import { getProjectHistory } from "@/lib/project-history";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { getProjectPhotos } from "@/lib/project-photos";
import { getProjectDocuments } from "@/lib/project-documents";
import { getProjectFinance } from "@/lib/project-finance";
import { getInstallationTimeline } from "@/lib/installation-data";
import { getTransportTrips } from "@/lib/transport-data";
import { getPlanningData } from "@/app/actions/planning";
import { getProjectMaterialOverview } from "@/lib/project-materials";
import { prisma } from "@/lib/prisma";
import {
  ProjectDetailClientView,
  ProjectDetailData,
} from "./ProjectDetailClientView";
import { formatThaiDate, workTypeLabel, projectStatusLabel } from "@/lib/utils";

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ tab?: string }>;
}

export default async function ProjectDetailPage({
  params,
  searchParams,
}: ProjectDetailPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const search = searchParams ? await searchParams : undefined;
  const initialTab = search?.tab || "overview";

  // Query project from PostgreSQL
  const dbProject = await prisma.project.findFirst({
    where: {
      OR: [{ id: id }, { code: id }],
    },
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
      ncrRecords: true,
      tasks: true,
    },
  });

  if (!dbProject) {
    notFound();
  }

  const [{ currentProject: planningProject }, materialsOverview, transportTrips, installationData, financeData, documentsData] = await Promise.all([
    getPlanningData(dbProject.id),
    getProjectMaterialOverview(dbProject.id),
    getTransportTrips(dbProject.id),
    getInstallationTimeline(dbProject.id),
    getProjectFinance(dbProject.id),
    getProjectDocuments(dbProject.id, session.user.id),
  ]);

  const [photosData, historyData] = await Promise.all([getProjectPhotos(dbProject.id, documentsData), getProjectHistory(dbProject.id, session.user.id, documentsData.documents)]);

  // Pre-calculated or demo values matching website-demo (http://localhost:3100/#/overview/:id)
  const isPCC26001 = dbProject.code === "PCC-26001";
  const isDraft = dbProject.code === "PCC-65E53273" || dbProject.status === "DRAFT";

  const donePct = isDraft ? 0 : 100;
  const qcPct = isPCC26001 ? 100 : 0;
  const attentionCount = isPCC26001 ? 0 : isDraft ? 16 : 7;

  // Dates
  const now = new Date("2026-11-05");
  const target = dbProject.targetDate
    ? new Date(dbProject.targetDate)
    : new Date("2026-11-30");
  const diffDays = Math.max(
    0,
    Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );

  const baseContract = dbProject.contracts[0];
  const contractValue = baseContract ? Number(baseContract.baseValue) : 4850000;
  const budget = 3200000;
  const actualCost = isPCC26001 ? 480000 : 0;

  // 6 Personnel Roles
  const pmMember =
    dbProject.members.find((m) => m.roleInProject === "PM")?.user?.name ||
    (isDraft ? "เจ้าหน้าที่โครงการ RW" : "สมศักดิ์ บริหาร");
  const engMember =
    dbProject.members.find((m) => m.roleInProject === "ENGINEER")?.user?.name ||
    (isDraft ? "คุณกิตติ เจ้าของโครงการ" : "วิศวกรแบบ");
  const siteMember =
    dbProject.members.find((m) => m.roleInProject === "SITE_ENGINEER")?.user?.name ||
    (isDraft ? "ควบคุมเอกสาร" : "สมชาย ใจดี");
  const qcMember =
    dbProject.members.find((m) => m.roleInProject === "QC_INSPECTOR")?.user?.name ||
    (isDraft ? "คุณกิตติ เจ้าของโครงการ" : "ประเมิน ตรวจสอบ");
  const whMember =
    dbProject.members.find((m) => m.roleInProject === "WAREHOUSE")?.user?.name ||
    (isDraft ? "คุณกิตติ เจ้าของโครงการ" : "ผู้ประสานวัสดุ");
  const costMember = isDraft ? "คุณกิตติ เจ้าของโครงการ" : "Cost Control / การเงิน";

  // Work packages mapping
  const mappedPackages = dbProject.workPackages.length
    ? dbProject.workPackages.map((wp, index) => {
        const wpDone = isDraft ? 0 : 100;
        const wpQC = isPCC26001 ? 100 : 0;
        return {
          id: wp.id,
          code: wp.code,
          name: wp.name,
          zone: wp.zone || "พื้นที่หลัก",
          scope: wp.notes || "—",
          target: Number(wp.target) || 100,
          unit: wp.unit || "แผ่น",
          weight: Number(wp.weight) || 100,
          siteStatus: "ready",
          crew: index === 0 ? "ทีมช่าง 1 (รั้วสำเร็จรูป)" : "ทีมช่าง 2",
          crewContact: "081-998-1122",
          progress: {
            donePct: wpDone,
            qcPct: wpQC,
            receivedGood: wpQC === 100 ? 100 : 0,
            damaged: 0,
            missing: 0,
          },
        };
      })
    : [
        {
          id: isPCC26001 ? "WP-F-A" : "WP-01",
          code: isPCC26001 ? "WP-F-A" : "WP-01",
          name: isPCC26001
            ? "ชุดงานเสารั้ว แผ่นรั้ว ทับหลัง"
            : "ชุดงานกำแพงกันดิน",
          zone: "พื้นที่หลัก",
          scope: "—",
          target: 100,
          unit: "แผ่น",
          weight: 100,
          siteStatus: "ready",
          crew: "ทีมช่าง 1 (รั้วสำเร็จรูป)",
          crewContact: "081-998-1122",
          progress: {
            donePct: donePct,
            qcPct: qcPct,
            receivedGood: qcPct === 100 ? 100 : 0,
            damaged: 0,
            missing: 0,
          },
        },
      ];

  // Trips data
  const tripsData = [
    {
      id: "TR-042",
      destination: "นิคมอุตสาหกรรมบางปะอิน",
      vehicle: "รถ 10 ล้อ ทะเบียน 70-1234",
      driver: "วิชัย ขนส่ง",
      eta: "3 ต.ค. 2569",
      status: "delivered",
      qty: 124,
      good: 124,
      damaged: 0,
      missing: 0,
    },
    {
      id: "TR-2894c8d4",
      destination: "นิคมอุตสาหกรรมบางปะอิน",
      vehicle: "รถ 6 ล้อ ทะเบียน 70-5678",
      driver: "วิชัย ขนส่ง",
      eta: "16 ต.ค. 2569",
      status: "planned",
      qty: 76,
      good: 0,
      damaged: 0,
      missing: 0,
    },
  ];

  // Tasks data
  const tasksData = dbProject.tasks.length
    ? dbProject.tasks.map((t) => ({
        id: t.id,
        code: t.code,
        name: t.name,
        packageId: t.packageId,
        stepIndex: t.stepIndex,
        duration: 2,
        predecessor: t.dependsOn[0] || "—",
        responsible: "ทีมช่าง 1",
        criteria: "ตรวจระดับและแนวดิ่งตามเกณฑ์",
        status: t.status,
      }))
    : [
        {
          id: "T-01",
          code: "WBS-01",
          name: "ปรับระดับดินและวางแนวหมุด",
          packageId: "WP-F-A",
          stepIndex: 1,
          duration: 2,
          predecessor: "—",
          responsible: "วิศวกรหน้างาน",
          criteria: "ระดับดิน ±5 มม.",
          status: "completed",
        },
        {
          id: "T-02",
          code: "WBS-02",
          name: "ขุดหลุมและเทฐานรากคอนกรีต",
          packageId: "WP-F-A",
          stepIndex: 2,
          duration: 3,
          predecessor: "WBS-01",
          responsible: "ทีมช่าง 1",
          criteria: "กำลังอัดคอนกรีต 28 วัน",
          status: "completed",
        },
        {
          id: "T-03",
          code: "WBS-03",
          name: "ติดตั้งเสารั้วคอนกรีตสำเร็จรูป",
          packageId: "WP-F-A",
          stepIndex: 3,
          duration: 4,
          predecessor: "WBS-02",
          responsible: "ทีมช่าง 1",
          criteria: "แนวดิ่งและระยะห่างเสา",
          status: "completed",
        },
        {
          id: "T-04",
          code: "WBS-04",
          name: "สอดแผ่นรั้วคอนกรีตสำเร็จรูป",
          packageId: "WP-F-A",
          stepIndex: 4,
          duration: 3,
          predecessor: "WBS-03",
          responsible: "ทีมช่าง 1",
          criteria: "รอยต่อแนบสนิท",
          status: "completed",
        },
      ];

  // Invoices
  const invoicesData = [
    {
      id: "INV-01",
      title: "งวดที่ 1: เงินล่วงหน้าและจัดเตรียมพื้นที่",
      amount: 1455000,
      paid: 1455000,
      due: "15 ต.ค. 2569",
      status: "ชำระครบแล้ว",
    },
    {
      id: "INV-02",
      title: "งวดที่ 2: งานติดตั้งเสาและแผ่นรั้ว",
      amount: 1940000,
      paid: 1940000,
      due: "31 ต.ค. 2569",
      status: "ชำระครบแล้ว",
    },
  ];

  const projectData: ProjectDetailData = {
    id: dbProject.id,
    code: dbProject.code,
    name: dbProject.name,
    clientName: dbProject.clientName || "บริษัทลูกค้าตัวอย่าง จำกัด",
    contractNo: dbProject.contractNo || "PO-2026-08892",
    contractType: "จัดหาพร้อมติดตั้ง (Turnkey)",
    workType: dbProject.workType,
    workTypeLabel: workTypeLabel[dbProject.workType] || "งานเสารั้ว แผ่นรั้ว ทับหลัง",
    status: isDraft ? "draft" : "active",
    statusLabel: projectStatusLabel[dbProject.status] || "กำลังดำเนินงาน",
    startDate: formatThaiDate(dbProject.startDate),
    targetDate: formatThaiDate(dbProject.targetDate),
    siteAddress: dbProject.siteAddress || "นิคมอุตสาหกรรมบางปะอิน",
    stagingArea: "Staging Area 1 · โซน A",
    accessRoute: "ประตู 2 ฝั่งทิศตะวันออก รถเทรลเลอร์ 10 ล้อเข้าได้",
    readiness: "ปรับระดับดินเรียบร้อย มีหมุดแนวเขตชัดเจน",
    contractValue,
    budget,
    actualCost,
    paymentTerms: "แบ่งงวดตามผลงาน QC 4 งวด",
    teamDescription: "PM / วิศวกรหน้างาน / QC",
    personnel: {
      pm: pmMember,
      engineer: engMember,
      site: siteMember,
      qc: qcMember,
      logistics: whMember,
      cost: costMember,
    },
    progress: {
      done: donePct,
      qc: qcPct,
    },
    workPackages: mappedPackages,
    attentionCount,
    daysRemaining: diffDays,
    trips: tripsData,
    tasks: tasksData,
    invoices: invoicesData,
  };

  return (
    <ProjectDetailClientView
      project={projectData}
      planningProject={planningProject}
      materialsOverview={materialsOverview}
      transportTrips={transportTrips}
      installationData={installationData}
      financeData={financeData}
      documentsData={documentsData}
      photosData={photosData}
      historyData={historyData}
      initialTab={initialTab}
    />
  );
}
