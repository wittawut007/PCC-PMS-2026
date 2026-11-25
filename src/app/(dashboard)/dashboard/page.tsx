import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  DashboardClientView,
  ProjectDashboardItem,
  TripDashboardItem,
  ActivityDashboardItem,
} from "./DashboardClientView";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Fetch real projects from PostgreSQL
  const dbProjects = await prisma.project.findMany({
    include: {
      workPackages: true,
      contracts: true,
      members: {
        include: {
          user: true,
        },
      },
      transportTrips: true,
      materialRequests: true,
      qcInspections: true,
      tasks: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const todayStr = "2026-11-05";

  // Map to dashboard items matching website-demo exactly
  const mappedProjects: ProjectDashboardItem[] = dbProjects.map((p) => {
    const budget = 3200000;
    const baseValue = 4850000;
    let actualCost = 0;
    let donePct = 100;
    let qcPct = 0;
    let status: "active" | "draft" | "closed" | "waiting" | "late" =
      p.status === "DRAFT" ? "draft" : "active";

    let startDateStr = p.startDate
      ? p.startDate.toISOString().slice(0, 10)
      : "2026-10-01";
    let targetDateStr = p.targetDate
      ? p.targetDate.toISOString().slice(0, 10)
      : "2026-11-30";

    let clientName = p.clientName || "บริษัทลูกค้าตัวอย่าง จำกัด";
    let projectName = p.name;

    if (p.code === "PCC-26001") {
      actualCost = 480000;
      donePct = 100;
      qcPct = 100;
      targetDateStr = "2026-10-31";
      projectName = "โครงการตัวอย่าง PCC";
      clientName = "บริษัทลูกค้าตัวอย่าง จำกัด";
    } else if (p.code === "PCC-26002") {
      actualCost = 0;
      donePct = 100;
      qcPct = 0;
      targetDateStr = "2026-11-30";
      projectName = "PCC Riverside";
      clientName = "บริษัทลูกค้าตัวอย่าง จำกัด";
    } else if (p.code === "PCC-26003") {
      actualCost = 0;
      donePct = 100;
      qcPct = 0;
      targetDateStr = "2026-11-30";
      projectName = "PCC Garden Village";
      clientName = "บริษัทลูกค้าตัวอย่าง จำกัด";
    } else if (p.code === "PCC-26004") {
      actualCost = 0;
      donePct = 100;
      qcPct = 0;
      targetDateStr = "2026-11-30";
      projectName = "PCC Tower";
      clientName = "บริษัทลูกค้าตัวอย่าง จำกัด";
    } else if (p.code === "PCC-65E53273" || p.status === "DRAFT") {
      actualCost = 0;
      donePct = 0;
      qcPct = 0;
      status = "draft";
      targetDateStr = "2026-11-30";
      projectName = "พเพเ";
      clientName = "ะ้ะ่ะ่";
    }

    return {
      id: p.id,
      code: p.code,
      name: projectName,
      client: clientName,
      status,
      start: startDateStr,
      end: targetDateStr,
      budget,
      value: baseValue,
      cost: actualCost,
      progress: {
        done: donePct,
        qc: qcPct,
      },
    };
  });

  // Sort order matching website-demo latest table
  const sortPriority: Record<string, number> = {
    "PCC-65E53273": 1,
    "PCC-26001": 2,
    "PCC-26004": 3,
    "PCC-26002": 4,
    "PCC-26003": 5,
  };
  mappedProjects.sort(
    (a, b) => (sortPriority[a.code] || 99) - (sortPriority[b.code] || 99)
  );

  // Recent trips matching website-demo
  const demoTrips: TripDashboardItem[] = [
    {
      id: "TR-042",
      projectId: "P-F",
      projectName: "โครงการตัวอย่าง PCC",
      eta: "2026-10-03",
      status: "delivered",
    },
    {
      id: "TR-2894c8d4",
      projectId: "P-RW",
      projectName: "PCC Riverside",
      eta: "2026-10-16",
      status: "planned",
    },
    {
      id: "TR-60926cc3",
      projectId: "P-RWF",
      projectName: "PCC Garden Village",
      eta: "2026-10-04",
      status: "delivered",
    },
  ];

  // Recent activities matching website-demo
  const demoActivities: ActivityDashboardItem[] = [
    {
      id: "TR-e989b1fe",
      projectId: "P-RWF",
      projectName: "PCC Garden Village",
      kind: "trip",
      title: "จัดเที่ยวขนส่ง",
      createdAt: "14/10/69 23:40",
      href: "/transport",
    },
    {
      id: "EXTERNAL-60f1357a",
      projectId: "P-RWF",
      projectName: "PCC Garden Village",
      kind: "external",
      title: "ยืนยันยอดจากคลัง",
      createdAt: "14/10/69 23:40",
      href: "/materials",
    },
    {
      id: "APPROVAL-084acd94",
      projectId: "P-RWF",
      projectName: "PCC Garden Village",
      kind: "approval",
      title: "แผ่นรั้วสำเร็จรูป (ตัวอย่าง)",
      createdAt: "14/10/69 23:40",
      href: "/approvals",
    },
    {
      id: "REQ-a7f61f7b",
      projectId: "P-RWF",
      projectName: "PCC Garden Village",
      kind: "material",
      title: "คำขอวัสดุ",
      createdAt: "14/10/69 23:40",
      href: "/materials",
    },
    {
      id: "TR-2894c8d4",
      projectId: "P-RW",
      projectName: "PCC Riverside",
      kind: "trip",
      title: "จัดเที่ยวขนส่ง",
      createdAt: "14/10/69 23:40",
      href: "/transport",
    },
  ];

  const formattedTodayThai = "5 พ.ย. 2569";

  return (
    <DashboardClientView
      initialProjects={mappedProjects}
      initialTrips={demoTrips}
      initialActivities={demoActivities}
      todayStr={todayStr}
      formattedTodayThai={formattedTodayThai}
    />
  );
}
