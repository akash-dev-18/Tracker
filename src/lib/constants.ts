import type {
  JobStatus,
  PriorityLevel,
  ProjectStatus,
  QuestionDifficulty,
  QuestionStatus,
  ResourceType,
  TaskStatus,
  WorkMode,
} from "@/lib/supabase/database.types";

export const REVIEW_INTERVALS = [1, 3, 7, 14, 30, 60] as const;

export const DIFFICULTY_LABEL: Record<QuestionDifficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export const DIFFICULTY_TONE: Record<QuestionDifficulty, string> = {
  easy: "text-verdigris border-verdigris/25 bg-verdigris/[0.08]",
  medium: "text-ochre border-ochre/25 bg-ochre/[0.08]",
  hard: "text-clay border-clay/25 bg-clay/[0.08]",
};

export const QUESTION_STATUS_LABEL: Record<QuestionStatus, string> = {
  todo: "To do",
  attempted: "Attempted",
  solved: "Solved",
  needs_revision: "Needs revision",
};

export const QUESTION_STATUS_TONE: Record<QuestionStatus, string> = {
  todo: "text-ash border-line bg-white/[0.03]",
  attempted: "text-ochre border-ochre/25 bg-ochre/[0.08]",
  solved: "text-verdigris border-verdigris/25 bg-verdigris/[0.08]",
  needs_revision: "text-copper border-copper/25 bg-copper/[0.08]",
};

export const JOB_STATUS_ORDER: JobStatus[] = [
  "wishlist",
  "applied",
  "screening",
  "interview",
  "offer",
  "rejected",
  "ghosted",
  "withdrawn",
];

export const JOB_STATUS_LABEL: Record<JobStatus, string> = {
  wishlist: "Wishlist",
  applied: "Applied",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  ghosted: "Ghosted",
  withdrawn: "Withdrawn",
};

export const JOB_STATUS_TONE: Record<JobStatus, string> = {
  wishlist: "text-ash border-line bg-white/[0.03]",
  applied: "text-bone border-line-strong bg-white/[0.05]",
  screening: "text-ochre border-ochre/25 bg-ochre/[0.08]",
  interview: "text-copper border-copper/25 bg-copper/[0.08]",
  offer: "text-verdigris border-verdigris/25 bg-verdigris/[0.08]",
  rejected: "text-clay border-clay/25 bg-clay/[0.08]",
  ghosted: "text-faint border-line bg-white/[0.02]",
  withdrawn: "text-faint border-line bg-white/[0.02]",
};

export const APPLIED_STATUSES: JobStatus[] = [
  "applied",
  "screening",
  "interview",
  "offer",
  "rejected",
  "ghosted",
  "withdrawn",
];

export const ACTIVE_STATUSES: JobStatus[] = ["applied", "screening", "interview"];

export const WORK_MODE_LABEL: Record<WorkMode, string> = {
  onsite: "On-site",
  hybrid: "Hybrid",
  remote: "Remote",
};

export const PROJECT_STATUS_ORDER: ProjectStatus[] = ["idea", "active", "paused", "done", "archived"];

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  idea: "Idea",
  active: "Active",
  paused: "Paused",
  done: "Done",
  archived: "Archived",
};

export const PROJECT_STATUS_TONE: Record<ProjectStatus, string> = {
  idea: "text-ash border-line bg-white/[0.03]",
  active: "text-verdigris border-verdigris/25 bg-verdigris/[0.08]",
  paused: "text-ochre border-ochre/25 bg-ochre/[0.08]",
  done: "text-copper border-copper/25 bg-copper/[0.08]",
  archived: "text-faint border-line bg-white/[0.02]",
};

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "To do",
  doing: "Doing",
  done: "Done",
};

export const PRIORITY_LABEL: Record<PriorityLevel, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const PRIORITY_TONE: Record<PriorityLevel, string> = {
  low: "text-faint",
  medium: "text-ash",
  high: "text-copper",
};

export const RESOURCE_TYPE_LABEL: Record<ResourceType, string> = {
  article: "Article",
  video: "Video",
  course: "Course",
  book: "Book",
  docs: "Docs",
  other: "Other",
};

export const LANGUAGES = [
  "cpp",
  "java",
  "python",
  "javascript",
  "typescript",
  "go",
  "rust",
  "sql",
  "other",
] as const;

export const PLATFORMS = [
  "LeetCode",
  "NeetCode",
  "GeeksforGeeks",
  "HackerRank",
  "Codeforces",
  "CodeChef",
  "InterviewBit",
  "Other",
] as const;
