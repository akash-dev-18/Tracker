"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import {
  ArrowLeft,
  CornerDownRight,
  FolderPlus,
  Layers,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
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
import { FieldError, Input, Label } from "@/components/ui/input";
import { SectionHeading } from "@/components/ui/panel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Topic } from "@/lib/supabase/database.types";
import { deleteTopic, saveTopic } from "@/features/dsa/actions";
import { buildTopicTree } from "@/features/dsa/topics";

export function TopicsManager({
  topics,
  counts,
}: {
  topics: Topic[];
  counts: Record<string, number>;
}) {
  const router = useRouter();
  const tree = buildTopicTree(topics);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Topic | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Topic | null>(null);
  const [deleting, startDelete] = useTransition();

  function openNew() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(topic: Topic) {
    setEditing(topic);
    setDialogOpen(true);
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    const target = pendingDelete;
    startDelete(async () => {
      const result = await deleteTopic(target.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setPendingDelete(null);
      toast.success("Topic deleted. Its problems are now unfiled.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-7">
      <SectionHeading
        index="02"
        title="Topics"
        description="A small, two-level map of the syllabus. Problems can live on a parent or a subtopic."
        actions={
          <>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dsa">
                <ArrowLeft className="size-3.5" /> Practice
              </Link>
            </Button>
            <Button variant="primary" size="sm" onClick={openNew}>
              <Plus className="size-4" /> Add topic
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="surface min-w-0 overflow-hidden rounded-card">
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <span className="kicker">Syllabus map</span>
            <span className="font-mono text-[10px] text-faint">
              {tree.length} parents · {topics.filter((topic) => topic.parent_id).length} subtopics
            </span>
          </div>

          {tree.length === 0 ? (
            <EmptyState
              icon={Layers}
              title="The syllabus is empty."
              description="Add your first parent topic, then nest subtopics beneath it. The starter tree may not have seeded if your account predates the migration."
              action={
                <Button variant="primary" onClick={openNew}>
                  <FolderPlus className="size-4" /> Add topic
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-line">
              {tree.map((parent, index) => {
                const childCount = parent.children.reduce(
                  (sum, child) => sum + (counts[child.id] ?? 0),
                  0,
                );
                const total = (counts[parent.id] ?? 0) + childCount;
                return (
                  <li key={parent.id} className="px-2 py-1.5">
                    <div className="group flex items-center gap-2 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.025]">
                      <span className="w-6 font-mono text-[9px] text-faint">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm text-bone">{parent.name}</div>
                        <div className="font-mono text-[9px] text-faint">
                          {parent.children.length} subtopics
                        </div>
                      </div>
                      <span className="font-mono text-[10px] text-faint">{total} problems</span>
                      <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="size-7 text-faint"
                          onClick={() => {
                            const full = topics.find((entry) => entry.id === parent.id);
                            if (full) openEdit(full);
                          }}
                          aria-label={`Edit ${parent.name}`}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="size-7 text-faint hover:text-clay"
                          onClick={() => {
                            const full = topics.find((entry) => entry.id === parent.id);
                            if (full) setPendingDelete(full);
                          }}
                          aria-label={`Delete ${parent.name}`}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>

                    {parent.children.length > 0 ? (
                      <ul className="mb-1 ml-10 space-y-0.5 border-l border-line pl-3">
                        {parent.children.map((child) => (
                          <li
                            key={child.id}
                            className="group flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-white/[0.02]"
                          >
                            <CornerDownRight className="size-3 shrink-0 text-faint/70" />
                            <span className="min-w-0 flex-1 truncate text-xs text-ash">
                              {child.name}
                            </span>
                            <span className="font-mono text-[9px] text-faint">
                              {counts[child.id] ?? 0}
                            </span>
                            <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="size-6 text-faint"
                                onClick={() => {
                                  const topic = topics.find((entry) => entry.id === child.id);
                                  if (topic) openEdit(topic);
                                }}
                                aria-label={`Edit ${child.name}`}
                              >
                                <Pencil className="size-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="size-6 text-faint hover:text-clay"
                                onClick={() => {
                                  const topic = topics.find((entry) => entry.id === child.id);
                                  if (topic) setPendingDelete(topic);
                                }}
                                aria-label={`Delete ${child.name}`}
                              >
                                <Trash2 className="size-3" />
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <aside className="space-y-4">
          <div className="surface rounded-card p-5">
            <div className="kicker text-copper">How it works</div>
            <p className="mt-2 text-sm leading-relaxed text-ash">
              Keep the map shallow. Two levels are enough to separate a subject from its patterns
              without turning revision into filing.
            </p>
            <ul className="mt-4 space-y-2.5 text-xs text-faint">
              <li className="flex gap-2">
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-copper" />
                Deleting a parent also removes its subtopics.
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-copper" />
                Problems are never deleted with a topic — they become unfiled.
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-copper" />
                Click a topic in Practice to filter the register.
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <TopicDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        topics={topics}
        topic={editing}
        onSaved={() => {
          setDialogOpen(false);
          router.refresh();
        }}
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
            <DialogTitle className="mt-1">Delete “{pendingDelete?.name}”?</DialogTitle>
            <DialogDescription>
              {pendingDelete?.parent_id
                ? "Any problems filed here will become unfiled."
                : "Its subtopics will also be deleted. Problems inside them will become unfiled."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPendingDelete(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete} disabled={deleting}>
              {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              Delete topic
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TopicDialog({
  open,
  onOpenChange,
  topics,
  topic,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topics: Topic[];
  topic: Topic | null;
  onSaved: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {open ? (
          <TopicForm
            key={topic?.id ?? "new"}
            topics={topics}
            topic={topic}
            onCancel={() => onOpenChange(false)}
            onSaved={onSaved}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function TopicForm({
  topics,
  topic,
  onCancel,
  onSaved,
}: {
  topics: Topic[];
  topic: Topic | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [parentId, setParentId] = useState(topic?.parent_id ?? "none");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  const hasChildren = topic ? topics.some((entry) => entry.parent_id === topic.id) : false;
  const parentOptions = topics.filter(
    (entry) => !entry.parent_id && entry.id !== topic?.id,
  );

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (topic) formData.set("id", topic.id);
    formData.set("parentId", parentId);
    setError(null);
    setFieldErrors({});

    startTransition(async () => {
      const result = await saveTopic(formData);
      if (!result.ok) {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }
      toast.success(topic ? "Topic updated." : "Topic added.");
      onSaved();
    });
  }

  return (
    <form onSubmit={onSubmit}>
      <DialogHeader>
        <div className="kicker text-copper">{topic ? "Edit topic" : "New topic"}</div>
        <DialogTitle className="mt-1">{topic ? topic.name : "Add a topic"}</DialogTitle>
        <DialogDescription>
          Parents stay broad. Use a subtopic for a specific pattern or technique.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div>
          <Label htmlFor="topic-name">Name</Label>
          <Input
            id="topic-name"
            name="name"
            defaultValue={topic?.name ?? ""}
            placeholder="e.g. Dynamic Programming"
            autoFocus
            aria-invalid={Boolean(fieldErrors.name)}
          />
          {fieldErrors.name ? <FieldError>{fieldErrors.name}</FieldError> : null}
        </div>

        <div>
          <Label>Parent</Label>
          <Select
            value={hasChildren ? "none" : parentId}
            onValueChange={setParentId}
            disabled={hasChildren}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Top level</SelectItem>
              {parentOptions.map((parent) => (
                <SelectItem key={parent.id} value={parent.id}>
                  {parent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasChildren ? (
            <p className="mt-1.5 text-xs text-faint">
              This topic has subtopics, so it must stay at the top level.
            </p>
          ) : (
            <p className="mt-1.5 text-xs text-faint">
              Subtopics can only sit one level beneath a parent.
            </p>
          )}
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-lg border border-clay/25 bg-clay/[0.08] px-3 py-2 text-sm text-clay">
          {error}
        </div>
      ) : null}

      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {topic ? "Save changes" : "Add topic"}
        </Button>
      </DialogFooter>
    </form>
  );
}
