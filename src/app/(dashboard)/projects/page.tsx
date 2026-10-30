import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ProjectsClientView } from "./ProjectsClientView";

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Fetch all projects with their work packages, contracts, and members
  const projects = await prisma.project.findMany({
    include: {
      workPackages: true,
      contracts: true,
      members: {
        include: {
          user: true,
        },
      },
    },
    orderBy: { code: "asc" },
  });

  // Map to client-friendly data structure
  const mappedProjects = projects.map((p) => {
    const pm = p.members.find((m) => m.roleInProject === "PM")?.user?.name || "สมชาย PM";
    const baseValue = p.contracts[0]?.baseValue ? Number(p.contracts[0].baseValue) : 0;
    
    // Compute progress demo metrics based on project code
    let donePct = 0;
    let qcPct = 0;
    let attention = false;
    let note = p.notes || "";

    if (p.code === "PCC-26001") {
      donePct = 78;
      qcPct = 59;
      note = "แผนและทีมพร้อม · มีงานรอ QC";
    } else if (p.code === "PCC-26002") {
      donePct = 48;
      qcPct = 35;
      note = "รอยืนยันพื้นที่และ Baseline";
    } else if (p.code === "PCC-26003") {
      donePct = 35;
      qcPct = 20;
      attention = true;
      note = "ความคืบหน้าต่ำกว่าแผน · ตรวจสอบผลกระทบ";
    } else if (p.code === "PCC-26004") {
      donePct = 65;
      qcPct = 50;
      note = "ดึงลวดอัดแรง AP1–AP7 ชั้น 1-5";
    }

    return {
      id: p.id,
      code: p.code,
      name: p.name,
      workType: p.workType,
      status: p.status,
      clientName: p.clientName,
      contractNo: p.contractNo || "—",
      baseValue,
      startDate: p.startDate ? p.startDate.toISOString() : null,
      targetDate: p.targetDate ? p.targetDate.toISOString() : null,
      pmName: pm,
      donePct,
      qcPct,
      attention,
      note,
      packagesCount: p.workPackages.length,
    };
  });

  return <ProjectsClientView initialProjects={mappedProjects} />;
}
