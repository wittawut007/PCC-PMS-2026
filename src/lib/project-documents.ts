import { prisma } from "@/lib/prisma";
import { realpath, stat } from "node:fs/promises";
import path from "node:path";

import { documentCategories, type DocumentFileTarget } from "@/lib/document-library-config";
export { documentCategories } from "@/lib/document-library-config";
import { documentAccess, managedDocumentExists } from "@/lib/document-files";
export interface ProjectDocument {
  id: string; projectId: string; category: string; folder: string; title: string; reference: string; revision: string | null;
  date: string; by: string | null; status: string; kind: "record" | "file"; filename: string | null; href: string | null;
  size: number | null; manage: DocumentFileTarget | null; description: string | null; fields: { label: string; value: string }[];
}
const iso = (d: Date) => d.toISOString();
const amount = (n: { toString(): string }, currency = "บาท") => `${Number(n.toString()).toLocaleString("th-TH", { maximumFractionDigits: 2 })} ${currency}`;
const workflowCategory: Record<string, string> = { DAILY_LOG: "installation", QC_REQUEST: "qc", QC_RESULT: "qc", APPROVAL_GATE: "qc", MATERIAL_REQUEST: "materials", TRANSPORT_TRIP: "transport", RECEIVING: "transport", PUBLICATION: "reports", HANDOVER: "reports" };

const workflowNames: Record<string, string> = { DAILY_LOG: "บันทึกงานประจำวัน", QC_REQUEST: "คำขอตรวจคุณภาพ", QC_RESULT: "ผลตรวจคุณภาพ", APPROVAL_GATE: "จุดตรวจและอนุมัติ", MATERIAL_REQUEST: "คำขอวัสดุ", TRANSPORT_TRIP: "เที่ยวขนส่ง", RECEIVING: "ตรวจรับวัสดุ", PUBLICATION: "รายงานเผยแพร่", HANDOVER: "ส่งมอบงาน" };
export function documentDataFields(value: unknown, prefix = ""): { label: string; value: string }[] {
  if (value === null || value === undefined) return [];
  if (typeof value !== "object") return [{ label: prefix || "รายละเอียด", value: typeof value === "boolean" ? value ? "ใช่" : "ไม่ใช่" : String(value) }];
  const names: Record<string, string> = { title: "ชื่อรายการ", description: "รายละเอียด", notes: "หมายเหตุ", note: "หมายเหตุ", status: "สถานะ", progress: "ความก้าวหน้า", donePct: "ติดตั้งเสร็จ (%)", qcPct: "ผ่าน QC (%)", quantity: "จำนวน", unit: "หน่วย", location: "พื้นที่", date: "วันที่", activity: "กิจกรรม", amount: "จำนวนเงิน", scope: "ขอบเขต", reference: "อ้างอิง", inspector: "ผู้ตรวจ", projectName: "โครงการ", projectCode: "รหัสโครงการ", summary: "สรุป", workPackages: "ชุดงาน", items: "รายการ", name: "ชื่อ", code: "รหัส", actualProgress: "ความก้าวหน้างาน", qcProgress: "ความก้าวหน้า QC" };
  return Object.entries(value).flatMap(([key, item]) => documentDataFields(item, [prefix, Array.isArray(value) ? `รายการที่ ${Number(key) + 1}` : names[key] || key].filter(Boolean).join(" / ")));
}

