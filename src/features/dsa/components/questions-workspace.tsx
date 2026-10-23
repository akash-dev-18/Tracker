"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDeferredValue, useMemo, useState, useTransition, type ReactNode } from "react";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleSlash,
  Clock3,
  FolderCog,
  ListChecks,
  Loader2,
  MoreHorizontal,
  NotebookPen,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Settings2,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { SectionHeading } from "@/components/ui/panel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  Question,
  QuestionStatus,
  Review,
  ReviewRating,
  Topic,
} from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils/cn";
import { formatCompact, isDueToday, todayISO } from "@/lib/utils/date";
import type { QuestionListItem } from "@/features/dsa/queries";
import {
  deleteQuestion,
  getQuestionDetail,
  recordReview,
  setQuestionStar,
  setQuestionStatus,
} from "@/features/dsa/actions";
import {
  allStatuses,
  difficultyLabels,
  difficultyTones,
  statusLabels,
  statusTones,
} from "@/features/dsa/presentation";
import { buildTopicTree, topicIdsForFilter, topicLabel, topicName } from "@/features/dsa/topics";
import { QuestionFormDialog } from "./question-form";
import { QuestionDetailSheet } from "./question-detail";

type DetailState = {
  open: boolean;
  loading: boolean;
  error: string | null;
  question: Question | null;
  reviews: Review[];
};

const emptyDetail: DetailState = {
  open: false,
  loading: false,
  error: null,
  question: null,
  reviews: [],
};

const PAGE_SIZE = 50;

function toListItem(question: Question): QuestionListItem {
  return {
    id: question.id,
    title: question.title,
    url: question.url,
    platform: question.platform,
    difficulty: question.difficulty,
    status: question.status,
    topic_id: question.topic_id,
    notes: question.notes,
    tags: question.tags,
    starred: question.starred,
    solved_at: question.solved_at,
    next_review_at: question.next_review_at,
    review_interval: question.review_interval,
    created_at: question.created_at,
    updated_at: question.updated_at,
  };
}

