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
import type { Project } from "@/lib/supabase/database.types";
import { saveProject } from "@/features/projects/actions";
import { priorityLabels, priorityOrder } from "@/features/jobs/presentation";
import { projectStatusLabels, projectStatusOrder } from "@/features/projects/presentation";

export function ProjectFormDialog({
  open,
  onOpenChange,
  project,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
  onSaved: (project: Project) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0">
        {open ? (
          <ProjectForm
            key={project?.id ?? "new"}
            project={project}
            onCancel={() => onOpenChange(false)}
            onSaved={onSaved}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function ProjectForm({
  project,
  onCancel,
  onSaved,
}: {
  project: Project | null;
  onCancel: () => void;
  onSaved: (project: Project) => void;
}) {
  const [status, setStatus] = useState(project?.status ?? "idea");
  const [priority, setPriority] = useState(project?.priority ?? "medium");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (project) formData.set("id", project.id);
    formData.set("status", status);
    formData.set("priority", priority);

    setError(null);
    setFieldErrors({});

    startTransition(async () => {
      const result = await saveProject(formData);
      if (!result.ok) {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }
      toast.success(project ? "Project updated." : "Project added.");
      onSaved(result.data);
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex max-h-[calc(100dvh-2rem)] flex-col">
      <div className="border-line shrink-0 border-b px-5 py-4 pr-14 sm:px-6">
        <div className="kicker text-copper">{project ? "Edit record" : "New project"}</div>
        <DialogTitle className="mt-1.5">
          {project ? "Update the project" : "Start a project"}
        </DialogTitle>
        <DialogDescription className="mt-1">
          The name is required. Keep the scope small enough to finish something real.
        </DialogDescription>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={project?.name ?? ""}
              placeholder="e.g. Docket"
              autoFocus
              aria-invalid={Boolean(fieldErrors.name)}
            />
            {fieldErrors.name ? <FieldError>{fieldErrors.name}</FieldError> : null}
          </div>

          <div>
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              name="summary"
              defaultValue={project?.summary ?? ""}
              placeholder="What are you building, and why?"
              className="min-h-20"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as Project["status"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {projectStatusOrder.map((value) => (
                    <SelectItem key={value} value={value}>
                      {projectStatusLabels[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select
                value={priority}
                onValueChange={(value) => setPriority(value as Project["priority"])}
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
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="repoUrl">Repository</Label>
              <Input
                id="repoUrl"
                name="repoUrl"
                type="text"
                inputMode="url"
                defaultValue={project?.repo_url ?? ""}
                placeholder="https://github.com/…"
                aria-invalid={Boolean(fieldErrors.repoUrl)}
              />
              {fieldErrors.repoUrl ? <FieldError>{fieldErrors.repoUrl}</FieldError> : null}
            </div>
            <div>
              <Label htmlFor="liveUrl">Live URL</Label>
              <Input
                id="liveUrl"
                name="liveUrl"
                type="text"
                inputMode="url"
                defaultValue={project?.live_url ?? ""}
                placeholder="https://…"
                aria-invalid={Boolean(fieldErrors.liveUrl)}
              />
              {fieldErrors.liveUrl ? <FieldError>{fieldErrors.liveUrl}</FieldError> : null}
            </div>
          </div>

          <div>
            <Label htmlFor="tech">Tech</Label>
            <Input
              id="tech"
              name="tech"
              defaultValue={project?.tech.join(", ") ?? ""}
              placeholder="Next.js, TypeScript, Supabase"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="startedAt">Started on</Label>
              <Input
                id="startedAt"
                name="startedAt"
                type="date"
                defaultValue={project?.started_at ?? ""}
                className="[color-scheme:dark]"
              />
            </div>
            <div>
              <Label htmlFor="targetDate">Target date</Label>
              <Input
                id="targetDate"
                name="targetDate"
                type="date"
                defaultValue={project?.target_date ?? ""}
                className="[color-scheme:dark]"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={project?.notes ?? ""}
              placeholder="Scope, constraints, references, next decisions…"
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
          {project ? "Save changes" : "Add project"}
        </Button>
      </DialogFooter>
    </form>
  );
}
