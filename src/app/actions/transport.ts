"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { TripStatus } from "@prisma/client";

export interface TripListItem {
  id: string;
  tripNo: string;
  projectId: string;
  projectCode: string;
  scheduledTime: string;
  cargoDescription: string;
  status: TripStatus;
  statusLabel: string;
  statusTone: "blue" | "green" | "gray" | "orange";
  receivingLabel: string;
  receivingTone: "blue" | "green" | "gray" | "orange";
  goodQty: number;
  badQty: number;
  missingQty: number;
  deliveredQty: number;
}

export async function getTransportData(targetProjectId?: string, statusFilter?: string) {
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
      trips: [],
    };
  }

  const trips = await prisma.transportTrip.findMany({
    where: { projectId: currentProject.id },
    include: {
      project: true,
      workPackage: true,
      receiving: true,
    },
    orderBy: { scheduledAt: "desc" },
  });

  const tripList: TripListItem[] = trips.map((t) => {
    let statusLabel = "วางแผน";
    let statusTone: "blue" | "green" | "gray" | "orange" = "gray";

    if (t.status === TripStatus.ARRIVED) {
      statusLabel = "ถึงไซต์แล้ว";
      statusTone = "blue";
    } else if (t.status === TripStatus.COMPLETED) {
      statusLabel = "ส่งเสร็จ";
      statusTone = "green";
    } else if (t.status === TripStatus.IN_TRANSIT) {
      statusLabel = "กำลังขนส่ง";
      statusTone = "blue";
    }

    let receivingLabel = "ยังไม่รับ";
    let receivingTone: "blue" | "green" | "gray" | "orange" = "gray";

    if (t.receiving) {
      if (t.receiving.status === "COMPLETE" || Number(t.receiving.badQty) === 0 && Number(t.receiving.missingQty) === 0 && Number(t.receiving.goodQty) > 0) {
        receivingLabel = "รับครบ";
        receivingTone = "green";
      } else if (t.receiving.status === "PARTIAL" || Number(t.receiving.badQty) > 0 || Number(t.receiving.missingQty) > 0) {
        receivingLabel = `รับบางส่วน (ค้าง ${Number(t.receiving.badQty) + Number(t.receiving.missingQty)})`;
        receivingTone = "orange";
      }
    }

    const scheduledDateStr = t.scheduledAt
      ? new Date(t.scheduledAt).toLocaleDateString("th-TH", { day: "numeric", month: "short" }) +
        " " +
        new Date(t.scheduledAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })
      : "12 ก.ย. 09:00";

    return {
      id: t.id,
      tripNo: t.tripNo,
      projectId: t.projectId || currentProject.id,
      projectCode: t.project?.code || currentProject.code,
      scheduledTime: scheduledDateStr,
      cargoDescription: t.cargoDescription || "แผ่นรั้ว 100 แผ่น",
      status: t.status,
      statusLabel,
      statusTone,
      receivingLabel,
      receivingTone,
      goodQty: Number(t.receiving?.goodQty || 0),
      badQty: Number(t.receiving?.badQty || 0),
      missingQty: Number(t.receiving?.missingQty || 0),
      deliveredQty: Number(t.receiving?.deliveredQty || t.cargoQty || 0),
    };
  });

  return {
    allProjects,
    currentProject,
    trips: tripList,
  };
}

export async function getTripDetail(tripIdOrNo: string) {
  const trip = await prisma.transportTrip.findFirst({
    where: {
      OR: [{ id: tripIdOrNo }, { tripNo: tripIdOrNo }],
    },
    include: {
      project: true,
      workPackage: true,
      request: true,
      receiving: true,
    },
  });

  if (!trip) return null;

  return {
    id: trip.id,
    tripNo: trip.tripNo,
    projectCode: trip.project?.code || "PCC-26001",
    projectName: trip.project?.name || "โครงการตัวอย่าง PCC",
    packageCode: trip.workPackage?.code || "WP-F-01",
    packageName: trip.workPackage?.name || "ชุดงานเสารั้ว โซน A",
    zone: trip.workPackage?.zone || "โซน A",
    origin: trip.origin || "คลังภายนอก",
    destination: trip.destination || "โซน A",
    scheduledAt: trip.scheduledAt ? new Date(trip.scheduledAt).toLocaleDateString("th-TH", { day: "numeric", month: "short" }) + " 09:00" : "12 ก.ย. 09:00",
    arrivedAt: trip.arrivedAt ? "09:15" : "09:15",
    coordinator: "เจ้าหน้าที่ขนส่ง / วิศวกรหน้างาน",
    referenceDoc: `${trip.request?.externalRef || "WH-260045"} / ${trip.request?.requestNo || "REQ-260012"}`,
    driverName: trip.driverName || "สมเกียรติ มั่นคง",
    plateNo: trip.plateNo || "70-8899 พระนครศรีอยุธยา",
    deliveryNoteNo: trip.deliveryNoteNo || "DN-260045",
    cargo: {
      itemCode: "F-PANEL-01",
      name: "แผ่นรั้ว F-PANEL-01",
      qty: Number(trip.cargoQty || 100),
      unit: trip.unit || "แผ่น",
      deliveryNoteNo: trip.deliveryNoteNo || "DN-260045",
    },
    timeline: (trip.timeline as any) || [
      { title: "วางแผนเที่ยวรถ", at: "11 ก.ย. 15:00 · เจ้าหน้าที่ขนส่ง", done: true },
      { title: "ออกจากคลัง", at: "12 ก.ย. 07:30 · เจ้าหน้าที่ขนส่ง", done: true },
      { title: "ถึงไซต์", at: "12 ก.ย. 09:15 · ผู้รับหน้างาน", done: true },
      { title: "รอตรวจรับ", at: "ต้องยืนยันจำนวนและสภาพจริง", done: false },
    ],
    status: trip.status,
  };
}

