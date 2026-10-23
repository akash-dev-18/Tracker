import "server-only";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Job } from "@/lib/supabase/database.types";

export type JobListItem = Job;

export async function getJobsData(): Promise<JobListItem[]> {
  await requireUser();
  const supabase = await createClient();

  const { data } = await supabase
    .from("jobs")
    .select("*")
    .order("updated_at", { ascending: false });

  return data ?? [];
}
