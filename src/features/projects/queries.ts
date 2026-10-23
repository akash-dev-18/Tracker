import "server-only";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Project, ProjectTask } from "@/lib/supabase/database.types";

export type ProjectListItem = Project;

export async function getProjectsData(): Promise<{
  projects: ProjectListItem[];
  tasks: ProjectTask[];
}> {
  await requireUser();
  const supabase = await createClient();

  const [projectsResult, tasksResult] = await Promise.all([
    supabase.from("projects").select("*").order("updated_at", { ascending: false }),
    supabase
      .from("project_tasks")
      .select("*")
      .order("project_id", { ascending: true })
      .order("sort_order", { ascending: true }),
  ]);

  return {
    projects: projectsResult.data ?? [],
    tasks: tasksResult.data ?? [],
  };
}
