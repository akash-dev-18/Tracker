"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { settingsSchema } from "./validation";

export type SettingsResult =
  | { ok: true; displayName: string | null; dailyGoal: number; timezone: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export async function saveSettings(formData: FormData): Promise<SettingsResult> {
  const user = await requireUser();
  const parsed = settingsSchema.safeParse({
    displayName: formData.get("displayName"),
    dailyGoal: formData.get("dailyGoal"),
    timezone: formData.get("timezone"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: "Check the highlighted fields.", fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      display_name: parsed.data.displayName,
      daily_goal: parsed.data.dailyGoal,
      timezone: parsed.data.timezone,
    },
    { onConflict: "id" },
  );

  if (error) {
    return { ok: false, error: "Could not save settings. Try again." };
  }

  await supabase.auth.updateUser({
    data: { display_name: parsed.data.displayName ?? "" },
  });

  revalidatePath("/", "layout");

  return {
    ok: true,
    displayName: parsed.data.displayName,
    dailyGoal: parsed.data.dailyGoal,
    timezone: parsed.data.timezone,
  };
}
