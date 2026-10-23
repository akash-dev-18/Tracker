import type { ResourceType } from "@/lib/supabase/database.types";
import type { BadgeProps } from "@/components/ui/badge";

export const resourceTypeLabels: Record<ResourceType, string> = {
  article: "Article",
  video: "Video",
  course: "Course",
  book: "Book",
  docs: "Docs",
  other: "Other",
};

export const resourceTypeTones: Record<ResourceType, BadgeProps["tone"]> = {
  article: "copper",
  video: "ochre",
  course: "verdigris",
  book: "clay",
  docs: "neutral",
  other: "neutral",
};

export const resourceTypeOrder: ResourceType[] = [
  "article",
  "video",
  "course",
  "book",
  "docs",
  "other",
];
