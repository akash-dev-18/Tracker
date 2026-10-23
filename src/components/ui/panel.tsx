import type * as React from "react";
import { cn } from "@/lib/utils/cn";

export function Panel({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("surface min-w-0 overflow-hidden rounded-card", className)} {...props} />;
}

export function PanelHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex min-w-0 items-start justify-between gap-4 border-b border-line px-5 py-4", className)}
      {...props}
    />
  );
}

export function PanelTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return <h2 className={cn("text-lg leading-tight text-bone", className)} {...props} />;
}

export function PanelBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("px-5 py-4", className)} {...props} />;
}

export function SectionHeading({
  index,
  title,
  description,
  actions,
  className,
}: {
  index?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div>
        <div className="flex items-center gap-3">
          {index ? <span className="kicker text-copper">{index}</span> : null}
          <span className="h-px w-6 bg-copper/40" />
          <span className="kicker">{description ? "Register" : "Docket"}</span>
        </div>
        <h1 className="mt-2 text-[clamp(2rem,3.2vw,2.75rem)] leading-[0.95] text-bone">{title}</h1>
        {description ? (
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ash">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
