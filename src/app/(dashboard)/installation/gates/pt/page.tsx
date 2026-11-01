import { getPtGatesData } from "@/app/actions/installation";
import { PtGatesView } from "@/components/installation/PtGatesView";

interface PtGatesPageProps {
  searchParams: Promise<{ projectId?: string }>;
}

export default async function PtGatesPage({ searchParams }: PtGatesPageProps) {
  const { projectId } = await searchParams;
  const { project, gates } = await getPtGatesData(projectId);

  return <PtGatesView project={project} gates={gates} />;
}
