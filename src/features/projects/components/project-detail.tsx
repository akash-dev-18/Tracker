"use client";

import { useState, useTransition, type FormEvent } from "react";
import {
  ArrowUpRight,
  CalendarClock,
  CheckCheck,
  ExternalLink,
  Loader2,
  Pencil,
  Plus,
  Trash2,
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
import type { Project, ProjectTask, TaskStatus } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils/cn";
import { formatCompact, formatShort } from "@/lib/utils/date";
import { addProjectTask } from "@/features/projects/actions";
import {
  projectStatusLabels,
  projectStatusTones,
  taskStatusLabels,
} from "@/features/projects/presentation";
import { priorityLabels, priorityTones } from "@/features/jobs/presentation";

const taskStatuses: TaskStatus[] = ["todo", "doing", "done"];

export function ProjectDetailSheet({
  open,
  onOpenChange,
  project,
  tasks,
  onEdit,
  onDelete,
  onTaskAdded,
  onTaskStatus,
  onTaskDeleted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
  tasks: ProjectTask[];
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onTaskAdded: (task: ProjectTask) => void;
  onTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  onTaskDeleted: (id: string) => Promise<void>;
}) {
  const [confirming, setConfirming] = useState(false);
  const done = tasks.filter((task) => task.status === "done").length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="max-w-xl">
        {!project ? (
          <div className="space-y-5 p-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="mt-6 h-40 w-full" />
          </div>
        ) : (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2 pr-2">
                <span className="kicker text-copper">Project record</span>
                {project.priority === "high" ? (
                  <Badge tone={priorityTones[project.priority]}>
                    {priorityLabels[project.priority]}
                  </Badge>
                ) : null}
              </div>
              <SheetTitle className="mt-1.5 pr-2 font-serif text-[1.65rem] leading-tight">
                {project.name}
              </SheetTitle>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <Badge tone={projectStatusTones[project.status]}>
                  {projectStatusLabels[project.status]}
                </Badge>
                {project.tech.map((tech) => (
                  <Badge key={tech} tone="outline">
                    {tech}
                  </Badge>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-4">
                {project.repo_url ? (
                  <a
                    href={project.repo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-copper inline-flex items-center gap-1.5 text-xs hover:underline"
                  >
                    Repository <ArrowUpRight className="size-3" />
                  </a>
                ) : null}
                {project.live_url ? (
                  <a
                    href={project.live_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-copper inline-flex items-center gap-1.5 text-xs hover:underline"
                  >
                    Live <ExternalLink className="size-3" />
                  </a>
                ) : null}
              </div>
            </SheetHeader>

            <SheetBody className="space-y-6">
              <div className="border-line bg-line grid grid-cols-2 gap-px overflow-hidden rounded-xl border">
                <Meta label="Started" value={formatShort(project.started_at)} />
                <Meta label="Target" value={formatShort(project.target_date)} />
                <Meta label="Tasks done" value={`${done} of ${tasks.length}`} />
                <Meta label="Updated" value={formatCompact(project.updated_at)} />
              </div>

              {project.summary ? (
                <section>
                  <h3 className="kicker mb-2">Summary</h3>
                  <Markdown>{project.summary}</Markdown>
                </section>
              ) : null}

              <section>
                <h3 className="text-bone mb-2 flex items-center gap-2 text-sm">
                  <CalendarClock className="text-faint size-3.5" /> Notes
                </h3>
                {project.notes ? (
                  <Markdown>{project.notes}</Markdown>
                ) : (
                  <p className="border-line text-faint rounded-lg border border-dashed px-3 py-4 text-xs">
                    No notes on this project yet.
                  </p>
                )}
              </section>

              <TaskSection
                projectId={project.id}
                tasks={tasks}
                done={done}
                onAdded={onTaskAdded}
                onStatus={onTaskStatus}
                onDeleted={onTaskDeleted}
              />
            </SheetBody>

            <SheetFooter className="justify-between">
              {confirming ? (
                <div className="flex w-full items-center justify-between gap-3">
                  <span className="text-clay text-xs">Delete this project and its tasks?</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
                      Keep
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => onDelete(project)}>
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
                  <Button size="sm" variant="secondary" onClick={() => onEdit(project)}>
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

function TaskSection({
  projectId,
  tasks,
  done,
  onAdded,
  onStatus,
  onDeleted,
}: {
  projectId: string;
  tasks: ProjectTask[];
  done: number;
  onAdded: (task: ProjectTask) => void;
  onStatus: (id: string, status: TaskStatus) => Promise<void>;
  onDeleted: (id: string) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || !title.trim()) return;
    const formData = new FormData();
    formData.set("projectId", projectId);
    formData.set("title", title);
    formData.set("dueDate", dueDate);
    setError(null);
    startTransition(async () => {
      const result = await addProjectTask(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setTitle("");
      setDueDate("");
      onAdded(result.data);
      toast.success("Task added.");
    });
  }

  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-bone flex items-center gap-2 text-sm">
          <CheckCheck className="text-faint size-3.5" /> Tasks
        </h3>
        <span className="text-faint font-mono text-[10px]">
          {done} / {tasks.length} done
        </span>
      </div>

      <form onSubmit={submit} className="mb-3 flex flex-col gap-2 sm:flex-row">
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Add a task…"
          className="h-8 flex-1 text-xs"
        />
        <Input
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          type="date"
          className="h-8 text-xs [color-scheme:dark] sm:w-36"
        />
        <Button type="submit" size="sm" variant="secondary" disabled={pending || !title.trim()}>
          {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
          Add
        </Button>
      </form>
      {error ? <p className="text-clay mb-2 text-[11px]">{error}</p> : null}

      {tasks.length > 0 ? (
        <ul className="divide-line border-line divide-y overflow-hidden rounded-xl border">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-center gap-2 px-3 py-2">
              <Select
                value={task.status}
                onValueChange={(value) => onStatus(task.id, value as TaskStatus)}
              >
                <SelectTrigger className="h-7 w-32 shrink-0 text-[11px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {taskStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {taskStatusLabels[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span
                className={cn(
                  "min-w-0 flex-1 truncate text-xs",
                  task.status === "done" ? "text-faint line-through" : "text-bone",
                )}
              >
                {task.title}
              </span>
              {task.due_date ? (
                <span className="text-faint shrink-0 font-mono text-[10px]">
                  {formatCompact(task.due_date)}
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => onDeleted(task.id)}
                className="text-faint hover:text-clay shrink-0 transition-colors"
                aria-label={`Delete ${task.title}`}
              >
                <Trash2 className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="border-line text-faint rounded-lg border border-dashed px-3 py-4 text-xs">
          Break the next step into a task or two.
        </p>
      )}
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
