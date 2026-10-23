"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { getSupabaseEnv } from "./env";

let browserClient: SupabaseClient<Database> | null = null;

export function createClient(): SupabaseClient<Database> {
  if (browserClient) return browserClient;

  const env = getSupabaseEnv();
  if (!env) {
    throw new Error("Supabase is not configured. Add your project URL and anon key to .env.local.");
  }

  browserClient = createBrowserClient<Database>(env.url, env.anonKey);
  return browserClient;
}
