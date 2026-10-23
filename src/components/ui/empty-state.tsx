import type { LucideIcon } from "lucide-react";
import type * as React from "react";
import { cn } from "@/lib/utils/cn";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-14 text-center", className)}>
      {Icon ? (
        <div className="mb-4 grid size-11 place-items-center rounded-full border border-line bg-white/[0.03] text-ash">
          <Icon className="size-5" strokeWidth={1.5} />
        </div>
      ) : null}
      <h3 className="text-lg text-bone">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-ash">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