export function QuestionsWorkspace({
  initialTopics,
  initialQuestions,
}: {
  initialTopics: Topic[];
  initialQuestions: QuestionListItem[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const newFromUrl = searchParams.get("new") === "1";
  const [questions, setQuestions] = useState(initialQuestions);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [topicFilter, setTopicFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [starredOnly, setStarredOnly] = useState(false);
  const [dueOnly, setDueOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [formOpen, setFormOpen] = useState(false);
  const [formQuestion, setFormQuestion] = useState<Question | null>(null);
  const [preparingEdit, setPreparingEdit] = useState(false);
  const [detail, setDetail] = useState<DetailState>(emptyDetail);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; title: string } | null>(null);
  const [deleting, startDelete] = useTransition();

  const topics = initialTopics;
  const tree = useMemo(() => buildTopicTree(topics), [topics]);
  const today = todayISO();

  const topicCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const question of questions) {
      if (question.topic_id) {
        counts[question.topic_id] = (counts[question.topic_id] ?? 0) + 1;
      }
    }
    return counts;
  }, [questions]);

  const stats = useMemo(() => {
    const solved = questions.filter((question) => question.status === "solved").length;
    const due = questions.filter(
      (question) =>
        question.next_review_at && question.next_review_at <= today && question.status !== "todo",
    ).length;
    const starred = questions.filter((question) => question.starred).length;
    return { total: questions.length, solved, due, starred };
  }, [questions, today]);

  const visible = useMemo(() => {
    const term = deferredSearch.trim().toLowerCase();
    const allowedTopics = topicIdsForFilter(topics, topicFilter);

    return questions.filter((question) => {
      if (
        allowedTopics.length > 0 &&
        (!question.topic_id || !allowedTopics.includes(question.topic_id))
      ) {
        return false;
      }
      if (difficultyFilter !== "all" && question.difficulty !== difficultyFilter) return false;
      if (statusFilter !== "all" && question.status !== statusFilter) return false;
      if (starredOnly && !question.starred) return false;
      if (dueOnly && !(question.next_review_at && question.next_review_at <= today)) return false;
      if (term) {
        const haystack = [
          question.title,
          question.platform ?? "",
          question.notes ?? "",
          question.tags.join(" "),
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [
    questions,
    topics,
    topicFilter,
    difficultyFilter,
    statusFilter,
    starredOnly,
    dueOnly,
    deferredSearch,
    today,
  ]);

  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageItems = visible.slice(pageStart, pageStart + PAGE_SIZE);

  const activeFilters =
    (topicFilter !== "all" ? 1 : 0) +
    (difficultyFilter !== "all" ? 1 : 0) +
    (statusFilter !== "all" ? 1 : 0) +
    (starredOnly ? 1 : 0) +
    (dueOnly ? 1 : 0) +
    (search.trim() ? 1 : 0);

  function resetFilters() {
    setSearch("");
    setTopicFilter("all");
    setDifficultyFilter("all");
    setStatusFilter("all");
    setStarredOnly(false);
    setDueOnly(false);
  }

  function closeForm(open: boolean) {
    setFormOpen(open);
    if (!open) {
      setFormQuestion(null);
      if (newFromUrl) router.replace("/dsa", { scroll: false });
    }
  }

  function handleSaved(question: Question) {
    setPage(1);
    setQuestions((current) => {
      const exists = current.some((item) => item.id === question.id);
      if (exists) {
        return current.map((item) => (item.id === question.id ? toListItem(question) : item));
      }
      return [toListItem(question), ...current];
    });
    setDetail((current) =>
      current.question?.id === question.id ? { ...current, question } : current,
    );
    closeForm(false);
  }

  async function openDetail(id: string) {
    setDetail({ open: true, loading: true, error: null, question: null, reviews: [] });
    const result = await getQuestionDetail(id);
    if (!result.ok) {
      setDetail({ open: true, loading: false, error: result.error, question: null, reviews: [] });
      return;
    }
    setDetail({
      open: true,
      loading: false,
      error: null,
      question: result.data.question,
      reviews: result.data.reviews,
    });
  }

  async function editFromList(id: string) {
    if (detail.question?.id === id) {
      setFormQuestion(detail.question);
      setFormOpen(true);
      return;
    }
    setPreparingEdit(true);
    const toastId = toast.loading("Opening problem…");
    const result = await getQuestionDetail(id);
    toast.dismiss(toastId);
    setPreparingEdit(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setFormQuestion(result.data.question);
    setFormOpen(true);
  }

  async function handleStatus(id: string, status: QuestionStatus) {
    const before = questions.find((question) => question.id === id);
    if (!before || before.status === status) return;
    setQuestions((current) =>
      current.map((question) => (question.id === id ? { ...question, status } : question)),
    );
    const result = await setQuestionStatus(id, status);
    if (!result.ok) {
      setQuestions((current) =>
        current.map((question) => (question.id === id ? before : question)),
      );
      toast.error(result.error);
      return;
    }
    setQuestions((current) =>
      current.map((question) => (question.id === id ? toListItem(result.data) : question)),
    );
    toast.success(`Marked ${statusLabels[status].toLowerCase()}.`);
  }

  async function toggleStar(question: QuestionListItem) {
    const next = !question.starred;
    setQuestions((current) =>
      current.map((item) => (item.id === question.id ? { ...item, starred: next } : item)),
    );
    const result = await setQuestionStar(question.id, next);
    if (!result.ok) {
      setQuestions((current) => current.map((item) => (item.id === question.id ? question : item)));
      toast.error(result.error);
    }
  }

  async function handleReview(id: string, rating: ReviewRating) {
    const result = await recordReview(id, rating);
    if (!result.ok) {
      toast.error(result.error);
      return false;
    }
    setQuestions((current) =>
      current.map((question) => (question.id === id ? toListItem(result.data.question) : question)),
    );
    setDetail((current) =>
      current.question?.id === id ? { ...current, question: result.data.question } : current,
    );
    const refreshed = await getQuestionDetail(id);
    if (refreshed.ok) {
      setDetail((current) =>
        current.question?.id === id
          ? { ...current, question: refreshed.data.question, reviews: refreshed.data.reviews }
          : current,
      );
    }
    toast.success(
      `Review logged. Next in ${result.data.interval} day${result.data.interval === 1 ? "" : "s"}.`,
    );
    return true;
  }

  function removeQuestion(id: string) {
    setQuestions((current) => current.filter((question) => question.id !== id));
    setDetail((current) => (current.question?.id === id ? emptyDetail : current));
    setPendingDelete(null);
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    const target = pendingDelete;
    startDelete(async () => {
      const result = await deleteQuestion(target.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      removeQuestion(target.id);
      toast.success("Problem deleted.");
    });
  }

  const hasAnyQuestions = questions.length > 0;

  return (
    <div className="space-y-7">
      <SectionHeading
        index="02"
        title="Practice"
        description="Every problem, its code, your notes, and the next review — in one register."
        actions={
          <>
            {preparingEdit ? (
              <span className="text-faint flex items-center gap-2 text-xs">
                <Loader2 className="size-3.5 animate-spin" /> Opening…
              </span>
            ) : null}
            <Button variant="secondary" size="sm" asChild>
              <Link href="/dsa/topics">
                <Settings2 className="size-3.5" /> Topics
              </Link>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setFormQuestion(null);
                setFormOpen(true);
              }}
            >
              <Plus className="size-4" /> Add problem
            </Button>
          </>
        }
      />

      <div className="rounded-card border-line bg-line grid grid-cols-2 gap-px overflow-hidden border sm:grid-cols-4">
        <MiniStat label="Recorded" value={stats.total} />
        <MiniStat
          label="Solved"
          value={stats.solved}
          hint={
            stats.total
              ? `${Math.round((stats.solved / stats.total) * 100)}% of register`
              : undefined
          }
        />
        <MiniStat label="Due for review" value={stats.due} tone="text-ochre" />
        <MiniStat label="Starred" value={stats.starred} />
      </div>

      <div className="surface rounded-card min-w-0 overflow-hidden">
        <div className="border-line flex flex-wrap items-center gap-2 border-b p-3">
          <div className="relative min-w-[180px] flex-1">
            <Search className="text-faint pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search title, notes, tags…"
              className="h-8 pl-8 text-xs"
            />
            {search ? (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                className="text-faint hover:text-bone absolute top-1/2 right-2 -translate-y-1/2"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </div>

          <Select
            value={topicFilter}
            onValueChange={(value) => {
              setTopicFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-full text-xs sm:w-44 lg:hidden">
              <SelectValue placeholder="All topics" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All topics</SelectItem>
              {tree.map((parent) => (
                <SelectItem key={parent.id} value={parent.id}>
                  {parent.name}
                </SelectItem>
              ))}
              {topics
                .filter((topic) => topic.parent_id)
                .map((topic) => (
                  <SelectItem key={topic.id} value={topic.id}>
                    <span className="text-ash pl-2">↳ {topic.name}</span>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Select
            value={difficultyFilter}
            onValueChange={(value) => {
              setDifficultyFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-[118px] text-xs">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any difficulty</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-[132px] text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any status</SelectItem>
              {allStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {statusLabels[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <FilterToggle
            active={dueOnly}
            onClick={() => {
              setDueOnly((value) => !value);
              setPage(1);
            }}
          >
            <Clock3 className="size-3.5" /> Due
          </FilterToggle>
          <FilterToggle
            active={starredOnly}
            onClick={() => {
              setStarredOnly((value) => !value);
              setPage(1);
            }}
          >
            <Star className="size-3.5" /> Starred
          </FilterToggle>
          {activeFilters > 0 ? (
            <button
              type="button"
              onClick={resetFilters}
              className="text-faint hover:text-bone text-xs transition-colors"
            >
              Clear
            </button>
          ) : null}
        </div>

        <div className="grid lg:grid-cols-[232px_1fr]">
          <aside className="border-line hidden border-r p-2 lg:block">
            <div className="mb-1 flex items-center justify-between px-2.5 py-1.5">
              <span className="kicker">Topics</span>
              <span className="text-faint font-mono text-[10px]">{topics.length}</span>
            </div>
            <nav className="space-y-0.5">
              <TopicButton
                active={topicFilter === "all"}
                label="All problems"
                count={questions.length}
                onClick={() => {
                  setTopicFilter("all");
                  setPage(1);
                }}
              />
              {tree.map((parent) => {
                const childCount = parent.children.reduce(
                  (sum, child) => sum + (topicCounts[child.id] ?? 0),
                  0,
                );
                const total = (topicCounts[parent.id] ?? 0) + childCount;
                const isExpanded = expanded.has(parent.id);
                return (
                  <div key={parent.id}>
                    <div className="flex items-center">
                      {parent.children.length > 0 ? (
                        <button
                          type="button"
                          className="text-faint hover:text-bone grid size-6 shrink-0 place-items-center rounded"
                          aria-label={isExpanded ? "Collapse" : "Expand"}
                          onClick={() =>
                            setExpanded((current) => {
                              const next = new Set(current);
                              if (next.has(parent.id)) next.delete(parent.id);
                              else next.add(parent.id);
                              return next;
                            })
                          }
                        >
                          {isExpanded ? (
                            <ChevronDown className="size-3" />
                          ) : (
                            <ChevronRight className="size-3" />
                          )}
                        </button>
                      ) : (
                        <span className="size-6 shrink-0" />
                      )}
                      <TopicButton
                        active={topicFilter === parent.id}
                        label={parent.name}
                        count={total}
                        onClick={() => {
                          setTopicFilter(parent.id);
                          setExpanded((current) => new Set(current).add(parent.id));
                          setPage(1);
                        }}
                        className="flex-1"
                      />
                    </div>
                    {isExpanded
                      ? parent.children.map((child) => (
                          <div key={child.id} className="ml-6">
                            <TopicButton
                              active={topicFilter === child.id}
                              label={child.name}
                              count={topicCounts[child.id] ?? 0}
                              onClick={() => {
                                setTopicFilter(child.id);
                                setPage(1);
                              }}
                            />
                          </div>
                        ))
                      : null}
                  </div>
                );
              })}
              {topics.length === 0 ? (
                <p className="text-faint px-2.5 py-3 text-xs">
                  No topics yet.{" "}
                  <Link href="/dsa/topics" className="text-copper hover:underline">
                    Create the first.
                  </Link>
                </p>
              ) : null}
            </nav>
            <div className="border-line mt-2 border-t p-2">
              <Link
                href="/dsa/topics"
                className="text-ash hover:text-bone flex items-center gap-2 rounded-md px-2.5 py-2 text-xs transition-colors hover:bg-white/[0.04]"
              >
                <FolderCog className="size-3.5" /> Manage topics
              </Link>
            </div>
          </aside>

          <div className="min-w-0">
            {!hasAnyQuestions ? (
              <EmptyState
                icon={ListChecks}
                title="No problems recorded yet."
                description="Add your first problem with just a title. Link, difficulty, topic, notes, and code can follow whenever you have them."
                action={
                  <Button
                    variant="primary"
                    onClick={() => {
                      setFormQuestion(null);
                      setFormOpen(true);
                    }}
                  >
                    <Plus className="size-4" /> Add first problem
                  </Button>
                }
              />
            ) : visible.length === 0 ? (
              <EmptyState
                icon={Search}
                title="Nothing matches those filters."
                description="Try a different search, or clear the filters to see the whole register."
                action={
                  <Button variant="secondary" onClick={resetFilters}>
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <>
                <div className="hidden md:block">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-line border-b">
                        <th className="text-faint px-4 py-2 font-mono text-[9px] font-normal tracking-[0.14em] uppercase">
                          Problem
                        </th>
                        <th className="text-faint w-28 px-2 py-2 font-mono text-[9px] font-normal tracking-[0.14em] uppercase">
                          Topic
                        </th>
                        <th className="text-faint w-20 px-2 py-2 font-mono text-[9px] font-normal tracking-[0.14em] uppercase">
                          Level
                        </th>
                        <th className="text-faint w-28 px-2 py-2 font-mono text-[9px] font-normal tracking-[0.14em] uppercase">
                          Status
                        </th>
                        <th className="text-faint w-24 px-2 py-2 font-mono text-[9px] font-normal tracking-[0.14em] uppercase">
                          Review
                        </th>
                        <th className="w-16 px-2 py-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {pageItems.map((question) => (
                        <tr
                          key={question.id}
                          className="group border-line/70 cursor-pointer border-b transition-colors last:border-0 hover:bg-white/[0.022]"
                          onClick={() => openDetail(question.id)}
                        >
                          <td className="max-w-0 px-4 py-2.5">
                            <div className="flex min-w-0 items-center gap-2">
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  toggleStar(question);
                                }}
                                className={cn(
                                  "shrink-0 rounded p-0.5 transition-colors",
                                  question.starred
                                    ? "text-copper"
                                    : "hover:text-faint text-transparent",
                                )}
                                aria-label={question.starred ? "Unstar problem" : "Star problem"}
                              >
                                <Star
                                  className={cn("size-3.5", question.starred && "fill-current")}
                                />
                              </button>
                              <div className="min-w-0">
                                <div className="flex min-w-0 items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      openDetail(question.id);
                                    }}
                                    className="text-bone group-hover:text-copper-bright truncate text-left text-[13px]"
                                  >
                                    {question.title}
                                  </button>
                                  {question.url ? (
                                    <a
                                      href={question.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      onClick={(event) => event.stopPropagation()}
                                      className="text-faint hover:text-copper shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                                      aria-label="Open original problem"
                                    >
                                      <ArrowUpRight className="size-3" />
                                    </a>
                                  ) : null}
                                  {question.notes ? (
                                    <NotebookPen className="text-faint/70 size-3 shrink-0" />
                                  ) : null}
                                </div>
                                <div className="text-faint mt-0.5 flex items-center gap-1.5 font-mono text-[9px]">
                                  {question.platform ? <span>{question.platform}</span> : null}
                                  {question.tags.slice(0, 2).map((tag) => (
                                    <span key={tag}>#{tag}</span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-2 py-2.5">
                            <span className="text-ash line-clamp-1 text-[11px]">
                              {topicName(topics, question.topic_id) ?? "—"}
                            </span>
                          </td>
                          <td className="px-2 py-2.5">
                            {question.difficulty ? (
                              <Badge
                                tone={difficultyTones[question.difficulty]}
                                className="text-[10px]"
                              >
                                {difficultyLabels[question.difficulty]}
                              </Badge>
                            ) : (
                              <span className="text-faint">—</span>
                            )}
                          </td>
                          <td className="px-2 py-2.5">
                            <Badge tone={statusTones[question.status]} className="text-[10px]">
                              {statusLabels[question.status]}
                            </Badge>
                          </td>
                          <td className="px-2 py-2.5">
                            {question.next_review_at ? (
                              isDueToday(question.next_review_at) ? (
                                <span className="text-ochre inline-flex items-center gap-1 font-mono text-[10px]">
                                  <Clock3 className="size-3" /> Due
                                </span>
                              ) : (
                                <span className="text-faint font-mono text-[10px]">
                                  {formatCompact(question.next_review_at)}
                                </span>
                              )
                            ) : (
                              <span className="text-faint">—</span>
                            )}
                          </td>
                          <td className="px-2 py-2.5">
                            <div className="flex items-center justify-end gap-1">
                              <RowMenu
                                question={question}
                                onEdit={() => editFromList(question.id)}
                                onStatus={(status) => handleStatus(question.id, status)}
                                onDelete={() =>
                                  setPendingDelete({ id: question.id, title: question.title })
                                }
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="divide-line divide-y md:hidden">
                  {pageItems.map((question) => (
                    <div
                      key={question.id}
                      className="cursor-pointer p-4 transition-colors active:bg-white/[0.03]"
                      onClick={() => openDetail(question.id)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            {question.starred ? (
                              <Star className="fill-copper text-copper size-3 shrink-0" />
                            ) : null}
                            <h3 className="text-bone truncate text-sm">{question.title}</h3>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            {question.difficulty ? (
                              <Badge
                                tone={difficultyTones[question.difficulty]}
                                className="text-[10px]"
                              >
                                {difficultyLabels[question.difficulty]}
                              </Badge>
                            ) : null}
                            <Badge tone={statusTones[question.status]} className="text-[10px]">
                              {statusLabels[question.status]}
                            </Badge>
                            {question.topic_id ? (
                              <span className="text-faint text-[10px]">
                                {topicName(topics, question.topic_id)}
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <RowMenu
                          question={question}
                          onEdit={() => editFromList(question.id)}
                          onStatus={(status) => handleStatus(question.id, status)}
                          onDelete={() =>
                            setPendingDelete({ id: question.id, title: question.title })
                          }
                        />
                      </div>
                      <div className="text-faint mt-2 flex items-center justify-between font-mono text-[10px]">
                        <span>{question.platform ?? "—"}</span>
                        <span className={cn(isDueToday(question.next_review_at) && "text-ochre")}>
                          {question.next_review_at
                            ? isDueToday(question.next_review_at)
                              ? "Review due"
                              : `Review ${formatCompact(question.next_review_at)}`
                            : "No review scheduled"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-line text-faint flex flex-wrap items-center justify-between gap-2 border-t px-4 py-2.5 font-mono text-[10px]">
                  <span>
                    Showing {visible.length === 0 ? 0 : pageStart + 1}–
                    {Math.min(pageStart + PAGE_SIZE, visible.length)} of {visible.length}
                    {visible.length !== questions.length ? ` · ${questions.length} total` : ""}
                  </span>
                  <div className="flex items-center gap-3">
                    {topicFilter !== "all" ? (
                      <span className="hidden truncate sm:inline">
                        {topicLabel(topics, topicFilter)}
                      </span>
                    ) : null}
                    {pageCount > 1 ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          aria-label="Previous page"
                          disabled={currentPage === 1}
                          onClick={() => setPage((value) => Math.max(1, value - 1))}
                          className="border-line text-ash hover:border-line-strong hover:text-bone grid size-6 place-items-center rounded-md border transition-colors disabled:pointer-events-none disabled:opacity-30"
                        >
                          <ChevronLeft className="size-3.5" />
                        </button>
                        <span className="text-ash tabular min-w-12 text-center">
                          {currentPage} / {pageCount}
                        </span>
                        <button
                          type="button"
                          aria-label="Next page"
                          disabled={currentPage === pageCount}
                          onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
                          className="border-line text-ash hover:border-line-strong hover:text-bone grid size-6 place-items-center rounded-md border transition-colors disabled:pointer-events-none disabled:opacity-30"
                        >
                          <ChevronRight className="size-3.5" />
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <QuestionFormDialog
        open={formOpen || newFromUrl}
        onOpenChange={closeForm}
        topics={topics}
        question={formQuestion}
        onSaved={handleSaved}
      />

      <QuestionDetailSheet
        open={detail.open}
        onOpenChange={(open) => setDetail((current) => (open ? { ...current, open } : emptyDetail))}
        loading={detail.loading}
        error={detail.error}
        question={detail.question}
        reviews={detail.reviews}
        topics={topics}
        onEdit={(question) => {
          setDetail(emptyDetail);
          setFormQuestion(question);
          setFormOpen(true);
        }}
        onDelete={(question) => {
          setPendingDelete({ id: question.id, title: question.title });
        }}
        onReview={handleReview}
      />

      <Dialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="kicker text-clay">Irreversible</div>
            <DialogTitle className="mt-1">Delete this problem?</DialogTitle>
            <DialogDescription>
              “{pendingDelete?.title}” will be removed along with its notes, code, and review
              history.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPendingDelete(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete} disabled={deleting}>
              {deleting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              Delete problem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MiniStat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: number;
  hint?: string;
  tone?: string;
}) {
  return (
    <div className="bg-carbon/70 px-4 py-3">
      <div className="kicker">{label}</div>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className={cn("tabular font-serif text-2xl leading-none", tone ?? "text-bone")}>
          {value}
        </span>
        {hint ? <span className="text-faint font-mono text-[9px]">{hint}</span> : null}
      </div>
    </div>
  );
}

function FilterToggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs transition-colors",
        active
          ? "border-copper/40 bg-copper/[0.09] text-copper"
          : "border-line text-ash hover:border-line-strong hover:text-bone bg-white/[0.02]",
      )}
    >
      {children}
    </button>
  );
}

function TopicButton({
  active,
  label,
  count,
  onClick,
  className,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left text-xs transition-colors",
        active ? "text-bone bg-white/[0.055]" : "text-ash hover:text-bone hover:bg-white/[0.03]",
        className,
      )}
    >
      <span className="truncate">{label}</span>
      <span className={cn("font-mono text-[9px]", active ? "text-copper" : "text-faint")}>
        {count}
      </span>
    </button>
  );
}

function RowMenu({
  question,
  onEdit,
  onStatus,
  onDelete,
}: {
  question: QuestionListItem;
  onEdit: () => void;
  onStatus: (status: QuestionStatus) => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-faint size-7"
          aria-label={`Actions for ${question.title}`}
          onClick={(event) => event.stopPropagation()}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
        <DropdownMenuLabel>Problem</DropdownMenuLabel>
        <DropdownMenuItem onSelect={onEdit}>
          <Pencil /> Edit record
        </DropdownMenuItem>
        {question.status !== "solved" ? (
          <DropdownMenuItem onSelect={() => onStatus("solved")}>
            <Check /> Mark solved
          </DropdownMenuItem>
        ) : null}
        {question.status !== "needs_revision" ? (
          <DropdownMenuItem onSelect={() => onStatus("needs_revision")}>
            <RotateCcw /> Needs revision
          </DropdownMenuItem>
        ) : null}
        {question.status !== "todo" ? (
          <DropdownMenuItem onSelect={() => onStatus("todo")}>
            <CircleSlash /> Move to to-do
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-clay focus:text-clay" onSelect={onDelete}>
          <Trash2 /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
