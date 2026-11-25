"use server";

import { auditedMutation } from "@/lib/project-audit";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { NcrStatus } from "@prisma/client";

export interface InstallationSummaryItem {
  id: string;
  packageCode: string;
  packageName: string;
  spanOrZone: string;
  progressActual: number; // e.g. 78%
  progressQc: number;     // e.g. 59%
  stageDescription: string;
  qcStatus: string;
  qcBadgeTone: "blue" | "green" | "orange" | "rose" | "gray";
  ncrCode?: string;
  inspectionNo?: string;
}

export interface WorkflowStageItem {
  id: number;
  title: string;
  badge: string;
  status: "completed" | "active" | "pending";
}

export interface WorkflowTrackerResult {
  type: string;
  typeName: string;
  title: string;
  subtitle: string;
  projectCode: string;
  projectName: string;
  currentCheckpoint: {
    title: string;
    description: string;
    drawingRef: string;
    approver: string;
  };
  stages: WorkflowStageItem[];
  evidences: Array<{
    label: string;
    ref: string;
    status: string;
    statusTone: "green" | "orange" | "rose" | "gray";
  }>;
  progressQc: number;
  guideline: string;
  irRef: string;
  ncrRef: string;
}

export async function getInstallationOverview(targetProjectId?: string) {
  const allProjects = await prisma.project.findMany({
    select: {
      id: true,
      code: true,
      name: true,
      workType: true,
      status: true,
      clientName: true,
      contractNo: true,
      startDate: true,
      targetDate: true,
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
      packages: [],
      stats: { totalTasks: 0, actualProgress: 0, qcProgress: 0, pendingIrCount: 0, openNcrCount: 0 },
      pendingInspections: [],
      ncrRecords: [],
    };
  }

  const workPackages = await prisma.workPackage.findMany({
    where: { projectId: currentProject.id },
    include: {
      tasks: true,
    },
    orderBy: { code: "asc" },
  });

  const inspections = await prisma.qcInspection.findMany({
    where: { projectId: currentProject.id },
    orderBy: { inspectedAt: "desc" },
  });

  const ncrRecords = await prisma.ncrRecord.findMany({
    where: { projectId: currentProject.id },
    orderBy: { createdAt: "desc" },
  });

  // Build summary packages matching SVG 19 table
  const packageSummaries: InstallationSummaryItem[] = workPackages.map((wp, idx) => {
    if (wp.code === "WP-F-01" || idx === 0) {
      return {
        id: wp.id,
        packageCode: wp.code,
        packageName: `${wp.code} · โซน A (ช่วงเสา F01–F10)`,
        spanOrZone: "ช่วงเสา F01–F10",
        progressActual: 78,
        progressQc: 59,
        stageDescription: "ติดตั้งแผ่น / ซ่อมผิวรอยต่อ F08",
        qcStatus: "ติดเงื่อนไข NCR-260006",
        qcBadgeTone: "orange",
        ncrCode: "NCR-260006",
        inspectionNo: "IR-260023",
      };
    } else if (wp.code === "WP-F-02" || idx === 1) {
      return {
        id: wp.id,
        packageCode: wp.code,
        packageName: `${wp.code} · โซน B (ช่วงเสา F11–F20)`,
        spanOrZone: "ช่วงเสา F11–F20",
        progressActual: 0,
        progressQc: 0,
        stageDescription: "รอเริ่มงาน (รอปรับระดับดินแนวคันกั้นน้ำ)",
        qcStatus: "ยังไม่เริ่ม",
        qcBadgeTone: "gray",
      };
    } else {
      return {
        id: wp.id,
        packageCode: wp.code,
        packageName: `${wp.code} · โซน C (ช่วงเสา F21–F30)`,
        spanOrZone: "ช่วงเสา F21–F30",
        progressActual: 0,
        progressQc: 0,
        stageDescription: "รอเริ่มงาน",
        qcStatus: "ยังไม่เริ่ม",
        qcBadgeTone: "gray",
      };
    }
  });

  // Calculate aggregated stats
  const pendingIrCount = inspections.filter((i) => i.status === "PENDING" || i.status === "RE_INSPECT").length || 1;
  const openNcrCount = ncrRecords.filter((n) => n.status === NcrStatus.OPEN || n.status === NcrStatus.PENDING_REVIEW).length || 1;

  return {
    allProjects,
    currentProject,
    packages: packageSummaries,
    stats: {
      totalTasks: 10,
      actualProgress: 78,
      qcProgress: 59,
      pendingIrCount,
      openNcrCount,
    },
    pendingInspections: inspections,
    ncrRecords,
  };
}

export async function getWorkflowTrackerData(type: string, targetProjectId?: string): Promise<WorkflowTrackerResult> {
  const normType = (type || "f").toLowerCase();
  
  let projectCode = "PCC-26001";
  if (normType === "rw") projectCode = "PCC-26002";
  if (normType === "rwf") projectCode = "PCC-26003";

  const project = await prisma.project.findFirst({
    where: targetProjectId ? { id: targetProjectId } : { code: projectCode },
  });

  if (normType === "rw") {
    // SVG 20: L-Wall
    return {
      type: "rw",
      typeName: "L-Wall",
      title: "ติดตามงานกำแพงกันดิน (L-Wall)",
      subtitle: "WP-RW-01 / โซน A",
      projectCode: project?.code || "PCC-26002",
      projectName: project?.name || "กำแพงกันดิน ริมน้ำนนทบุรี",
      currentCheckpoint: {
        title: "จุดตรวจปัจจุบัน: งานถมกลับ",
        description: "แบบงานถมและผลตรวจชั้นดินตาม Specification",
        drawingRef: "แบบฉบับอนุมัติ / Checklist ล่าสุด",
        approver: "QC และผู้มีอำนาจตามโครงการ",
      },
      stages: [
        { id: 1, title: "สำรวจ / แนว / ฐาน", badge: "ผ่านตามขอบเขต", status: "completed" },
        { id: 2, title: "เหล็กและติดตั้ง L-Wall", badge: "ผ่านก่อนเท", status: "completed" },
        { id: 3, title: "Pre-Pour / เท / บ่ม", badge: "ผ่านตามใบตรวจ", status: "completed" },
        { id: 4, title: "รอยต่อ / ระบายน้ำ / ถม", badge: "รอตรวจงานถม", status: "active" },
        { id: 5, title: "Final / ส่งมอบ", badge: "รอขั้นก่อนหน้า", status: "pending" },
      ],
      evidences: [
        { label: "ผลวัด / ภาพหน้างาน", ref: "IR-260023", status: "รอตรวจ", statusTone: "orange" },
        { label: "เกณฑ์ตรวจ", ref: "Specification โครงการ", status: "อ้างฉบับอนุมัติ", statusTone: "green" },
      ],
      progressQc: 80,
      guideline: "ปล่อยงานเฉพาะขอบเขตที่ผ่าน • ไม่ผ่าน > ระบุเหตุ / แก้ไข / ส่งตรวจซ้ำ • การบันทึกว่าทำแล้วไม่ถือว่าอนุมัติคุณภาพ",
      irRef: "IR-260023",
      ncrRef: "NCR-260006",
    };
  } else if (normType === "rwf") {
    // SVG 21: L-Wall + Fence
    return {
      type: "rwf",
      typeName: "L-Wall + F",
      title: "ติดตามงานกำแพงกันดินพร้อมเสารั้ว (L-Wall + F)",
      subtitle: "WP-RWF-01 / โซน A",
      projectCode: project?.code || "PCC-26003",
      projectName: project?.name || "กำแพงพร้อมรั้วคลังสินค้า",
      currentCheckpoint: {
        title: "จุดตรวจปัจจุบัน: ติดตั้งเสารั้ว",
        description: "แนว ดิ่ง และระยะ Span ตามแบบอนุมัติ",
        drawingRef: "Drawing RWF-201 Rev.03",
        approver: "QC โครงการ (นายสมชาย ตรวจสอบ)",
      },
      stages: [
        { id: 1, title: "ฐานและ L-Wall", badge: "ผ่าน", status: "completed" },
        { id: 2, title: "จุดต่อเสารั้ว / ทับหลัง", badge: "ผ่านก่อนตั้งเสา", status: "completed" },
        { id: 3, title: "ติดตั้งเสาและแผ่นรั้ว", badge: "รอตรวจแนวเสา", status: "active" },
        { id: 4, title: "รอยต่อและเก็บงาน", badge: "รอขั้นก่อนหน้า", status: "pending" },
        { id: 5, title: "ส่งมอบรวม", badge: "รอขั้นก่อนหน้า", status: "pending" },
      ],
      evidences: [
        { label: "ตรวจแนวและดิ่ง", ref: "IR-260024", status: "รอตรวจ", statusTone: "orange" },
        { label: "รายการตรวจสอบ", ref: "Checklist RWF", status: "ฉบับอนุมัติ", statusTone: "green" },
      ],
      progressQc: 65,
      guideline: "ปล่อยงานเฉพาะขอบเขตที่ผ่าน • ตรวจสอบจุดต่อ L-Wall กับเสาอย่างเคร่งครัด • การบันทึกว่าทำแล้วไม่ถือว่าอนุมัติคุณภาพ",
      irRef: "IR-260024",
      ncrRef: "NCR-260006",
    };
  } else {
    // SVG 22: Fence (F)
    return {
      type: "f",
      typeName: "Fence",
      title: "ติดตามงานเสารั้ว (Fence)",
      subtitle: "WP-F-01 / ช่วงเสา F01–F10",
      projectCode: project?.code || "PCC-26001",
      projectName: project?.name || "โครงการตัวอย่าง PCC (รั้ว)",
      currentCheckpoint: {
        title: "จุดตรวจปัจจุบัน: เก็บงานรั้ว F08",
        description: "แก้ไขผิวและรอยต่อ F08 แนบหลักฐานก่อนตรวจซ้ำ",
        drawingRef: "Drawing F-101 Rev.03 / Checklist F",
        approver: "QC โครงการ (นายสมชาย ตรวจสอบ)",
      },
      stages: [
        { id: 1, title: "สำรวจแนว / ฐาน Socket", badge: "ผ่านตามเกณฑ์", status: "completed" },
        { id: 2, title: "ตั้งเสา / แนวดิ่ง / Span", badge: "ผ่าน 10 จุด", status: "completed" },
        { id: 3, title: "ติดตั้งแผ่น / ทับหลัง", badge: "ติดแก้ F08", status: "active" },
        { id: 4, title: "เก็บงาน / ตรวจสุดท้าย", badge: "รอขั้นก่อนหน้า", status: "pending" },
        { id: 5, title: "ส่งมอบงานรั้ว", badge: "รอขั้นก่อนหน้า", status: "pending" },
      ],
      evidences: [
        { label: "ผลวัด / ภาพหน้างาน", ref: "IR-260023", status: "ตรวจซ้ำ (Re-Inspect)", statusTone: "orange" },
        { label: "บันทึกข้อบกพร่อง", ref: "NCR-260006", status: "รอแก้ไข", statusTone: "rose" },
      ],
      progressQc: 59,
      guideline: "ปล่อยงานเฉพาะขอบเขตที่ผ่าน • F08 ไม่นับเป็นผลงานผ่านจนกว่าจะตรวจซ้ำผ่าน • การบันทึกว่าทำแล้วไม่ถือว่าอนุมัติคุณภาพ",
      irRef: "IR-260023",
      ncrRef: "NCR-260006",
    };
  }
}

export async function getPtGatesData(targetProjectId?: string) {
  const project = await prisma.project.findFirst({
    where: targetProjectId ? { id: targetProjectId } : { code: "PCC-26004" },
    include: {
      approvalGates: {
        orderBy: { gateCode: "asc" },
      },
    },
  });

  return {
    project,
    gates: project?.approvalGates || [],
  };
}

export async function getQcInspectionData(inspectionNo: string) {
  const inspection = await prisma.qcInspection.findUnique({
    where: { inspectionNo },
    include: {
      project: true,
      workPackage: true,
    },
  });

  return inspection;
}

export async function submitQcInspectionDecisionAction(formData: {
  inspectionNo: string;
  decision: "APPROVED" | "REJECTED" | "RE_INSPECT";
  scope: string;
  notes: string;
}) {
  const inspection = await prisma.qcInspection.findUnique({
    where: { inspectionNo: formData.inspectionNo },
  });

  if (!inspection) {
    throw new Error("ไม่พบรายการตรวจ QC นี้");
  }

  const updated = await auditedMutation({ projectId: inspection.projectId, action: "QC_DECIDED", entityId: inspection.id, data: { title: "พิจารณาผลตรวจ QC", reference: inspection.inspectionNo, before: { status: inspection.status }, after: formData } }, async tx => {
  const updated = await tx.qcInspection.update({
    where: { inspectionNo: formData.inspectionNo },
    data: {
      status: formData.decision,
      scope: formData.scope,
      notes: formData.notes,
    },
  });

  // If rejected or re-inspect, ensure NCR exists
  if (formData.decision === "REJECTED" || formData.decision === "RE_INSPECT") {
    const existingNcr = await tx.ncrRecord.findFirst({
      where: { referenceDoc: formData.inspectionNo },
    });
    if (!existingNcr) {
      await tx.ncrRecord.create({
        data: {
          code: `NCR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          projectId: inspection.projectId,
          description: formData.notes || "พบข้อบกพร่องจากการตรวจ QC",
          severity: "MAJOR",
          location: formData.scope,
          referenceDoc: formData.inspectionNo,
          assignedTo: "ทีมติดตั้ง / วิศวกรหน้างาน",
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          status: NcrStatus.OPEN,
          correctiveAction: "ดำเนินการตามวิธีที่วิศวกรอนุมัติ และขอตรวจซ้ำ",
        },
      });
    }
  }


    return updated;

  });

  revalidatePath("/installation");
  revalidatePath(`/installation/inspection/${formData.inspectionNo}`);
  return { success: true, inspection: updated };
}

export async function getNcrData(code: string) {
  const ncr = await prisma.ncrRecord.findUnique({
    where: { code },
    include: {
      project: true,
    },
  });

  return ncr;
}

export async function submitNcrAction(data: {
  code: string;
  actionType: "UPDATE" | "REQUEST_REINSPECT" | "CLOSE";
  correctiveAction?: string;
  verificationNotes?: string;
}) {
  const ncr = await prisma.ncrRecord.findUnique({
    where: { code: data.code },
  });

  if (!ncr) {
    throw new Error("ไม่พบรายการ NCR");
  }

  let newStatus: NcrStatus = ncr.status;
  if (data.actionType === "REQUEST_REINSPECT") {
    newStatus = NcrStatus.PENDING_REVIEW;
  } else if (data.actionType === "CLOSE") {
    newStatus = NcrStatus.CLOSED;
  }

  const updatedHistory = Array.isArray(ncr.history) ? [...ncr.history] : [];
  if (data.actionType === "REQUEST_REINSPECT") {
    updatedHistory.push({
      title: "ส่งตรวจซ้ำ",
      at: `${new Date().toLocaleDateString("th-TH")} · แนบหลักฐานเรียบร้อย`,
      done: true,
    });
  } else if (data.actionType === "CLOSE") {
    updatedHistory.push({
      title: "ปิด NCR",
      at: `${new Date().toLocaleDateString("th-TH")} · วิศวกรโครงการอนุมัติ`,
      done: true,
    });
  }

  const updated = await auditedMutation({ projectId: ncr.projectId, action: "NCR_UPDATED", entityId: ncr.id, data: { title: "ดำเนินการข้อบกพร่อง NCR", reference: ncr.code, before: { status: ncr.status, correctiveAction: ncr.correctiveAction }, after: { ...data, status: newStatus } } }, async tx => {
  const updated = await tx.ncrRecord.update({
    where: { code: data.code },
    data: {
      status: newStatus,
      correctiveAction: data.correctiveAction || ncr.correctiveAction,
      verificationNotes: data.verificationNotes || ncr.verificationNotes,
      history: updatedHistory,
    },
  });


    return updated;

  });

  revalidatePath("/installation");
  revalidatePath(`/installation/ncr/${data.code}`);
  return { success: true, ncr: updated };
}

export async function createDailyLogAction(data: {
  projectId: string;
  packageId?: string;
  logDate: string;
  location: string;
  activity: string;
  quantity: number;
  unit: string;
  workers: number;
  workHours: number;
  equipment?: string;
  issues?: string;
  description?: string;
}) {
  const newLog = await auditedMutation({ projectId: data.projectId, action: "DAILY_LOG_CREATED", data: { title: data.activity, ...data } }, async tx => {
  return await tx.dailyLog.create({
    data: {
      projectId: data.projectId,
      packageId: data.packageId,
      logDate: new Date(data.logDate),
      location: data.location,
      activity: data.activity,
      quantity: Number(data.quantity),
      unit: data.unit,
      workers: Number(data.workers),
      workHours: Number(data.workHours),
      equipment: data.equipment,
      issues: data.issues,
      description: data.description || `${data.activity} ${data.quantity} ${data.unit} ณ ตำแหน่ง ${data.location}`,
      status: "DRAFT",
      qcStatus: "NOT_VERIFIED",
    },
  });

  });

  revalidatePath("/installation");
  revalidatePath("/installation/daily-log/new");
  return { success: true, log: newLog };
}
