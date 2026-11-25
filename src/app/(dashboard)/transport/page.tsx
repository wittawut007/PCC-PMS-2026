import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getTransportTrips } from "@/lib/transport-data";
import { TripStatus } from "@prisma/client";
import { TransportClientView } from "./TransportClientView";

export const metadata: Metadata = {
  title: "การขนส่งและตรวจรับ | PCC PMS 2026",
  description:
    "ระบบบริหารและติดตามเที่ยวรถขนส่งชิ้นส่วนพรีคาสท์ และบันทึกผลการตรวจรับหน้างาน",
};

interface TransportPageProps {
  searchParams: Promise<{ projectId?: string; status?: string }>;
}

export default async function TransportPage({ searchParams }: TransportPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { projectId, status } = await searchParams;

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

  const trips = await getTransportTrips(selectedProjectId, status && Object.values(TripStatus).includes(status as TripStatus) ? status as TripStatus : undefined);

  return (
    <TransportClientView
      allProjects={allProjects}
      selectedProjectId={selectedProjectId}
      trips={trips}
    />
  );
}
