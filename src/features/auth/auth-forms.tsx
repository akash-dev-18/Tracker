"use client";

import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import { signIn, signUp } from "./actions";
import { initialAuthState } from "./state";

function PasswordInput({
  name,
  autoComplete,
  error,
  placeholder = "At least 8 characters",
}: {
  name: string;
  autoComplete: string;
  error?: string;
  placeholder?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        id={name}
        name={name}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={cn("pr-10", error && "border-clay/50 focus:border-clay/60 focus:ring-clay/20")}
        required
      />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-faint transition-colors hover:bg-white/[0.05] hover:text-bone"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
      </button>
    </div>
  );
}

function FormMessage({ tone, children }: { tone: "error" | "success"; children: string }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-lg border px-3 py-2.5 text-xs leading-relaxed",
        tone === "error"
          ? "border-clay/25 bg-clay/[0.08] text-clay"
          : "border-verdigris/25 bg-verdigris/[0.08] text-verdigris",
      )}
    >
      {children}
    </div>
  );
}

function SubmitButton({
  label,
  pending,
}: {
  label: string;
  pending: boolean;
}) {
  return (
    <Button type="submit" variant="primary" className="h-10 w-full justify-between px-4" disabled={pending}>
      <span className="font-medium">{label}</span>
      {pending ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
    </Button>
  );
}

function SignInForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(signIn, initialAuthState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      {state.error ? <FormMessage tone="error">{state.error}</FormMessage> : null}

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className={cn(state.fieldErrors?.email && "border-clay/50")}
          required
        />
        {state.fieldErrors?.email ? <FieldError>{state.fieldErrors.email}</FieldError> : null}
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <PasswordInput
          name="password"
          autoComplete="current-password"
          placeholder="Your password"
          error={state.fieldErrors?.password}
        />
        {state.fieldErrors?.password ? <FieldError>{state.fieldErrors.password}</FieldError> : null}
      </div>

      <SubmitButton label={pending ? "Signing in" : "Sign in"} pending={pending} />
    </form>
  );
}

function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUp, initialAuthState);

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? <FormMessage tone="error">{state.error}</FormMessage> : null}
      {state.message ? <FormMessage tone="success">{state.message}</FormMessage> : null}

      <div>
        <Label htmlFor="displayName">Name</Label>
        <Input
          id="displayName"
          name="displayName"
          autoComplete="name"
          placeholder="How should the register address you?"
        />
        {state.fieldErrors?.displayName ? (
          <FieldError>{state.fieldErrors.displayName}</FieldError>
        ) : null}
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className={cn(state.fieldErrors?.email && "border-clay/50")}
          required
        />
        {state.fieldErrors?.email ? <FieldError>{state.fieldErrors.email}</FieldError> : null}
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <PasswordInput
          name="password"
          autoComplete="new-password"
          error={state.fieldErrors?.password}
        />
        {state.fieldErrors?.password ? <FieldError>{state.fieldErrors.password}</FieldError> : null}
      </div>

      <SubmitButton label={pending ? "Creating account" : "Create account"} pending={pending} />
    </form>
  );
}

export function AuthForms({ next }: { next: string }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  return (
    <div className="w-full max-w-[26rem]">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="kicker text-copper">Private register</div>
          <h1 className="mt-2 font-serif text-4xl leading-none text-bone">
            {mode === "signin" ? "Welcome back." : "Open your register."}
          </h1>
        </div>
      </div>

      <div className="mb-6 inline-flex w-full rounded-lg border border-line bg-white/[0.02] p-1">
        <button
          type="button"
          onClick={() => setMode("signin")}
          className={cn(
            "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            mode === "signin" ? "bg-white/[0.07] text-bone" : "text-ash hover:text-bone",
          )}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={cn(
            "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            mode === "signup" ? "bg-white/[0.07] text-bone" : "text-ash hover:text-bone",
          )}
        >
          Create account
        </button>
      </div>

      <div className="glass rounded-panel p-6 sm:p-7">
        {mode === "signin" ? <SignInForm next={next} /> : <SignUpForm />}
      </div>

      <p className="mt-5 text-center text-[11px] leading-relaxed text-faint">
        Your register is private. Every record is scoped to your account and protected by
        row-level security.
      </p>
    </div>
  );
}
