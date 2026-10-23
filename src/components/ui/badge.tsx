import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] leading-5 font-medium whitespace-nowrap",
  {
    variants: {
      tone: {
        neutral: "border-line bg-white/[0.03] text-ash",
        copper: "border-copper/25 bg-copper/[0.08] text-copper",
        verdigris: "border-verdigris/25 bg-verdigris/[0.08] text-verdigris",
        ochre: "border-ochre/25 bg-ochre/[0.08] text-ochre",
        clay: "border-clay/25 bg-clay/[0.08] text-clay",
        outline: "border-line-strong bg-transparent text-bone",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  },
);

export type BadgeProps = React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>;

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

export function Dot({ className }: { className?: string }) {
  return <span className={cn("size-1.5 shrink-0 rounded-full bg-current", className)} />;
}
