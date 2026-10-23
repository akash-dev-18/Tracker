"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Job, JobEvent } from "@/lib/supabase/database.types";
import { fail, fromZodError, ok, type ActionResult } from "@/lib/action-result";
import { todayISO } from "@/lib/utils/date";
import { jobEventInputSchema, jobInputSchema } from "./validation";

function revalidateJobs() {
  revalidatePath("/jobs");
  revalidatePath("/dashboard");
}

export async function saveJob(formData: FormData): Promise<ActionResult<Job>> {
  const user = await requireUser();
  const supabase = await createClient();

  const parsed = jobInputSchema.safeParse({
    id: formData.get("id"),
    company: formData.get("company"),
    role: formData.get("role"),
    url: formData.get("url"),
    status: formData.get("status"),
    location: formData.get("location"),
    workMode: formData.get("workMode"),
    salaryRange: formData.get("salaryRange"),
    source: formData.get("source"),
    appliedAt: formData.get("appliedAt"),
    followUpAt: formData.get("followUpAt"),
    resumeVersion: formData.get("resumeVersion"),
    contactName: formData.get("contactName"),
    contactEmail: formData.get("contactEmail"),
    priority: formData.get("priority"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) return fromZodError(parsed.error);

  const input = parsed.data;
  let existing: Job | null = null;

  if (input.id) {
    const { data } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", input.id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!data) return fail("That application no longer exists.");
    existing = data;
  }

  let appliedAt = input.appliedAt ?? existing?.applied_at ?? null;
  if (!appliedAt && input.status !== "wishlist") appliedAt = todayISO();

  const payload = {
    company: input.company,
    role: input.role,
    url: input.url,
    status: input.status,
    location: input.location,
    work_mode: input.workMode,
    salary_range: input.salaryRange,
    source: input.source,
    applied_at: appliedAt,
    follow_up_at: input.followUpAt,
    resume_version: input.resumeVersion,
    contact_name: input.contactName,
    contact_email: input.contactEmail,
    priority: input.priority,
    notes: input.notes,
  };

  if (existing) {
    const { data, error } = await supabase
      .from("jobs")
      .update(payload)
      .eq("id", existing.id)
      .eq("user_id", user.id)
      .select("*")
      .single();
    if (error) return fail("We couldn't save that application. Try again.");
    revalidateJobs();
    return ok(data);
  }

  const { data, error } = await supabase
    .from("jobs")
    .insert({ ...payload, user_id: user.id })
    .select("*")
    .single();

  if (error) return fail("We couldn't add that application. Try again.");
  revalidateJobs();
  return ok(data);
}

export async function deleteJob(id: string): Promise<ActionResult<null>> {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase.from("jobs").delete().eq("id", id).eq("user_id", user.id);

  if (error) return fail("We couldn't delete that application. Try again.");
  revalidateJobs();
  return ok(null);
}

export async function getJobDetail(
  id: string,
): Promise<ActionResult<{ job: Job; events: JobEvent[] }>> {
  const user = await requireUser();
  const supabase = await createClient();

  if (!/^[0-9a-f-]{36}$/i.test(id)) return fail("That application could not be found.");

  const { data: job } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!job) return fail("That application no longer exists.");

  const { data: events } = await supabase
    .from("job_events")
    .select("*")
    .eq("job_id", id)
    .eq("user_id", user.id)
    .order("happened_at", { ascending: false })
    .limit(30);

  return ok({ job, events: events ?? [] });
}

export async function addJobEvent(formData: FormData): Promise<ActionResult<JobEvent>> {
  const user = await requireUser();
  const supabase = await createClient();

  const parsed = jobEventInputSchema.safeParse({
    jobId: formData.get("jobId"),
    type: formData.get("type"),
    note: formData.get("note"),
    happenedAt: formData.get("happenedAt"),
  });

  if (!parsed.success) return fromZodError(parsed.error);
  const input = parsed.data;

  const { data: job } = await supabase
    .from("jobs")
    .select("id")
    .eq("id", input.jobId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!job) return fail("That application no longer exists.");

  const { data, error } = await supabase
    .from("job_events")
    .insert({
      user_id: user.id,
      job_id: input.jobId,
      type: input.type,
      note: input.note,
      happened_at: input.happenedAt
        ? new Date(`${input.happenedAt}T12:00:00`).toISOString()
        : new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) return fail("We couldn't log that event. Try again.");
  revalidateJobs();
  return ok(data);
}
