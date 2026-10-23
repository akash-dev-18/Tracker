"use client";

import { useDeferredValue, useMemo, useState, useTransition } from "react";
import {
  BriefcaseBusiness,
  CalendarClock,
  ChevronRight,
  CircleAlert,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { SectionHeading } from "@/components/ui/panel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Job, JobEvent } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils/cn";
import { formatCompact, todayISO } from "@/lib/utils/date";
import { deleteJob, getJobDetail } from "@/features/jobs/actions";
import {
  jobStatusLabels,
  jobStatusOrder,
  jobStatusTones,
  priorityLabels,
  priorityTones,
  workModeLabels,
} from "@/features/jobs/presentation";
import type { JobListItem } from "@/features/jobs/queries";
import { JobFormDialog } from "./job-form";
import { JobDetailSheet } from "./job-detail";

type DetailState = {
  open: boolean;
  loading: boolean;
  error: string | null;
  job: Job | null;
  events: JobEvent[];
};

const emptyDetail: DetailState = {
  open: false,
  loading: false,
  error: null,
  job: null,
  events: [],
};

const activeStatuses: Job["status"][] = ["applied", "screening", "interview"];

export function JobsWorkspace({ initialJobs }: { initialJobs: JobListItem[] }) {
  const [jobs, setJobs] = useState(initialJobs);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [statusFilter, setStatusFilter] = useState("all");
  const [followUpOnly, setFollowUpOnly] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formJob, setFormJob] = useState<Job | null>(null);
  const [detail, setDetail] = useState<DetailState>(emptyDetail);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; label: string } | null>(null);
  const [deleting, startDelete] = useTransition();
  const today = todayISO();

  const visible = useMemo(() => {
    const term = deferredSearch.trim().toLowerCase();
    return jobs.filter((job) => {
      if (statusFilter !== "all" && job.status !== statusFilter) return false;
      if (followUpOnly && !(job.follow_up_at && job.follow_up_at <= today)) return false;
      if (term) {
        const haystack = [
          job.company,
          job.role,
          job.location ?? "",
          job.source ?? "",
          job.notes ?? "",
          job.contact_name ?? "",
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [jobs, statusFilter, followUpOnly, deferredSearch, today]);

  const stats = useMemo(() => {
    const active = jobs.filter((job) => activeStatuses.includes(job.status)).length;
    const interviews = jobs.filter(
      (job) => job.status === "screening" || job.status === "interview",
    ).length;
    const offers = jobs.filter((job) => job.status === "offer").length;
    const followUps = jobs.filter(
      (job) => activeStatuses.includes(job.status) && job.follow_up_at && job.follow_up_at <= today,
    ).length;
    return { active, interviews, offers, followUps };
  }, [jobs, today]);

  function closeForm(open: boolean) {
    setFormOpen(open);
    if (!open) setFormJob(null);
  }

  function handleSaved(job: Job) {
    setJobs((current) => {
      const exists = current.some((item) => item.id === job.id);
      if (exists) return current.map((item) => (item.id === job.id ? job : item));
      return [job, ...current];
    });
    setDetail((current) => (current.job?.id === job.id ? { ...current, job } : current));
    closeForm(false);
  }

  async function openDetail(id: string) {
    setDetail({ open: true, loading: true, error: null, job: null, events: [] });
    const result = await getJobDetail(id);
    if (!result.ok) {
      setDetail({ open: true, loading: false, error: result.error, job: null, events: [] });
      return;
    }
    setDetail({
      open: true,
      loading: false,
      error: null,
      job: result.data.job,
      events: result.data.events,
    });
  }

  function handleDelete(job: Job) {
    setPendingDelete({ id: job.id, label: `${job.company} · ${job.role}` });
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    startDelete(async () => {
      const result = await deleteJob(id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setJobs((current) => current.filter((job) => job.id !== id));
      setPendingDelete(null);
      setDetail(emptyDetail);
      toast.success("Application deleted.");
    });
  }

  function handleEventAdded(event: JobEvent) {
    setDetail((current) => ({
      ...current,
      events: [event, ...current.events].sort((a, b) => b.happened_at.localeCompare(a.happened_at)),
    }));
  }

  return (
    <div className="space-y-7">
      <SectionHeading
        index="04"
        title="Applications"
        description="Keep the pipeline honest: what you sent, who replied, and what needs a nudge."
        actions={
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              setFormJob(null);
              setFormOpen(true);
            }}
          >
            <Plus className="size-3.5" /> Add application
          </Button>
        }
      />

      <div className="rounded-card border-line bg-line grid grid-cols-2 gap-px overflow-hidden border lg:grid-cols-4">
        <MiniStat
          label="In play"
          value={stats.active}
          hint="Applied to interview"
          tone="text-bone"
        />
        <MiniStat
          label="Interviews"
          value={stats.interviews}
          hint="Screening and on-site"
          tone="text-ochre"
        />
        <MiniStat label="Offers" value={stats.offers} hint="On the table" tone="text-verdigris" />
        <MiniStat
          label="Follow-ups"
          value={stats.followUps}
          hint="Due or overdue"
          tone="text-clay"
        />
      </div>

      <div className="surface rounded-card min-w-0 overflow-hidden">
        <div className="border-line flex flex-wrap items-center gap-2 border-b p-3">
          <div className="relative min-w-[180px] flex-1">
            <Search className="text-faint pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search company, role, notes…"
              className="h-8 pl-8 text-xs"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-faint hover:text-bone absolute top-1/2 right-2 -translate-y-1/2"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {jobStatusOrder.map((status) => (
                <SelectItem key={status} value={status}>
                  {jobStatusLabels[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <button
            type="button"
            onClick={() => setFollowUpOnly((value) => !value)}
            className={cn(
              "flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs transition-colors",
              followUpOnly
                ? "border-copper/40 bg-copper/[0.09] text-copper"
                : "border-line text-ash hover:border-line-strong hover:text-bone bg-white/[0.02]",
            )}
          >
            <CalendarClock className="size-3.5" /> Follow-ups
          </button>
        </div>

        {jobs.length === 0 ? (
          <EmptyState
            icon={BriefcaseBusiness}
            title="No applications recorded yet."
            description="Add the first role you're chasing. Status, contacts, and follow-ups can grow from there."
            action={
              <Button
                variant="primary"
                onClick={() => {
                  setFormJob(null);
                  setFormOpen(true);
                }}
              >
                <Plus className="size-4" /> Add first application
              </Button>
            }
          />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={Search}
            title="Nothing matches those filters."
            description="Try a different search or reset the pipeline view."
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setFollowUpOnly(false);
                }}
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <ul className="divide-line divide-y">
            {visible.map((job) => {
              const followUpDue =
                activeStatuses.includes(job.status) &&
                job.follow_up_at &&
                job.follow_up_at <= today;
              return (
                <li key={job.id}>
                  <button
                    type="button"
                    onClick={() => openDetail(job.id)}
                    className="group flex w-full items-start gap-4 px-4 py-4 text-left transition-colors hover:bg-white/[0.025] sm:items-center sm:px-5"
                  >
                    <div className="border-line text-faint grid size-9 shrink-0 place-items-center rounded-md border bg-white/[0.03]">
                      <BriefcaseBusiness className="size-4" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-bone truncate text-sm">{job.company}</p>
                        {job.priority === "high" ? (
                          <Badge tone={priorityTones[job.priority]}>
                            {priorityLabels[job.priority]}
                          </Badge>
                        ) : null}
                      </div>
                      <p className="text-ash mt-0.5 truncate text-xs">{job.role}</p>
                      <p className="text-faint mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[10px]">
                        {job.location ? <span>{job.location}</span> : null}
                        {job.work_mode ? <span>{workModeLabels[job.work_mode]}</span> : null}
                        {job.source ? <span>{job.source}</span> : null}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5 sm:flex-row sm:items-center sm:gap-4">
                      <Badge tone={jobStatusTones[job.status]}>{jobStatusLabels[job.status]}</Badge>
                      <div className="text-right">
                        <p
                          className={cn(
                            "flex items-center justify-end gap-1 font-mono text-[10px]",
                            followUpDue ? "text-clay" : "text-faint",
                          )}
                        >
                          {followUpDue ? <CircleAlert className="size-3" /> : null}
                          {job.follow_up_at
                            ? `Follow up ${formatCompact(job.follow_up_at)}`
                            : "No follow-up"}
                        </p>
                        <p className="text-faint mt-0.5 font-mono text-[10px]">
                          {job.applied_at
                            ? `Applied ${formatCompact(job.applied_at)}`
                            : formatCompact(job.updated_at)}
                        </p>
                      </div>
                      <ChevronRight className="text-faint size-4 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {visible.length > 0 ? (
          <div className="border-line text-faint flex items-center justify-between border-t px-4 py-2.5 font-mono text-[10px]">
            <span>
              {visible.length} of {jobs.length} application{jobs.length === 1 ? "" : "s"}
            </span>
            <span className="hidden sm:inline">Ordered by last update</span>
          </div>
        ) : null}
      </div>

      <JobFormDialog open={formOpen} onOpenChange={closeForm} job={formJob} onSaved={handleSaved} />

      <JobDetailSheet
        open={detail.open}
        onOpenChange={(open) => setDetail((current) => (open ? { ...current, open } : emptyDetail))}
        loading={detail.loading}
        error={detail.error}
        job={detail.job}
        events={detail.events}
        onEventAdded={handleEventAdded}
        onEdit={(job) => {
          setDetail(emptyDetail);
          setFormJob(job);
          setFormOpen(true);
        }}
        onDelete={handleDelete}
      />

      <Dialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="kicker text-clay">Irreversible</div>
            <DialogTitle className="mt-1">Delete this application?</DialogTitle>
            <DialogDescription>
              “{pendingDelete?.label}” will be removed along with its notes, contacts, and event
              timeline.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPendingDelete(null)} disabled={deleting}>
              Keep
            </Button>
            <Button variant="danger" onClick={confirmDelete} disabled={deleting}>
              {deleting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              Delete application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MiniStat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: number;
  hint: string;
  tone: string;
}) {
  return (
    <div className="bg-carbon/70 px-4 py-3">
      <div className="kicker">{label}</div>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className={cn("tabular font-serif text-2xl leading-none", tone)}>{value}</span>
        <span className="text-faint font-mono text-[9px]">{hint}</span>
      </div>
    </div>
  );
}
