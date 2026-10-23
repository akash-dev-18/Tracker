"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Project, ProjectTask } from "@/lib/supabase/database.types";
import { fail, fromZodError, ok, type ActionResult } from "@/lib/action-result";
import { todayISO } from "@/lib/utils/date";
import { projectInputSchema, projectTaskInputSchema, taskStatusSchema } from "./validation";

function revalidateProjects() {
  revalidatePath("/projects");
  revalidatePath("/dashboard");
}

export async function saveProject(formData: FormData): Promise<ActionResult<Project>> {
  const user = await requireUser();
  const supabase = await createClient();

  const parsed = projectInputSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    summary: formData.get("summary"),
    repoUrl: formData.get("repoUrl"),
    liveUrl: formData.get("liveUrl"),
    status: formData.get("status"),
    tech: formData.get("tech"),
    priority: formData.get("priority"),
    startedAt: formData.get("startedAt"),
    targetDate: formData.get("targetDate"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) return fromZodError(parsed.error);
  const input = parsed.data;

  let existing: Project | null = null;
  if (input.id) {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("id", input.id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!data) return fail("That project no longer exists.");
    existing = data;
  }

  let startedAt = input.startedAt ?? existing?.started_at ?? null;
  if (!startedAt && (input.status === "active" || input.status === "done")) {
    startedAt = todayISO();
  }

  const payload = {
    name: input.name,
    summary: input.summary,
    repo_url: input.repoUrl,
    live_url: input.liveUrl,
    status: input.status,
    tech: input.tech,
    priority: input.priority,
    started_at: startedAt,
    target_date: input.targetDate,
    notes: input.notes,
  };

  if (existing) {
    const { data, error } = await supabase
      .from("projects")
      .update(payload)
      .eq("id", existing.id)
      .eq("user_id", user.id)
      .select("*")
      .single();
    if (error) return fail("We couldn't save that project. Try again.");
    revalidateProjects();
    return ok(data);
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({ ...payload, user_id: user.id })
    .select("*")
    .single();

  if (error) return fail("We couldn't add that project. Try again.");
  revalidateProjects();
  return ok(data);
}

export async function deleteProject(id: string): Promise<ActionResult<null>> {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase.from("projects").delete().eq("id", id).eq("user_id", user.id);
  if (error) return fail("We couldn't delete that project. Try again.");
  revalidateProjects();
  return ok(null);
}

export async function addProjectTask(formData: FormData): Promise<ActionResult<ProjectTask>> {
  const user = await requireUser();
  const supabase = await createClient();

  const parsed = projectTaskInputSchema.safeParse({
    projectId: formData.get("projectId"),
    title: formData.get("title"),
    dueDate: formData.get("dueDate"),
  });
  if (!parsed.success) return fromZodError(parsed.error);
  const input = parsed.data;

  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", input.projectId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!project) return fail("That project no longer exists.");

  const { count } = await supabase
    .from("project_tasks")
    .select("id", { count: "exact", head: true })
    .eq("project_id", input.projectId)
    .eq("user_id", user.id);

  const { data, error } = await supabase
    .from("project_tasks")
    .insert({
      user_id: user.id,
      project_id: input.projectId,
      title: input.title,
      due_date: input.dueDate,
      sort_order: (count ?? 0) + 1,
    })
    .select("*")
    .single();

  if (error) return fail("We couldn't add that task. Try again.");
  revalidateProjects();
  return ok(data);
}

export async function setProjectTaskStatus(
  id: string,
  status: "todo" | "doing" | "done",
): Promise<ActionResult<ProjectTask>> {
  const user = await requireUser();
  const supabase = await createClient();

  const parsed = taskStatusSchema.safeParse({ id, status });
  if (!parsed.success) return fromZodError(parsed.error);

  const { data, error } = await supabase
    .from("project_tasks")
    .update({ status })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) return fail("We couldn't update that task. Try again.");
  revalidateProjects();
  return ok(data);
}

export async function deleteProjectTask(id: string): Promise<ActionResult<null>> {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("project_tasks")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return fail("We couldn't delete that task. Try again.");
  revalidateProjects();
  return ok(null);
}
