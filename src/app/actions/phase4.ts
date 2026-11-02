"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// =============================================================================
// 1. Budget & Cost Breakdown (SVG 27)
// =============================================================================
export async function getBudgetData(targetProjectId?: string) {
  const allProjects = await prisma.project.findMany({
    select: {
      id: true,
      code: true,
      name: true,
      workType: true,
      status: true,
      clientName: true,
    },
    orderBy: { code: "asc" },
  });

  let currentProject = allProjects.find((p) => p.id === targetProjectId || p.code === targetProjectId);
  if (!currentProject) {
    currentProject = allProjects.find((p) => p.code === "PCC-26001") || allProjects[0];
  }

  if (!currentProject) {
    return {
      allProjects: [],
      currentProject: null,
      summary: {
        currentBudget: 10.0,
        baseBudget: 9.5,
        approvedIncrease: 0.5,
        actualCost: 6.2,
        committedRemaining: 2.0,
        forecastTotal: 10.4,
        overBudget: 0.4,
        paidAmount: 5.4,
      },
      items: [],
    };
  }

  const budgetItems = await prisma.budgetItem.findMany({
    where: { projectId: currentProject.id },
    orderBy: { createdAt: "asc" },
  });

  return {
    allProjects,
    currentProject,
    summary: {
      currentBudget: 10.0,
      baseBudget: 9.5,
      approvedIncrease: 0.5,
      actualCost: 6.2,
      committedRemaining: 2.0,
      forecastTotal: 10.4,
      overBudget: 0.4,
      paidAmount: 5.4,
    },
    items: budgetItems.map((b) => ({
      id: b.id,
      packageTitle: b.packageTitle,
      budgetAmount: Number(b.budgetAmount),
      actualCost: Number(b.actualCost),
      committedCost: Number(b.committedCost),
      forecastTotal: Number(b.forecastTotal),
      paidAmount: Number(b.paidAmount),
      variance: Number(b.variance),
      notes: b.notes,
    })),
  };
}

// =============================================================================
// 2. Project Reports & S-Curve (SVG 28)
// =============================================================================
export async function getProjectReportsData(targetProjectId?: string) {
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

  let currentProject = allProjects.find((p) => p.id === targetProjectId || p.code === targetProjectId);
  if (!currentProject) {
    currentProject = allProjects.find((p) => p.code === "PCC-26001") || allProjects[0];
  }

  return {
    allProjects,
    currentProject,
    stats: {
      actualProgress: 72,
      qcProgress: 61,
      pendingIssuesCount: 3,
      openNcrCount: 1,
    },
    packageProgress: [
      { name: "งานกำแพงกันดิน (L-Wall)", actual: 90, qc: 80 },
      { name: "งานกำแพงกันดินพร้อมเสารั้ว (L-Wall+F)", actual: 75, qc: 65 },
      { name: "งานเสารั้ว (F)", actual: 78, qc: 59 },
      { name: "งานพื้นโพสเทนชั่น (PT)", actual: 45, qc: 40 },
    ],
    sCurveData: [
      { month: "ก.ค. 2569", planned: 15, actual: 12, qc: 10 },
      { month: "ส.ค. 2569", planned: 45, actual: 42, qc: 35 },
      { month: "ก.ย. 2569", planned: 70, actual: 72, qc: 61 },
      { month: "ต.ค. 2569", planned: 88, actual: null, qc: null },
      { month: "พ.ย. 2569", planned: 100, actual: null, qc: null },
    ],
    keyIssues: [
      { title: "วัสดุ F-PANEL-01 ล็อตใหม่", desc: "รอตรวจสอบค่าแรงอัดและการบ่ม 14 วันก่อนส่งเข้าไซต์", tone: "amber" },
      { title: "จุดอนุมัติ AP3 กำลังอัด P01", desc: "รอผลแล็บ LAB-P01-003 จากสถาบันภายนอก", tone: "amber" },
      { title: "คาดการณ์งบประมาณจบงานเกิน 0.40 ลบ.", desc: "เกิดจากงานปรับระดับดินแนวคันกั้นน้ำเพิ่มเติม", tone: "rose" },
    ],
  };
}

