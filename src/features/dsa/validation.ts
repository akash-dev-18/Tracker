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
const optionalUuid = z.preprocess(nullIfEmpty, z.string().uuid().nullable());

const difficulty = z.preprocess(
  nullIfEmpty,
  z.enum(["easy", "medium", "hard"]).nullable(),
);
const questionStatus = z.preprocess(
  (value) => (value === null || value === undefined || value === "" ? "todo" : value),
  z.enum(["todo", "attempted", "solved", "needs_revision"]),
);

export const questionInputSchema = z.object({
  id: z.preprocess(nullIfEmpty, z.string().uuid().nullable()),
  title: z
    .string()
    .trim()
    .min(1, "A title is required.")
    .max(220, "Keep the title under 220 characters."),
  url: optionalUrl,
  platform: optionalString,
  difficulty,
  status: questionStatus,
  topicId: optionalUuid,
  notes: optionalString,
  code: optionalString,
  language: optionalString,
  tags: z.preprocess(
    (value) => {
      if (Array.isArray(value)) return value;
      if (typeof value === "string") return parseTags(value);
      return [];
    },
    z.array(z.string()).max(12),
  ),
  starred: z.preprocess(
    (value) => value === "on" || value === "true" || value === true,
    z.boolean(),
  ),
  solvedAt: optionalDate,
});

export type QuestionInput = z.infer<typeof questionInputSchema>;

export const statusUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["todo", "attempted", "solved", "needs_revision"]),
});

export const reviewInputSchema = z.object({
  questionId: z.string().uuid(),
  rating: z.enum(["again", "hard", "good", "easy"]),
});

export const topicInputSchema = z.object({
  id: z.preprocess(nullIfEmpty, z.string().uuid().nullable()),
  name: z
    .string()
    .trim()
    .min(1, "A topic name is required.")
    .max(80, "Keep it under 80 characters."),
  parentId: optionalUuid,
  color: optionalString,
});

export type TopicInput = z.infer<typeof topicInputSchema>;

export const importRowSchema = z.object({
  title: z.string().trim().min(1),
  url: optionalUrl,
  platform: optionalString,
  difficulty,
  status: questionStatus,
  notes: optionalString,
  tags: z.array(z.string()).default([]),
  solvedAt: optionalDate,
});

export type ImportRow = z.infer<typeof importRowSchema>;
