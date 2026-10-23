"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldError, FieldHint, Input, Label } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Profile } from "@/lib/supabase/database.types";
import { saveSettings } from "@/features/settings/actions";

const timezoneOptions = [
  "Asia/Kolkata",
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];

export function SettingsForm({ profile, email }: { profile: Profile; email: string }) {
  const router = useRouter();
  const [timezone, setTimezone] = useState(profile.timezone);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const zones = timezoneOptions.includes(timezone)
    ? timezoneOptions
    : [timezone, ...timezoneOptions];

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("timezone", timezone);

    setError(null);
    setFieldErrors({});
    setSaved(false);

    startTransition(async () => {
      const result = await saveSettings(formData);
      if (!result.ok) {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }
      setSaved(true);
      toast.success("Settings saved.");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="displayName">Display name</Label>
          <Input
            id="displayName"
            name="displayName"
            defaultValue={profile.display_name ?? ""}
            placeholder="Your name"
            autoComplete="name"
            maxLength={80}
            aria-invalid={Boolean(fieldErrors.displayName)}
          />
          {fieldErrors.displayName ? <FieldError>{fieldErrors.displayName}</FieldError> : null}
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={email} readOnly disabled />
          <FieldHint>Used to sign in and receive confirmations.</FieldHint>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="dailyGoal">Daily target</Label>
          <Input
            id="dailyGoal"
            name="dailyGoal"
            type="number"
            min={1}
            max={20}
            defaultValue={profile.daily_goal}
            className="[color-scheme:dark]"
            aria-invalid={Boolean(fieldErrors.dailyGoal)}
          />
          {fieldErrors.dailyGoal ? (
            <FieldError>{fieldErrors.dailyGoal}</FieldError>
          ) : (
            <FieldHint>Solved problems plus completed reviews.</FieldHint>
          )}
        </div>
        <div>
          <Label>Timezone</Label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger aria-invalid={Boolean(fieldErrors.timezone)}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {zones.map((zone) => (
                <SelectItem key={zone} value={zone}>
                  {zone.replaceAll("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldErrors.timezone ? <FieldError>{fieldErrors.timezone}</FieldError> : null}
          <button
            type="button"
            className="text-faint hover:text-ash mt-1.5 text-xs underline-offset-4 hover:underline"
            onClick={() => setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)}
          >
            Use this device&apos;s timezone
          </button>
        </div>
      </div>

      {error ? <p className="text-clay text-xs">{error}</p> : null}

      <div className="border-line flex items-center gap-3 border-t pt-4">
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
          Save changes
        </Button>
        {saved ? <span className="text-verdigris text-xs">Saved.</span> : null}
      </div>
    </form>
  );
}