export async function documentFileLink(source: string): Promise<string | null> {
  try {
    if (/^https?:\/\//i.test(source)) return new URL(source).href;
    if (source.startsWith("//") || source.includes("\\") || /^[a-z][a-z0-9+.-]*:/i.test(source)) return null;
    const publicRoot = await realpath(path.join(process.cwd(), "public"));
    const decoded = decodeURIComponent(source.split(/[?#]/)[0]);
    const candidate = await realpath(/* turbopackIgnore: true */ path.resolve(publicRoot, decoded.replace(/^\/+/, "")));
    if (!candidate.startsWith(publicRoot + path.sep) || !(await stat(/* turbopackIgnore: true */ candidate)).isFile()) return null;
    return "/" + path.relative(publicRoot, candidate).split(path.sep).map(encodeURIComponent).join("/");
  } catch { return null; }
}

export function attachmentReferences(value: unknown): { source: string; name: string | null }[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap(item => {
    if (typeof item === "string" && item.trim()) return [{ source: item.trim(), name: null }];
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    const entry = item as Record<string, unknown>;
    const source = [entry.url, entry.storagePath, entry.path, entry.filename, entry.name].find(v => typeof v === "string" && v.trim());
    return typeof source === "string" ? [{ source: source.trim(), name: typeof entry.filename === "string" ? entry.filename : typeof entry.name === "string" ? entry.name : null }] : [];
  });
}

export async function getProjectDocuments(projectId: string, viewerId?: string) {
  const where = { projectId };
  const [drawings, contracts, requests, orders, trips, logs, inspections, gates, ncrs, reports, workflows, files] = await Promise.all([
    prisma.drawing.findMany({ where, include: { bomItems: true } }),
    prisma.contract.findMany({ where, include: { billingPeriods: { include: { payments: true } } } }),
    prisma.materialRequest.findMany({ where, include: { items: true } }), prisma.productionOrder.findMany({ where }),
    prisma.transportTrip.findMany({ where, include: { receiving: true } }),
    prisma.dailyLog.findMany({ where, include: { createdBy: { select: { name: true } } } }), prisma.qcInspection.findMany({ where }),
    prisma.approvalGate.findMany({ where }), prisma.ncrRecord.findMany({ where }), prisma.publication.findMany({ where }),
    prisma.workflowRecord.findMany({ where, include: { createdBy: { select: { name: true } } } }),
    prisma.evidenceFile.findMany({ where, include: { createdBy: { select: { name: true } }, record: { select: { kind: true, projectId: true, status: true } }, dailyLog: { select: { projectId: true } } } }),
  ]);
  const documents: ProjectDocument[] = [];
  type RecordInput = Omit<ProjectDocument, "projectId" | "kind" | "filename" | "href" | "size" | "revision" | "by" | "description" | "fields" | "manage"> & Partial<Pick<ProjectDocument, "revision" | "by" | "description" | "fields">>;
  const add = (d: RecordInput) => { const row: ProjectDocument = { projectId, kind: "record", filename: null, href: null, size: null, revision: null, by: null, description: null, fields: [], manage: null, ...d }; documents.push(row); return row; };
  const attachments: { parent: ProjectDocument; source: string; name: string | null; size?: number; id?: string; target: DocumentFileTarget }[] = [];
  const attach = (parent: ProjectDocument, values: unknown, target: Pick<DocumentFileTarget, "type" | "id">) => attachmentReferences(values).forEach(file => attachments.push({ parent, ...file, target: { ...target, source: file.source } }));
  for (const d of drawings) add({ id: `drawing-${d.id}`, category: "drawings", folder: "แบบก่อสร้างและรายการ BOM", title: d.title, reference: d.code, revision: d.revision, date: iso(d.updatedAt), by: d.approvedBy, status: d.status, description: d.notes, fields: d.bomItems.map(b => ({ label: `${b.itemCode} · ${b.name}`, value: `${Number(b.quantity)} ${b.unit}${b.spec ? ` · ${b.spec}` : ""}` })) });
  for (const c of contracts) {
    add({ id: `contract-${c.id}`, category: "contracts", folder: "สัญญาโครงการ", title: `สัญญา ${c.contractNo}`, reference: c.contractNo, revision: String(c.revision), date: iso(c.updatedAt), status: "RECORDED", description: c.notes, fields: [{ label: "มูลค่าสัญญา", value: amount(c.baseValue, c.currency) }, { label: "งานเพิ่ม / ลด", value: amount(c.variationTotal, c.currency) }, { label: "วันที่ลงนาม", value: c.signedDate ? c.signedDate.toLocaleDateString("th-TH") : "ยังไม่ระบุ" }] });
    for (const p of c.billingPeriods) {
      add({ id: `billing-${p.id}`, category: "contracts", folder: "งวดเรียกเก็บลูกค้า", title: `งวดที่ ${p.periodNo} · ${c.contractNo}`, reference: c.contractNo, date: iso(p.updatedAt), status: p.status, fields: [{ label: "ยอดสุทธิ", value: amount(p.netAmount, c.currency) }, { label: "ครบกำหนดชำระ", value: p.dueDate?.toLocaleDateString("th-TH") || "ยังไม่ระบุ" }] });
      for (const pay of p.payments) add({ id: `payment-${pay.id}`, category: "contracts", folder: "หลักฐานรับชำระ", title: `รับชำระงวดที่ ${p.periodNo} · ${c.contractNo}`, reference: pay.reference || c.contractNo, date: iso(pay.paidAt), status: "RECORDED", description: pay.notes, fields: [{ label: "ยอดรับชำระ", value: amount(pay.amount, c.currency) }] });
    }
  }
  for (const r of requests) {
    const row = add({ id: `material-${r.id}`, category: "materials", folder: "คำขอวัสดุและยืนยันคลัง", title: `คำขอวัสดุ ${r.requestNo}`, reference: r.requestNo, revision: r.drawingRev, date: iso(r.updatedAt), by: r.confirmedBy, status: r.status, description: r.notes, fields: r.items.map(i => ({ label: `${i.itemCode} · ${i.description}`, value: `${Number(i.quantity)} ${i.unit}` })) });
    if (r.responseFileUrl) attach(row, [r.responseFileUrl], { type: "material-response", id: r.id });
  }
  for (const o of orders) add({ id: `production-${o.id}`, category: "materials", folder: "ใบสั่งผลิต", title: `ใบสั่งผลิต ${o.orderNo}`, reference: o.orderNo, date: iso(o.updatedAt), status: o.status, description: o.notes, fields: [{ label: "รายการผลิต", value: `${o.itemName} · ${Number(o.quantity)} ${o.unit}` }] });
  for (const t of trips) {
    add({ id: `transport-${t.id}`, category: "transport", folder: "เที่ยวขนส่งและใบส่งของ", title: t.cargoDescription || `เที่ยวขนส่ง ${t.tripNo}`, reference: t.deliveryNoteNo || t.tripNo, date: iso(t.updatedAt), by: t.driverName, status: t.status, fields: [{ label: "เที่ยวรถ", value: t.tripNo }, { label: "รายการขนส่ง", value: `${Number(t.cargoQty || 0)} ${t.unit || ""}` }, { label: "ปลายทาง", value: t.destination || "ยังไม่ระบุ" }] });
    if (t.receiving) {
      const r = t.receiving, row = add({ id: `receiving-${r.id}`, category: "transport", folder: "ใบตรวจรับปลายทาง", title: `ผลตรวจรับ ${t.tripNo}`, reference: t.tripNo, date: iso(r.receivedAt), by: r.receivedBy, status: r.status, description: r.damageNotes || r.notes, fields: [{ label: "รับดี", value: `${Number(r.goodQty)} ${t.unit || ""}` }, { label: "เสียหาย / ขาด", value: `${Number(r.badQty)} / ${Number(r.missingQty)}` }] }); attach(row, r.attachedFiles, { type: "receiving-file", id: r.id });
    }
  }
  for (const l of logs) { const row = add({ id: `daily-${l.id}`, category: "installation", folder: "บันทึกงานประจำวัน", title: l.activity || "บันทึกการติดตั้ง", reference: l.location || "บันทึกประจำวัน", date: iso(l.logDate), by: l.createdBy?.name, status: l.status, description: l.description, fields: [{ label: "ปริมาณงาน", value: l.quantity === null ? "ยังไม่ระบุ" : `${Number(l.quantity)} ${l.unit || ""}` }, { label: "สิ่งที่ต้องติดตาม", value: l.issues || "ไม่มีบันทึก" }] }); attach(row, l.photos, { type: "daily-photo", id: l.id }); }
  for (const i of inspections) { const row = add({ id: `qc-${i.id}`, category: "qc", folder: "ใบตรวจคุณภาพ IR", title: `ตรวจคุณภาพ ${i.scope || ""}`, reference: i.inspectionNo, date: iso(i.updatedAt), by: i.inspector, status: i.status, description: i.notes, fields: [{ label: "แบบอ้างอิง", value: i.drawingRef || "ยังไม่ระบุ" }, { label: "NCR อ้างอิง", value: i.ncrCode || "ไม่มีบันทึก" }] }); attach(row, i.photos, { type: "qc-photo", id: i.id }); }
  for (const g of gates) add({ id: `gate-${g.id}`, category: "qc", folder: "บันทึกจุดอนุมัติ AP", title: g.title, reference: g.gateCode, date: iso(g.updatedAt), by: g.approver, status: g.status, description: g.notes, fields: [{ label: "ดำเนินการต่อเมื่ออนุมัติ", value: g.unlockedAction }, { label: "ผลทดสอบ", value: g.testResult || "ยังไม่ระบุ" }] });
  for (const n of ncrs) add({ id: `ncr-${n.id}`, category: "ncr", folder: "รายการข้อบกพร่อง", title: n.description, reference: n.code, date: iso(n.updatedAt), by: n.assignedTo, status: n.status, fields: [{ label: "แนวทางแก้ไข", value: n.correctiveAction || "ยังไม่ระบุ" }, { label: "ผลตรวจการแก้ไข", value: n.verificationNotes || "ยังไม่ระบุ" }] });
  for (const r of reports) add({ id: `report-${r.id}`, category: "reports", folder: "รายงานเผยแพร่", title: r.title, reference: "รายงานเผยแพร่", date: iso(r.publishedAt), by: r.publishedBy, status: "PUBLISHED", fields: documentDataFields(r.snapshot) });
  for (const w of workflows) add({ id: `workflow-${w.id}`, category: workflowCategory[w.kind] || "general", folder: "เอกสารขั้นตอนงาน", title: w.notes || `บันทึก${documentCategories.find(c => c.id === workflowCategory[w.kind])?.name || "ขั้นตอนงาน"}`, reference: workflowNames[w.kind] || "เอกสารขั้นตอนงาน", date: iso(w.updatedAt), by: w.createdBy.name, status: w.status, description: w.notes, fields: documentDataFields(w.data) });
  for (const f of files) {
    if (f.record && f.record.projectId !== projectId || f.dailyLog && f.dailyLog.projectId !== projectId) continue;
    const parent: ProjectDocument = { id: `evidence-${f.id}`, projectId, category: f.title !== null ? f.category : f.record ? workflowCategory[f.record.kind] || "general" : f.dailyLogId ? "installation" : "general", folder: f.title !== null ? f.folder : "ไฟล์แนบโครงการ", title: f.title || f.filename, reference: f.reference || f.filename, revision: f.revision, date: iso(f.title !== null ? f.updatedAt : f.createdAt), by: f.createdBy.name, status: f.record?.status || "RECORDED", kind: "file", filename: f.filename, href: null, size: f.sizeBytes, manage: null, description: f.description, fields: [] };
    attachments.unshift({ parent, source: f.storagePath, name: f.filename, size: f.sizeBytes, id: parent.id, target: { type: "evidence", id: f.id, source: f.storagePath, version: iso(f.updatedAt) } });
  }
  const seen = new Set<string>();
  for (const [index, a] of attachments.entries()) {
    const key = `${a.parent.id}:${a.source}`; if (seen.has(key)) continue; seen.add(key);
    const filename = a.name || a.source.split(/[?#]/)[0].split("/").pop() || "ไฟล์แนบ";
    documents.push({ ...a.parent, id: a.id || `attachment-${a.parent.id}-${index}`, kind: "file", title: a.id ? a.parent.title : filename, filename, manage: a.target, href: a.source.startsWith("managed:") ? await managedDocumentExists(a.source) ? `/api/projects/${encodeURIComponent(projectId)}/documents/${encodeURIComponent(a.target.id)}` : null : await documentFileLink(a.source), size: a.size ?? null, reference: a.parent.reference, fields: [{ label: "เอกสารอ้างอิง", value: a.parent.title }], description: a.id ? a.parent.description : null });
  }
  return { canManage: viewerId ? (await documentAccess(projectId, viewerId)).write : false, projectId, categories: documentCategories, documents: documents.sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id)) };
}
export type ProjectDocumentsData = Awaited<ReturnType<typeof getProjectDocuments>>;
