"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Question, Review, Topic } from "@/lib/supabase/database.types";
import { fail, fromZodError, ok, type ActionResult } from "@/lib/action-result";
import { addDaysISO, todayISO } from "@/lib/utils/date";
import { nextReview } from "@/features/revision/algorithm";
import {
  questionInputSchema,
  reviewInputSchema,
  statusUpdateSchema,
  topicInputSchema,
  type TopicInput,
} from "./validation";

function revalidateDsa() {
  revalidatePath("/dsa");
  revalidatePath("/dsa/topics");
  revalidatePath("/dashboard");
  revalidatePath("/review");
  revalidatePath("/analytics");
}

export async function saveQuestion(formData: FormData): Promise<ActionResult<Question>> {
  const user = await requireUser();
  const supabase = await createClient();

  const parsed = questionInputSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
    url: formData.get("url"),
    platform: formData.get("platform"),
    difficulty: formData.get("difficulty"),
    status: formData.get("status"),
    topicId: formData.get("topicId"),
    notes: formData.get("notes"),
    code: formData.get("code"),
    language: formData.get("language"),
    tags: formData.get("tags"),
    starred: formData.get("starred"),
    solvedAt: formData.get("solvedAt"),
  });

  if (!parsed.success) return fromZodError(parsed.error);

  const input = parsed.data;

  if (input.topicId) {
    const { data: topic } = await supabase
      .from("topics")
      .select("id")
      .eq("id", input.topicId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!topic) return fail("That topic no longer exists. Pick another one.");
  }

  let existing: Question | null = null;
  if (input.id) {
    const { data } = await supabase
      .from("questions")
      .select("*")
      .eq("id", input.id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!data) return fail("That problem no longer exists.");
    existing = data;
  }

  const today = todayISO();
  let solvedAt = input.solvedAt ?? existing?.solved_at ?? null;
  let nextReviewAt = existing?.next_review_at ?? null;
  let reviewInterval = existing?.review_interval ?? 0;

  if (input.status === "solved") {
    if (!solvedAt) solvedAt = today;
    if (!nextReviewAt) {
      reviewInterval = 1;
      nextReviewAt = addDaysISO(1);
    }
  } else if (input.status === "needs_revision") {
    if (!nextReviewAt || nextReviewAt > today) nextReviewAt = today;
  } else if (input.status === "todo") {
    nextReviewAt = null;
    reviewInterval = 0;
  }

  const payload = {
    title: input.title,
    url: input.url,
    platform: input.platform,
    difficulty: input.difficulty,
    status: input.status,
    topic_id: input.topicId,
    notes: input.notes,
    code: input.code,
    language: input.language,
    tags: input.tags,
    starred: input.starred,
    solved_at: solvedAt,
    next_review_at: nextReviewAt,
    review_interval: reviewInterval,
  };

  if (existing) {
    const { data, error } = await supabase
      .from("questions")
      .update(payload)
      .eq("id", existing.id)
      .eq("user_id", user.id)
      .select("*")
      .single();
    if (error) return fail("We couldn't save that problem. Try again.");
    revalidateDsa();
    return ok(data);
  }

  const { data, error } = await supabase
    .from("questions")
    .insert({ ...payload, user_id: user.id })
    .select("*")
    .single();

  if (error) return fail("We couldn't add that problem. Try again.");
  revalidateDsa();
  return ok(data);
}

export async function setQuestionStatus(
  id: string,
  status: "todo" | "attempted" | "solved" | "needs_revision",
): Promise<ActionResult<Question>> {
  const user = await requireUser();
  const supabase = await createClient();

  const parsed = statusUpdateSchema.safeParse({ id, status });
  if (!parsed.success) return fromZodError(parsed.error);

  const { data: existing } = await supabase
    .from("questions")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existing) return fail("That problem no longer exists.");

  const today = todayISO();
  const patch: Partial<Question> = { status };

  if (status === "solved") {
    patch.solved_at = existing.solved_at ?? today;
    if (!existing.next_review_at) {
      patch.next_review_at = addDaysISO(1);
      patch.review_interval = 1;
    }
  } else if (status === "needs_revision") {
    patch.next_review_at = today;
    patch.solved_at = existing.solved_at ?? today;
  } else if (status === "todo") {
    patch.next_review_at = null;
    patch.review_interval = 0;
  }

  const { data, error } = await supabase
    .from("questions")
    .update(patch)
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) return fail("We couldn't update that problem. Try again.");

  revalidateDsa();
  return ok(data);
}

