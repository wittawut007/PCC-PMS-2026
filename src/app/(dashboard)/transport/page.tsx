import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { getTransportData } from "@/app/actions/transport";
import { TransportDashboard } from "@/components/transport/TransportDashboard";

export const metadata: Metadata = {
  title: "การขนส่งและตรวจรับ | PCC PMS 2026",
  description: "ระบบบริหารและติดตามเที่ยวรถขนส่งชิ้นส่วนพรีคาสท์ และบันทึกผลการตรวจรับหน้างาน",
};

interface TransportPageProps {
  searchParams: Promise<{ projectId?: string; status?: string }>;
}

export default async function TransportPage({ searchParams }: TransportPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { projectId, status } = await searchParams;
  const data = await getTransportData(projectId, status);

  if (!data.currentProject) {
    return (
      <div className="p-8 text-center text-sm text-[#596780]">
        ไม่พบข้อมูลโครงการในระบบ
      </div>
    );
  }

  return (
    <TransportDashboard
      allProjects={data.allProjects}
      currentProject={data.currentProject}
      trips={data.trips}
    />
  );
}
