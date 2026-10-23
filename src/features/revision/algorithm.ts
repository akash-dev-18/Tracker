import { addDaysISO, todayISO } from "@/lib/utils/date";
import type { ReviewRating } from "@/lib/supabase/database.types";

export const REVIEW_LADDER = [1, 3, 7, 14, 30, 60, 90] as const;

export type NextReview = {
  interval: number;
  nextReviewAt: string;
  status: "solved" | "needs_revision";
};

function nextLadderValue(current: number): number {
  const index = REVIEW_LADDER.findIndex((value) => value >= current);
  if (index === -1) return REVIEW_LADDER[REVIEW_LADDER.length - 1];
  return REVIEW_LADDER[Math.min(index + 1, REVIEW_LADDER.length - 1)];
}

export function nextReview(
  rating: ReviewRating,
  currentInterval: number,
  today: string = todayISO(),
): NextReview {
  const current = Math.max(0, currentInterval);

  if (rating === "again") {
    return {
      interval: 1,
      nextReviewAt: addDaysISO(1, new Date(`${today}T12:00:00`)),
      status: "needs_revision",
    };
  }

  if (rating === "hard") {
    const interval = current > 0 ? current : 1;
    return {
      interval,
      nextReviewAt: addDaysISO(interval, new Date(`${today}T12:00:00`)),
      status: "solved",
    };
  }

  if (rating === "easy") {
    const lifted = nextLadderValue(nextLadderValue(current));
    return {
      interval: lifted,
      nextReviewAt: addDaysISO(lifted, new Date(`${today}T12:00:00`)),
      status: "solved",
    };
  }

  const next = nextLadderValue(current);
  return {
    interval: next,
    nextReviewAt: addDaysISO(next, new Date(`${today}T12:00:00`)),
    status: "solved",
  };
}
