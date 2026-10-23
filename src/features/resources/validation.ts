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

export const resourceInputSchema = z.object({
  id: z.preprocess(nullIfEmpty, z.string().uuid().nullable()),
  title: z
    .string()
    .trim()
    .min(1, "A title is required.")
    .max(220, "Keep the title under 220 characters."),
  url: optionalUrl,
  type: z.preprocess(
    (value) => (value === null || value === undefined || value === "" ? "article" : value),
    z.enum(["article", "video", "course", "book", "docs", "other"]),
  ),
  tags: z.preprocess((value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string") return parseTags(value);
    return [];
  }, z.array(z.string()).max(12)),
  notes: optionalString,
  isRead: z.preprocess(
    (value) => value === "on" || value === "true" || value === true,
    z.boolean(),
  ),
});

export type ResourceInput = z.infer<typeof resourceInputSchema>;
