import { getWorkflowTrackerData } from "@/app/actions/installation";
import { WorkflowTrackerView } from "@/components/installation/WorkflowTrackerView";

interface WorkflowPageProps {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ projectId?: string }>;
}

export default async function WorkflowPage({ params, searchParams }: WorkflowPageProps) {
  const { type } = await params;
  const { projectId } = await searchParams;

  const data = await getWorkflowTrackerData(type, projectId);

  return <WorkflowTrackerView data={data} />;
}
