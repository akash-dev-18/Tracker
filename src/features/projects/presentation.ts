import type { ProjectStatus, TaskStatus } from "@/lib/supabase/database.types";
import type { BadgeProps } from "@/components/ui/badge";

export const projectStatusLabels: Record<ProjectStatus, string> = {
  idea: "Idea",
  active: "Active",
  paused: "Paused",
  done: "Done",
  archived: "Archived",
};

export const projectStatusTones: Record<ProjectStatus, BadgeProps["tone"]> = {
  idea: "neutral",
  active: "verdigris",
  paused: "ochre",
  done: "copper",
  archived: "neutral",
};

export const taskStatusLabels: Record<TaskStatus, string> = {
  todo: "To do",
  doing: "In progress",
  done: "Done",
};

export const projectStatusOrder: ProjectStatus[] = ["idea", "active", "paused", "done", "archived"];
