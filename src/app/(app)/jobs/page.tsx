import type { Metadata } from "next";
import { getJobsData } from "@/features/jobs/queries";
import { JobsWorkspace } from "@/features/jobs/components/jobs-workspace";

export const metadata: Metadata = { title: "Applications" };

export default async function JobsPage() {
  const jobs = await getJobsData();

  return <JobsWorkspace initialJobs={jobs} />;
}
