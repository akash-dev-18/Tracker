import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AppShell } from "@/components/shell/app-shell";
import type { Topic } from "@/lib/supabase/database.types";
import type { QuestionListItem } from "@/features/dsa/queries";
import { QuestionsWorkspace } from "@/features/dsa/components/questions-workspace";
import { addDaysISO } from "@/lib/utils/date";

export const metadata: Metadata = {
  title: "Practice preview",
  robots: { index: false, follow: false },
};

const topicSpec: [string, string, string[]][] = [
  ["Arrays & Hashing", "arrays", ["Two Pointers", "Sliding Window", "Prefix Sum"]],
  ["Strings", "strings", ["Parsing", "Palindrome"]],
  ["Linked Lists", "linked-list", ["Fast & Slow", "Reversal"]],
  ["Stacks & Queues", "stacks", ["Monotonic Stack"]],
  ["Trees", "trees", ["Traversal", "BST"]],
  ["Graphs", "graphs", ["BFS & DFS", "Topological Sort", "Union Find"]],
  ["Dynamic Programming", "dp", ["1-D", "2-D", "Knapsack"]],
  ["Greedy", "greedy", ["Intervals"]],
  ["Binary Search", "binary-search", ["Search Space"]],
  ["Heap", "heap", ["Top K"]],
  ["Backtracking", "backtracking", ["Subsets", "Permutations"]],
];

function makeTopics(): Topic[] {
  const topics: Topic[] = [];
  topicSpec.forEach(([parentName, , children], index) => {
    const parentId = `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`;
    topics.push({
      id: parentId,
      user_id: "00000000-0000-4000-8000-000000000000",
      name: parentName,
      parent_id: null,
      color: null,
      sort_order: index + 1,
      created_at: "2026-09-01T10:00:00Z",
      updated_at: "2026-09-01T10:00:00Z",
    });
    children.forEach((childName, childIndex) => {
      topics.push({
        id: `10000000-0000-4000-8000-${String(index + 1).padStart(4, "0")}${String(childIndex + 1).padStart(8, "0")}`,
        user_id: "00000000-0000-4000-8000-000000000000",
        name: childName,
        parent_id: parentId,
        color: null,
        sort_order: childIndex + 1,
        created_at: "2026-09-01T10:00:00Z",
        updated_at: "2026-09-01T10:00:00Z",
      });
    });
  });
  return topics;
}

const topics = makeTopics();

const arrays = topics[0].id;
const twoPointers = topics[1].id;
const slidingWindow = topics[2].id;
const trees = topics.find((topic) => topic.name === "Trees")!.id;
const traverse = topics.find((topic) => topic.name === "Traversal")!.id;
const graphs = topics.find((topic) => topic.name === "Graphs")!.id;
const bfs = topics.find((topic) => topic.name === "BFS & DFS")!.id;
const dp1d = topics.find((topic) => topic.name === "1-D")!.id;
const heaps = topics.find((topic) => topic.name === "Heap")!.id;
const stacks = topics.find((topic) => topic.name === "Stacks & Queues")!.id;
const intervals = topics.find((topic) => topic.name === "Intervals")!.id;
const strings = topics.find((topic) => topic.name === "Strings")!.id;

const base = "2026-10-01T09:00:00Z";

