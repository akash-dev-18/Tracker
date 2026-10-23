"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import type * as React from "react";
import { cn } from "@/lib/utils/cn";

export function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-line-strong bg-white/[0.05] transition-colors outline-none focus-visible:ring-1 focus-visible:ring-copper/60 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-copper/60 data-[state=checked]:bg-copper/80",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="pointer-events-none block size-3.5 translate-x-0.5 rounded-full bg-bone shadow transition-transform data-[state=checked]:translate-x-[18px] data-[state=checked]:bg-ink" />
    </SwitchPrimitive.Root>
  );
}
