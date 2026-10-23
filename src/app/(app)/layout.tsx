import { format, startOfDay } from "date-fns";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AppShell } from "@/components/shell/app-shell";
import { getProfile, requireUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { todayISO } from "@/lib/utils/date";

export default async function AppLayout({ children }: { children: ReactNode }) {
  if (!isSupabaseConfigured()) redirect("/setup");

  const user = await requireUser();
  const profile = await getProfile();
  const supabase = await createClient();
  const today = todayISO();
  const startOfToday = startOfDay(new Date()).toISOString();

  const [due, activeJobs, solvedToday, reviewedToday] = await Promise.all([
    supabase
      .from("questions")
      .select("id", { count: "exact", head: true })
      .lte("next_review_at", today),
    supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .in("status", ["applied", "screening", "interview"]),
    supabase
      .from("questions")
      .select("id", { count: "exact", head: true })
      .eq("solved_at", today),
    supabase
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .gte("reviewed_at", startOfToday),
  ]);

  const email = user.email ?? "";
  const displayName =
    profile?.display_name ||
    (user.user_metadata?.display_name as string | undefined) ||
    email.split("@")[0] ||
    "You";

  return (
    <AppShell
      user={{ displayName, email }}
      stats={{
        dailyGoal: profile?.daily_goal ?? 3,
        todayProgress: (solvedToday.count ?? 0) + (reviewedToday.count ?? 0),
        dueCount: due.count ?? 0,
        activeJobCount: activeJobs.count ?? 0,
      }}
      todayLabel={format(new Date(), "EEE d MMM").toUpperCase()}
    >
      {children}
    </AppShell>
  );
}
