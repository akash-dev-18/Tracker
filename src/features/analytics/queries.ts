import "server-only";

import { addDays, format, startOfDay } from "date-fns";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type {
  Question,
  Review,
  ReviewRating,
  StudyLog,
  Topic,
} from "@/lib/supabase/database.types";
import { addDaysISO, todayISO, toDate } from "@/lib/utils/date";

export type ActivityPoint = {
  date: string;
  label: string;
  reviews: number;
  solved: number;
  minutes: number;
};

export type ForecastPoint = {
  date: string;
  label: string;
  count: number;
};

export type RatingCount = {
  rating: ReviewRating;
  label: string;
  count: number;
};

export type StatusCount = {
  status: Question["status"];
  label: string;
  count: number;
};

export type TopicCount = {
  name: string;
  count: number;
};

export type AnalyticsData = {
  reviews30: number;
  solvedTotal: number;
  minutes30: number;
  activeDays30: number;
  streak: number;
  dueCount: number;
  overdueCount: number;
  activity: ActivityPoint[];
  forecast: ForecastPoint[];
  ratings: RatingCount[];
  statuses: StatusCount[];
  topics: TopicCount[];
};

const ratingLabels: Record<ReviewRating, string> = {
  again: "Again",
  hard: "Hard",
  good: "Good",
  easy: "Easy",
};

const statusLabels: Record<Question["status"], string> = {
  todo: "To do",
  attempted: "Attempted",
  solved: "Solved",
  needs_revision: "Needs revision",
};

export async function getAnalyticsData(): Promise<AnalyticsData> {
  await requireUser();
  const supabase = await createClient();

  const today = todayISO();
  const start60 = addDaysISO(-59);
  const start60Timestamp = startOfDay(addDays(new Date(), -59)).toISOString();

  const [questionsResult, reviewsResult, logsResult, topicsResult] = await Promise.all([
    supabase
      .from("questions")
      .select("id,title,status,difficulty,topic_id,solved_at,next_review_at,created_at"),
    supabase.from("reviews").select("id,rating,reviewed_at").gte("reviewed_at", start60Timestamp),
    supabase
      .from("study_logs")
      .select("*")
      .gte("log_date", start60)
      .order("log_date", { ascending: true }),
    supabase.from("topics").select("*").order("name", { ascending: true }),
  ]);

  const questions = (questionsResult.data ?? []) as Pick<
    Question,
    | "id"
    | "title"
    | "status"
    | "difficulty"
    | "topic_id"
    | "solved_at"
    | "next_review_at"
    | "created_at"
  >[];
  const reviews = (reviewsResult.data ?? []) as Pick<Review, "id" | "rating" | "reviewed_at">[];
  const logs = (logsResult.data ?? []) as StudyLog[];
  const topics = (topicsResult.data ?? []) as Topic[];

  const dayKeys = new Map<string, ActivityPoint>();
  for (let index = 29; index >= 0; index -= 1) {
    const date = addDays(new Date(), -index);
    const key = format(date, "yyyy-MM-dd");
    dayKeys.set(key, {
      date: key,
      label: format(date, "d MMM"),
      reviews: 0,
      solved: 0,
      minutes: 0,
    });
  }

  let reviews30 = 0;
  for (const review of reviews) {
    const date = toDate(review.reviewed_at);
    if (!date) continue;
    const key = format(date, "yyyy-MM-dd");
    const point = dayKeys.get(key);
    if (point) {
      point.reviews += 1;
      reviews30 += 1;
    }
  }

  for (const log of logs) {
    const key = log.log_date.slice(0, 10);
    const point = dayKeys.get(key);
    if (point) point.minutes += log.minutes;
  }

  for (const question of questions) {
    if (!question.solved_at) continue;
    const point = dayKeys.get(question.solved_at.slice(0, 10));
    if (point) point.solved += 1;
  }

  const forecast: ForecastPoint[] = [];
  for (let index = 0; index < 14; index += 1) {
    const date = addDays(new Date(), index);
    const key = format(date, "yyyy-MM-dd");
    forecast.push({
      date: key,
      label: format(date, "d MMM"),
      count: questions.filter(
        (question) => question.status !== "todo" && question.next_review_at?.slice(0, 10) === key,
      ).length,
    });
  }

  const recentReviews = reviews.filter((review) => {
    const date = toDate(review.reviewed_at);
    return date ? dayKeys.has(format(date, "yyyy-MM-dd")) : false;
  });

  const ratings = (Object.keys(ratingLabels) as ReviewRating[]).map((rating) => ({
    rating,
    label: ratingLabels[rating],
    count: recentReviews.filter((review) => review.rating === rating).length,
  }));

  const statuses = (Object.keys(statusLabels) as Question["status"][]).map((status) => ({
    status,
    label: statusLabels[status],
    count: questions.filter((question) => question.status === status).length,
  }));

  const topicNames = new Map(topics.map((topic) => [topic.id, topic.name]));
  const topicCounts = new Map<string, number>();
  for (const question of questions) {
    if (!question.topic_id) continue;
    const name = topicNames.get(question.topic_id);
    if (!name) continue;
    topicCounts.set(name, (topicCounts.get(name) ?? 0) + 1);
  }

  const activityDates = new Set<string>();
  for (const review of reviews) {
    const date = toDate(review.reviewed_at);
    if (date) activityDates.add(format(date, "yyyy-MM-dd"));
  }
  for (const log of logs) {
    if (log.minutes > 0 || log.questions_solved > 0) activityDates.add(log.log_date.slice(0, 10));
  }
  for (const question of questions) {
    if (question.solved_at) activityDates.add(question.solved_at.slice(0, 10));
  }

  let streak = 0;
  let cursor = new Date();
  if (!activityDates.has(format(cursor, "yyyy-MM-dd"))) {
    cursor = addDays(cursor, -1);
  }
  while (activityDates.has(format(cursor, "yyyy-MM-dd"))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  const activity = [...dayKeys.values()];
  const activeDays30 = activity.filter(
    (point) => point.reviews > 0 || point.solved > 0 || point.minutes > 0,
  ).length;

  return {
    reviews30,
    solvedTotal: questions.filter((question) => question.status === "solved").length,
    minutes30: activity.reduce((sum, point) => sum + point.minutes, 0),
    activeDays30,
    streak,
    dueCount: questions.filter(
      (question) =>
        question.next_review_at && question.next_review_at <= today && question.status !== "todo",
    ).length,
    overdueCount: questions.filter(
      (question) =>
        question.next_review_at && question.next_review_at < today && question.status !== "todo",
    ).length,
    activity,
    forecast,
    ratings,
    statuses,
    topics: [...topicCounts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
  };
}
