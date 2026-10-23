"use client";

import { useDeferredValue, useMemo, useState, useTransition } from "react";
import {
  BookOpen,
  CheckCircle2,
  Circle,
  ExternalLink,
  Loader2,
  Pencil,
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
import type { Resource } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils/cn";
import { formatCompact } from "@/lib/utils/date";
import { deleteResource, setResourceRead } from "@/features/resources/actions";
import {
  resourceTypeLabels,
  resourceTypeOrder,
  resourceTypeTones,
} from "@/features/resources/presentation";
import type { ResourceListItem } from "@/features/resources/queries";
import { ResourceFormDialog } from "./resource-form";

export function LibraryWorkspace({ initialResources }: { initialResources: ResourceListItem[] }) {
  const [resources, setResources] = useState(initialResources);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [typeFilter, setTypeFilter] = useState("all");
  const [readFilter, setReadFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [formResource, setFormResource] = useState<Resource | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Resource | null>(null);
  const [deleting, startDelete] = useTransition();

  const visible = useMemo(() => {
    const term = deferredSearch.trim().toLowerCase();
    return resources.filter((resource) => {
      if (typeFilter !== "all" && resource.type !== typeFilter) return false;
      if (readFilter === "unread" && resource.is_read) return false;
      if (readFilter === "read" && !resource.is_read) return false;
      if (term) {
        const haystack = [resource.title, resource.notes ?? "", resource.tags.join(" ")]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [resources, typeFilter, readFilter, deferredSearch]);

  const stats = useMemo(() => {
    const read = resources.filter((resource) => resource.is_read).length;
    const notes = resources.filter((resource) => resource.notes && resource.notes.trim()).length;
    return { total: resources.length, read, unread: resources.length - read, notes };
  }, [resources]);

  function closeForm(open: boolean) {
    setFormOpen(open);
    if (!open) setFormResource(null);
  }

  function handleSaved(resource: Resource) {
    setResources((current) => {
      const exists = current.some((item) => item.id === resource.id);
      if (exists) return current.map((item) => (item.id === resource.id ? resource : item));
      return [resource, ...current];
    });
    closeForm(false);
  }

  async function toggleRead(resource: Resource) {
    const next = !resource.is_read;
    setResources((current) =>
      current.map((item) => (item.id === resource.id ? { ...item, is_read: next } : item)),
    );
    const result = await setResourceRead(resource.id, next);
    if (!result.ok) {
      setResources((current) => current.map((item) => (item.id === resource.id ? resource : item)));
      toast.error(result.error);
    }
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    const resource = pendingDelete;
    startDelete(async () => {
      const result = await deleteResource(resource.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setResources((current) => current.filter((item) => item.id !== resource.id));
      setPendingDelete(null);
      toast.success("Resource deleted.");
    });
  }

  return (
    <div className="space-y-7">
      <SectionHeading
        index="06"
        title="Library"
        description="Articles, books, and references worth keeping — without letting them pile up unread."
        actions={
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              setFormResource(null);
              setFormOpen(true);
            }}
          >
            <Plus className="size-3.5" /> Add resource
          </Button>
        }
      />

      <div className="rounded-card border-line bg-line grid grid-cols-2 gap-px overflow-hidden border lg:grid-cols-4">
        <MiniStat label="Saved" value={stats.total} hint="In the library" tone="text-bone" />
        <MiniStat label="Unread" value={stats.unread} hint="Still waiting" tone="text-ochre" />
        <MiniStat label="Read" value={stats.read} hint="Finished" tone="text-verdigris" />
        <MiniStat
          label="With notes"
          value={stats.notes}
          hint="Worth returning to"
          tone="text-copper"
        />
      </div>

      <div className="surface rounded-card min-w-0 overflow-hidden">
        <div className="border-line flex flex-wrap items-center gap-2 border-b p-3">
          <div className="relative min-w-[180px] flex-1">
            <Search className="text-faint pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search titles, notes, tags…"
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

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-8 w-[120px] text-xs">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {resourceTypeOrder.map((type) => (
                <SelectItem key={type} value={type}>
                  {resourceTypeLabels[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={readFilter} onValueChange={setReadFilter}>
            <SelectTrigger className="h-8 w-[110px] text-xs">
              <SelectValue placeholder="Any state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any state</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="read">Read</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {resources.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="The library is empty."
            description="Save the next article, book, or course you want to come back to."
            action={
              <Button
                variant="primary"
                onClick={() => {
                  setFormResource(null);
                  setFormOpen(true);
                }}
              >
                <Plus className="size-4" /> Add first resource
              </Button>
            }
          />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={Search}
            title="Nothing matches those filters."
            description="Try a different search, or clear the library view."
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setSearch("");
                  setTypeFilter("all");
                  setReadFilter("all");
                }}
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <ul className="divide-line divide-y">
            {visible.map((resource) => (
              <li key={resource.id} className="group flex items-start gap-3 px-4 py-3.5 sm:px-5">
                <button
                  type="button"
                  onClick={() => toggleRead(resource)}
                  className={cn(
                    "mt-0.5 shrink-0 transition-colors",
                    resource.is_read ? "text-verdigris" : "text-faint hover:text-bone",
                  )}
                  aria-label={resource.is_read ? "Mark as unread" : "Mark as read"}
                >
                  {resource.is_read ? (
                    <CheckCircle2 className="size-4" />
                  ) : (
                    <Circle className="size-4" />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFormResource(resource);
                        setFormOpen(true);
                      }}
                      className={cn(
                        "hover:text-copper truncate text-left text-sm transition-colors",
                        resource.is_read ? "text-faint" : "text-bone",
                      )}
                    >
                      {resource.title}
                    </button>
                    <Badge tone={resourceTypeTones[resource.type]}>
                      {resourceTypeLabels[resource.type]}
                    </Badge>
                    {resource.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-faint rounded bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  {resource.notes ? (
                    <p className="text-ash mt-1 line-clamp-1 text-xs leading-relaxed">
                      {resource.notes}
                    </p>
                  ) : null}
                  <p className="text-faint mt-1 font-mono text-[10px]">
                    Added {formatCompact(resource.created_at)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  {resource.url ? (
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-faint hover:text-copper grid size-7 place-items-center rounded-md transition-colors hover:bg-white/[0.05]"
                      aria-label="Open resource"
                    >
                      <ExternalLink className="size-3.5" />
                    </a>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => {
                      setFormResource(resource);
                      setFormOpen(true);
                    }}
                    className="text-faint hover:text-bone grid size-7 place-items-center rounded-md transition-colors hover:bg-white/[0.05]"
                    aria-label="Edit resource"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDelete(resource)}
                    className="text-faint hover:bg-clay/10 hover:text-clay grid size-7 place-items-center rounded-md transition-colors"
                    aria-label="Delete resource"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {visible.length > 0 ? (
          <div className="border-line text-faint flex items-center justify-between border-t px-4 py-2.5 font-mono text-[10px]">
            <span>
              {visible.length} of {resources.length} resource{resources.length === 1 ? "" : "s"}
            </span>
            <span className="hidden sm:inline">{stats.unread} unread</span>
          </div>
        ) : null}
      </div>

      <ResourceFormDialog
        open={formOpen}
        onOpenChange={closeForm}
        resource={formResource}
        onSaved={handleSaved}
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
            <DialogTitle className="mt-1">Delete this resource?</DialogTitle>
            <DialogDescription>
              “{pendingDelete?.title}” will be removed from the library.
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
              Delete resource
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
