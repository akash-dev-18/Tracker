import type { Metadata } from "next";
import { getTopicData } from "@/features/dsa/queries";
import { TopicsManager } from "@/features/dsa/components/topics-manager";

export const metadata: Metadata = { title: "Topics" };

export default async function TopicsPage() {
  const { topics, counts } = await getTopicData();

  return <TopicsManager topics={topics} counts={counts} />;
}
