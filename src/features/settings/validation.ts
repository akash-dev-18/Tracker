import { z } from "zod";

export const settingsSchema = z.object({
  displayName: z
    .string()
    .trim()
    .max(80, "Keep your name under 80 characters.")
    .transform((value) => value || null),
  dailyGoal: z.coerce
    .number()
    .int("Use a whole number.")
    .min(1, "Set a target of at least 1.")
    .max(20, "Keep the daily target at 20 or below."),
  timezone: z
    .string()
    .trim()
    .min(1, "Choose a timezone.")
    .max(64)
    .refine((value) => {
      try {
        new Intl.DateTimeFormat("en-US", { timeZone: value }).format();
        return true;
      } catch {
        return false;
      }
    }, "Choose a valid timezone."),
});
