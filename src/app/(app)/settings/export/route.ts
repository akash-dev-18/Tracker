import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { todayISO } from "@/lib/utils/date";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const supabase = await createClient();
  const [
    profile,
    topics,
    questions,
    reviews,
    jobs,
    jobEvents,
    projects,
    projectTasks,
    resources,
    studyLogs,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("topics").select("*").eq("user_id", user.id).order("name"),
    supabase.from("questions").select("*").eq("user_id", user.id).order("created_at"),
    supabase.from("reviews").select("*").eq("user_id", user.id).order("reviewed_at"),
    supabase.from("jobs").select("*").eq("user_id", user.id).order("created_at"),
    supabase.from("job_events").select("*").eq("user_id", user.id).order("happened_at"),
    supabase.from("projects").select("*").eq("user_id", user.id).order("created_at"),
    supabase.from("project_tasks").select("*").eq("user_id", user.id).order("sort_order"),
    supabase.from("resources").select("*").eq("user_id", user.id).order("created_at"),
    supabase.from("study_logs").select("*").eq("user_id", user.id).order("log_date"),
  ]);

  const payload = {
    exported_at: new Date().toISOString(),
    account: { id: user.id, email: user.email },
    profile: profile.data,
    topics: topics.data ?? [],
    questions: questions.data ?? [],
    reviews: reviews.data ?? [],
    jobs: jobs.data ?? [],
    job_events: jobEvents.data ?? [],
    projects: projects.data ?? [],
    project_tasks: projectTasks.data ?? [],
    resources: resources.data ?? [],
    study_logs: studyLogs.data ?? [],
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="docket-export-${todayISO()}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