// =============================================================================
// 3. Handover & Project Closeout (SVG 29)
// =============================================================================
export async function getHandoverData(targetProjectId?: string) {
  const allProjects = await prisma.project.findMany({
    select: { id: true, code: true, name: true },
    orderBy: { code: "asc" },
  });

  let currentProject = allProjects.find((p) => p.id === targetProjectId || p.code === targetProjectId);
  if (!currentProject) {
    currentProject = allProjects.find((p) => p.code === "PCC-26001") || allProjects[0];
  }

  const items = currentProject
    ? await prisma.handoverItem.findMany({
        where: { projectId: currentProject.id },
        orderBy: { sortOrder: "asc" },
      })
    : [];

  return {
    allProjects,
    currentProject,
    items,
    readinessPercent: 70,
    canClose: false,
    alertMessage: "มี QC / NCR / AP7 และเอกสารค้าง ต้องดำเนินการตามขอบเขตที่เกี่ยวข้อง",
  };
}

export async function updateHandoverItemStatusAction(id: string, status: string, statusLabel: string, statusTone: string) {
  const updated = await prisma.handoverItem.update({
    where: { id },
    data: { status, statusLabel, statusTone },
  });
  revalidatePath("/handover");
  return updated;
}

// =============================================================================
// 4. Owner Portal (SVG 30)
// =============================================================================
export async function getOwnerPortalData(targetProjectId?: string) {
  const project = await prisma.project.findFirst({
    where: targetProjectId ? { id: targetProjectId } : { code: "PCC-26001" },
    include: {
      contracts: {
        include: {
          billingPeriods: true,
        },
      },
    },
  });

  return {
    project: project || {
      id: "pcc-26001",
      code: "PCC-26001",
      name: "โครงการตัวอย่าง PCC (รั้ว)",
      clientName: "บริษัทลูกค้าตัวอย่าง จำกัด",
    },
    metrics: {
      qcProgress: 61,
      targetDate: "30 พ.ย. 2569",
      pendingInvoiceAmount: "1.50 ลบ.",
      pendingInvoiceTitle: "งวดที่ 2 · 25 ก.ย. 2569",
    },
    progressByCategory: [
      { name: "งานกำแพงกันดิน (L-Wall)", percent: 80 },
      { name: "งานกำแพงกันดินพร้อมเสารั้ว (L-Wall+F)", percent: 65 },
      { name: "งานเสารั้ว (F)", percent: 59 },
      { name: "งานพื้นโพสเทนชั่น (PT)", percent: 40 },
    ],
    publishedDocuments: [
      { title: "แบบติดตั้งรั้ว F-101", revision: "Rev.03", date: "10 ก.ย. 2569", fileType: "PDF" },
      { title: "รายงานความก้าวหน้า", revision: "ก.ย. 2569", date: "12 ก.ย. 2569", fileType: "PDF" },
      { title: "ใบส่งมอบงวดงานที่ 1", revision: "ฉบับอนุมัติ", date: "31 ส.ค. 2569", fileType: "PDF" },
    ],
    recentPhotos: [
      { title: "ติดตั้งรั้ว · โซน A", date: "เผยแพร่ 12 ก.ย. 2569", image: "site-f01.jpg" },
      { title: "วัสดุถึงพื้นที่โครงการ", date: "เผยแพร่ 12 ก.ย. 2569", image: "delivery-f01.jpg" },
    ],
    billings: [
      { term: "งวด 1 · 2.00 ล้านบาท", status: "ชำระแล้ว", statusTone: "green", dueDate: "31 ส.ค. 2569" },
      { term: "งวด 2 · 1.50 ล้านบาท", status: "รอชำระ", statusTone: "amber", dueDate: "25 ก.ย. 2569" },
      { term: "งวด 3 · 0.85 ล้านบาท", status: "ยังไม่ถึงกำหนด", statusTone: "gray", dueDate: "31 ต.ค. 2569" },
      { term: "งวด 4 · 0.50 ล้านบาท", status: "ยังไม่ถึงกำหนด", statusTone: "gray", dueDate: "30 พ.ย. 2569" },
    ],
  };
}

