"use client";

import { useDeferredValue, useMemo, useState, useTransition } from "react";
import {
  ArrowUpRight,
  CalendarClock,
  FolderKanban,
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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Project, ProjectTask, TaskStatus } from "@/lib/supabase/database.types";
import { formatCompact } from "@/lib/utils/date";
import {
  deleteProject,
  deleteProjectTask,
  setProjectTaskStatus,
} from "@/features/projects/actions";
import {
  projectStatusLabels,
  projectStatusOrder,
  projectStatusTones,
} from "@/features/projects/presentation";
import { priorityLabels, priorityTones } from "@/features/jobs/presentation";
import type { ProjectListItem } from "@/features/projects/queries";
import { ProjectDetailSheet } from "./project-detail";
import { ProjectFormDialog } from "./project-form";

const activeStatuses: Project["status"][] = ["active"];
const openTaskStatuses: TaskStatus[] = ["todo", "doing"];

export function ProjectsWorkspace({
  initialProjects,
  initialTasks,
}: {
  initialProjects: ProjectListItem[];
  initialTasks: ProjectTask[];
}) {
  const [projects, setProjects] = useState(initialProjects);
  const [tasks, setTasks] = useState(initialTasks);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [statusFilter, setStatusFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [formProject, setFormProject] = useState<Project | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Project | null>(null);
  const [deleting, startDelete] = useTransition();

  const detailProject = projects.find((project) => project.id === detailId) ?? null;
  const detailTasks = useMemo(
    () => (detailId ? tasks.filter((task) => task.project_id === detailId) : []),
    [tasks, detailId],
  );

  const tasksByProject = useMemo(() => {
    const map = new Map<string, ProjectTask[]>();
    for (const task of tasks) {
      const list = map.get(task.project_id) ?? [];
      list.push(task);
      map.set(task.project_id, list);
    }
    return map;
  }, [tasks]);

  const visible = useMemo(() => {
    const term = deferredSearch.trim().toLowerCase();
    return projects.filter((project) => {
      if (statusFilter !== "all" && project.status !== statusFilter) return false;
      if (term) {
        const haystack = [
          project.name,
          project.summary ?? "",
          project.notes ?? "",
          project.tech.join(" "),
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [projects, statusFilter, deferredSearch]);

  const stats = useMemo(() => {
    const active = projects.filter((project) => activeStatuses.includes(project.status)).length;
    const paused = projects.filter((project) => project.status === "paused").length;
    const done = projects.filter((project) => project.status === "done").length;
    const openTasks = tasks.filter((task) => openTaskStatuses.includes(task.status)).length;
    return { active, paused, done, openTasks };
  }, [projects, tasks]);

  function closeForm(open: boolean) {
    setFormOpen(open);
    if (!open) setFormProject(null);
  }

  function handleSaved(project: Project) {
    setProjects((current) => {
      const exists = current.some((item) => item.id === project.id);
      if (exists) return current.map((item) => (item.id === project.id ? project : item));
      return [project, ...current];
    });
    closeForm(false);
  }

  function handleDelete(project: Project) {
    setPendingDelete(project);
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    const project = pendingDelete;
    startDelete(async () => {
      const result = await deleteProject(project.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setProjects((current) => current.filter((item) => item.id !== project.id));
      setTasks((current) => current.filter((task) => task.project_id !== project.id));
      setPendingDelete(null);
      setDetailId(null);
      toast.success("Project deleted.");
    });
  }

  function handleTaskAdded(task: ProjectTask) {
    setTasks((current) => [...current, task]);
  }

  async function handleTaskStatus(id: string, status: TaskStatus) {
    const before = tasks.find((task) => task.id === id);
    if (!before || before.status === status) return;
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, status } : task)));
    const result = await setProjectTaskStatus(id, status);
    if (!result.ok) {
      setTasks((current) => current.map((task) => (task.id === id ? before : task)));
      toast.error(result.error);
    }
  }

  async function handleTaskDeleted(id: string) {
    const before = tasks.find((task) => task.id === id);
    if (!before) return;
    setTasks((current) => current.filter((task) => task.id !== id));
    const result = await deleteProjectTask(id);
    if (!result.ok) {
      setTasks((current) => [...current, before]);
      toast.error(result.error);
      return;
    }
    toast.success("Task deleted.");
  }

  return (
    <div className="space-y-7">
      <SectionHeading
        index="05"
        title="Projects"
        description="Proof of work, broken into tasks small enough to actually finish."
        actions={
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              setFormProject(null);
              setFormOpen(true);
            }}
          >
            <Plus className="size-3.5" /> Add project
          </Button>
        }
      />

      <div className="rounded-card border-line bg-line grid grid-cols-2 gap-px overflow-hidden border lg:grid-cols-4">
        <MiniStat label="Active" value={stats.active} hint="In motion" tone="text-verdigris" />
        <MiniStat label="Paused" value={stats.paused} hint="Waiting" tone="text-ochre" />
        <MiniStat
          label="Open tasks"
          value={stats.openTasks}
          hint="Across all projects"
          tone="text-bone"
        />
        <MiniStat label="Shipped" value={stats.done} hint="Marked done" tone="text-copper" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[180px] flex-1">
          <Search className="text-faint pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search projects, tech, notes…"
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
            {projectStatusOrder.map((status) => (
              <SelectItem key={status} value={status}>
                {projectStatusLabels[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {projects.length === 0 ? (
        <div className="surface rounded-card">
          <EmptyState
            icon={FolderKanban}
            title="No projects yet."
            description="Add the build that best shows the work you want to be hired for. Then break it into tasks."
            action={
              <Button
                variant="primary"
                onClick={() => {
                  setFormProject(null);
                  setFormOpen(true);
                }}
              >
                <Plus className="size-4" /> Add first project
              </Button>
            }
          />
        </div>
      ) : visible.length === 0 ? (
        <div className="surface rounded-card">
          <EmptyState
            icon={Search}
            title="Nothing matches those filters."
            description="Try a different search or reset the project view."
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
              >
                Clear filters
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {visible.map((project) => {
            const projectTasks = tasksByProject.get(project.id) ?? [];
            const done = projectTasks.filter((task) => task.status === "done").length;
            return (
              <button
                key={project.id}
                type="button"
                onClick={() => setDetailId(project.id)}
                className="surface group rounded-card hover:border-line-strong flex min-h-[220px] flex-col p-5 text-left transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="kicker text-copper">Project</span>
                      {project.priority === "high" ? (
                        <Badge tone={priorityTones[project.priority]}>
                          {priorityLabels[project.priority]}
                        </Badge>
                      ) : null}
                    </div>
                    <h2 className="text-bone mt-2 truncate font-serif text-[1.45rem] leading-tight">
                      {project.name}
                    </h2>
                  </div>
                  <Badge tone={projectStatusTones[project.status]}>
                    {projectStatusLabels[project.status]}
                  </Badge>
                </div>

                <p className="text-ash mt-2 line-clamp-2 text-xs leading-relaxed">
                  {project.summary ?? "No summary yet."}
                </p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {project.tech.slice(0, 4).map((tech) => (
                    <span
                      key={tech}
                      className="text-faint rounded-md bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="mt-auto space-y-2 pt-5">
                  <div className="text-faint flex items-center justify-between font-mono text-[10px]">
                    <span>
                      {done} / {projectTasks.length} tasks
                    </span>
                    <span>
                      {project.target_date
                        ? `Target ${formatCompact(project.target_date)}`
                        : "No target"}
                    </span>
                  </div>
                  <Progress
                    value={done}
                    max={projectTasks.length}
                    label={`${project.name} task progress`}
                  />
                </div>

                <div className="border-line mt-3 flex items-center justify-between border-t pt-3">
                  <span className="text-faint flex items-center gap-1.5 font-mono text-[10px]">
                    <CalendarClock className="size-3" />
                    Updated {formatCompact(project.updated_at)}
                  </span>
                  <span className="text-copper flex items-center gap-1 text-[11px]">
                    Open{" "}
                    <ArrowUpRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {visible.length > 0 ? (
        <p className="text-faint font-mono text-[10px]">
          {visible.length} of {projects.length} project{projects.length === 1 ? "" : "s"}
        </p>
      ) : null}

      <ProjectFormDialog
        open={formOpen}
        onOpenChange={closeForm}
        project={formProject}
        onSaved={handleSaved}
      />

      <ProjectDetailSheet
        open={Boolean(detailProject)}
        onOpenChange={(open) => {
          if (!open) setDetailId(null);
        }}
        project={detailProject}
        tasks={detailTasks}
        onTaskAdded={handleTaskAdded}
        onTaskStatus={handleTaskStatus}
        onTaskDeleted={handleTaskDeleted}
        onEdit={(project) => {
          setDetailId(null);
          setFormProject(project);
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
            <DialogTitle className="mt-1">Delete this project?</DialogTitle>
            <DialogDescription>
              “{pendingDelete?.name}” will be removed along with its notes and task list.
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
              Delete project
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
        <span className={`tabular font-serif text-2xl leading-none ${tone}`}>{value}</span>
        <span className="text-faint font-mono text-[9px]">{hint}</span>
      </div>
    </div>
  );
}