const fixtures: {
  title: string;
  topic: string;
  difficulty: QuestionListItem["difficulty"];
  status: QuestionListItem["status"];
  platform: string;
  due: number | null;
  solved: number | null;
  starred?: boolean;
  tags?: string[];
  notes?: string;
}[] = [
  {
    title: "Trapping Rain Water",
    topic: arrays,
    difficulty: "hard",
    status: "needs_revision",
    platform: "LeetCode",
    due: -1,
    solved: -8,
    starred: true,
    tags: ["two-pointers", "prefix"],
    notes: "Two-pointer invariant: the smaller boundary decides the trapped water. Re-derive before coding.",
  },
  {
    title: "Longest Substring Without Repeating Characters",
    topic: slidingWindow,
    difficulty: "medium",
    status: "solved",
    platform: "LeetCode",
    due: 0,
    solved: -3,
    tags: ["sliding-window", "hash-set"],
    notes: "Window shrinks from the left until the duplicate leaves the set.",
  },
  {
    title: "Serialize and Deserialize Binary Tree",
    topic: traverse,
    difficulty: "hard",
    status: "needs_revision",
    platform: "LeetCode",
    due: 0,
    solved: -14,
    starred: true,
    tags: ["trees", "dfs"],
    notes: "Preorder with null markers. The deserialize pointer must be shared across recursive calls.",
  },
  {
    title: "Course Schedule II",
    topic: bfs,
    difficulty: "medium",
    status: "solved",
    platform: "NeetCode",
    due: 1,
    solved: -2,
    tags: ["topological-sort"],
    notes: "Kahn's algorithm. Cycle detection is the queue length check.",
  },
  {
    title: "Coin Change",
    topic: dp1d,
    difficulty: "medium",
    status: "solved",
    platform: "LeetCode",
    due: 2,
    solved: -5,
    tags: ["dp", "knapsack"],
    notes: "amount + 1 as sentinel; iterate coins outside, amount inside for unlimited use.",
  },
  {
    title: "Merge Intervals",
    topic: intervals,
    difficulty: "medium",
    status: "solved",
    platform: "LeetCode",
    due: 3,
    solved: -1,
    tags: ["sorting"],
  },
  {
    title: "Word Ladder",
    topic: bfs,
    difficulty: "hard",
    status: "attempted",
    platform: "LeetCode",
    due: null,
    solved: null,
    tags: ["bfs", "strings"],
    notes: "Bidirectional BFS is the clean follow-up. Watch the wildcard index rebuild cost.",
  },
  {
    title: "Valid Parentheses",
    topic: stacks,
    difficulty: "easy",
    status: "solved",
    platform: "LeetCode",
    due: 9,
    solved: -9,
    tags: ["stack"],
  },
  {
    title: "Kth Largest Element in an Array",
    topic: heaps,
    difficulty: "medium",
    status: "solved",
    platform: "LeetCode",
    due: 6,
    solved: -6,
    tags: ["heap", "quickselect"],
  },
  {
    title: "Two Sum II",
    topic: twoPointers,
    difficulty: "easy",
    status: "solved",
    platform: "LeetCode",
    due: 13,
    solved: -13,
    tags: ["two-pointers"],
  },
  {
    title: "Minimum Window Substring",
    topic: slidingWindow,
    difficulty: "hard",
    status: "attempted",
    platform: "LeetCode",
    due: null,
    solved: null,
    starred: true,
    tags: ["sliding-window", "counts"],
  },
  {
    title: "Number of Islands",
    topic: bfs,
    difficulty: "medium",
    status: "solved",
    platform: "LeetCode",
    due: 21,
    solved: -21,
    tags: ["graphs", "flood-fill"],
  },
  {
    title: "Clone Graph",
    topic: graphs,
    difficulty: "medium",
    status: "todo",
    platform: "NeetCode",
    due: null,
    solved: null,
    tags: ["graphs", "hash-map"],
  },
  {
    title: "Binary Tree Maximum Path Sum",
    topic: trees,
    difficulty: "hard",
    status: "needs_revision",
    platform: "LeetCode",
    due: -3,
    solved: -18,
    starred: true,
    tags: ["trees", "dfs"],
    notes: "Return the best downward path, update the global answer with the through-node sum.",
  },
  {
    title: "Group Anagrams",
    topic: strings,
    difficulty: "medium",
    status: "solved",
    platform: "LeetCode",
    due: 34,
    solved: -34,
    tags: ["hash-map"],
  },
  {
    title: "House Robber",
    topic: dp1d,
    difficulty: "medium",
    status: "solved",
    platform: "LeetCode",
    due: 4,
    solved: -4,
    tags: ["dp"],
  },
  {
    title: "Permutations",
    topic: topics.find((topic) => topic.name === "Backtracking")!.id,
    difficulty: "medium",
    status: "todo",
    platform: "LeetCode",
    due: null,
    solved: null,
    tags: ["backtracking"],
  },
];

const questions: QuestionListItem[] = fixtures.map((fixture, index) => ({
  id: `20000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
  title: fixture.title,
  url: "https://leetcode.com/problems/two-sum/",
  platform: fixture.platform,
  difficulty: fixture.difficulty,
  status: fixture.status,
  topic_id: fixture.topic,
  notes: fixture.notes ?? null,
  tags: fixture.tags ?? [],
  starred: fixture.starred ?? false,
  solved_at: fixture.solved === null ? null : addDaysISO(fixture.solved),
  next_review_at: fixture.due === null ? null : addDaysISO(fixture.due),
  review_interval: fixture.status === "solved" ? 7 : 0,
  created_at: new Date(new Date(base).getTime() + index * 3600_000).toISOString(),
  updated_at: base,
}));

export default function PracticePreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <AppShell
      user={{ displayName: "Akash Sharma", email: "akash@example.com" }}
      todayLabel="TUE 21 OCT"
      stats={{ dailyGoal: 4, todayProgress: 2, dueCount: 4, activeJobCount: 12 }}
    >
      <Suspense fallback={null}>
        <QuestionsWorkspace initialTopics={topics} initialQuestions={questions} />
      </Suspense>
    </AppShell>
  );
}
