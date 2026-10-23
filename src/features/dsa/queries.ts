import "server-only";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Question, Topic } from "@/lib/supabase/database.types";

export type QuestionListItem = Pick<
  Question,
  | "id"
  | "title"
  | "url"
  | "platform"
  | "difficulty"
  | "status"
  | "topic_id"
  | "notes"
  | "tags"
  | "starred"
  | "solved_at"
  | "next_review_at"
  | "review_interval"
  | "created_at"
  | "updated_at"
>;

const listColumns =
  "id,title,url,platform,difficulty,status,topic_id,notes,tags,starred,solved_at,next_review_at,review_interval,created_at,updated_at";

export async function getDsaData(): Promise<{
  topics: Topic[];
  questions: QuestionListItem[];
}> {
  await requireUser();
  const supabase = await createClient();

  const [topicsResult, questionsResult] = await Promise.all([
    supabase
      .from("topics")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from("questions")
      .select(listColumns)
      .order("created_at", { ascending: false }),
  ]);

  return {
    topics: topicsResult.data ?? [],
    questions: (questionsResult.data ?? []) as QuestionListItem[],
  };
}

export async function getTopicData(): Promise<{
  topics: Topic[];
  counts: Record<string, number>;
}> {
  await requireUser();
  const supabase = await createClient();

  const [topicsResult, questionsResult] = await Promise.all([
    supabase
      .from("topics")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase.from("questions").select("topic_id"),
  ]);

  const counts: Record<string, number> = {};
  for (const question of questionsResult.data ?? []) {
    if (question.topic_id) {
      counts[question.topic_id] = (counts[question.topic_id] ?? 0) + 1;
    }
  }

  return { topics: topicsResult.data ?? [], counts };
}
