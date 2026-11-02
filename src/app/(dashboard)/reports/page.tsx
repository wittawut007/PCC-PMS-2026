import { getProjectReportsData } from "@/app/actions/phase4";
import { ProjectReportsView } from "@/components/reports/ProjectReportsView";

interface ReportsPageProps {
  searchParams: Promise<{ projectId?: string }>;
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const { projectId } = await searchParams;
  const data = await getProjectReportsData(projectId);

  return (
    <ProjectReportsView
      currentProject={data.currentProject}
      stats={data.stats}
      packageProgress={data.packageProgress}
      sCurveData={data.sCurveData}
      keyIssues={data.keyIssues}
    />
  );
}
