import "server-only";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Resource } from "@/lib/supabase/database.types";

export type ResourceListItem = Resource;

export async function getResourcesData(): Promise<ResourceListItem[]> {
  await requireUser();
  const supabase = await createClient();

  const { data } = await supabase
    .from("resources")
    .select("*")
    .order("is_read", { ascending: true })
    .order("created_at", { ascending: false });

  return data ?? [];
}
