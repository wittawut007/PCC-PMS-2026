import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { getProductionData } from "@/app/actions/materials";
import { ProductionDashboard } from "@/components/production/ProductionDashboard";

export const metadata: Metadata = {
  title: "ติดตามคำขอผลิต | PCC PMS 2026",
  description: "ติดตามคำขอผลิตชิ้นส่วนสำเร็จรูปและพรีคาสท์ ตรวจสอบยอดผลิตและกำหนดส่ง",
};

interface ProductionPageProps {
  searchParams: Promise<{ projectId?: string }>;
}

export default async function ProductionPage({ searchParams }: ProductionPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { projectId } = await searchParams;
  const data = await getProductionData(projectId);

  if (!data || !data.currentProject) {
    return (
      <div className="p-8 text-center text-sm text-[#596780]">
        ไม่พบข้อมูลโครงการในระบบ
      </div>
    );
  }

  return (
    <ProductionDashboard
      allProjects={data.allProjects}
      currentProject={data.currentProject}
      kpis={data.kpis}
      orders={data.orders}
      detailOrder={data.detailOrder}
    />
  );
}
