import { cn } from "@/lib/utils/cn";

export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={cn("size-5", className)}>
      <path
        d="M5 3.75v16.5h16.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
      <path
        d="M9.75 3.75v8.25h8.25"
        stroke="#C08A5D"
        strokeWidth="1.25"
        strokeLinecap="square"
      />
      <circle cx="19.25" cy="5.5" r="1.35" fill="#7FA28C" />
    </svg>
  );
}

export function Wordmark({
  className,
  showMark = true,
}: {
  className?: string;
  showMark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-baseline gap-2.5", className)}>
      {showMark ? <Mark className="size-[18px] self-center text-bone" /> : null}
      <span className="font-serif text-[1.35rem] leading-none tracking-[-0.01em] text-bone">
        Docket
      </span>
    </span>
  );
}
