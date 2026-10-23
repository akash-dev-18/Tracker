import "server-only";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Question, Topic } from "@/lib/supabase/database.types";
import { addDaysISO, startOfTodayISO, todayISO } from "@/lib/utils/date";

export type ReviewQueueItem = Pick<
  Question,
  | "id"
  | "title"
  | "url"
  | "platform"
  | "difficulty"
  | "status"
  | "topic_id"
  | "notes"
  | "code"
  | "language"
  | "tags"
  | "starred"
  | "solved_at"
  | "next_review_at"
  | "review_interval"
  | "created_at"
  | "updated_at"
>;

export type UpcomingReview = Pick<Question, "id" | "title" | "next_review_at" | "topic_id">;

const queueColumns =
  "id,title,url,platform,difficulty,status,topic_id,notes,code,language,tags,starred,solved_at,next_review_at,review_interval,created_at,updated_at";

export async function getReviewData(): Promise<{
  topics: Topic[];
  due: ReviewQueueItem[];
  dueTotal: number;
  overdue: number;
  reviewedToday: number;
  upcoming: UpcomingReview[];
  upcomingTotal: number;
  weekEnd: string;
}> {
  await requireUser();
  const supabase = await createClient();
  const today = todayISO();
  const weekEnd = addDaysISO(7);

  const [topicsResult, dueResult, upcomingResult, reviewedResult] = await Promise.all([
    supabase
      .from("topics")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from("questions")
      .select(queueColumns, { count: "exact" })
      .lte("next_review_at", today)
      .neq("status", "todo")
      .order("next_review_at", { ascending: true })
      .order("created_at", { ascending: true })
      .limit(200),
    supabase
      .from("questions")
      .select("id,title,next_review_at,topic_id", { count: "exact" })
      .gt("next_review_at", today)
      .lte("next_review_at", weekEnd)
      .neq("status", "todo")
      .order("next_review_at", { ascending: true })
      .limit(8),
    supabase
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .gte("reviewed_at", startOfTodayISO()),
  ]);

  const due = (dueResult.data ?? []) as ReviewQueueItem[];

  return {
    topics: topicsResult.data ?? [],
    due,
    dueTotal: dueResult.count ?? due.length,
    overdue: due.filter((question) => question.next_review_at && question.next_review_at < today)
      .length,
    reviewedToday: reviewedResult.count ?? 0,
    upcoming: (upcomingResult.data ?? []) as UpcomingReview[],
    upcomingTotal: upcomingResult.count ?? upcomingResult.data?.length ?? 0,
    weekEnd,
  };
}
