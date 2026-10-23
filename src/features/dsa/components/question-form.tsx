"use client";

import dynamic from "next/dynamic";
import { Fragment, useState, useTransition, type FormEvent } from "react";
import { Loader2, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { Checkbox } from "@/components/ui/checkbox";
import type { Question, Topic } from "@/lib/supabase/database.types";
import { buildTopicTree } from "@/features/dsa/topics";
import { saveQuestion } from "@/features/dsa/actions";
import { cn } from "@/lib/utils/cn";

const CodeEditor = dynamic(() => import("./code-editor"), {
  ssr: false,
  loading: () => (
    <div className="h-[240px] animate-pulse rounded-lg border border-line bg-white/[0.02]" />
  ),
});

const languages = [
  { value: "none", label: "Plain text" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
];

const difficulties = [
  { value: "none", label: "Not set" },
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

const statuses = [
  { value: "todo", label: "To do" },
  { value: "attempted", label: "Attempted" },
  { value: "solved", label: "Solved" },
  { value: "needs_revision", label: "Needs revision" },
];

export function QuestionFormDialog({
  open,
  onOpenChange,
  topics,
  question,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topics: Topic[];
  question: Question | null;
  onSaved: (question: Question) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0">
        {open ? (
          <QuestionForm
            key={question?.id ?? "new"}
            topics={topics}
            question={question}
            onCancel={() => onOpenChange(false)}
            onSaved={onSaved}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function QuestionForm({
  topics,
  question,
  onCancel,
  onSaved,
}: {
  topics: Topic[];
  question: Question | null;
  onCancel: () => void;
  onSaved: (question: Question) => void;
}) {
  const tree = buildTopicTree(topics);
  const [difficulty, setDifficulty] = useState(question?.difficulty ?? "none");
  const [status, setStatus] = useState<string>(question?.status ?? "todo");
  const [topicId, setTopicId] = useState(question?.topic_id ?? "none");
  const [language, setLanguage] = useState(question?.language ?? "none");
  const [starred, setStarred] = useState(question?.starred ?? false);
  const [code, setCode] = useState(question?.code ?? "");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (question) formData.set("id", question.id);
    formData.set("difficulty", difficulty);
    formData.set("status", status);
    formData.set("topicId", topicId);
    formData.set("language", language);
    formData.set("starred", starred ? "on" : "");
    formData.set("code", code);

    setError(null);
    setFieldErrors({});

    startTransition(async () => {
      const result = await saveQuestion(formData);
      if (!result.ok) {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }
      toast.success(question ? "Problem updated." : "Problem added to the register.");
      onSaved(result.data);
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex max-h-[calc(100dvh-2rem)] flex-col">
      <div className="shrink-0 border-b border-line px-5 py-4 pr-14 sm:px-6">
        <div className="kicker text-copper">{question ? "Edit record" : "New record"}</div>
        <DialogTitle className="mt-1.5">
          {question ? "Update the problem" : "Add a problem"}
        </DialogTitle>
        <DialogDescription className="mt-1">
          Only the title is required. Add as much or as little as you like.
        </DialogDescription>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                defaultValue={question?.title ?? ""}
                placeholder="e.g. Trapping Rain Water"
                autoFocus
                aria-invalid={Boolean(fieldErrors.title)}
              />
              {fieldErrors.title ? <FieldError>{fieldErrors.title}</FieldError> : null}
            </div>

            <div>
              <Label htmlFor="url">Problem link</Label>
              <Input
                id="url"
                name="url"
                type="text"
                inputMode="url"
                defaultValue={question?.url ?? ""}
                placeholder="https://leetcode.com/problems/…"
                aria-invalid={Boolean(fieldErrors.url)}
              />
              {fieldErrors.url ? <FieldError>{fieldErrors.url}</FieldError> : null}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="platform">Platform</Label>
                <Input
                  id="platform"
                  name="platform"
                  defaultValue={question?.platform ?? ""}
                  placeholder="LeetCode"
                />
              </div>
              <div>
                <Label>Difficulty</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Topic</Label>
                <Select value={topicId} onValueChange={setTopicId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Unfiled" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unfiled</SelectItem>
                    {tree.map((parent) => (
                      <Fragment key={parent.id}>
                        <SelectItem value={parent.id}>{parent.name}</SelectItem>
                        {parent.children.map((child) => (
                          <SelectItem key={child.id} value={child.id}>
                            <span className="pl-3 text-ash">↳ {child.name}</span>
                          </SelectItem>
                        ))}
                      </Fragment>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="solvedAt">Solved on</Label>
                <Input
                  id="solvedAt"
                  name="solvedAt"
                  type="date"
                  defaultValue={question?.solved_at ?? ""}
                  className="[color-scheme:dark]"
                />
              </div>
              <div>
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  name="tags"
                  defaultValue={question?.tags.join(", ") ?? ""}
                  placeholder="arrays, two-pointer"
                />
                <FieldHint>Comma separated.</FieldHint>
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-line bg-white/[0.015] px-3 py-2.5">
              <Checkbox checked={starred} onCheckedChange={(value) => setStarred(value === true)} />
              <span className="flex items-center gap-2 text-sm text-ash">
                <Star className={cn("size-3.5", starred && "fill-copper text-copper")} />
                Star this problem
              </span>
            </label>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                defaultValue={question?.notes ?? ""}
                placeholder="Approach, edge cases, mistakes to remember…"
                className="min-h-32"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-end justify-between gap-3">
              <div>
                <Label>Solution</Label>
                <FieldHint className="mt-0">Markdown in notes, code here.</FieldHint>
              </div>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="h-8 w-36 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <CodeEditor
              value={code}
              language={language === "none" ? null : language}
              onChange={setCode}
              minHeight="400px"
            />
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-lg border border-clay/25 bg-clay/[0.08] px-3 py-2 text-sm text-clay">
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
          {question ? "Save changes" : "Add problem"}
        </Button>
      </DialogFooter>
    </form>
  );
}
