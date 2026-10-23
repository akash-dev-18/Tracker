import type { Metadata } from "next";
import { Download, LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel, PanelBody, PanelHeader, PanelTitle, SectionHeading } from "@/components/ui/panel";
import { getProfile, requireUser } from "@/lib/auth";
import { signOut } from "@/features/auth/actions";
import { SettingsForm } from "@/features/settings/components/settings-form";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireUser();
  const savedProfile = await getProfile();
  const now = new Date().toISOString();
  const profile = savedProfile ?? {
    id: user.id,
    display_name: (user.user_metadata?.display_name as string | undefined) ?? null,
    daily_goal: 3,
    timezone: "Asia/Kolkata",
    created_at: now,
    updated_at: now,
  };

  return (
    <div className="space-y-7">
      <SectionHeading
        index="08"
        title="Settings"
        description="Your profile, the daily target, and a clean copy of everything in the register."
      />

      <div className="max-w-3xl space-y-5">
        <Panel>
          <PanelHeader>
            <div>
              <PanelTitle>Profile</PanelTitle>
              <p className="text-faint mt-1 text-xs">How Docket addresses you and paces the day.</p>
            </div>
          </PanelHeader>
          <PanelBody>
            <SettingsForm profile={profile} email={user.email ?? ""} />
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader>
            <div>
              <PanelTitle>Your data</PanelTitle>
              <p className="text-faint mt-1 text-xs">
                Problems, reviews, applications, projects, library, and study logs.
              </p>
            </div>
            <ShieldCheck className="text-verdigris size-4" />
          </PanelHeader>
          <PanelBody className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-ash max-w-md text-sm leading-relaxed">
              Export the full register as a JSON file. Nothing leaves this account unless you
              download it.
            </p>
            <Button asChild variant="secondary">
              <a href="/settings/export" download>
                <Download className="size-3.5" /> Export JSON
              </a>
            </Button>
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader>
            <div>
              <PanelTitle>Session</PanelTitle>
              <p className="text-faint mt-1 text-xs">Signed in as {user.email}</p>
            </div>
          </PanelHeader>
          <PanelBody>
            <form action={signOut}>
              <Button type="submit" variant="ghost">
                <LogOut className="size-3.5" /> Sign out
              </Button>
            </form>
          </PanelBody>
        </Panel>
      </div>
    </div>
  );
}
