"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type * as React from "react";
import { cn } from "@/lib/utils/cn";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

export function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  side?: "right" | "left" | "bottom";
}) {
  const positions = {
    right:
      "inset-y-0 right-0 h-dvh w-full max-w-md border-l data-[state=open]:animate-slide-in-right",
    left: "inset-y-0 left-0 h-dvh w-full max-w-md border-r data-[state=open]:animate-slide-in-left",
    bottom:
      "inset-x-0 bottom-0 max-h-[88dvh] w-full rounded-t-panel border-t data-[state=open]:animate-slide-up",
  };

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/70 backdrop-blur-[3px] data-[state=open]:animate-fade" />
      <DialogPrimitive.Content
        className={cn(
          "glass-strong fixed z-50 flex flex-col overflow-hidden border-line-strong",
          positions[side],
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute top-4 right-4 grid size-8 place-items-center rounded-md text-faint transition-colors hover:bg-white/[0.05] hover:text-bone">
          <X className="size-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("shrink-0 border-b border-line px-5 py-4 pr-14", className)}
      {...props}
    />
  );
}

export function SheetTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn("text-lg leading-tight text-bone", className)}
      {...props}
    />
  );
}

export function SheetBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("min-h-0 flex-1 overflow-y-auto px-5 py-4", className)} {...props} />;
}

export function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-end gap-2 border-t border-line px-5 py-3",
        className,
      )}
      {...props}
    />
  );
}
