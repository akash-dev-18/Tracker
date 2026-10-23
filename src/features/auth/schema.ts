import { z } from "zod";

export const signInSchema = z.object({
  email: z.email({ message: "Enter a valid email address." }),
  password: z.string().min(1, "Enter your password."),
});

export const signUpSchema = z.object({
  displayName: z
    .string()
    .trim()
    .max(80, "Keep your name under 80 characters.")
    .optional()
    .transform((value) => value || undefined),
  email: z.email({ message: "Enter a valid email address." }),
  password: z
    .string()
    .min(8, "Use at least 8 characters.")
    .max(72, "Keep your password under 72 characters."),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
