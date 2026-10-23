import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 select-none disabled:pointer-events-none disabled:opacity-45 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-copper/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink active:translate-y-px [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-copper text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] hover:bg-copper-bright",
        secondary:
          "border border-line-strong bg-white/[0.035] text-bone hover:border-white/20 hover:bg-white/[0.06]",
        ghost: "text-ash hover:bg-white/[0.05] hover:text-bone",
        outline: "border border-copper/35 text-copper hover:border-copper/60 hover:bg-copper/[0.08]",
        danger: "border border-clay/30 bg-clay/[0.08] text-clay hover:bg-clay/[0.16]",
        link: "text-copper underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4",
        lg: "h-10 px-5",
        icon: "size-9",
        "icon-sm": "size-8",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "md",
    },
  },
);

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { buttonVariants };
