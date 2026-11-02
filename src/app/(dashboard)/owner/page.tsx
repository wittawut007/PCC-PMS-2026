import { getOwnerPortalData } from "@/app/actions/phase4";
import { OwnerPortalView } from "@/components/owner/OwnerPortalView";

interface OwnerPageProps {
  searchParams: Promise<{ projectId?: string }>;
}

export default async function OwnerPage({ searchParams }: OwnerPageProps) {
  const { projectId } = await searchParams;
  const data = await getOwnerPortalData(projectId);

  return <OwnerPortalView data={data} />;
}
