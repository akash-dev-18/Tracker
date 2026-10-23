import type { Metadata } from "next";
import { getProjectsData } from "@/features/projects/queries";
import { ProjectsWorkspace } from "@/features/projects/components/projects-workspace";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const { projects, tasks } = await getProjectsData();

  return <ProjectsWorkspace initialProjects={projects} initialTasks={tasks} />;
}