// =============================================================================
// 5. Settings & Permissions (SVG 31)
// =============================================================================
export async function getSettingsData() {
  const rolePermissions = [
    {
      role: "PM",
      roleLabel: "ผู้จัดการโครงการ (Project Manager)",
      createPerms: "โครงการ / แผน / คำขอ",
      approvePerms: "แผนและคำขอตามอำนาจ",
      scope: "โครงการที่ได้รับสิทธิ์",
    },
    {
      role: "วิศวกร / QC",
      roleLabel: "วิศวกรสนาม & เจ้าหน้าที่ QC",
      createPerms: "ผลตรวจ / หลักฐาน",
      approvePerms: "Gate ตามอำนาจที่แต่งตั้ง",
      scope: "งานและพื้นที่ที่รับผิดชอบ",
    },
    {
      role: "ผู้ประสานวัสดุ / ขนส่ง",
      roleLabel: "เจ้าหน้าที่คลังและโลจิสติกส์",
      createPerms: "เอกสาร / สถานะ / ผลตอบกลับ",
      approvePerms: "ตามอำนาจงานที่กำหนด",
      scope: "วัสดุและขนส่งของโครงการ",
    },
    {
      role: "Cost Control / บัญชี",
      roleLabel: "ผู้ควบคุมต้นทุนและบัญชีการเงิน",
      createPerms: "ต้นทุน / จ่าย / เรียกเก็บ",
      approvePerms: "งบตามวงเงินและอำนาจ",
      scope: "ข้อมูลการเงินภายใน",
    },
    {
      role: "เจ้าของโครงการ",
      roleLabel: "ผู้ว่าจ้าง / Owner",
      createPerms: "ดู / ดาวน์โหลด",
      approvePerms: "รับมอบตามสิทธิ์ที่กำหนด",
      scope: "เฉพาะข้อมูลเผยแพร่ของตน",
    },
  ];

  return {
    rolePermissions,
    policyNotice: "Workflow มี Version และผู้รับรอง: การเปลี่ยนเกณฑ์ทางวิศวกรรมต้องผ่านผู้มีอำนาจ กำหนดวันที่มีผลและผลกระทบต่อชุดงานที่เปิดอยู่",
  };
}

// =============================================================================
// 6. Approval Tasks (SVG 32)
// =============================================================================
export async function getApprovalTasksData(tab: string = "WAITING_ME", targetProjectId?: string) {
  const allProjects = await prisma.project.findMany({
    select: { id: true, code: true, name: true },
    orderBy: { code: "asc" },
  });

  const tasks = await prisma.approvalTask.findMany({
    where: {
      tabGroup: tab,
      ...(targetProjectId ? { projectId: targetProjectId } : {}),
    },
    include: {
      project: true,
    },
    orderBy: { dueDate: "asc" },
  });

  const counts = {
    waitingMe: await prisma.approvalTask.count({ where: { tabGroup: "WAITING_ME" } }),
    sentByMe: 3,
    returned: 1,
    history: 12,
  };

  return {
    allProjects,
    tasks,
    counts,
    currentTab: tab,
  };
}

export async function processApprovalTaskAction(taskId: string, action: "APPROVE" | "REJECT", comment?: string) {
  const task = await prisma.approvalTask.findUnique({ where: { id: taskId } });
  if (!task) throw new Error("ไม่พบรายการอนุมัตินี้");

  const updated = await prisma.approvalTask.update({
    where: { id: taskId },
    data: {
      status: action === "APPROVE" ? "APPROVED" : "REJECTED",
      statusLabel: action === "APPROVE" ? "อนุมัติแล้ว" : "ส่งกลับแก้ไข",
      tabGroup: action === "APPROVE" ? "HISTORY" : "RETURNED",
    },
  });

  revalidatePath("/approvals");
  return updated;
}
