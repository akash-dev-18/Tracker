import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarCheck, Clock3, Flame, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/panel";
import { StatTile } from "@/components/ui/stat";
import { getAnalyticsData } from "@/features/analytics/queries";
import {
  ActivityPanel,
  ForecastPanel,
  RatingMix,
  StatusBreakdown,
  TopicBreakdown,
} from "@/features/analytics/components/analytics-charts";

export const metadata: Metadata = { title: "Analytics" };

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round((minutes / 60) * 10) / 10;
  return `${hours}h`;
}

export default async function AnalyticsPage() {
  const data = await getAnalyticsData();

  return (
    <div className="space-y-7">
      <SectionHeading
        index="07"
        title="Analytics"
        description="The shape of the work: what you reviewed, when you showed up, and where the register is thin."
        actions={
          <Button asChild size="sm" variant="secondary">
            <Link href="/review">
              <RefreshCw className="size-3.5" /> Review queue <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Reviews · 30d"
          value={data.reviews30}
          hint={`${data.activeDays30} active days in the window.`}
          icon={RefreshCw}
        />
        <StatTile
          label="Solved · total"
          value={data.solvedTotal}
          hint="Problems marked solved in the register."
          icon={CalendarCheck}
        />
        <StatTile
          label="Study time · 30d"
          value={formatMinutes(data.minutes30)}
          hint="Minutes logged in study sessions."
          icon={Clock3}
        />
        <StatTile
          label="Day streak"
          value={data.streak}
          hint={data.streak > 0 ? "Keep the chain intact." : "One review starts the chain."}
          icon={Flame}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <ActivityPanel activity={data.activity} />
          <ForecastPanel
            forecast={data.forecast}
            dueCount={data.dueCount}
            overdueCount={data.overdueCount}
          />
        </div>

        <aside className="space-y-5">
          <RatingMix ratings={data.ratings} />
          <StatusBreakdown statuses={data.statuses} />
          <TopicBreakdown topics={data.topics} />
        </aside>
      </div>
    </div>
  );
}
