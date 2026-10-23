import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarClock, CheckCheck, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/panel";
import { topicLabel } from "@/features/dsa/topics";
import { getReviewData } from "@/features/revision/queries";
import { ReviewSession } from "@/features/revision/components/review-session";
import { formatCompact } from "@/lib/utils/date";

export const metadata: Metadata = { title: "Revision" };

export default async function RevisionPage() {
  const { topics, due, dueTotal, overdue, reviewedToday, upcoming, upcomingTotal } =
    await getReviewData();
  const dueToday = Math.max(0, dueTotal - overdue);

  return (
    <div className="space-y-7">
      <SectionHeading
        index="03"
        title="Revision"
        description="A short, honest queue of problems worth seeing again."
        actions={
          <Button asChild size="sm" variant="secondary">
            <Link href="/dsa">
              <ListChecks className="size-3.5" /> Practice register
            </Link>
          </Button>
        }
      />

      <div className="rounded-card border-line bg-line grid grid-cols-1 gap-px overflow-hidden border sm:grid-cols-3">
        <Stat
          label="Due now"
          value={String(dueTotal)}
          detail={`${dueToday} today · ${overdue} overdue`}
          icon={CalendarClock}
          tone="copper"
        />
        <Stat
          label="Reviewed today"
          value={String(reviewedToday)}
          detail="Ratings logged in this session"
          icon={CheckCheck}
          tone="verdigris"
        />
        <Stat
          label="Next seven days"
          value={String(upcomingTotal)}
          detail="Scheduled follow-ups"
          icon={ArrowRight}
          tone="ochre"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <ReviewSession initialDue={due} topics={topics} />

        <aside className="space-y-4">
          <section className="surface rounded-card overflow-hidden">
            <div className="border-line flex items-center justify-between border-b px-4 py-3">
              <span className="kicker">Later this week</span>
              <span className="text-faint font-mono text-[10px]">{upcomingTotal}</span>
            </div>
            {upcoming.length > 0 ? (
              <ul className="divide-line divide-y">
                {upcoming.map((question) => (
                  <li key={question.id} className="flex items-start gap-3 px-4 py-3">
                    <span className="text-copper mt-px w-11 shrink-0 font-mono text-[10px]">
                      {formatCompact(question.next_review_at)}
                    </span>
                    <div className="min-w-0">
                      <p className="text-bone truncate text-xs">{question.title}</p>
                      <p className="text-faint mt-0.5 truncate text-[11px]">
                        {topicLabel(topics, question.topic_id) ?? "Unsorted"}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-faint px-4 py-6 text-xs leading-relaxed">
                Nothing scheduled in the next seven days. Solve a problem and it will enter the
                ladder.
              </p>
            )}
          </section>

          <section className="surface rounded-card p-4">
            <span className="kicker">How it works</span>
            <p className="text-ash mt-2 text-xs leading-relaxed">
              Reviewing on the day a problem is due keeps the ladder honest. Rate what actually
              happened, not what you hoped — a weak recall today buys a shorter interval tomorrow.
            </p>
            <Link
              href="/analytics"
              className="text-copper mt-3 inline-flex items-center gap-1.5 text-xs hover:underline"
            >
              See the record <ArrowRight className="size-3" />
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof CalendarClock;
  tone: "copper" | "verdigris" | "ochre";
}) {
  const toneClass = {
    copper: "text-copper",
    verdigris: "text-verdigris",
    ochre: "text-ochre",
  }[tone];

  return (
    <div className="bg-carbon/70 px-4 py-3.5">
      <div className="flex items-center justify-between">
        <span className="text-faint font-mono text-[9px] tracking-[0.14em] uppercase">{label}</span>
        <Icon className={`size-3.5 ${toneClass}`} />
      </div>
      <div className="text-bone tabular mt-1.5 font-serif text-2xl leading-none">{value}</div>
      <div className="text-faint mt-1.5 text-[11px]">{detail}</div>
    </div>
  );
}
