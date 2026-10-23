import type { JobStatus, PriorityLevel, WorkMode } from "@/lib/supabase/database.types";
import type { BadgeProps } from "@/components/ui/badge";

export const jobStatusLabels: Record<JobStatus, string> = {
  wishlist: "Wishlist",
  applied: "Applied",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  ghosted: "Ghosted",
  withdrawn: "Withdrawn",
};

export const jobStatusTones: Record<JobStatus, BadgeProps["tone"]> = {
  wishlist: "neutral",
  applied: "copper",
  screening: "ochre",
  interview: "ochre",
  offer: "verdigris",
  rejected: "clay",
  ghosted: "neutral",
  withdrawn: "neutral",
};

export const priorityLabels: Record<PriorityLevel, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const priorityTones: Record<PriorityLevel, BadgeProps["tone"]> = {
  low: "neutral",
  medium: "ochre",
  high: "clay",
};

export const jobStatusOrder: JobStatus[] = [
  "wishlist",
  "applied",
  "screening",
  "interview",
  "offer",
  "rejected",
  "ghosted",
  "withdrawn",
];

export const workModeLabels: Record<WorkMode, string> = {
  onsite: "On-site",
  hybrid: "Hybrid",
  remote: "Remote",
};

export const priorityOrder: PriorityLevel[] = ["low", "medium", "high"];
