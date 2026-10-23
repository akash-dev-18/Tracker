import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCheck,
  CircleAlert,
  Clock3,
  FolderKanban,
  ListChecks,
  Plus,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Panel, PanelBody, PanelHeader, PanelTitle, SectionHeading } from "@/components/ui/panel";
import { Progress } from "@/components/ui/progress";
import { StatTile } from "@/components/ui/stat";
import { getProfile, getSessionUser } from "@/lib/auth";
import {
  formatCompact,
  formatDayGreeting,
  formatRelative,
  todayISO,
} from "@/lib/utils/date";
import { getDashboardData } from "@/features/dashboard/queries";
import {
  difficultyLabels,
  difficultyTones,
  statusLabels,
  statusTones,
} from "@/features/dsa/presentation";
import { topicLabel } from "@/features/dsa/topics";
import {
  jobStatusLabels,
  jobStatusTones,
  priorityLabels,
  priorityTones,
} from "@/features/jobs/presentation";
import { projectStatusLabels, projectStatusTones } from "@/features/projects/presentation";

export const metadata: Metadata = { title: "Today" };

export default async function DashboardPage() {
  const [user, profile, data] = await Promise.all([
    getSessionUser(),
    getProfile(),
    getDashboardData(),
  ]);
  const today = todayISO();
  const dailyGoal = profile?.daily_goal ?? 3;
  const todayProgress = data.solvedToday + data.reviewedToday;

  return (
    <div className="space-y-7">
      <SectionHeading
        index="01"
        title="Today"
        description={`${formatDayGreeting()} — a focused view of what needs you next.`}
        actions={
          <>
            <span className="text-faint hidden items-center gap-2 font-mono text-[10px] tracking-[0.12em] uppercase xl:flex">
              <CalendarDays className="size-3.5" />
              {user?.email}
            </span>
            <Button asChild size="sm" variant="secondary">
              <Link href="/review">
                <RefreshCw className="size-3.5" /> Review
              </Link>
            </Button>
            <Button asChild size="sm" variant="primary">
              <Link href="/dsa?new=1">
                <Plus className="size-3.5" /> Add problem
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Link href="/review" className="transition-transform hover:-translate-y-px">
          <StatTile
            label="Due now"
            value={data.dueCount}
            hint={data.dueCount > 0 ? "Problems waiting on a rating." : "The queue is clear."}
            icon={Clock3}
          />
        </Link>
        <StatTile
          label="Solved today"
          value={data.solvedToday}
          hint="Problems marked solved."
          icon={CheckCheck}
        />
        <StatTile
          label="Reviews logged"
          value={data.reviewedToday}
          hint="Ratings recorded today."
          icon={RefreshCw}
        />
        <Link href="/jobs" className="transition-transform hover:-translate-y-px">
          <StatTile
            label="Active applications"
            value={data.activeJobCount}
            hint={
              data.activeJobCount > 0
                ? "Applied, screening, or interviewing."
                : "No open applications."
            }
            icon={BriefcaseBusiness}
          />
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <Panel>
            <PanelHeader>
              <div>
                <PanelTitle>Due now</PanelTitle>
                <p className="text-faint mt-1 text-xs">The shortest path back into the material.</p>
              </div>
              <Link
                href="/review"
                className="text-copper flex items-center gap-1.5 text-xs hover:underline"
              >
                Open queue <ArrowRight className="size-3" />
              </Link>
            </PanelHeader>
            {data.due.length > 0 ? (
              <ul className="divide-line divide-y">
                {data.due.map((question) => {
                  const overdue = question.next_review_at && question.next_review_at < today;
                  return (
                    <li key={question.id}>
                      <Link
                        href="/review"
                        className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-white/[0.025]"
                      >
                        <span className={overdue ? "text-clay" : "text-copper"}>
                          {overdue ? (
                            <CircleAlert className="size-4" strokeWidth={1.5} />
                          ) : (
                            <Clock3 className="size-4" strokeWidth={1.5} />
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-bone truncate text-sm">{question.title}</p>
                          <p className="text-faint mt-0.5 truncate text-[11px]">
                            {topicLabel(data.topics, question.topic_id) ?? "Unsorted"}
                            {question.difficulty
                              ? ` · ${difficultyLabels[question.difficulty]}`
                              : ""}
                          </p>
                        </div>
                        <span
                          className={`font-mono text-[10px] ${overdue ? "text-clay" : "text-copper"}`}
                        >
                          {overdue ? "Overdue" : "Today"}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState
                icon={CheckCheck}
                title="Nothing due right now."
                description="The ladder is clear. Add a problem or let the next review date come around."
                action={
                  <Button asChild size="sm" variant="secondary">
                    <Link href="/dsa">Open practice register</Link>
                  </Button>
                }
              />
            )}
          </Panel>

          <Panel>
            <PanelHeader>
              <div>
                <PanelTitle>Applications</PanelTitle>
                <p className="text-faint mt-1 text-xs">Open conversations and follow-ups.</p>
              </div>
              <Link
                href="/jobs"
                className="text-copper flex items-center gap-1.5 text-xs hover:underline"
              >
                All applications <ArrowRight className="size-3" />
              </Link>
            </PanelHeader>
            {data.activeJobs.length > 0 ? (
              <ul className="divide-line divide-y">
                {data.activeJobs.map((job) => (
                  <li key={job.id}>
                    <Link
                      href="/jobs"
                      className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-white/[0.025]"
                    >
                      <div className="border-line text-faint grid size-8 shrink-0 place-items-center rounded-md border bg-white/[0.03]">
                        <BriefcaseBusiness className="size-3.5" strokeWidth={1.5} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-bone truncate text-sm">{job.company}</p>
                        <p className="text-faint mt-0.5 truncate text-[11px]">{job.role}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {job.priority === "high" ? (
                          <Badge tone={priorityTones[job.priority]}>
                            {priorityLabels[job.priority]}
                          </Badge>
                        ) : null}
                        <Badge tone={jobStatusTones[job.status]}>
                          {jobStatusLabels[job.status]}
                        </Badge>
                        <span className="text-faint hidden w-20 text-right font-mono text-[10px] sm:inline">
                          {job.follow_up_at ? formatCompact(job.follow_up_at) : "No follow-up"}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={BriefcaseBusiness}
                title="No open applications."
                description="The application log is a simple way to keep follow-ups from going quiet."
                action={
                  <Button asChild size="sm" variant="secondary">
                    <Link href="/jobs">Open applications</Link>
                  </Button>
                }
              />
            )}
          </Panel>

          <Panel>
            <PanelHeader>
              <div>
                <PanelTitle>Recent problems</PanelTitle>
                <p className="text-faint mt-1 text-xs">The last few entries in the register.</p>
              </div>
              <Link
                href="/dsa"
                className="text-copper flex items-center gap-1.5 text-xs hover:underline"
              >
                Practice <ArrowRight className="size-3" />
              </Link>
            </PanelHeader>
            {data.recent.length > 0 ? (
              <ul className="divide-line divide-y">
                {data.recent.map((question) => (
                  <li key={question.id}>
                    <Link
                      href="/dsa"
                      className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-white/[0.025]"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-bone truncate text-xs">{question.title}</p>
                        <p className="text-faint mt-0.5 truncate text-[11px]">
                          {topicLabel(data.topics, question.topic_id) ?? "Unsorted"} ·{" "}
                          {formatRelative(question.created_at)}
                        </p>
                      </div>
                      <Badge tone={statusTones[question.status]}>
                        {statusLabels[question.status]}
                      </Badge>
                      {question.difficulty ? (
                        <Badge
                          tone={difficultyTones[question.difficulty]}
                          className="hidden sm:inline-flex"
                        >
                          {difficultyLabels[question.difficulty]}
                        </Badge>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={ListChecks}
                title="The register is empty."
                description="It only takes a title to start. Notes and reviews can follow."
                action={
                  <Button asChild size="sm" variant="primary">
                    <Link href="/dsa?new=1">
                      <Plus className="size-3.5" /> Add first problem
                    </Link>
                  </Button>
                }
              />
            )}
          </Panel>
        </div>

        <aside className="space-y-5">
          <Panel>
            <PanelBody className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="kicker">Daily target</span>
                <span className="text-faint font-mono text-[10px]">
                  {Math.min(todayProgress, dailyGoal)} / {dailyGoal}
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-bone tabular font-serif text-[2.4rem] leading-none">
                    {todayProgress}
                  </span>
                  <span className="text-faint text-xs">of {dailyGoal}</span>
                </div>
                <Progress
                  value={todayProgress}
                  max={dailyGoal}
                  label="Daily target progress"
                  className="mt-3"
                />
              </div>
              <p className="text-faint text-[11px] leading-relaxed">
                {todayProgress >= dailyGoal
                  ? "Target met. Anything else today is margin."
                  : "Reviews and solves both count. A small, honest session beats a large, vague one."}
              </p>
            </PanelBody>
          </Panel>

          <Panel>
            <PanelHeader className="py-3">
              <PanelTitle className="text-base">Upcoming reviews</PanelTitle>
              <span className="text-faint font-mono text-[10px]">{data.upcoming.length}</span>
            </PanelHeader>
            {data.upcoming.length > 0 ? (
              <ul className="divide-line divide-y">
                {data.upcoming.map((question) => (
                  <li key={question.id} className="flex items-start gap-3 px-4 py-3">
                    <span className="text-copper mt-px w-11 shrink-0 font-mono text-[10px]">
                      {formatCompact(question.next_review_at)}
                    </span>
                    <div className="min-w-0">
                      <p className="text-bone truncate text-xs">{question.title}</p>
                      <p className="text-faint mt-0.5 truncate text-[11px]">
                        {topicLabel(data.topics, question.topic_id) ?? "Unsorted"}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-faint px-4 py-5 text-xs leading-relaxed">
                No reviews scheduled in the next week.
              </p>
            )}
          </Panel>

          <Panel>
            <PanelHeader className="py-3">
              <div className="flex items-center gap-2">
                <FolderKanban className="text-faint size-3.5" />
                <PanelTitle className="text-base">Projects in motion</PanelTitle>
              </div>
              <span className="text-faint font-mono text-[10px]">{data.activeProjectCount}</span>
            </PanelHeader>
            {data.projects.length > 0 ? (
              <ul className="divide-line divide-y">
                {data.projects.map((project) => (
                  <li key={project.id} className="px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-bone truncate text-xs">{project.name}</p>
                      <Badge tone={projectStatusTones[project.status]}>
                        {projectStatusLabels[project.status]}
                      </Badge>
                    </div>
                    <p className="text-faint mt-1 font-mono text-[10px]">
                      {project.target_date
                        ? `Target ${formatCompact(project.target_date)}`
                        : "No target date"}
                      {project.tech.length > 0 ? ` · ${project.tech.slice(0, 2).join(", ")}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-faint px-4 py-5 text-xs leading-relaxed">
                No active projects. The project register is waiting for its first build.
              </p>
            )}
            <div className="border-line border-t px-4 py-2.5">
              <Link
                href="/projects"
                className="text-copper flex items-center gap-1.5 text-[11px] hover:underline"
              >
                Open projects <ArrowRight className="size-3" />
              </Link>
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
}
