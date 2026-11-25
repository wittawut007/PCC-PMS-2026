"use server";

import { auditedMutation } from "@/lib/project-audit";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { RecordStatus, ProductionStatus } from "@prisma/client";

export interface BomItemData {
  id: string;
  itemCode: string;
  name: string;
  quantity: number;
  additionalQty: number;
  totalRequired: number;
  unit: string;
  spec?: string | null;
  category?: string | null;
  status: string;
}

export interface DrawingData {
  id: string;
  code: string;
  title: string;
  revision: string;
  status: string;
  approvedBy?: string | null;
  approvedAt?: string | null;
  notes?: string | null;
  packageName?: string | null;
  packageCode?: string | null;
  items: BomItemData[];
}

export interface MaterialDocumentItem {
  id: string;
  docNo: string;
  kind: "REQUEST" | "PRODUCTION" | "RETURN";
  packageAndRev: string;
  neededByDate: string;
  responseInfo: string;
  statusLabel: string;
  statusTone: "green" | "orange" | "blue" | "gray" | "red";
  allocatedQty?: number;
  requestedQty?: number;
  unit?: string;
  externalRef?: string | null;
  requestId?: string;
}

export interface MaterialKpiSummary {
  required: number;
  unit: string;
  packageName: string;
  allocated: number;
  allocatedRef: string;
  producing: number;
  producingNote: string;
  shortage: number;
  shortageFormula: string;
}

/**
 * Loads BOM data for a specific project (SVG 09)
 */
export async function getProjectBomData(projectIdOrCode: string) {
  const project = await prisma.project.findFirst({
    where: {
      OR: [{ id: projectIdOrCode }, { code: projectIdOrCode }],
    },
    include: {
      workPackages: true,
      drawings: {
        include: {
          bomItems: true,
          workPackage: true,
        },
      },
    },
  });

  if (!project) return null;

  const drawing = project.drawings[0];
  if (!drawing) {
    return {
      project: {
        id: project.id,
        code: project.code,
        name: project.name,
        workType: project.workType,
        status: project.status,
      },
      drawing: null,
    };
  }

  const items: BomItemData[] = drawing.bomItems.map((b) => {
    const qty = Number(b.quantity);
    const addQty = Number(b.additionalQty);
    return {
      id: b.id,
      itemCode: b.itemCode,
      name: b.name,
      quantity: qty,
      additionalQty: addQty,
      totalRequired: qty + addQty,
      unit: b.unit,
      spec: b.spec,
      category: b.category,
      status: "พร้อมขอเบิก",
    };
  });

  return {
    project: {
      id: project.id,
      code: project.code,
      name: project.name,
      workType: project.workType,
      status: project.status,
      clientName: project.clientName,
      contractNo: project.contractNo,
      startDate: project.startDate?.toISOString() || null,
      targetDate: project.targetDate?.toISOString() || null,
    },
    drawing: {
      id: drawing.id,
      code: drawing.code,
      title: drawing.title,
      revision: drawing.revision,
      status: drawing.status,
      approvedBy: drawing.approvedBy,
      approvedAt: drawing.approvedAt?.toISOString() || null,
      notes: drawing.notes,
      packageName: drawing.workPackage?.name || "ชุดงานเสารั้ว โซน A",
      packageCode: drawing.workPackage?.code || "WP-F-01",
      items,
    },
  };
}

/**
 * Loads Materials & Warehouse overview data (SVG 12)
 */