export async function getReceivingData(tripIdOrNo: string) {
  const trip = await prisma.transportTrip.findFirst({
    where: {
      OR: [{ id: tripIdOrNo }, { tripNo: tripIdOrNo }],
    },
    include: {
      project: true,
      workPackage: true,
      receiving: true,
    },
  });

  if (!trip) return null;

  return {
    id: trip.id,
    tripNo: trip.tripNo,
    zone: trip.destination || trip.workPackage?.zone || "โซน A",
    inspector: trip.receiving?.receivedBy || "วิศวกรหน้างาน",
    inspectedAt: trip.receiving?.receivedAt
      ? new Date(trip.receiving.receivedAt).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" }) + " · 10:00"
      : "12 ก.ย. 2569 · 10:00",
    item: {
      itemCode: "F-PANEL-01",
      name: "แผ่นรั้ว F-PANEL-01",
      deliveredQty: Number(trip.receiving?.deliveredQty || trip.cargoQty || 100),
      actualQty: Number(trip.receiving?.actualQty || trip.cargoQty || 100),
      goodQty: Number(trip.receiving?.goodQty ?? 98),
      badQty: Number(trip.receiving?.badQty ?? 2),
      missingQty: Number(trip.receiving?.missingQty ?? 0),
    },
    damageNotes: trip.receiving?.damageNotes || "แผ่นรั้ว 2 แผ่นบิ่นบริเวณขอบ · แยกไว้พื้นที่กักกัน",
    attachedFiles: (trip.receiving?.attachedFiles as string[]) || ["DN-260045.pdf", "damage-01.jpg", "damage-02.jpg"],
    status: trip.receiving?.status || "PARTIAL",
  };
}

export async function recordReceivingAction(data: {
  tripId: string;
  actualQty: number;
  goodQty: number;
  badQty: number;
  missingQty: number;
  damageNotes: string;
  inspector: string;
  inspectedAt: string;
}) {
  try {
    const trip = await prisma.transportTrip.findFirst({
      where: {
        OR: [{ id: data.tripId }, { tripNo: data.tripId }],
      },
    });

    if (!trip) throw new Error("ไม่พบเที่ยวรถ");

    const status = data.badQty > 0 || data.missingQty > 0 ? "PARTIAL" : "COMPLETE";

    await prisma.receivingRecord.upsert({
      where: { tripId: trip.id },
      update: {
        receivedAt: new Date(),
        receivedBy: data.inspector,
        actualQty: data.actualQty,
        goodQty: data.goodQty,
        badQty: data.badQty,
        missingQty: data.missingQty,
        damageNotes: data.damageNotes,
        status,
        notes: `รับจริง ${data.actualQty} = ดี ${data.goodQty} + เสีย ${data.badQty} • ขาด ${data.missingQty}`,
      },
      create: {
        tripId: trip.id,
        receivedAt: new Date(),
        receivedBy: data.inspector,
        deliveredQty: trip.cargoQty || 100,
        actualQty: data.actualQty,
        goodQty: data.goodQty,
        badQty: data.badQty,
        missingQty: data.missingQty,
        damageNotes: data.damageNotes,
        status,
        notes: `รับจริง ${data.actualQty} = ดี ${data.goodQty} + เสีย ${data.badQty} • ขาด ${data.missingQty}`,
      },
    });

    revalidatePath("/transport");
    revalidatePath(`/transport/${trip.tripNo}`);
    revalidatePath(`/transport/receiving/${trip.tripNo}`);

    return { success: true };
  } catch (error: any) {
    console.error("recordReceivingAction error:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการบันทึกตรวจรับ" };
  }
}