export async function setQuestionStar(
  id: string,
  starred: boolean,
): Promise<ActionResult<Question>> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("questions")
    .update({ starred })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) return fail("We couldn't update that problem. Try again.");
  revalidateDsa();
  return ok(data);
}

export async function deleteQuestion(id: string): Promise<ActionResult<null>> {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase.from("questions").delete().eq("id", id).eq("user_id", user.id);

  if (error) return fail("We couldn't delete that problem. Try again.");
  revalidateDsa();
  return ok(null);
}

export async function getQuestionDetail(
  id: string,
): Promise<ActionResult<{ question: Question; reviews: Review[] }>> {
  const user = await requireUser();
  const supabase = await createClient();

  if (!/^[0-9a-f-]{36}$/i.test(id)) return fail("That problem could not be found.");

  const { data: question } = await supabase
    .from("questions")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!question) return fail("That problem no longer exists.");

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("question_id", id)
    .eq("user_id", user.id)
    .order("reviewed_at", { ascending: false })
    .limit(8);

  return ok({ question, reviews: reviews ?? [] });
}

export async function recordReview(
  questionId: string,
  rating: "again" | "hard" | "good" | "easy",
): Promise<ActionResult<{ question: Question; interval: number; nextReviewAt: string }>> {
  const user = await requireUser();
  const supabase = await createClient();

  const parsed = reviewInputSchema.safeParse({ questionId, rating });
  if (!parsed.success) return fromZodError(parsed.error);

  const { data: question } = await supabase
    .from("questions")
    .select("*")
    .eq("id", questionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!question) return fail("That problem no longer exists.");

  const next = nextReview(rating, question.review_interval);
  const reviewedAt = new Date().toISOString();

  const { data: updated, error } = await supabase
    .from("questions")
    .update({
      status: next.status,
      next_review_at: next.nextReviewAt,
      review_interval: next.interval,
      solved_at: question.solved_at ?? todayISO(),
    })
    .eq("id", questionId)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) return fail("We couldn't record that review. Try again.");

  await supabase.from("reviews").insert({
    user_id: user.id,
    question_id: questionId,
    rating,
    reviewed_at: reviewedAt,
    interval_before: question.review_interval,
    interval_after: next.interval,
  });

  revalidateDsa();

  return ok({ question: updated, interval: next.interval, nextReviewAt: next.nextReviewAt });
}

export async function saveTopic(formData: FormData): Promise<ActionResult<Topic>> {
  const user = await requireUser();
  const supabase = await createClient();

  const parsed = topicInputSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    parentId: formData.get("parentId"),
    color: formData.get("color"),
  });

  if (!parsed.success) return fromZodError(parsed.error);

  const input: TopicInput = parsed.data;

  if (input.parentId) {
    if (input.parentId === input.id) return fail("A topic can't be its own parent.");
    const { data: parent } = await supabase
      .from("topics")
      .select("id,parent_id")
      .eq("id", input.parentId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!parent) return fail("That parent topic no longer exists.");
    if (parent.parent_id) return fail("Subtopics can only sit one level deep.");
  }

  const payload = {
    name: input.name,
    parent_id: input.parentId,
    color: input.color,
  };

  if (input.id) {
    const { data, error } = await supabase
      .from("topics")
      .update(payload)
      .eq("id", input.id)
      .eq("user_id", user.id)
      .select("*")
      .single();
    if (error) {
      if (error.code === "23505") return fail("A topic with that name already exists here.");
      return fail("We couldn't save that topic. Try again.");
    }
    revalidateDsa();
    return ok(data);
  }

  const countQuery = supabase
    .from("topics")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { count } = input.parentId
    ? await countQuery.eq("parent_id", input.parentId)
    : await countQuery.is("parent_id", null);

  const { data, error } = await supabase
    .from("topics")
    .insert({
      ...payload,
      user_id: user.id,
      sort_order: (count ?? 0) + 1,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") return fail("A topic with that name already exists here.");
    return fail("We couldn't add that topic. Try again.");
  }

  revalidateDsa();
  return ok(data);
}

export async function deleteTopic(id: string): Promise<ActionResult<null>> {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase.from("topics").delete().eq("id", id).eq("user_id", user.id);

  if (error) return fail("We couldn't delete that topic. Try again.");
  revalidateDsa();
  return ok(null);
}