export async function getMaterialsData(targetProjectId?: string) {
  const allProjects = await prisma.project.findMany({
    select: {
      id: true,
      code: true,
      name: true,
      workType: true,
      status: true,
      clientName: true,
      startDate: true,
      targetDate: true,
      siteAddress: true,
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
      kpis: null,
      documents: [],
      packages: [],
    };
  }

  // Load project relations
  const projectWithData = await prisma.project.findUnique({
    where: { id: currentProject.id },
    include: {
      workPackages: true,
      drawings: {
        include: {
          bomItems: true,
          workPackage: true,
        },
      },
      materialRequests: {
        include: {
          items: true,
          workPackage: true,
        },
        orderBy: { createdAt: "desc" },
      },
      productionOrders: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const drawing = projectWithData?.drawings[0];
  const primaryBomItem = drawing?.bomItems[0];
  const req = projectWithData?.materialRequests[0];

  // Calculate KPIs matching SVG 12
  const required = primaryBomItem ? Number(primaryBomItem.quantity) : 100;
  const unit = primaryBomItem ? primaryBomItem.unit : "แผ่น";
  const packageName = drawing?.workPackage?.code ? `${drawing.workPackage.code} (โซน A)` : "WP-F-01";

  // Allocated from request confirmation
  const primaryReqItem = req?.items.find((i) => i.itemCode === (primaryBomItem?.itemCode || "F-PANEL-01"));
  const allocated = primaryReqItem ? Number(primaryReqItem.allocated) : 70;
  const allocatedRef = req?.externalRef ? `อ้างอิง ${req.externalRef}` : "ยังไม่ยืนยัน";

  // Producing from production orders
  const producingOrders = projectWithData?.productionOrders.filter((po) => po.status === ProductionStatus.PRODUCING) || [];
  const producing = producingOrders.reduce((sum, po) => sum + Number(po.quantity), 0) || 20;

  // Shortage = required - allocated - producing
  const shortage = Math.max(0, required - allocated - producing);

  const kpis: MaterialKpiSummary = {
    required,
    unit: `${primaryBomItem?.name?.split(" ")[0] || "แผ่นรั้ว"} · ${packageName}`,
    packageName,
    allocated,
    allocatedRef,
    producing,
    producingNote: "ต้องยืนยันกำหนดรับ",
    shortage,
    shortageFormula: `${required} – ${allocated} – ${producing}`,
  };

  // Build documents list
  const documents: MaterialDocumentItem[] = [];

  // 1. Material Requests
  projectWithData?.materialRequests.forEach((mr) => {
    const item = mr.items[0];
    const isPartial = Number(item?.allocated || 0) < Number(item?.quantity || 0) && Number(item?.allocated || 0) > 0;
    documents.push({
      id: mr.id,
      docNo: mr.requestNo,
      kind: "REQUEST",
      packageAndRev: `${mr.workPackage.code} / ${mr.drawingRev || "BOM Rev.03"}`,
      neededByDate: mr.neededBy ? new Date(mr.neededBy).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" }) : "14 ก.ย. 69",
      responseInfo: mr.externalRef || "รอคลังตรวจสอบ",
      statusLabel: isPartial ? "ยืนยันบางส่วน" : mr.status === RecordStatus.APPROVED ? "อนุมัติแล้ว" : "ร่าง",
      statusTone: isPartial ? "orange" : mr.status === RecordStatus.APPROVED ? "green" : "gray",
      allocatedQty: Number(item?.allocated || 0),
      requestedQty: Number(item?.quantity || 0),
      unit: item?.unit || "แผ่น",
      externalRef: mr.externalRef,
      requestId: mr.id,
    });
  });

  // 2. Production Orders (such as PRD-260009)
  projectWithData?.productionOrders.forEach((po) => {
    documents.push({
      id: po.id,
      docNo: po.orderNo,
      kind: "PRODUCTION",
      packageAndRev: `${packageName} / เพิ่ม ${Number(po.quantity)} ${po.unit}`,
      neededByDate: po.readyDate ? new Date(po.readyDate).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" }) : "รอยืนยัน",
      responseInfo: po.latestUpdate?.split("/")[1]?.trim() || "รอฝ่ายผลิต",
      statusLabel: po.status === ProductionStatus.PRODUCING ? "กำลังผลิต" : "ส่งคำขอแล้ว",
      statusTone: po.status === ProductionStatus.PRODUCING ? "blue" : "blue",
      allocatedQty: 0,
      requestedQty: Number(po.quantity),
      unit: po.unit,
    });
  });

  // 3. Return Material draft
  documents.push({
    id: "ret-draft",
    docNo: "RET-260003",
    kind: "RETURN",
    packageAndRev: "คืนวัสดุคงเหลือ",
    neededByDate: "หลังจบชุดงาน",
    responseInfo: "ยังไม่ส่ง",
    statusLabel: "ร่าง",
    statusTone: "gray",
  });

  return {
    allProjects,
    currentProject,
    kpis,
    documents,
    packages: projectWithData?.workPackages || [],
    drawingRev: drawing ? `BOM Rev.${drawing.revision}` : "BOM Rev.03",
  };
}

/**
 * Creates a new Material Request (SVG 13)
 */
export async function createMaterialRequestAction(formData: {
  projectId: string;
  packageId: string;
  drawingRev?: string;
  neededBy: string;
  notes?: string;
  items: {
    bomItemId?: string;
    itemCode: string;
    description: string;
    quantity: number;
    unit: string;
  }[];
  submitForApproval?: boolean;
}) {
  try {
    const count = await prisma.materialRequest.count();
    const requestNo = `REQ-26${String(count + 1).padStart(4, "0")}`;

    const mr = await auditedMutation({ projectId: formData.projectId, action: "MATERIAL_REQUEST_CREATED", data: { title: "สร้างคำขอวัสดุ", reference: requestNo, ...formData } }, async tx => {
    return await tx.materialRequest.create({
      data: {
        requestNo,
        projectId: formData.projectId,
        packageId: formData.packageId,
        drawingRev: formData.drawingRev || "Rev.03",
        neededBy: new Date(formData.neededBy),
        status: formData.submitForApproval ? RecordStatus.SUBMITTED : RecordStatus.DRAFT,
        notes: formData.notes || null,
        items: {
          create: formData.items.map((item) => ({
            bomItemId: item.bomItemId,
            itemCode: item.itemCode,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            allocated: 0,
            shortage: item.quantity,
          })),
        },
      },
    });

    });

    revalidatePath("/materials");
    revalidatePath(`/projects/${formData.projectId}`);

    return { success: true, requestId: mr.id, requestNo };
  } catch (error: any) {
    console.error("createMaterialRequestAction error:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการสร้างคำขอเบิกวัสดุ" };
  }
}

/**
 * Loads Material Request for dispatch & recording response (SVG 14)
 */
export async function getMaterialRequestForDispatch(requestId: string) {
  const mr = await prisma.materialRequest.findFirst({
    where: {
      OR: [{ id: requestId }, { requestNo: requestId }],
    },
    include: {
      project: true,
      workPackage: true,
      drawing: true,
      items: true,
    },
  });

  if (!mr) return null;

  return {
    id: mr.id,
    requestNo: mr.requestNo,
    projectName: mr.project.name,
    projectCode: mr.project.code,
    packageCode: mr.workPackage.code,
    packageName: mr.workPackage.name,
    zone: mr.workPackage.zone || "โซน A",
    drawingRev: mr.drawingRev || "BOM Rev.03",
    neededBy: mr.neededBy?.toISOString() || null,
    notes: mr.notes || "ส่งโซน A · ติดต่อผู้รับเหมาหน้างานก่อนเข้าพื้นที่",
    items: mr.items.map((i) => ({
      id: i.id,
      itemCode: i.itemCode,
      description: i.description,
      quantity: Number(i.quantity),
      unit: i.unit,
      allocated: Number(i.allocated),
      shortage: Number(i.shortage || 0),
    })),
    warehouse: {
      externalRef: mr.externalRef || "WH-260045",
      warehouseName: mr.warehouseName || "คลังหลักบางปะอิน",
      storageLocation: mr.storageLocation || "Zone B-04 / Lot 12",
      confirmedBy: mr.confirmedBy || "เจ้าหน้าที่คลัง",
      confirmedAt: mr.confirmedAt?.toISOString() || "2026-09-11T16:30:00Z",
      responseFileUrl: mr.responseFileUrl || "WH-260045-confirmation.pdf",
      warehouseNotes: mr.warehouseNotes || "",
    },
  };
}

/**
 * Records Warehouse Response (SVG 14)
 */
export async function recordWarehouseResponseAction(
  requestId: string,
  data: {
    externalRef: string;
    warehouseName?: string;
    storageLocation?: string;
    confirmedBy: string;
    responseFileUrl?: string;
    warehouseNotes?: string;
    allocatedQuantities?: { [itemCode: string]: number };
  }
) {
  try {
    const mr = await prisma.materialRequest.findUnique({
      where: { id: requestId },
      include: { items: true },
    });

    if (!mr) throw new Error("ไม่พบคำขอเบิกวัสดุ");

  await auditedMutation({ projectId: mr.projectId, action: "WAREHOUSE_CONFIRMED", entityId: mr.id, data: { title: "บันทึกผลจัดสรรจากคลัง", reference: mr.requestNo, ...data } }, async tx => {
    // Update items allocated and shortage
    if (data.allocatedQuantities) {
      for (const item of mr.items) {
        if (data.allocatedQuantities[item.itemCode] !== undefined) {
          const alloc = data.allocatedQuantities[item.itemCode];
          const qty = Number(item.quantity);
          await tx.materialRequestItem.update({
            where: { id: item.id },
            data: {
              allocated: alloc,
              confirmed: alloc,
              shortage: Math.max(0, qty - alloc),
            },
          });
        }
      }
    }

    await tx.materialRequest.update({
      where: { id: requestId },
      data: {
        externalRef: data.externalRef,
        warehouseName: data.warehouseName || "คลังหลักบางปะอิน",
        storageLocation: data.storageLocation || "Zone B-04 / Lot 12",
        confirmedBy: data.confirmedBy,
        confirmedAt: new Date(),
        responseFileUrl: data.responseFileUrl || null,
        warehouseNotes: data.warehouseNotes || null,
        status: RecordStatus.APPROVED,
      },
    });


  });

    revalidatePath("/materials");
    revalidatePath(`/materials/dispatch/${requestId}`);

    return { success: true };
  } catch (error: any) {
    console.error("recordWarehouseResponseAction error:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการบันทึกผลจากคลัง" };
  }
}

/**
 * Loads Production Tracking data (SVG 15)
 */
export async function getProductionData(targetProjectId?: string) {
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

  if (!currentProject) return null;

  const projectWithData = await prisma.project.findUnique({
    where: { id: currentProject.id },
    include: {
      drawings: {
        include: { bomItems: true },
      },
      materialRequests: {
        include: { items: true },
      },
      productionOrders: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  const drawing = projectWithData?.drawings[0];
  const primaryItem = drawing?.bomItems[0];
  const primaryReq = projectWithData?.materialRequests[0];
  const primaryReqItem = primaryReq?.items.find((i) => i.itemCode === (primaryItem?.itemCode || "F-PANEL-01"));

  const required = primaryItem ? Number(primaryItem.quantity) : 100;
  const unit = primaryItem ? primaryItem.unit : "แผ่น";
  const confirmed = primaryReqItem ? Number(primaryReqItem.allocated) : 70;

  const orders = projectWithData?.productionOrders || [];
  const existingOrder = orders.find((o) => o.orderNo === "PRD-260008");
  const newOrder = orders.find((o) => o.orderNo === "PRD-260009");

  const existingQty = existingOrder ? Number(existingOrder.quantity) : 20;
  const requestedAddQty = newOrder ? Number(newOrder.quantity) : 10;

  return {
    allProjects,
    currentProject,
    kpis: {
      required,
      itemLabel: `${primaryItem?.name?.split(" ")[0] || "แผ่นรั้ว"} / ${drawing ? `BOM Rev.${drawing.revision}` : "BOM Rev.03"}`,
      confirmed,
      confirmedRef: primaryReq?.externalRef ? `ยืนยัน ${primaryReq.externalRef}` : "ยืนยัน WH-260045",
      existingQty,
      existingRef: existingOrder?.orderNo || "PRD-260008",
      requestedAddQty,
      requestedAddRef: newOrder?.orderNo || "PRD-260009",
    },
    orders: orders.map((o) => ({
      id: o.id,
      orderNo: o.orderNo,
      itemCode: o.itemCode,
      itemName: o.itemName,
      quantity: Number(o.quantity),
      unit: o.unit,
      readyDate: o.readyDate ? new Date(o.readyDate).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" }) : "รอยืนยัน",
      latestUpdate: o.latestUpdate || "ฝ่ายผลิต",
      status: o.status,
      history: (o.history as any) || [],
      notes: o.notes,
    })),
    detailOrder: newOrder
      ? {
          orderNo: newOrder.orderNo,
          history: (newOrder.history as any) || [
            { date: "12 ก.ย. 09:00", text: "ส่งคำขอเพิ่ม 10 แผ่นจากยอดขาด" },
            { date: "12 ก.ย. 11:00", text: "ผู้ประสานติดตามกำหนดพร้อมส่ง" },
          ],
        }
      : null,
  };
}
