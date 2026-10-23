import { z } from "zod";
import { parseTags } from "@/lib/utils/text";

const nullIfEmpty = (value: unknown) => {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed || trimmed === "none") return null;
    return trimmed;
  }
  return value;
};

const optionalString = z.preprocess(nullIfEmpty, z.string().nullable());
const optionalUrl = z.preprocess((value) => {
  const clean = nullIfEmpty(value);
  if (clean === null) return null;
  if (typeof clean !== "string") return clean;
  return /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
}, z.string().url("Enter a valid URL.").nullable());
const optionalDate = z.preprocess(
  nullIfEmpty,
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date.")
    .nullable(),
);

export const projectInputSchema = z.object({
  id: z.preprocess(nullIfEmpty, z.string().uuid().nullable()),
  name: z
    .string()
    .trim()
    .min(1, "A project name is required.")
    .max(160, "Keep the name under 160 characters."),
  summary: optionalString,
  repoUrl: optionalUrl,
  liveUrl: optionalUrl,
  status: z.preprocess(
    (value) => (value === null || value === undefined || value === "" ? "idea" : value),
    z.enum(["idea", "active", "paused", "done", "archived"]),
  ),
  tech: z.preprocess((value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string") return parseTags(value);
    return [];
  }, z.array(z.string()).max(16)),
  priority: z.preprocess(
    (value) => (value === null || value === undefined || value === "" ? "medium" : value),
    z.enum(["low", "medium", "high"]),
  ),
  startedAt: optionalDate,
  targetDate: optionalDate,
  notes: optionalString,
});

export type ProjectInput = z.infer<typeof projectInputSchema>;

export const projectTaskInputSchema = z.object({
  projectId: z.string().uuid(),
  title: z
    .string()
    .trim()
    .min(1, "A task title is required.")
    .max(220, "Keep the task under 220 characters."),
  dueDate: optionalDate,
});

export type ProjectTaskInput = z.infer<typeof projectTaskInputSchema>;

export const taskStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["todo", "doing", "done"]),
});
