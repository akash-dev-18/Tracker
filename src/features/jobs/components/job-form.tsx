"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldError, Input, Label, Textarea } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Job } from "@/lib/supabase/database.types";
import { saveJob } from "@/features/jobs/actions";
import {
  jobStatusLabels,
  jobStatusOrder,
  priorityLabels,
  priorityOrder,
  workModeLabels,
} from "@/features/jobs/presentation";

const workModes = ["none", "onsite", "hybrid", "remote"] as const;

export function JobFormDialog({
  open,
  onOpenChange,
  job,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: Job | null;
  onSaved: (job: Job) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0">
        {open ? (
          <JobForm
            key={job?.id ?? "new"}
            job={job}
            onCancel={() => onOpenChange(false)}
            onSaved={onSaved}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function JobForm({
  job,
  onCancel,
  onSaved,
}: {
  job: Job | null;
  onCancel: () => void;
  onSaved: (job: Job) => void;
}) {
  const [status, setStatus] = useState(job?.status ?? "wishlist");
  const [priority, setPriority] = useState(job?.priority ?? "medium");
  const [workMode, setWorkMode] = useState<string>(job?.work_mode ?? "none");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (job) formData.set("id", job.id);
    formData.set("status", status);
    formData.set("priority", priority);
    formData.set("workMode", workMode);

    setError(null);
    setFieldErrors({});

    startTransition(async () => {
      const result = await saveJob(formData);
      if (!result.ok) {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }
      toast.success(job ? "Application updated." : "Application added.");
      onSaved(result.data);
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex max-h-[calc(100dvh-2rem)] flex-col">
      <div className="border-line shrink-0 border-b px-5 py-4 pr-14 sm:px-6">
        <div className="kicker text-copper">{job ? "Edit record" : "New application"}</div>
        <DialogTitle className="mt-1.5">
          {job ? "Update the application" : "Add an application"}
        </DialogTitle>
        <DialogDescription className="mt-1">
          Company and role are required. The rest can fill in as the conversation moves.
        </DialogDescription>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                name="company"
                defaultValue={job?.company ?? ""}
                placeholder="e.g. Linear"
                autoFocus
                aria-invalid={Boolean(fieldErrors.company)}
              />
              {fieldErrors.company ? <FieldError>{fieldErrors.company}</FieldError> : null}
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                name="role"
                defaultValue={job?.role ?? ""}
                placeholder="e.g. Product Engineer"
                aria-invalid={Boolean(fieldErrors.role)}
              />
              {fieldErrors.role ? <FieldError>{fieldErrors.role}</FieldError> : null}
            </div>
          </div>

          <div>
            <Label htmlFor="url">Job link</Label>
            <Input
              id="url"
              name="url"
              type="text"
              inputMode="url"
              defaultValue={job?.url ?? ""}
              placeholder="https://company.com/careers/…"
              aria-invalid={Boolean(fieldErrors.url)}
            />
            {fieldErrors.url ? <FieldError>{fieldErrors.url}</FieldError> : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as Job["status"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {jobStatusOrder.map((value) => (
                    <SelectItem key={value} value={value}>
                      {jobStatusLabels[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select
                value={priority}
                onValueChange={(value) => setPriority(value as Job["priority"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOrder.map((value) => (
                    <SelectItem key={value} value={value}>
                      {priorityLabels[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Work mode</Label>
              <Select value={workMode} onValueChange={setWorkMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not set</SelectItem>
                  {workModes
                    .filter((value) => value !== "none")
                    .map((value) => (
                      <SelectItem key={value} value={value}>
                        {workModeLabels[value as keyof typeof workModeLabels]}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                defaultValue={job?.location ?? ""}
                placeholder="Remote · Bengaluru · New York"
              />
            </div>
            <div>
              <Label htmlFor="salaryRange">Salary range</Label>
              <Input
                id="salaryRange"
                name="salaryRange"
                defaultValue={job?.salary_range ?? ""}
                placeholder="$120k – $160k"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="source">Source</Label>
              <Input
                id="source"
                name="source"
                defaultValue={job?.source ?? ""}
                placeholder="Referral, job board, cold outreach…"
              />
            </div>
            <div>
              <Label htmlFor="resumeVersion">Résumé version</Label>
              <Input
                id="resumeVersion"
                name="resumeVersion"
                defaultValue={job?.resume_version ?? ""}
                placeholder="e.g. frontend-v3"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="appliedAt">Applied on</Label>
              <Input
                id="appliedAt"
                name="appliedAt"
                type="date"
                defaultValue={job?.applied_at ?? ""}
                className="[color-scheme:dark]"
              />
            </div>
            <div>
              <Label htmlFor="followUpAt">Follow up on</Label>
              <Input
                id="followUpAt"
                name="followUpAt"
                type="date"
                defaultValue={job?.follow_up_at ?? ""}
                className="[color-scheme:dark]"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="contactName">Contact name</Label>
              <Input
                id="contactName"
                name="contactName"
                defaultValue={job?.contact_name ?? ""}
                placeholder="Recruiter or hiring manager"
              />
            </div>
            <div>
              <Label htmlFor="contactEmail">Contact email</Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                defaultValue={job?.contact_email ?? ""}
                placeholder="name@company.com"
                aria-invalid={Boolean(fieldErrors.contactEmail)}
              />
              {fieldErrors.contactEmail ? (
                <FieldError>{fieldErrors.contactEmail}</FieldError>
              ) : null}
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={job?.notes ?? ""}
              placeholder="What was discussed, what to prepare, what to ask next…"
              className="min-h-28"
            />
          </div>
        </div>

        {error ? (
          <div className="border-clay/25 bg-clay/[0.08] text-clay mt-4 rounded-lg border px-3 py-2 text-sm">
            {error}
          </div>
        ) : null}
      </div>

      <DialogFooter className="mx-0 mt-0 shrink-0 px-5 py-4 sm:px-6">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {job ? "Save changes" : "Add application"}
        </Button>
      </DialogFooter>
    </form>
  );
}
