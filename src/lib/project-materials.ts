import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const materialInclude = {
  drawings: { include: { bomItems: true, workPackage: true } },
  materialRequests: { include: { items: true, workPackage: true } },
  productionOrders: true,
  transportTrips: { include: { receiving: true } },
} satisfies Prisma.ProjectInclude;

type MaterialSource = Prisma.ProjectGetPayload<{ include: typeof materialInclude }>;

export interface ProjectMaterialRow {
  id: string;
  code: string;
  name: string;
  unit: string;
  spec: string;
  packageId: string | null;
  packageName: string;
  drawingId: string | null;
  reference: string;
  approved: boolean;
  required: number | null;
  requested: number;
  allocated: number;
  confirmedDemand: number;
  delivered: number;
  received: number;
  damaged: number;
  missing: number;
  scheduled: number;
  inTransit: number;
  ordered: number;
  producing: number;
  ready: number;
  outstanding: number | null;
  toProcure: number | null;
  toProduce: number | null;
  requests: string[];
  deliveries: { reference: string; status: string; quantity: number; good: number | null; bad: number; missing: number }[];
  orders: { reference: string; status: string; quantity: number; date: string | null }[];
}

export interface ProjectMaterialOverview {
  rows: ProjectMaterialRow[];
  unresolved: string[];
}

const quantity = (value: unknown) => Math.max(0, Number(value) || 0);
const unique = <T,>(values: T[]) => [...new Set(values)];

