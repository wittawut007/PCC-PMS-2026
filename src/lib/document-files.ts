import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { mkdir, writeFile, readFile, unlink, stat } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { documentCategories, type DocumentFileTarget } from "@/lib/document-library-config";

export class DocumentError extends Error { constructor(message: string, public status = 400) { super(message); } }
export const maxDocumentSize = 25 * 1024 * 1024;
const mimeTypes: Record<string, string> = { pdf: "application/pdf", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif", txt: "text/plain", csv: "text/csv", doc: "application/msword", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", xls: "application/vnd.ms-excel", xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", ppt: "application/vnd.ms-powerpoint", pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation", zip: "application/zip", dwg: "application/octet-stream", dxf: "application/octet-stream" };
const storageRoot = () => path.resolve(/* turbopackIgnore: true */ process.env.DOCUMENT_STORAGE_DIR || path.join(process.cwd(), ".data", "documents"));
export function managedDocumentPath(source: string) {
  if (!/^managed:[0-9a-f-]{36}\.[a-z0-9]+$/.test(source)) throw new DocumentError("ไม่พบไฟล์จัดเก็บ", 404);
  return path.join(/* turbopackIgnore: true */ storageRoot(), source.slice("managed:".length));
}
export async function managedDocumentExists(source: string) { try { return (await stat(/* turbopackIgnore: true */ managedDocumentPath(source))).isFile(); } catch { return false; } }
export async function documentAccess(projectId: string, userId: string) {
  const [project, user, member] = await Promise.all([prisma.project.findUnique({ where: { id: projectId }, select: { id: true } }), prisma.user.findUnique({ where: { id: userId }, select: { role: true, isActive: true } }), prisma.projectMember.findUnique({ where: { projectId_userId: { projectId, userId } }, select: { id: true, roleInProject: true } })]);
  if (!project || !user?.isActive) return { read: false, write: false };
  const global = ["SYSTEM_ADMIN", "PM", "EXECUTIVE"].includes(user.role);
  return { read: global || !!member, write: (global || !!member && member.roleInProject !== "OBSERVER") && !["EXECUTIVE", "OWNER"].includes(user.role) };
}
export async function requireDocumentAccess(projectId: string, userId: string, write = false) {
  const access = await documentAccess(projectId, userId);
  if (!(write ? access.write : access.read)) throw new DocumentError("คุณไม่มีสิทธิ์จัดการเอกสารของโครงการนี้", 403);
}
const text = (data: FormData, key: string, max: number, required = false) => {
  const raw = data.get(key); const value = typeof raw === "string" ? raw.trim() : "";
  if (required && !value) throw new DocumentError("กรุณากรอกข้อมูลให้ครบ");
  if (value.length > max) throw new DocumentError("ข้อความยาวเกินกำหนด");
  return value;
};
export function documentMetadata(data: FormData) {
  const category = text(data, "category", 40, true);
  if (!documentCategories.some(c => c.id === category)) throw new DocumentError("กรุณาเลือกหมวดหมู่เอกสาร");
  return { title: text(data, "title", 250, true), category, folder: documentCategories.find(c => c.id === category)!.name, revision: text(data, "revision", 30) || null, reference: text(data, "reference", 200) || null, description: text(data, "description", 5000) || null };
}
export function documentTarget(value: unknown): DocumentFileTarget {
  if (!value || typeof value !== "object") throw new DocumentError("ไม่พบรายการไฟล์");
  const t = value as DocumentFileTarget;
  if (!["evidence", "material-response", "daily-photo", "qc-photo", "receiving-file"].includes(t.type) || typeof t.id !== "string" || !t.id || t.id.length > 200 || typeof t.source !== "string" || t.source.length > 3000 || t.version !== undefined && typeof t.version !== "string") throw new DocumentError("ข้อมูลรายการไฟล์ไม่ถูกต้อง");
  return t;
}
async function store(file: File) {
  if (!file.size || file.size > maxDocumentSize) throw new DocumentError("กรุณาเลือกไฟล์ขนาดไม่เกิน 25 MB");
  const filename = file.name.replace(/\\/g, "/").split("/").pop()!.replace(/[\x00-\x1f]/g, "").trim();
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  if (!filename || filename.length > 200 || !mimeTypes[ext]) throw new DocumentError("รองรับ PDF, Office, รูปภาพ, CSV, TXT, ZIP และไฟล์แบบ DWG/DXF");
  const source = `managed:${randomUUID()}.${ext}`;
  await mkdir(storageRoot(), { recursive: true, mode: 0o700 });
  await writeFile(managedDocumentPath(source), Buffer.from(await file.arrayBuffer()), { flag: "wx", mode: 0o600 });
  return { storagePath: source, filename, mimeType: mimeTypes[ext], sizeBytes: file.size };
}
async function discard(source: string) {
  if (!source.startsWith("managed:")) return;
  if (await prisma.evidenceFile.count({ where: { storagePath: source } })) return;
  try { await unlink(managedDocumentPath(source)); } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") console.warn("Unable to clean up an unused document file"); }
}
function attachmentSource(value: Prisma.JsonValue) {
  if (typeof value === "string") return value.trim();
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return [value.url, value.storagePath, value.path, value.filename, value.name].find(v => typeof v === "string" && v.trim())?.toString().trim() ?? null;
}
function removeReference(values: Prisma.JsonValue, source: string) {
  if (!Array.isArray(values) || !values.some(value => attachmentSource(value) === source)) throw new DocumentError("รายการไฟล์มีการเปลี่ยนแปลง กรุณาโหลดหน้าใหม่", 409);
  return values.filter(value => attachmentSource(value) !== source) as Prisma.InputJsonValue;
}
async function detachReference(tx: Prisma.TransactionClient, projectId: string, t: DocumentFileTarget) {
  if (t.type === "material-response") {
    const row = await tx.materialRequest.findFirst({ where: { id: t.id, projectId } });
    if (!row || row.responseFileUrl !== t.source) throw new DocumentError("ไม่พบไฟล์แนบของโครงการนี้หรือรายการเปลี่ยนแปลงแล้ว", 409);
    await tx.materialRequest.update({ where: { id: row.id }, data: { responseFileUrl: null } });
  } else if (t.type === "daily-photo") {
    const row = await tx.dailyLog.findFirst({ where: { id: t.id, projectId } });
    if (!row) throw new DocumentError("ไม่พบไฟล์ของโครงการนี้", 404);
    await tx.dailyLog.update({ where: { id: row.id }, data: { photos: removeReference(row.photos, t.source) } });
  } else if (t.type === "qc-photo") {
    const row = await tx.qcInspection.findFirst({ where: { id: t.id, projectId } });
    if (!row) throw new DocumentError("ไม่พบไฟล์ของโครงการนี้", 404);
    await tx.qcInspection.update({ where: { id: row.id }, data: { photos: removeReference(row.photos, t.source) } });
  } else if (t.type === "receiving-file") {
    const row = await tx.receivingRecord.findFirst({ where: { id: t.id, trip: { projectId } } });
    if (!row) throw new DocumentError("ไม่พบไฟล์ของโครงการนี้", 404);
    await tx.receivingRecord.update({ where: { id: row.id }, data: { attachedFiles: removeReference(row.attachedFiles, t.source) } });
  } else throw new DocumentError("ข้อมูลไฟล์ไม่ถูกต้อง");
}
export async function uploadProjectDocument(projectId: string, userId: string, data: FormData) {
  await requireDocumentAccess(projectId, userId, true);
  const meta = documentMetadata(data), file = data.get("file");
  if (!(file instanceof File)) throw new DocumentError("กรุณาเลือกไฟล์เอกสาร");
  const stored = await store(file);
  try {
    return await prisma.$transaction(async tx => {
      const row = await tx.evidenceFile.create({ data: { projectId, createdById: userId, ...meta, ...stored } });
      await tx.auditLog.create({ data: { projectId, userId, action: "DOCUMENT_UPLOADED", entityId: row.id, data: { title: row.title || row.filename, filename: row.filename, category: row.category, revision: row.revision, sizeBytes: row.sizeBytes } } });
      return row.id;
    });
  } catch (error) { await discard(stored.storagePath); throw error; }
}
export async function editProjectDocument(projectId: string, userId: string, target: DocumentFileTarget, data: FormData) {
  await requireDocumentAccess(projectId, userId, true);
  const meta = documentMetadata(data), file = data.get("file");
  const stored = file instanceof File && file.size > 0 ? await store(file) : null;
  try {
    const id = await prisma.$transaction(async tx => {
      let id: string;
      let before: Record<string, unknown> = { filename: target.source.split(/[?#]/)[0].split("/").pop() };
      if (target.type === "evidence") {
        const existing = await tx.evidenceFile.findFirst({ where: { id: target.id, projectId } });
        if (!existing || existing.storagePath !== target.source || target.version && existing.updatedAt.toISOString() !== target.version) throw new DocumentError("รายการไฟล์มีการเปลี่ยนแปลง กรุณาโหลดหน้าใหม่", 409);
        before = { title: existing.title, filename: existing.filename, category: existing.category, revision: existing.revision, reference: existing.reference, description: existing.description };
        const updated = await tx.evidenceFile.update({ where: { id: existing.id }, data: { ...meta, ...(stored || {}) } }); id = updated.id;
      } else {
        await detachReference(tx, projectId, target);
        const row = await tx.evidenceFile.create({ data: { projectId, createdById: userId, ...meta, ...(stored || { filename: target.source.split(/[?#]/)[0].split("/").pop() || meta.title, storagePath: target.source, mimeType: "application/octet-stream", sizeBytes: 0 }) } }); id = row.id;
      }
      await tx.auditLog.create({ data: { projectId, userId, action: "DOCUMENT_UPDATED", entityId: id, data: { title: meta.title, sourceType: target.type, replacedFile: !!stored, before: JSON.parse(JSON.stringify(before)), after: { ...meta, ...(stored ? { filename: stored.filename } : {}) } } } });
      return id;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    if (stored && target.type === "evidence") await discard(target.source);
    return id;
  } catch (error) { if (stored) await discard(stored.storagePath); throw error; }
}
export async function deleteProjectDocument(projectId: string, userId: string, target: DocumentFileTarget) {
  await requireDocumentAccess(projectId, userId, true);
  await prisma.$transaction(async tx => {
    let snapshot = { title: "", filename: target.source.split(/[?#]/)[0].split("/").pop() || "ไฟล์แนบ", category: "", revision: "" };
    if (target.type === "evidence") {
      const existing = await tx.evidenceFile.findFirst({ where: { id: target.id, projectId } });
      if (!existing || existing.storagePath !== target.source || target.version && existing.updatedAt.toISOString() !== target.version) throw new DocumentError("รายการไฟล์มีการเปลี่ยนแปลง กรุณาโหลดหน้าใหม่", 409);
      snapshot = { title: existing.title || existing.filename, filename: existing.filename, category: existing.category, revision: existing.revision || "" };
      await tx.evidenceFile.delete({ where: { id: existing.id } });
    } else await detachReference(tx, projectId, target);
    await tx.auditLog.create({ data: { projectId, userId, action: "DOCUMENT_DELETED", entityId: target.id, data: { ...snapshot, sourceType: target.type } } });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  if (target.type === "evidence") await discard(target.source);
}
export async function readManagedDocument(source: string) { try { return await readFile(/* turbopackIgnore: true */ managedDocumentPath(source)); } catch { throw new DocumentError("ไม่พบไฟล์จัดเก็บ", 404); } }
