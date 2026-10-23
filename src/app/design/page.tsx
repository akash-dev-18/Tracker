import type { Metadata } from "next";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Circle,
  Clock3,
  FolderKanban,
  RefreshCw,
} from "lucide-react";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Panel, PanelHeader, SectionHeading } from "@/components/ui/panel";
import { Progress } from "@/components/ui/progress";
import { StatTile } from "@/components/ui/stat";
import { StatusPill } from "@/components/ui/status-pill";

export const metadata: Metadata = {
  title: "Design preview",
  robots: { index: false, follow: false },
};

const revisions = [
  {
    title: "Longest Substring Without Repeating Characters",
    topic: "Sliding Window",
    platform: "LeetCode",
    difficulty: "Medium",
    interval: "3d",
  },
  {
    title: "Serialize and Deserialize Binary Tree",
    topic: "Trees",
    platform: "LeetCode",
    difficulty: "Hard",
    interval: "7d",
  },
  {
    title: "Course Schedule II",
    topic: "Topological Sort",
    platform: "NeetCode",
    difficulty: "Medium",
    interval: "1d",
  },
];

const followUps = [
  { company: "Linear", role: "Frontend Engineer", status: "Interview", when: "Tomorrow" },
  { company: "Vercel", role: "Product Engineer", status: "Applied", when: "Fri" },
];

const recent = [
  { title: "Merge Intervals", topic: "Intervals", difficulty: "Medium", when: "Today" },
  { title: "Word Ladder", topic: "Graphs", difficulty: "Hard", when: "Yesterday" },
  { title: "Coin Change", topic: "DP", difficulty: "Medium", when: "2 days ago" },
  { title: "Valid Parentheses", topic: "Stacks", difficulty: "Easy", when: "3 days ago" },
];

const tasks = [
  { title: "Add optimistic updates to the board", project: "Docket", done: true },
  { title: "Write the ingestion worker", project: "Signal", done: false },
  { title: "Polish empty states", project: "Docket", done: false },
];

