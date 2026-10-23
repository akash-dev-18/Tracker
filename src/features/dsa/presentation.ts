import type { QuestionDifficulty, QuestionStatus } from "@/lib/supabase/database.types";
import type { BadgeProps } from "@/components/ui/badge";

export const difficultyLabels: Record<QuestionDifficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export const difficultyTones: Record<QuestionDifficulty, BadgeProps["tone"]> = {
  easy: "verdigris",
  medium: "ochre",
  hard: "clay",
};

export const statusLabels: Record<QuestionStatus, string> = {
  todo: "To do",
  attempted: "Attempted",
  solved: "Solved",
  needs_revision: "Needs revision",
};

export const statusTones: Record<QuestionStatus, BadgeProps["tone"]> = {
  todo: "neutral",
  attempted: "copper",
  solved: "verdigris",
  needs_revision: "ochre",
};

export const allStatuses: QuestionStatus[] = [
  "todo",
  "attempted",
  "solved",
  "needs_revision",
];
