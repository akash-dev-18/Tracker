import type { Metadata } from "next";
import { ArrowUpRight, Database, KeyRound, Terminal } from "lucide-react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Connect Supabase",
};

const envBlock = `NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key`;

export default function SetupPage() {
  if (isSupabaseConfigured()) redirect("/login");

  return (
    <div className="w-full max-w-lg min-w-0">
      <div className="kicker text-copper">Setup · One time</div>
      <h1 className="mt-2 font-serif text-4xl leading-none text-bone">Connect your register.</h1>
      <p className="mt-3 text-sm leading-relaxed text-ash">
        Docket stores its data in your own Supabase project. Add two keys, run the schema once,
        and the register is yours.
      </p>

      <Panel className="mt-7 divide-y divide-line">
        <div className="flex gap-4 p-5">
          <div className="grid size-8 shrink-0 place-items-center rounded-md border border-line bg-white/[0.03] text-copper">
            <Database className="size-4" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-sm font-medium text-bone">1. Create the project</h2>
            <p className="mt-1 text-xs leading-relaxed text-ash">
              In Supabase, create a project named <span className="text-bone">docket</span> in the
              region closest to you. Free tier is enough.
            </p>
          </div>
        </div>

        <div className="flex gap-4 p-5">
          <div className="grid size-8 shrink-0 place-items-center rounded-md border border-line bg-white/[0.03] text-copper">
            <Terminal className="size-4" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-medium text-bone">2. Run the schema</h2>
            <p className="mt-1 text-xs leading-relaxed text-ash">
              Open the SQL editor and run the migration committed at{" "}
              <code className="rounded bg-white/[0.05] px-1 py-0.5 font-mono text-[11px] break-words text-bone [overflow-wrap:anywhere]">
                supabase/migrations/20261021000001_init.sql
              </code>
              . It creates the tables, policies, triggers, and your default topic tree.
            </p>
          </div>
        </div>

        <div className="flex gap-4 p-5">
          <div className="grid size-8 shrink-0 place-items-center rounded-md border border-line bg-white/[0.03] text-copper">
            <KeyRound className="size-4" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-medium text-bone">3. Add your keys</h2>
            <p className="mt-1 text-xs leading-relaxed text-ash">
              Copy the Project URL and publishable key from Project Settings → API into{" "}
              <code className="rounded bg-white/[0.05] px-1 py-0.5 font-mono text-[11px] break-words text-bone [overflow-wrap:anywhere]">
                .env.local
              </code>
              , then restart the dev server.
            </p>
            <pre className="mt-3 max-w-full overflow-x-auto rounded-lg border border-line bg-black/30 p-3 font-mono text-[11px] leading-relaxed text-ash">
              {envBlock}
            </pre>
          </div>
        </div>
      </Panel>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button asChild variant="primary">
          <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer">
            Open Supabase
            <ArrowUpRight className="size-4" />
          </a>
        </Button>
        <Button asChild variant="secondary">
          <a href="/setup">I&apos;ve added the keys — refresh</a>
        </Button>
      </div>

      <p className="mt-5 text-[11px] leading-relaxed text-faint">
        Never paste your service-role key into this app. Only the public publishable key is needed.
      </p>
    </div>
  );
}
