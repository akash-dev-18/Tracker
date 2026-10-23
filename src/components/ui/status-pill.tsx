import { Badge, Dot, type BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

export function StatusPill({
  label,
  tone = "neutral",
  className,
}: {
  label: string;
  tone?: BadgeProps["tone"];
  className?: string;
}) {
  return (
    <Badge tone={tone} className={cn("gap-1.5", className)}>
      <Dot />
      {label}
    </Badge>
  );
}
