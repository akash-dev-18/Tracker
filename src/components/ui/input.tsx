import type * as React from "react";
import { cn } from "@/lib/utils/cn";

export function Input({ className, type = "text", ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "h-9 w-full rounded-lg border border-line bg-white/[0.025] px-3 text-sm text-bone shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] transition-colors placeholder:text-faint hover:border-line-strong focus:border-copper/45 focus:bg-white/[0.04] focus:outline-none focus:ring-1 focus:ring-copper/25 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full resize-y rounded-lg border border-line bg-white/[0.025] px-3 py-2.5 text-sm leading-relaxed text-bone transition-colors placeholder:text-faint hover:border-line-strong focus:border-copper/45 focus:bg-white/[0.04] focus:outline-none focus:ring-1 focus:ring-copper/25 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      className={cn("mb-1.5 block text-xs font-medium tracking-wide text-ash", className)}
      {...props}
    />
  );
}

export function FieldHint({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("mt-1.5 text-xs text-faint", className)} {...props} />;
}

export function FieldError({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("mt-1.5 text-xs text-clay", className)} {...props} />;
}