export default function DesignPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <AppShell
      user={{ displayName: "Akash Sharma", email: "akash@example.com" }}
      todayLabel="TUE 21 OCT"
      stats={{ dailyGoal: 4, todayProgress: 2, dueCount: 3, activeJobCount: 12 }}
    >
      <div className="space-y-8">
        <SectionHeading
          index="01"
          title="Today"
          description="Three reviews are due. Two applications need a nudge. Keep it short."
          actions={
            <Button variant="primary" size="md">
              <RefreshCw className="size-3.5" />
              Start 3 reviews
            </Button>
          }
        />

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <StatTile
            label="Solved"
            value={128}
            hint="problems in the register"
            icon={CheckCircle2}
            delta="+4 this week"
          />
          <StatTile
            label="Revision due"
            value={3}
            hint="0 overdue · next at 18:00"
            icon={RefreshCw}
            delta="2 left today"
            deltaTone="text-ochre"
          />
          <StatTile
            label="Applications"
            value={12}
            hint="3 interviews in motion"
            icon={Briefcase}
            delta="2 follow-ups"
            deltaTone="text-copper"
          />
          <StatTile
            label="Projects"
            value={3}
            hint="2 active · 1 paused"
            icon={FolderKanban}
            delta="68% tasks"
            deltaTone="text-ash"
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
          <Panel>
            <PanelHeader>
              <div>
                <span className="kicker">Register</span>
                <h2 className="mt-1 text-lg text-bone">Revision queue</h2>
              </div>
              <div className="flex items-center gap-2">
                <StatusPill label="3 due" tone="ochre" />
                <Button variant="ghost" size="icon-sm" aria-label="Open revision queue">
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </PanelHeader>
            <div className="divide-y divide-line">
              {revisions.map((item) => (
                <div key={item.title} className="flex min-w-0 items-center gap-3 px-5 py-3">
                  <div className="grid size-8 shrink-0 place-items-center rounded-md border border-line bg-white/[0.02] font-mono text-[10px] text-copper">
                    {item.interval}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="min-w-0 truncate text-sm text-bone">{item.title}</span>
                      <StatusPill
                        label={item.difficulty}
                        tone={
                          item.difficulty === "Easy"
                            ? "verdigris"
                            : item.difficulty === "Hard"
                              ? "clay"
                              : "ochre"
                        }
                      />
                    </div>
                    <p className="mt-0.5 text-[11px] text-faint">
                      {item.topic} · {item.platform}
                    </p>
                  </div>
                  <Button variant="secondary" size="sm" className="hidden sm:inline-flex">
                    Review
                  </Button>
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <PanelHeader>
              <div>
                <span className="kicker">Pipeline</span>
                <h2 className="mt-1 text-lg text-bone">Needs a follow-up</h2>
              </div>
              <StatusPill label="2" tone="copper" />
            </PanelHeader>
            <div className="divide-y divide-line">
              {followUps.map((item) => (
                <div key={item.company} className="flex min-w-0 items-center gap-3 px-5 py-3.5">
                  <div className="grid size-9 shrink-0 place-items-center rounded-md border border-line bg-white/[0.03] font-mono text-xs text-ash">
                    {item.company[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-bone">{item.company}</p>
                    <p className="truncate text-[11px] text-faint">{item.role}</p>
                  </div>
                  <div className="text-right">
                    <StatusPill
                      label={item.status}
                      tone={item.status === "Interview" ? "copper" : "neutral"}
                    />
                    <p className="mt-1 font-mono text-[10px] text-faint">{item.when}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-line px-5 py-3">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-faint">Response rate</span>
                <span className="font-mono text-bone">32%</span>
              </div>
              <Progress value={32} className="mt-2" />
            </div>
          </Panel>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Panel>
            <PanelHeader>
              <div>
                <span className="kicker">Practice</span>
                <h2 className="mt-1 text-lg text-bone">Recent solves</h2>
              </div>
              <Button variant="ghost" size="sm">
                View all
                <ArrowRight className="size-3.5" />
              </Button>
            </PanelHeader>
            <div className="divide-y divide-line">
              {recent.map((item) => (
                <div key={item.title} className="flex items-center gap-3 px-5 py-2.5">
                  <span className="font-mono text-[10px] text-faint">
                    {item.when === "Today" ? "TODAY" : item.when === "Yesterday" ? "YEST" : item.when.replace(" days ago", "D").toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-bone">{item.title}</p>
                    <p className="text-[11px] text-faint">{item.topic}</p>
                  </div>
                  <span
                    className={
                      item.difficulty === "Easy"
                        ? "text-[10px] text-verdigris"
                        : item.difficulty === "Hard"
                          ? "text-[10px] text-clay"
                          : "text-[10px] text-ochre"
                    }
                  >
                    {item.difficulty}
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <PanelHeader>
              <div>
                <span className="kicker">Projects</span>
                <h2 className="mt-1 text-lg text-bone">Open tasks</h2>
              </div>
              <StatusPill label="3" tone="verdigris" />
            </PanelHeader>
            <div className="divide-y divide-line">
              {tasks.map((task) => (
                <label
                  key={task.title}
                  className="flex cursor-pointer items-center gap-3 px-5 py-3 transition-colors hover:bg-white/[0.02]"
                >
                  <Checkbox defaultChecked={task.done} />
                  <span className="min-w-0 flex-1">
                    <span
                      className={
                        task.done
                          ? "block truncate text-sm text-faint line-through"
                          : "block truncate text-sm text-bone"
                      }
                    >
                      {task.title}
                    </span>
                    <span className="block text-[11px] text-faint">{task.project}</span>
                  </span>
                  {task.done ? (
                    <Clock3 className="size-3.5 text-faint" />
                  ) : (
                    <Circle className="size-3.5 text-faint" />
                  )}
                </label>
              ))}
            </div>
            <div className="border-t border-line px-5 py-3">
              <div className="mb-2 flex items-center justify-between text-[11px]">
                <span className="text-faint">Docket · task completion</span>
                <span className="font-mono text-bone">68%</span>
              </div>
              <Progress value={68} className="[&>div]:bg-verdigris" />
            </div>
          </Panel>
        </div>

        <div className="flex items-center justify-between border-t border-line pt-5">
          <span className="font-mono text-[10px] tracking-[0.14em] text-faint uppercase">
            Design preview · development only
          </span>
          <span className="font-mono text-[10px] text-faint">Docket 0.1</span>
        </div>
      </div>
    </AppShell>
  );
}
