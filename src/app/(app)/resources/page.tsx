import type { Metadata } from "next";
import { getResourcesData } from "@/features/resources/queries";
import { LibraryWorkspace } from "@/features/resources/components/library-workspace";

export const metadata: Metadata = { title: "Library" };

export default async function ResourcesPage() {
  const resources = await getResourcesData();

  return <LibraryWorkspace initialResources={resources} />;
}
