import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { getMaterialsData } from "@/app/actions/materials";
import { MaterialsDashboard } from "@/components/materials/MaterialsDashboard";

export const metadata: Metadata = {
  title: "วัสดุและเอกสารส่งคลัง | PCC PMS 2026",
  description: "ระบบบริหารจัดการวัสดุ รายการตาม BOM ตรวจสอบยอดคลัง และติดตามการจัดหา",
};

interface MaterialsPageProps {
  searchParams: Promise<{ projectId?: string }>;
}

export default async function MaterialsPage({ searchParams }: MaterialsPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { projectId } = await searchParams;
  const data = await getMaterialsData(projectId);

  if (!data.currentProject) {
    return (
      <div className="p-8 text-center text-sm text-[#596780]">
        ไม่พบข้อมูลโครงการในระบบ
      </div>
    );
  }

  return (
    <MaterialsDashboard
      allProjects={data.allProjects}
      currentProject={data.currentProject}
      kpis={data.kpis}
      documents={data.documents}
      drawingRev={data.drawingRev}
    />
  );
}
