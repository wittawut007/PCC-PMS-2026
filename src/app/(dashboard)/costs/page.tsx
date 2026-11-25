import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProjectFinanceView } from "@/components/finance/ProjectFinanceView";
import { getProjectFinance } from "@/lib/project-finance";

export const metadata: Metadata = {
  title: "งบประมาณและต้นทุนโครงการ | PCC PMS 2026",
  description:
    "ระบบบริหารและติดตามงบประมาณ ต้นทุนเกิดจริง งวดเรียกเก็บเงิน และการรับชำระ",
};

interface CostsPageProps {
  searchParams: Promise<{ projectId?: string }>;
}

export default async function CostsPage({ searchParams }: CostsPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { projectId } = await searchParams;

  // 1. Fetch all projects
  const allProjects = await prisma.project.findMany({
    select: {
      id: true,
      code: true,
      name: true,
      workType: true,
      status: true,
    },
    orderBy: { code: "asc" },
  });

  const selectedProjectId = projectId || "";

  const data = await getProjectFinance(selectedProjectId || undefined);
  return <ProjectFinanceView key={selectedProjectId} data={data} projectId={selectedProjectId} allProjects={allProjects} />;
}
