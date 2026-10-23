"use client";

import { useState, useTransition } from "react";
import {
  ArrowUpRight,
  CalendarClock,
  Check,
  Code2,
  Copy,
  History,
  Loader2,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/ui/markdown";
import { Sheet, SheetBody, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import type { Question, Review, ReviewRating, Topic } from "@/lib/supabase/database.types";
import { difficultyLabels, difficultyTones, statusLabels, statusTones } from "@/features/dsa/presentation";
import { topicLabel } from "@/features/dsa/topics";
import { nextReview } from "@/features/revision/algorithm";
import { formatRelative, formatShort } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";

const ratings: { value: ReviewRating; label: string; className: string }[] = [
  { value: "again", label: "Again", className: "hover:border-clay/50 hover:text-clay" },
  { value: "hard", label: "Hard", className: "hover:border-ochre/50 hover:text-ochre" },
  { value: "good", label: "Good", className: "hover:border-verdigris/50 hover:text-verdigris" },
  { value: "easy", label: "Easy", className: "hover:border-copper/50 hover:text-copper" },
];

function ratingHint(rating: ReviewRating, interval: number): string {
  const next = nextReview(rating, interval);
  return `+${next.interval}d`;
}

export function QuestionDetailSheet({
  open,
  onOpenChange,
  loading,
  error,
  question,
  reviews,
  topics,
  onEdit,
  onDelete,
  onReview,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  error: string | null;
  question: Question | null;
  reviews: Review[];
  topics: Topic[];
  onEdit: (question: Question) => void;
  onDelete: (question: Question) => void;
  onReview: (id: string, rating: ReviewRating) => Promise<boolean>;
}) {
  const [confirming, setConfirming] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pendingRating, setPendingRating] = useState<ReviewRating | null>(null);
  const [isPending, startTransition] = useTransition();

  function copyCode() {
    if (!question?.code) return;
    navigator.clipboard.writeText(question.code).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    });
  }

  function review(rating: ReviewRating) {
    if (!question) return;
    setPendingRating(rating);
    startTransition(async () => {
      await onReview(question.id, rating);
      setPendingRating(null);
    });
  }

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
        ) : error || !question ? (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <p className="text-sm text-ash">{error ?? "That problem no longer exists."}</p>
            <Button variant="secondary" className="mt-4" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        ) : (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2 pr-2">
                <span className="kicker text-copper">Problem record</span>
                {question.starred ? (
                  <Star className="size-3 fill-copper text-copper" />
                ) : null}
              </div>
              <SheetTitle className="mt-1.5 pr-2 font-serif text-[1.65rem] leading-tight">
                {question.title}
              </SheetTitle>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {question.difficulty ? (
                  <Badge tone={difficultyTones[question.difficulty]}>
                    {difficultyLabels[question.difficulty]}
                  </Badge>
                ) : null}
                <Badge tone={statusTones[question.status]}>{statusLabels[question.status]}</Badge>
                {question.platform ? <Badge>{question.platform}</Badge> : null}
                {question.topic_id ? (
                  <Badge tone="outline">{topicLabel(topics, question.topic_id) ?? "Topic"}</Badge>
                ) : null}
              </div>
              {question.url ? (
                <a
                  href={question.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs text-copper hover:underline"
                >
                  Open problem <ArrowUpRight className="size-3" />
                </a>
              ) : null}
            </SheetHeader>

            <SheetBody className="space-y-6">
              <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line">
                <Meta label="Solved" value={formatShort(question.solved_at)} />
                <Meta label="Next review" value={formatShort(question.next_review_at)} />
                <Meta label="Interval" value={question.review_interval > 0 ? `${question.review_interval} days` : "—"} />
                <Meta label="Added" value={formatRelative(question.created_at)} />
              </div>

              <section>
                <div className="mb-2.5 flex items-center justify-between">
                  <h3 className="text-sm text-bone">Log a review</h3>
                  {question.next_review_at ? (
                    <span className="font-mono text-[10px] text-faint uppercase">
                      Next {formatShort(question.next_review_at)}
                    </span>
                  ) : null}
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {ratings.map((rating) => (
                    <button
                      key={rating.value}
                      type="button"
                      disabled={isPending}
                      onClick={() => review(rating.value)}
                      className={cn(
                        "group rounded-lg border border-line bg-white/[0.02] px-1.5 py-2 text-center transition-colors disabled:opacity-50",
                        rating.className,
                      )}
                    >
                      <span className="block text-xs text-ash group-hover:text-inherit">
                        {pendingRating === rating.value ? (
                          <Loader2 className="mx-auto size-3.5 animate-spin" />
                        ) : (
                          rating.label
                        )}
                      </span>
                      <span className="mt-0.5 block font-mono text-[9px] text-faint">
                        {ratingHint(rating.value, question.review_interval)}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="mb-2 flex items-center gap-2 text-sm text-bone">
                  <CalendarClock className="size-3.5 text-faint" /> Notes
                </h3>
                {question.notes ? (
                  <Markdown>{question.notes}</Markdown>
                ) : (
                  <p className="rounded-lg border border-dashed border-line px-3 py-4 text-xs text-faint">
                    No notes on this problem yet.
                  </p>
                )}
              </section>

              <section>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm text-bone">
                    <Code2 className="size-3.5 text-faint" /> Solution
                  </h3>
                  {question.code ? (
                    <button
                      type="button"
                      onClick={copyCode}
                      className="flex items-center gap-1.5 font-mono text-[10px] text-faint uppercase transition-colors hover:text-bone"
                    >
                      {copied ? <Check className="size-3 text-verdigris" /> : <Copy className="size-3" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  ) : null}
                </div>
                {question.code ? (
                  <div className="relative overflow-hidden rounded-xl border border-line bg-black/25">
                    <div className="flex items-center justify-between border-b border-line px-3 py-1.5">
                      <span className="font-mono text-[10px] tracking-[0.12em] text-faint uppercase">
                        {question.language ?? "plain text"}
                      </span>
                    </div>
                    <pre className="max-h-[420px] overflow-auto p-3 font-mono text-[12px] leading-relaxed text-bone/90">
                      <code>{question.code}</code>
                    </pre>
                  </div>
                ) : (
                  <p className="rounded-lg border border-dashed border-line px-3 py-4 text-xs text-faint">
                    No solution saved yet.
                  </p>
                )}
              </section>

              {question.tags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {question.tags.map((tag) => (
                    <span key={tag} className="rounded-md bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-faint">
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : null}

              {reviews.length > 0 ? (
                <section>
                  <h3 className="mb-2 flex items-center gap-2 text-sm text-bone">
                    <History className="size-3.5 text-faint" /> Recent reviews
                  </h3>
                  <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line">
                    {reviews.map((review) => (
                      <li key={review.id} className="flex items-center justify-between px-3 py-2 text-xs">
                        <span className="capitalize text-ash">{review.rating}</span>
                        <span className="font-mono text-[10px] text-faint">
                          {formatRelative(review.reviewed_at)} · {review.interval_after}d
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </SheetBody>

            <SheetFooter className="justify-between">
              {confirming ? (
                <div className="flex w-full items-center justify-between gap-3">
                  <span className="text-xs text-clay">Delete this problem permanently?</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
                      Keep
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => onDelete(question)}>
                      <Trash2 className="size-3.5" /> Delete
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <Button size="sm" variant="ghost" className="text-clay" onClick={() => setConfirming(true)}>
                    <Trash2 className="size-3.5" /> Delete
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => onEdit(question)}>
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

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-carbon/80 px-3 py-2.5">
      <div className="font-mono text-[9px] tracking-[0.14em] text-faint uppercase">{label}</div>
      <div className="mt-1 text-xs text-bone">{value}</div>
    </div>
  );
}
