import { getApprovalTasksData } from "@/app/actions/phase4";
import { ApprovalTasksView } from "@/components/approvals/ApprovalTasksView";

interface ApprovalsPageProps {
  searchParams: Promise<{ tab?: string; projectId?: string }>;
}

export default async function ApprovalsPage({ searchParams }: ApprovalsPageProps) {
  const { tab, projectId } = await searchParams;
  const data = await getApprovalTasksData(tab || "WAITING_ME", projectId);

  return (
    <ApprovalTasksView
      tasks={data.tasks}
      counts={data.counts}
      currentTab={data.currentTab}
    />
  );
}
