import type { Metadata } from "next";
import { getDsaData } from "@/features/dsa/queries";
import { QuestionsWorkspace } from "@/features/dsa/components/questions-workspace";

export const metadata: Metadata = { title: "Practice" };

export default async function PracticePage() {
  const { topics, questions } = await getDsaData();

  return <QuestionsWorkspace initialTopics={topics} initialQuestions={questions} />;
}
