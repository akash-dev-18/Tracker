import type { Topic } from "@/lib/supabase/database.types";

export type TopicTree = {
  id: string;
  name: string;
  parentId: string | null;
  children: { id: string; name: string }[];
};

export function buildTopicTree(topics: Topic[]): TopicTree[] {
  const parents = topics
    .filter((topic) => !topic.parent_id)
    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));

  return parents.map((parent) => ({
    id: parent.id,
    name: parent.name,
    parentId: null,
    children: topics
      .filter((topic) => topic.parent_id === parent.id)
      .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name))
      .map((child) => ({ id: child.id, name: child.name })),
  }));
}

export function topicName(topics: Topic[], id: string | null): string | null {
  if (!id) return null;
  return topics.find((topic) => topic.id === id)?.name ?? null;
}

export function topicLabel(topics: Topic[], id: string | null): string | null {
  if (!id) return null;
  const topic = topics.find((entry) => entry.id === id);
  if (!topic) return null;
  if (!topic.parent_id) return topic.name;
  const parent = topics.find((entry) => entry.id === topic.parent_id);
  return parent ? `${parent.name} / ${topic.name}` : topic.name;
}

export function topicIdsForFilter(topics: Topic[], id: string): string[] {
  if (id === "all") return [];
  const children = topics.filter((topic) => topic.parent_id === id).map((topic) => topic.id);
  return children.length > 0 ? [id, ...children] : [id];
}
