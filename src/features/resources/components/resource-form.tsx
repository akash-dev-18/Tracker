"use client";

import { useState, useTransition, type FormEvent } from "react";
import { BookOpen, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldError, FieldHint, Input, Label, Textarea } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Resource } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils/cn";
import { saveResource } from "@/features/resources/actions";
import { resourceTypeLabels, resourceTypeOrder } from "@/features/resources/presentation";

export function ResourceFormDialog({
  open,
  onOpenChange,
  resource,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource: Resource | null;
  onSaved: (resource: Resource) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        {open ? (
          <ResourceForm
            key={resource?.id ?? "new"}
            resource={resource}
            onCancel={() => onOpenChange(false)}
            onSaved={onSaved}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function ResourceForm({
  resource,
  onCancel,
  onSaved,
}: {
  resource: Resource | null;
  onCancel: () => void;
  onSaved: (resource: Resource) => void;
}) {
  const [type, setType] = useState(resource?.type ?? "article");
  const [isRead, setIsRead] = useState(resource?.is_read ?? false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (resource) formData.set("id", resource.id);
    formData.set("type", type);
    formData.set("isRead", isRead ? "on" : "");

    setError(null);
    setFieldErrors({});

    startTransition(async () => {
      const result = await saveResource(formData);
      if (!result.ok) {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }
      toast.success(resource ? "Resource updated." : "Resource saved.");
      onSaved(result.data);
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex max-h-[calc(100dvh-2rem)] flex-col">
      <div className="border-line shrink-0 border-b px-5 py-4 pr-14 sm:px-6">
        <div className="kicker text-copper">{resource ? "Edit resource" : "New resource"}</div>
        <DialogTitle className="mt-1.5">
          {resource ? "Update the entry" : "Save something worth returning to"}
        </DialogTitle>
        <DialogDescription className="mt-1">
          A title is enough. Link it, tag it, and mark it read when you&apos;re done.
        </DialogDescription>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              defaultValue={resource?.title ?? ""}
              placeholder="e.g. Designing Data-Intensive Applications"
              autoFocus
              aria-invalid={Boolean(fieldErrors.title)}
            />
            {fieldErrors.title ? <FieldError>{fieldErrors.title}</FieldError> : null}
          </div>

          <div>
            <Label htmlFor="url">Link</Label>
            <Input
              id="url"
              name="url"
              type="text"
              inputMode="url"
              defaultValue={resource?.url ?? ""}
              placeholder="https://…"
              aria-invalid={Boolean(fieldErrors.url)}
            />
            {fieldErrors.url ? <FieldError>{fieldErrors.url}</FieldError> : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Type</Label>
              <Select value={type} onValueChange={(value) => setType(value as Resource["type"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {resourceTypeOrder.map((value) => (
                    <SelectItem key={value} value={value}>
                      {resourceTypeLabels[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                name="tags"
                defaultValue={resource?.tags.join(", ") ?? ""}
                placeholder="system-design, frontend"
              />
              <FieldHint>Comma separated.</FieldHint>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={resource?.notes ?? ""}
              placeholder="Why is this worth keeping? What did you take from it?"
              className="min-h-32"
            />
          </div>

          <label className="border-line flex cursor-pointer items-center gap-3 rounded-lg border bg-white/[0.015] px-3 py-2.5">
            <Checkbox checked={isRead} onCheckedChange={(value) => setIsRead(value === true)} />
            <span className="text-ash flex items-center gap-2 text-sm">
              <BookOpen className={cn("size-3.5", isRead && "text-verdigris")} />
              Mark as read
            </span>
          </label>
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
          {resource ? "Save changes" : "Add resource"}
        </Button>
      </DialogFooter>
    </form>
  );
}
