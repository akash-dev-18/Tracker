"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Panel, PanelBody, PanelHeader, PanelTitle } from "@/components/ui/panel";
import { Progress } from "@/components/ui/progress";
import type {
  ActivityPoint,
  ForecastPoint,
  RatingCount,
  StatusCount,
  TopicCount,
} from "@/features/analytics/queries";

const tooltipStyle = {
  background: "#101215",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8,
  fontSize: 12,
  color: "#e9e5dc",
};

const ratingColors: Record<string, string> = {
  again: "#b86a63",
  hard: "#c7a45e",
  good: "#7fa28c",
  easy: "#c08a5d",
};

const statusColors: Record<string, string> = {
  todo: "bg-faint",
  attempted: "bg-copper",
  solved: "bg-verdigris",
  needs_revision: "bg-ochre",
};

export function ActivityPanel({ activity }: { activity: ActivityPoint[] }) {
  return (
    <Panel>
      <PanelHeader>
        <div>
          <PanelTitle>Review activity</PanelTitle>
          <p className="text-faint mt-1 text-xs">Reviews and solves over the last 30 days.</p>
        </div>
        <div className="text-faint flex items-center gap-3 font-mono text-[10px]">
          <span className="flex items-center gap-1.5">
            <span className="bg-copper size-1.5 rounded-full" /> Reviews
          </span>
          <span className="flex items-center gap-1.5">
            <span className="bg-verdigris size-1.5 rounded-full" /> Solved
          </span>
        </div>
      </PanelHeader>
      <PanelBody className="pt-5">
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activity} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="reviews-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c08a5d" stopOpacity={0.38} />
                  <stop offset="100%" stopColor="#c08a5d" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="solved-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7fa28c" stopOpacity={0.32} />
                  <stop offset="100%" stopColor="#7fa28c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.055)" vertical={false} />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6e7072", fontSize: 10 }}
                interval={4}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6e7072", fontSize: 10 }}
                allowDecimals={false}
              />
              <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#e9e5dc" }} />
              <Area
                type="monotone"
                dataKey="reviews"
                name="Reviews"
                stroke="#c08a5d"
                strokeWidth={1.8}
                fill="url(#reviews-fill)"
              />
              <Area
                type="monotone"
                dataKey="solved"
                name="Solved"
                stroke="#7fa28c"
                strokeWidth={1.8}
                fill="url(#solved-fill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </PanelBody>
    </Panel>
  );
}

export function ForecastPanel({
  forecast,
  dueCount,
  overdueCount,
}: {
  forecast: ForecastPoint[];
  dueCount: number;
  overdueCount: number;
}) {
  return (
    <Panel>
      <PanelHeader>
        <div>
          <PanelTitle>Due forecast</PanelTitle>
          <p className="text-faint mt-1 text-xs">Scheduled reviews for the next 14 days.</p>
        </div>
        <span className="text-faint font-mono text-[10px]">
          {dueCount} due · {overdueCount} overdue
        </span>
      </PanelHeader>
      <PanelBody className="pt-5">
        <div className="h-[210px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={forecast} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.055)" vertical={false} />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6e7072", fontSize: 9 }}
                interval={1}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6e7072", fontSize: 10 }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={{ color: "#e9e5dc" }}
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
              />
              <Bar
                dataKey="count"
                name="Due"
                fill="#c08a5d"
                radius={[3, 3, 0, 0]}
                maxBarSize={22}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </PanelBody>
    </Panel>
  );
}

export function RatingMix({ ratings }: { ratings: RatingCount[] }) {
  const total = ratings.reduce((sum, rating) => sum + rating.count, 0);

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle className="text-base">Rating mix</PanelTitle>
        <span className="text-faint font-mono text-[10px]">{total} reviews</span>
      </PanelHeader>
      <PanelBody className="space-y-4">
        {total > 0 ? (
          <div className="flex h-2 overflow-hidden rounded-full bg-white/[0.06]">
            {ratings.map((rating) => (
              <div
                key={rating.rating}
                style={{
                  width: `${(rating.count / total) * 100}%`,
                  backgroundColor: ratingColors[rating.rating],
                }}
                title={`${rating.label}: ${rating.count}`}
              />
            ))}
          </div>
        ) : (
          <div className="h-2 rounded-full bg-white/[0.06]" />
        )}
        <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5">
          {ratings.map((rating) => (
            <li key={rating.rating} className="flex items-center justify-between text-xs">
              <span className="text-ash flex items-center gap-2">
                <span
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: ratingColors[rating.rating] }}
                />
                {rating.label}
              </span>
              <span className="text-faint font-mono text-[10px]">{rating.count}</span>
            </li>
          ))}
        </ul>
      </PanelBody>
    </Panel>
  );
}

export function StatusBreakdown({ statuses }: { statuses: StatusCount[] }) {
  const total = statuses.reduce((sum, status) => sum + status.count, 0);

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle className="text-base">Register status</PanelTitle>
        <span className="text-faint font-mono text-[10px]">{total} problems</span>
      </PanelHeader>
      <PanelBody className="space-y-3">
        {statuses.map((status) => (
          <div key={status.status}>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="text-ash">{status.label}</span>
              <span className="text-faint font-mono text-[10px]">{status.count}</span>
            </div>
            <Progress
              value={status.count}
              max={Math.max(total, 1)}
              className="h-1"
              indicatorClassName={statusColors[status.status]}
              label={`${status.label} problems`}
            />
          </div>
        ))}
      </PanelBody>
    </Panel>
  );
}

export function TopicBreakdown({ topics }: { topics: TopicCount[] }) {
  const max = topics[0]?.count ?? 1;

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle className="text-base">Topic coverage</PanelTitle>
        <span className="text-faint font-mono text-[10px]">{topics.length} topics</span>
      </PanelHeader>
      <PanelBody className="space-y-3">
        {topics.length > 0 ? (
          topics.map((topic) => (
            <div key={topic.name}>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-ash truncate">{topic.name}</span>
                <span className="text-faint font-mono text-[10px]">{topic.count}</span>
              </div>
              <Progress
                value={topic.count}
                max={max}
                className="h-1"
                label={`${topic.name} problems`}
              />
            </div>
          ))
        ) : (
          <p className="text-faint text-xs leading-relaxed">
            File a few problems under topics to see where the practice is concentrated.
          </p>
        )}
      </PanelBody>
    </Panel>
  );
}
