import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { InstallationTimeline } from "@/components/installation/InstallationTimeline";
import { getInstallationTimeline } from "@/lib/installation-data";

export const metadata: Metadata = {
  title: "การติดตั้งและตรวจคุณภาพ | PCC PMS 2026",
  description:
    "ระบบบริหารและติดตามความคืบหน้างานติดตั้ง จุดอนุมัติ AP ตรวจสอบคุณภาพ และจัดการข้อบกพร่อง NCR",
};

interface InstallationPageProps {
  searchParams: Promise<{ projectId?: string }>;
}

export default async function InstallationPage({ searchParams }: InstallationPageProps) {
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

  const data = await getInstallationTimeline(selectedProjectId || undefined);
  return <InstallationTimeline key={selectedProjectId} data={data} projectId={selectedProjectId} allProjects={allProjects} />;
}
