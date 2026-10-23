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

export const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Use at least 8 characters.")
      .max(72, "Keep your password under 72 characters."),
    confirmPassword: z.string().min(1, "Repeat the new password."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
