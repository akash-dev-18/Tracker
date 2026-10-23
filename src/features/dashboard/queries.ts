import "server-only";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Job, Project, Question, Topic } from "@/lib/supabase/database.types";
import { addDaysISO, startOfTodayISO, todayISO } from "@/lib/utils/date";

export type DashboardDueQuestion = Pick<
  Question,
  "id" | "title" | "difficulty" | "status" | "topic_id" | "next_review_at"
>;

export type DashboardJob = Pick<
  Job,
  "id" | "company" | "role" | "status" | "priority" | "follow_up_at" | "location" | "work_mode"
>;

export type DashboardProject = Pick<
  Project,
  "id" | "name" | "status" | "priority" | "target_date" | "tech"
>;

export type DashboardRecentQuestion = Pick<
  Question,
  "id" | "title" | "status" | "difficulty" | "topic_id" | "created_at"
>;

export type DashboardUpcomingQuestion = Pick<
  Question,
  "id" | "title" | "next_review_at" | "topic_id"
>;

export async function getDashboardData(): Promise<{
  topics: Topic[];
  due: DashboardDueQuestion[];
  dueCount: number;
  solvedToday: number;
  reviewedToday: number;
  activeJobs: DashboardJob[];
  activeJobCount: number;
  projects: DashboardProject[];
  activeProjectCount: number;
  recent: DashboardRecentQuestion[];
  upcoming: DashboardUpcomingQuestion[];
}> {
  await requireUser();
  const supabase = await createClient();
  const today = todayISO();
  const startOfToday = startOfTodayISO();
  const weekEnd = addDaysISO(7);

  const [
    topicsResult,
    dueResult,
    solvedResult,
    reviewedResult,
    jobsResult,
    projectsResult,
    recentResult,
    upcomingResult,
  ] = await Promise.all([
    supabase
      .from("topics")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from("questions")
      .select("id,title,difficulty,status,topic_id,next_review_at", { count: "exact" })
      .lte("next_review_at", today)
      .neq("status", "todo")
      .order("next_review_at", { ascending: true })
      .limit(5),
    supabase.from("questions").select("id", { count: "exact", head: true }).eq("solved_at", today),
    supabase
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .gte("reviewed_at", startOfToday),
    supabase
      .from("jobs")
      .select("id,company,role,status,priority,follow_up_at,location,work_mode", { count: "exact" })
      .in("status", ["applied", "screening", "interview"])
      .order("follow_up_at", { ascending: true, nullsFirst: false })
      .limit(4),
    supabase
      .from("projects")
      .select("id,name,status,priority,target_date,tech", { count: "exact" })
      .eq("status", "active")
      .order("target_date", { ascending: true, nullsFirst: false })
      .limit(3),
    supabase
      .from("questions")
      .select("id,title,status,difficulty,topic_id,created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("questions")
      .select("id,title,next_review_at,topic_id")
      .gt("next_review_at", today)
      .lte("next_review_at", weekEnd)
      .neq("status", "todo")
      .order("next_review_at", { ascending: true })
      .limit(3),
  ]);

  return {
    topics: topicsResult.data ?? [],
    due: (dueResult.data ?? []) as DashboardDueQuestion[],
    dueCount: dueResult.count ?? dueResult.data?.length ?? 0,
    solvedToday: solvedResult.count ?? 0,
    reviewedToday: reviewedResult.count ?? 0,
    activeJobs: (jobsResult.data ?? []) as DashboardJob[],
    activeJobCount: jobsResult.count ?? jobsResult.data?.length ?? 0,
    projects: (projectsResult.data ?? []) as DashboardProject[],
    activeProjectCount: projectsResult.count ?? projectsResult.data?.length ?? 0,
    recent: (recentResult.data ?? []) as DashboardRecentQuestion[],
    upcoming: (upcomingResult.data ?? []) as DashboardUpcomingQuestion[],
  };
}
