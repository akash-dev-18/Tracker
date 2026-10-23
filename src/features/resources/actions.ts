"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Resource } from "@/lib/supabase/database.types";
import { fail, fromZodError, ok, type ActionResult } from "@/lib/action-result";
import { resourceInputSchema } from "./validation";

function revalidateResources() {
  revalidatePath("/resources");
  revalidatePath("/dashboard");
}

export async function saveResource(formData: FormData): Promise<ActionResult<Resource>> {
  const user = await requireUser();
  const supabase = await createClient();

  const parsed = resourceInputSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
    url: formData.get("url"),
    type: formData.get("type"),
    tags: formData.get("tags"),
    notes: formData.get("notes"),
    isRead: formData.get("isRead"),
  });

  if (!parsed.success) return fromZodError(parsed.error);
  const input = parsed.data;

  let existing: Resource | null = null;
  if (input.id) {
    const { data } = await supabase
      .from("resources")
      .select("*")
      .eq("id", input.id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!data) return fail("That resource no longer exists.");
    existing = data;
  }

  const payload = {
    title: input.title,
    url: input.url,
    type: input.type,
    tags: input.tags,
    notes: input.notes,
    is_read: input.isRead,
  };

  if (existing) {
    const { data, error } = await supabase
      .from("resources")
      .update(payload)
      .eq("id", existing.id)
      .eq("user_id", user.id)
      .select("*")
      .single();
    if (error) return fail("We couldn't save that resource. Try again.");
    revalidateResources();
    return ok(data);
  }

  const { data, error } = await supabase
    .from("resources")
    .insert({ ...payload, user_id: user.id })
    .select("*")
    .single();

  if (error) return fail("We couldn't add that resource. Try again.");
  revalidateResources();
  return ok(data);
}

export async function setResourceRead(
  id: string,
  isRead: boolean,
): Promise<ActionResult<Resource>> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("resources")
    .update({ is_read: isRead })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) return fail("We couldn't update that resource. Try again.");
  revalidateResources();
  return ok(data);
}

export async function deleteResource(id: string): Promise<ActionResult<null>> {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase.from("resources").delete().eq("id", id).eq("user_id", user.id);

  if (error) return fail("We couldn't delete that resource. Try again.");
  revalidateResources();
  return ok(null);
}
