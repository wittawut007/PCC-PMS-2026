import { getHandoverData } from "@/app/actions/phase4";
import { HandoverCloseoutView } from "@/components/handover/HandoverCloseoutView";

interface HandoverPageProps {
  searchParams: Promise<{ projectId?: string }>;
}

export default async function HandoverPage({ searchParams }: HandoverPageProps) {
  const { projectId } = await searchParams;
  const data = await getHandoverData(projectId);

  return (
    <HandoverCloseoutView
      currentProject={data.currentProject}
      items={data.items}
      readinessPercent={data.readinessPercent}
      canClose={data.canClose}
      alertMessage={data.alertMessage}
    />
  );
}