export function buildProjectMaterialOverview(project: MaterialSource): ProjectMaterialOverview {
  const rows: ProjectMaterialRow[] = [];
  const unresolved: string[] = [];
  const requestRows = new Map<string, ProjectMaterialRow[]>();
  // Select one current revision per drawing and work package.
  const latest = new Map<string, MaterialSource["drawings"][number]>();
  for (const drawing of project.drawings) {
    const key = `${drawing.packageId || ""}:${drawing.code}`;
    const previous = latest.get(key);
    const approved = drawing.status === "APPROVED";
    const previousApproved = previous?.status === "APPROVED";
    if (!previous || (approved && !previousApproved) || (approved === previousApproved && drawing.revision.localeCompare(previous.revision, undefined, { numeric: true }) > 0)) {
      latest.set(key, drawing);
    }
  }
  function addRow(data: Pick<ProjectMaterialRow, "id" | "code" | "name" | "unit" | "spec" | "packageId" | "packageName" | "drawingId" | "reference" | "approved" | "required">) {
    const row: ProjectMaterialRow = { ...data, requested: 0, allocated: 0, confirmedDemand: 0, delivered: 0, received: 0, damaged: 0, missing: 0, scheduled: 0, inTransit: 0, ordered: 0, producing: 0, ready: 0, outstanding: null, toProcure: null, toProduce: null, requests: [], deliveries: [], orders: [] };
    rows.push(row);
    return row;
  }
  for (const drawing of latest.values()) {
    for (const item of drawing.bomItems) {
      addRow({ id: item.id, code: item.itemCode, name: item.name, unit: item.unit, spec: item.spec || "", packageId: drawing.packageId, packageName: drawing.workPackage?.name || "ทั้งโครงการ", drawingId: drawing.id, reference: `${drawing.code} · Rev.${drawing.revision}`, approved: drawing.status === "APPROVED", required: quantity(item.quantity) + quantity(item.additionalQty) });
    }
  }
  for (const request of project.materialRequests) {
    const linked: ProjectMaterialRow[] = [];
    for (const item of request.items) {
      let row = rows.find(row => row.id === item.bomItemId && row.unit === item.unit);
      if (!row && !item.bomItemId) {
        const candidates = rows.filter(row => row.code === item.itemCode && row.unit === item.unit && (!row.packageId || row.packageId === request.packageId) && (!request.drawingId || row.drawingId === request.drawingId));
        if (candidates.length === 1) row = candidates[0];
      }
      if (!row) {
        row = addRow({ id: item.bomItemId || `request:${item.id}`, code: item.itemCode, name: item.description, unit: item.unit, spec: item.notes || "", packageId: request.packageId, packageName: request.workPackage.name, drawingId: request.drawingId, reference: `คำขอ ${request.requestNo} · ตรวจสอบฐาน BOM`, approved: false, required: null });
      }
      row.requested += quantity(item.quantity);
      row.requests = unique([...row.requests, request.requestNo]);
      if (["APPROVED", "CLOSED"].includes(request.status) && (request.externalRef || request.confirmedAt)) {
        row.allocated += quantity(item.allocated);
        row.confirmedDemand += quantity(item.quantity);
      }
      linked.push(row);
    }
    requestRows.set(request.id, unique(linked));
  }
  function matchRow(candidates: ProjectMaterialRow[], itemCode: string | null, unit: string | null, packageId: string | null) {
    const scoped = candidates.filter(row => (!unit || row.unit === unit) && (!packageId || !row.packageId || row.packageId === packageId));
    if (itemCode) {
      const exact = scoped.filter(row => row.code === itemCode);
      return exact.length === 1 ? exact[0] : undefined;
    }
    return scoped.length === 1 ? scoped[0] : undefined;
  }
  for (const trip of project.transportTrips) {
    if (trip.status === "CANCELLED") continue;
    const candidates = trip.requestId ? requestRows.get(trip.requestId) || [] : rows;
    const described = candidates.filter(row => trip.cargoDescription?.includes(row.code));
    const row = matchRow(described.length ? described : candidates, null, trip.unit, trip.packageId);
    if (!row) {
      unresolved.push(`เที่ยว ${trip.tripNo} · ${trip.cargoDescription || "ยังไม่ระบุวัสดุ"} · ${quantity(trip.cargoQty)} ${trip.unit || ""} · รอระบุวัสดุให้ชัดเจน`);
      continue;
    }
    const amount = quantity(trip.cargoQty);
    const receipt = trip.receiving;
    if (receipt || trip.status === "COMPLETED") row.delivered += receipt ? quantity(receipt.deliveredQty) : amount;
    if (receipt) {
      row.received += quantity(receipt.goodQty);
      row.damaged += quantity(receipt.badQty);
      row.missing += quantity(receipt.missingQty);
    }
    if (["SCHEDULED", "LOADING"].includes(trip.status)) row.scheduled += amount;
    if (trip.status === "IN_TRANSIT" || (trip.status === "ARRIVED" && !receipt)) row.inTransit += amount;
    row.deliveries.push({ reference: trip.tripNo, status: trip.status, quantity: amount, good: receipt ? quantity(receipt.goodQty) : null, bad: quantity(receipt?.badQty), missing: quantity(receipt?.missingQty) });
  }
  for (const order of project.productionOrders) {
    if (order.status === "CANCELLED") continue;
    const candidates = order.requestId ? requestRows.get(order.requestId) || [] : rows;
    let row = rows.find(row => row.id === order.bomItemId && row.unit === order.unit);
    if (!row) row = matchRow(candidates, order.itemCode, order.unit, null);
    if (!row) {
      row = addRow({ id: `production:${order.id}`, code: order.itemCode, name: order.itemName, unit: order.unit, spec: order.spec || "", packageId: null, packageName: "ตรวจสอบชุดงาน", drawingId: null, reference: `ใบสั่งผลิต ${order.orderNo} · ตรวจสอบฐาน BOM`, approved: false, required: null });
    }
    const amount = quantity(order.quantity);
    row.ordered += amount;
    if (order.status === "PRODUCING") row.producing += amount;
    if (order.status === "READY") row.ready += amount;
    row.orders.push({ reference: order.orderNo, status: order.status, quantity: amount, date: order.readyDate?.toISOString() || null });
  }
  for (const row of rows) {
    if (!row.approved || row.required === null) continue;
    row.outstanding = Math.max(0, row.required - row.received);
    const covered = Math.max(row.received, row.allocated - row.damaged - row.missing);
    row.toProcure = Math.max(0, row.required - covered - row.ordered);
    if (row.confirmedDemand > 0) {
      row.toProduce = Math.min(row.toProcure, Math.max(0, row.confirmedDemand - covered - row.ordered));
    }
  }
  return { rows, unresolved };
}

export async function getProjectMaterialOverview(projectId: string): Promise<ProjectMaterialOverview> {
  const project = await prisma.project.findUnique({ where: { id: projectId }, include: materialInclude });
  return project ? buildProjectMaterialOverview(project) : { rows: [], unresolved: [] };
}
