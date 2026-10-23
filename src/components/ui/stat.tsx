import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function StatTile({
  label,
  value,
  hint,
  icon: Icon,
  delta,
  deltaTone = "text-verdigris",
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  delta?: string;
  deltaTone?: string;
  className?: string;
}) {
  return (
    <div className={cn("surface rounded-card p-5", className)}>
      <div className="flex items-center justify-between gap-3">
        <span className="kicker">{label}</span>
        {Icon ? <Icon className="size-4 text-faint" strokeWidth={1.5} /> : null}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-serif text-[2.1rem] leading-none text-bone tabular">{value}</span>
        {delta ? <span className={cn("font-mono text-[10px]", deltaTone)}>{delta}</span> : null}
      </div>
      {hint ? <p className="mt-2 text-[11px] leading-relaxed text-faint">{hint}</p> : null}
    </div>
  );
}
