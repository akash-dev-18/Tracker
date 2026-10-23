import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForms } from "@/features/auth/auth-forms";
import { getSessionUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (!isSupabaseConfigured()) redirect("/setup");

  const user = await getSessionUser();
  if (user) redirect("/dashboard");

  const params = await searchParams;
  const next =
    typeof params.next === "string" && params.next.startsWith("/") && !params.next.startsWith("//")
      ? params.next
      : "/dashboard";

  return <AuthForms next={next} />;
}
