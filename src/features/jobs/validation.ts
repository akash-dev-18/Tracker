import { z } from "zod";

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
const optionalEmail = z.preprocess(
  nullIfEmpty,
  z.string().email("Enter a valid email address.").nullable(),
);
const optionalDate = z.preprocess(
  nullIfEmpty,
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date.")
    .nullable(),
);

export const jobStatuses = [
  "wishlist",
  "applied",
  "screening",
  "interview",
  "offer",
  "rejected",
  "ghosted",
  "withdrawn",
] as const;

export const jobInputSchema = z.object({
  id: z.preprocess(nullIfEmpty, z.string().uuid().nullable()),
  company: z
    .string()
    .trim()
    .min(1, "A company is required.")
    .max(160, "Keep the company under 160 characters."),
  role: z
    .string()
    .trim()
    .min(1, "A role is required.")
    .max(160, "Keep the role under 160 characters."),
  url: optionalUrl,
  status: z.preprocess(
    (value) => (value === null || value === undefined || value === "" ? "wishlist" : value),
    z.enum(jobStatuses),
  ),
  location: optionalString,
  workMode: z.preprocess(nullIfEmpty, z.enum(["onsite", "hybrid", "remote"]).nullable()),
  salaryRange: optionalString,
  source: optionalString,
  appliedAt: optionalDate,
  followUpAt: optionalDate,
  resumeVersion: optionalString,
  contactName: optionalString,
  contactEmail: optionalEmail,
  priority: z.preprocess(
    (value) => (value === null || value === undefined || value === "" ? "medium" : value),
    z.enum(["low", "medium", "high"]),
  ),
  notes: optionalString,
});

export type JobInput = z.infer<typeof jobInputSchema>;

export const jobEventInputSchema = z.object({
  jobId: z.string().uuid(),
  type: z
    .string()
    .trim()
    .min(1, "Pick an event type.")
    .max(80, "Keep the event type under 80 characters."),
  note: optionalString,
  happenedAt: optionalDate,
});

export type JobEventInput = z.infer<typeof jobEventInputSchema>;
