import { getInstallationOverview } from "@/app/actions/installation";
import { InstallationDashboard } from "@/components/installation/InstallationDashboard";

interface InstallationPageProps {
  searchParams: Promise<{ projectId?: string }>;
}

export default async function InstallationPage({ searchParams }: InstallationPageProps) {
  const { projectId } = await searchParams;
  const data = await getInstallationOverview(projectId);

  if (!data.currentProject) {
    return (
      <div className="p-8 text-center text-gray-500">
        ไม่พบข้อมูลโครงการ
      </div>
    );
  }

  return (
    <InstallationDashboard
      allProjects={data.allProjects}
      currentProject={data.currentProject}
      packages={data.packages}
      stats={data.stats}
      pendingInspections={data.pendingInspections}
      ncrRecords={data.ncrRecords}
    />
  );
}
