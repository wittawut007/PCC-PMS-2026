import { prisma } from "@/lib/prisma";
import { DailyLogForm } from "@/components/installation/DailyLogForm";

interface DailyLogPageProps {
  searchParams: Promise<{ projectId?: string }>;
}

export default async function NewDailyLogPage({ searchParams }: DailyLogPageProps) {
  const { projectId } = await searchParams;

  const project = await prisma.project.findFirst({
    where: projectId ? { id: projectId } : { code: "PCC-26001" },
    include: {
      workPackages: true,
    },
  });

  if (!project) {
    return <div className="p-8 text-center text-gray-500">ไม่พบโครงการ</div>;
  }

  return (
    <DailyLogForm
      project={project}
      workPackages={project.workPackages || []}
    />
  );
}
