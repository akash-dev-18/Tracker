"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  ArrowUpRight,
  CalendarClock,
  Check,
  Code2,
  Eye,
  EyeOff,
  Loader2,
  SkipForward,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Markdown } from "@/components/ui/markdown";
import type { ReviewRating, Topic } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils/cn";
import { formatShort } from "@/lib/utils/date";
import {
  difficultyLabels,
  difficultyTones,
  statusLabels,
  statusTones,
} from "@/features/dsa/presentation";
import { recordReview } from "@/features/dsa/actions";
import { topicLabel } from "@/features/dsa/topics";
import { nextReview } from "@/features/revision/algorithm";
import type { ReviewQueueItem } from "@/features/revision/queries";

const ratings: { value: ReviewRating; label: string; className: string }[] = [
  { value: "again", label: "Again", className: "hover:border-clay/50 hover:text-clay" },
  { value: "hard", label: "Hard", className: "hover:border-ochre/50 hover:text-ochre" },
  { value: "good", label: "Good", className: "hover:border-verdigris/50 hover:text-verdigris" },
  { value: "easy", label: "Easy", className: "hover:border-copper/50 hover:text-copper" },
];

export function ReviewSession({
  initialDue,
  topics,
}: {
  initialDue: ReviewQueueItem[];
  topics: Topic[];
}) {
  const [remaining, setRemaining] = useState(initialDue);
  const [revealed, setRevealed] = useState(false);
  const [pendingRating, setPendingRating] = useState<ReviewRating | null>(null);
  const [completed, setCompleted] = useState(0);
  const [isPending, startTransition] = useTransition();

  const current = remaining[0] ?? null;
  const total = initialDue.length;

  function skip() {
    if (remaining.length < 2) {
      toast("That's the only problem in the queue.");
      return;
    }
    setRemaining(([first, ...rest]) => [...rest, first]);
    setRevealed(false);
  }

  function rate(rating: ReviewRating) {
    if (!current || isPending) return;
    const item = current;
    setPendingRating(rating);
    startTransition(async () => {
      const result = await recordReview(item.id, rating);
      if (!result.ok) {
        toast.error(result.error);
        setPendingRating(null);
        return;
      }
      setRemaining((items) => items.filter((question) => question.id !== item.id));
      setRevealed(false);
      setCompleted((value) => value + 1);
      setPendingRating(null);
      toast.success(
        `Logged. Next review in ${result.data.interval} day${result.data.interval === 1 ? "" : "s"}.`,
      );
    });
  }

  if (!current) {
    return (
      <div className="surface rounded-card overflow-hidden">
        <EmptyState
          icon={completed > 0 ? Check : CalendarClock}
          title={completed > 0 ? "Queue cleared." : "Nothing due today."}
          description={
            completed > 0
              ? `You reviewed ${completed} problem${completed === 1 ? "" : "s"}. The next dates are set — go put the rest of the day to use.`
              : "Mark a problem solved in your practice register and it will show up here on its next review date."
          }
          action={
            <Button asChild variant={completed > 0 ? "primary" : "secondary"}>
              <Link href="/dsa">
                {completed > 0 ? "Back to practice" : "Open practice register"}
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="surface rounded-card overflow-hidden">
      <div className="border-line flex items-center justify-between border-b px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="kicker text-copper">Now reviewing</span>
          <span className="text-faint font-mono text-[10px]">{remaining.length} left</span>
        </div>
        <span className="text-faint tabular font-mono text-[10px]">
          {completed} of {total} done
        </span>
      </div>
      <div className="h-0.5 bg-white/[0.04]">
        <div
          className="bg-copper h-full transition-[width] duration-300"
          style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
        />
      </div>

      <div className="p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-1.5">
          {current.difficulty ? (
            <Badge tone={difficultyTones[current.difficulty]}>
              {difficultyLabels[current.difficulty]}
            </Badge>
          ) : null}
          <Badge tone={statusTones[current.status]}>{statusLabels[current.status]}</Badge>
          {current.platform ? <Badge>{current.platform}</Badge> : null}
          {current.topic_id ? (
            <Badge tone="outline">{topicLabel(topics, current.topic_id) ?? "Topic"}</Badge>
          ) : null}
        </div>

        <h2 className="text-bone mt-4 font-serif text-[clamp(1.6rem,3vw,2.2rem)] leading-tight">
          {current.title}
        </h2>

        {current.url ? (
          <a
            href={current.url}
            target="_blank"
            rel="noreferrer"
            className="text-copper mt-2 inline-flex items-center gap-1.5 text-xs hover:underline"
          >
            Open problem <ArrowUpRight className="size-3" />
          </a>
        ) : null}

        <div className="border-line bg-line mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border sm:grid-cols-4">
          <Meta label="Scheduled" value={formatShort(current.next_review_at)} />
          <Meta
            label="Interval"
            value={current.review_interval > 0 ? `${current.review_interval} days` : "New"}
          />
          <Meta label="Solved" value={formatShort(current.solved_at)} />
          <Meta label="Added" value={formatShort(current.created_at)} />
        </div>

        <div className="border-line mt-6 rounded-xl border bg-black/15">
          <button
            type="button"
            onClick={() => setRevealed((value) => !value)}
            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
          >
            <span className="text-bone flex items-center gap-2 text-sm">
              <Eye className="text-faint size-3.5" />
              {revealed ? "Notes and solution" : "Recall first — then reveal your notes"}
            </span>
            <span className="text-faint flex items-center gap-1.5 font-mono text-[10px] tracking-[0.12em] uppercase">
              {revealed ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
              {revealed ? "Hide" : "Reveal"}
            </span>
          </button>

          {revealed ? (
            <div className="border-line space-y-5 border-t px-4 py-4">
              {current.notes ? (
                <Markdown>{current.notes}</Markdown>
              ) : (
                <p className="text-faint text-xs">No notes saved for this problem.</p>
              )}
              {current.code ? (
                <div className="border-line overflow-hidden rounded-lg border bg-black/25">
                  <div className="border-line flex items-center gap-2 border-b px-3 py-1.5">
                    <Code2 className="text-faint size-3" />
                    <span className="text-faint font-mono text-[10px] tracking-[0.12em] uppercase">
                      {current.language ?? "plain text"}
                    </span>
                  </div>
                  <pre className="text-bone/90 max-h-80 overflow-auto p-3 font-mono text-[12px] leading-relaxed">
                    <code>{current.code}</code>
                  </pre>
                </div>
              ) : null}
              {current.tags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {current.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-faint rounded-md bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="border-line mt-6 border-t pt-5">
          <div className="flex items-center justify-between gap-3">
            <span className="kicker">How did it go?</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={skip}
              disabled={isPending || remaining.length < 2}
            >
              <SkipForward className="size-3.5" /> Skip
            </Button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {ratings.map((rating) => {
              const hint = nextReview(rating.value, current.review_interval);
              return (
                <button
                  key={rating.value}
                  type="button"
                  disabled={isPending}
                  onClick={() => rate(rating.value)}
                  className={cn(
                    "group border-line rounded-lg border bg-white/[0.02] px-2 py-2.5 text-center transition-colors disabled:opacity-50",
                    rating.className,
                  )}
                >
                  <span className="text-ash block text-xs group-hover:text-inherit">
                    {pendingRating === rating.value ? (
                      <Loader2 className="mx-auto size-3.5 animate-spin" />
                    ) : (
                      rating.label
                    )}
                  </span>
                  <span className="text-faint mt-0.5 block font-mono text-[9px]">
                    +{hint.interval}d
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
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
