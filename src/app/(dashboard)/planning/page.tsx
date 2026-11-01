import { Suspense } from "react";
import { getPlanningData } from "@/app/actions/planning";
import { PlanningClientView } from "./PlanningClientView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "แผนงานและปฏิทินโครงการ | PCC PMS 2026",
  description: "ระบบจัดการแผนงานแบบ Interactive Gantt และปฏิทินโครงการ 50 WBS Tasks",
};

interface PlanningPageProps {
  searchParams: Promise<{ projectId?: string; view?: string }>;
}

async function PlanningContent({ searchParams }: PlanningPageProps) {
  const resolvedParams = await searchParams;
  const { projects, currentProject } = await getPlanningData(resolvedParams.projectId);

  return (
    <PlanningClientView
      projects={projects}
      currentProject={currentProject}
    />
  );
}

export default function PlanningPage(props: PlanningPageProps) {
  return (
    <div className="space-y-6">
      <Suspense
        fallback={
          <div className="bg-white rounded-2xl p-16 text-center border border-[#E4EAF4] animate-pulse">
            <div className="w-10 h-10 border-4 border-[#075DD8] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xs text-[#596780]">กำลังโหลดแผนงานและข้อมูลโครงการ...</p>
          </div>
        }
      >
        <PlanningContent {...props} />
      </Suspense>
    </div>
  );
}
