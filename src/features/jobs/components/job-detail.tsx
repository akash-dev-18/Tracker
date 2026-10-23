"use client";

import { useState, useTransition } from "react";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarClock,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Send,
  Trash2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Markdown } from "@/components/ui/markdown";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import type { Job, JobEvent } from "@/lib/supabase/database.types";
import { formatRelative, formatShort } from "@/lib/utils/date";
import { addJobEvent } from "@/features/jobs/actions";
import {
  jobStatusLabels,
  jobStatusTones,
  priorityLabels,
  priorityTones,
  workModeLabels,
} from "@/features/jobs/presentation";

const eventTypes = ["note", "follow-up", "screen", "interview", "offer", "rejection"] as const;

export function JobDetailSheet({
  open,
  onOpenChange,
  loading,
  error,
  job,
  events,
  onEdit,
  onDelete,
  onEventAdded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  error: string | null;
  job: Job | null;
  events: JobEvent[];
  onEdit: (job: Job) => void;
  onDelete: (job: Job) => void;
  onEventAdded: (event: JobEvent) => void;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="max-w-xl">
        {loading ? (
          <div className="space-y-5 p-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="grid grid-cols-2 gap-3 pt-6">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
            <Skeleton className="h-40 w-full" />
          </div>
        ) : error || !job ? (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <p className="text-ash text-sm">{error ?? "That application no longer exists."}</p>
            <Button variant="secondary" className="mt-4" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        ) : (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2 pr-2">
                <span className="kicker text-copper">Application record</span>
                {job.priority === "high" ? (
                  <Badge tone={priorityTones[job.priority]}>{priorityLabels[job.priority]}</Badge>
                ) : null}
              </div>
              <SheetTitle className="mt-1.5 pr-2 font-serif text-[1.65rem] leading-tight">
                {job.company}
              </SheetTitle>
              <p className="text-ash mt-1 pr-2 text-sm">{job.role}</p>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <Badge tone={jobStatusTones[job.status]}>{jobStatusLabels[job.status]}</Badge>
                {job.work_mode ? <Badge>{workModeLabels[job.work_mode]}</Badge> : null}
                {job.location ? (
                  <Badge tone="outline">
                    <MapPin className="size-3" /> {job.location}
                  </Badge>
                ) : null}
              </div>
              {job.url ? (
                <a
                  href={job.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-copper mt-3 inline-flex items-center gap-1.5 text-xs hover:underline"
                >
                  Open posting <ArrowUpRight className="size-3" />
                </a>
              ) : null}
            </SheetHeader>

            <SheetBody className="space-y-6">
              <div className="border-line bg-line grid grid-cols-2 gap-px overflow-hidden rounded-xl border">
                <Meta label="Applied" value={formatShort(job.applied_at)} />
                <Meta label="Follow up" value={formatShort(job.follow_up_at)} />
                <Meta label="Salary" value={job.salary_range ?? "—"} />
                <Meta label="Source" value={job.source ?? "—"} />
                <Meta label="Résumé" value={job.resume_version ?? "—"} />
                <Meta label="Added" value={formatRelative(job.created_at)} />
              </div>

              {job.contact_name || job.contact_email ? (
                <section className="border-line rounded-xl border px-3 py-3">
                  <h3 className="kicker mb-2">Contact</h3>
                  <div className="text-ash space-y-1 text-xs">
                    {job.contact_name ? (
                      <p className="flex items-center gap-2">
                        <UserRound className="text-faint size-3.5" /> {job.contact_name}
                      </p>
                    ) : null}
                    {job.contact_email ? (
                      <a
                        href={`mailto:${job.contact_email}`}
                        className="text-copper flex items-center gap-2 hover:underline"
                      >
                        <Mail className="size-3.5" /> {job.contact_email}
                      </a>
                    ) : null}
                  </div>
                </section>
              ) : null}

              <section>
                <h3 className="text-bone mb-2 flex items-center gap-2 text-sm">
                  <BriefcaseBusiness className="text-faint size-3.5" /> Notes
                </h3>
                {job.notes ? (
                  <Markdown>{job.notes}</Markdown>
                ) : (
                  <p className="border-line text-faint rounded-lg border border-dashed px-3 py-4 text-xs">
                    No notes on this application yet.
                  </p>
                )}
              </section>

              <EventComposer jobId={job.id} onAdded={onEventAdded} />

              {events.length > 0 ? (
                <section>
                  <h3 className="text-bone mb-2 flex items-center gap-2 text-sm">
                    <CalendarClock className="text-faint size-3.5" /> Timeline
                  </h3>
                  <ul className="divide-line border-line divide-y overflow-hidden rounded-xl border">
                    {events.map((event) => (
                      <li key={event.id} className="px-3 py-2.5">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-ash text-xs capitalize">{event.type}</span>
                          <span className="text-faint font-mono text-[10px]">
                            {formatRelative(event.happened_at)}
                          </span>
                        </div>
                        {event.note ? (
                          <p className="text-ash mt-1 text-xs leading-relaxed">{event.note}</p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </SheetBody>

            <SheetFooter className="justify-between">
              {confirming ? (
                <div className="flex w-full items-center justify-between gap-3">
                  <span className="text-clay text-xs">Delete this application permanently?</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
                      Keep
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => onDelete(job)}>
                      <Trash2 className="size-3.5" /> Delete
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-clay"
                    onClick={() => setConfirming(true)}
                  >
                    <Trash2 className="size-3.5" /> Delete
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => onEdit(job)}>
                    <Pencil className="size-3.5" /> Edit record
                  </Button>
                </>
              )}
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function EventComposer({ jobId, onAdded }: { jobId: string; onAdded: (event: JobEvent) => void }) {
  const [type, setType] = useState<string>("note");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    if (pending) return;
    const formData = new FormData();
    formData.set("jobId", jobId);
    formData.set("type", type);
    formData.set("note", note);
    setError(null);
    startTransition(async () => {
      const result = await addJobEvent(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setNote("");
      onAdded(result.data);
      toast.success("Event logged.");
    });
  }

  return (
    <section className="border-line rounded-xl border p-3">
      <h3 className="kicker mb-2.5">Log an event</h3>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="h-8 text-xs sm:w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {eventTypes.map((value) => (
              <SelectItem key={value} value={value} className="capitalize">
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="What happened?"
          className="h-8 flex-1 text-xs"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              submit();
            }
          }}
        />
        <Button type="button" size="sm" variant="secondary" onClick={submit} disabled={pending}>
          {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
          Log
        </Button>
      </div>
      {error ? <p className="text-clay mt-2 text-[11px]">{error}</p> : null}
    </section>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-carbon/80 px-3 py-2.5">
      <div className="text-faint font-mono text-[9px] tracking-[0.14em] uppercase">{label}</div>
      <div className="text-bone mt-1 text-xs">{value}</div>
    </div>
  );
}
