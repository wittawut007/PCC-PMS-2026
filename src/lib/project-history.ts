import { prisma } from "@/lib/prisma";
import { documentAccess } from "@/lib/document-files";
import type { ProjectDocument } from "@/lib/project-documents";

const actions: Record<string, [string, string, string]> = {
  PROJECT_CREATED: ["project", "สร้างโครงการ", "create"], PLAN_UPDATED: ["planning", "ปรับแผนงาน", "update"], PLAN_RESET: ["planning", "คืนค่าแผนงาน", "update"],
  MATERIAL_REQUEST_CREATED: ["materials", "สร้างคำขอวัสดุ", "create"], WAREHOUSE_CONFIRMED: ["materials", "ยืนยันการจัดสรรจากคลัง", "update"],
  RECEIVING_RECORDED: ["transport", "บันทึกผลตรวจรับ", "update"], DAILY_LOG_CREATED: ["installation", "บันทึกงานประจำวัน", "create"],
  QC_DECIDED: ["installation", "พิจารณาผล QC", "approve"], NCR_UPDATED: ["installation", "ดำเนินการ NCR", "update"],
  DOCUMENT_UPLOADED: ["documents", "อัปโหลดไฟล์", "create"], DOCUMENT_UPDATED: ["documents", "แก้ไขไฟล์ / รายละเอียด", "update"], DOCUMENT_DELETED: ["documents", "ลบไฟล์", "delete"],
  APPROVE_TASK: ["approval", "อนุมัติรายการ", "approve"], REJECT_TASK: ["approval", "ส่งกลับแก้ไข", "reject"], HANDOVER_UPDATED: ["approval", "ปรับสถานะส่งมอบ", "update"],
};
export interface HistoryEvent { id: string; at: string; category: string; action: string; actionCode: string; kind: string; title: string; reference: string; actor: string; actorId: string; source: "audit" | "record"; details: unknown; }
export interface ProjectHistoryData { projectId: string; generatedAt: string; events: HistoryEvent[]; }
export async function getProjectHistory(projectId: string, userId: string, documents: ProjectDocument[]): Promise<ProjectHistoryData> {
  const access = await documentAccess(projectId, userId);
  if (!access.read) throw new Error("คุณไม่มีสิทธิ์ดูประวัติโครงการนี้");
  const logs = await prisma.auditLog.findMany({ where: { projectId }, include: { user: { select: { name: true } } }, orderBy: [{ createdAt: "desc" }, { id: "desc" }] });
  const events: HistoryEvent[] = logs.map(log => {
    const [category, action, defaultKind] = actions[log.action] || ["project", log.action, "update"];
    const data = log.data && typeof log.data === "object" && !Array.isArray(log.data) ? log.data as Record<string, unknown> : {};
    const decision = data.after && typeof data.after === "object" ? (data.after as Record<string, unknown>).decision : null;
    const kind = log.action === "QC_DECIDED" && decision === "REJECTED" ? "reject" : defaultKind;
    return { id: `audit-${log.id}`, at: log.createdAt.toISOString(), category, action, kind, actionCode: log.action, title: String(data.title || data.filename || action), reference: String(data.reference || data.requestCode || log.entityId || ""), actor: log.user.name, actorId: log.userId, source: "audit", details: log.data };
  });
  // Older business records are references, never reconstructed edit/approval logs.
  const categoryMap: Record<string, string> = { drawings: "documents", general: "documents", contracts: "finance", finance: "finance", materials: "materials", production: "materials", transport: "transport", qc: "installation", ncr: "installation", installation: "installation", reports: "approval" };
  for (const d of documents.filter(d => d.kind === "record")) events.push({ id: `record-${d.id}`, at: d.date, category: categoryMap[d.category] || "documents", action: "รายการอ้างอิงเดิม", actionCode: "EXISTING_RECORD", kind: "record", title: d.title, reference: d.reference, actor: d.by || "ไม่ระบุผู้บันทึก", actorId: `record:${d.by || "unknown"}`, source: "record", details: { description: d.description, status: d.status, ...Object.fromEntries(d.fields.map(f => [f.label, f.value])) } });
  events.sort((a, b) => b.at.localeCompare(a.at) || b.id.localeCompare(a.id));
  return { projectId, generatedAt: new Date().toISOString(), events };
}
