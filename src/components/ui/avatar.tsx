import { cn } from "@/lib/utils/cn";
import { initials } from "@/lib/utils/text";

export function Avatar({
  name,
  className,
  size = "md",
}: {
  name: string | null | undefined;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "size-7 text-[10px]",
    md: "size-8 text-[11px]",
    lg: "size-10 text-xs",
  };

  return (
    <div
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-full border border-copper/25 bg-copper/[0.1] font-mono tracking-wide text-copper",
        sizes[size],
        className,
      )}
    >
      {initials(name)}
    </div>
  );
}
