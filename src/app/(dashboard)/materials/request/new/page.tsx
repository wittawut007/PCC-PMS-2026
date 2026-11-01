import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { MaterialRequestForm } from "@/components/materials/MaterialRequestForm";

export const metadata: Metadata = {
  title: "สร้างคำขอเบิกวัสดุ | PCC PMS 2026",
  description: "สร้างคำขอเบิกวัสดุตามแบบและรายการ BOM ที่ได้รับอนุมัติ",
};

interface NewMaterialRequestPageProps {
  searchParams: Promise<{ projectId?: string; packageId?: string }>;
}

export default async function NewMaterialRequestPage({ searchParams }: NewMaterialRequestPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { projectId } = await searchParams;

  const allProjects = await prisma.project.findMany({
    select: { id: true, code: true, name: true },
    orderBy: { code: "asc" },
  });

  const currentProject =
    allProjects.find((p) => p.id === projectId || p.code === projectId) ||
    allProjects.find((p) => p.code === "PCC-26001") ||
    allProjects[0];

  const packages = await prisma.workPackage.findMany({
    where: { projectId: currentProject.id },
    select: { id: true, code: true, name: true, zone: true },
    orderBy: { code: "asc" },
  });

  const drawing = await prisma.drawing.findFirst({
    where: { projectId: currentProject.id },
    include: { bomItems: true },
  });

  const initialItems = drawing
    ? drawing.bomItems.map((item) => ({
        bomItemId: item.id,
        itemCode: item.itemCode,
        name: item.name,
        bomQty: Number(item.quantity),
        unit: item.unit,
      }))
    : [
        { itemCode: "F-PANEL-01", name: "แผ่นรั้ว F-PANEL-01", bomQty: 100, unit: "แผ่น" },
        { itemCode: "F-POST-01", name: "เสารั้ว F-POST-01", bomQty: 11, unit: "ต้น" },
        { itemCode: "F-BEAM-01", name: "คานทับหลัง F-BEAM-01", bomQty: 10, unit: "ชิ้น" },
      ];

  return (
    <MaterialRequestForm
      projects={allProjects}
      currentProjectId={currentProject.id}
      packages={packages}
      bomRevision={drawing ? `Rev.${drawing.revision}` : "Rev.03"}
      initialItems={initialItems}
    />
  );
}
