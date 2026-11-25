import { prisma } from "@/lib/prisma";
import type { ProjectDocument, ProjectDocumentsData } from "@/lib/project-documents";
import { projectPhotoCategories, projectPhotoCategory } from "@/lib/project-photo-config";

export interface ProjectPhoto {
  id: string; projectId: string; title: string; src: string; href: string; category: string; date: string;
  by: string | null; status: string; packageId: string | null; packageName: string | null; caption: string | null;
  related: { title: string; reference: string; href: string; fields: { label: string; value: string }[] }[];
}
export interface PhotoSourceMetadata { documentId: string; packageId: string | null; date?: string; mimeType?: string; }
export function buildProjectPhotos(projectId: string, library: ProjectDocumentsData, packages: { id: string; code: string; name: string; zone: string | null }[], metadata: PhotoSourceMetadata[]) {
  const photos: ProjectPhoto[] = [], unavailable = new Set<string>(), bySource = new Map<string, ProjectPhoto>();
  const sourceMetadata = new Map(metadata.map(m => [m.documentId, m]));
  for (const doc of library.documents) {
    if (doc.projectId !== projectId || doc.kind !== "file") continue;
    const meta = sourceMetadata.get(doc.id);
    if (!/\.(?:png|jpe?g|webp|gif)(?:[?#].*)?$/i.test(doc.filename || "") && !/^image\/(png|jpeg|webp|gif)$/.test(meta?.mimeType || "")) continue;
    const source = doc.manage?.source || doc.href || doc.filename || doc.id;
    if (!doc.href) { unavailable.add(source); continue; }
    const parentId = sourceParentId(doc);
    const parent = library.documents.find(d => d.id === parentId && d.projectId === projectId) || doc;
    const relatedTab = doc.category === "transport" || doc.category === "materials" ? "transport" : ["installation", "qc", "ncr"].includes(doc.category) ? "installation" : "documents";
    const related = { title: parent.title, reference: parent.reference, href: `/projects/${encodeURIComponent(projectId)}?tab=${relatedTab}`, fields: parent.fields };
    const existing = bySource.get(source);
    if (existing) { if (!existing.related.some(r => r.title === related.title && r.reference === related.reference)) existing.related.push(related); continue; }
    const pkg = packages.find(p => p.id === meta?.packageId);
    const src = doc.href.startsWith(`/api/projects/${encodeURIComponent(projectId)}/documents/`) ? `${doc.href}?inline=1&v=${encodeURIComponent(doc.date)}` : doc.href;
    const photo: ProjectPhoto = { id: doc.id, projectId, title: doc.title, src, href: doc.href, category: projectPhotoCategory(doc.category), date: meta?.date || parent.date, by: doc.by, status: doc.status, packageId: pkg?.id || null, packageName: pkg ? `${pkg.code} · ${pkg.name}${pkg.zone ? ` · ${pkg.zone}` : ""}` : null, caption: doc.description || parent.description, related: [related] };
    bySource.set(source, photo); photos.push(photo);
  }
  photos.sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
  return { projectId, photos, categories: projectPhotoCategories, packages, unavailableCount: unavailable.size, canManage: library.canManage };
}
function sourceParentId(doc: ProjectDocument) {
  const target = doc.manage;
  if (!target) return doc.id;
  return ({ "daily-photo": "daily", "qc-photo": "qc", "receiving-file": "receiving", "material-response": "material", evidence: "evidence" }[target.type]) + "-" + target.id;
}

export async function getProjectPhotos(projectId: string, library: ProjectDocumentsData) {
  const where = { projectId };
  const [packages, logs, inspections, receiving, requests, evidence] = await Promise.all([
    prisma.workPackage.findMany({ where, select: { id: true, code: true, name: true, zone: true }, orderBy: { code: "asc" } }),
    prisma.dailyLog.findMany({ where, select: { id: true, packageId: true, logDate: true } }),
    prisma.qcInspection.findMany({ where, select: { id: true, packageId: true, inspectedAt: true } }),
    prisma.receivingRecord.findMany({ where: { trip: { projectId } }, select: { id: true, receivedAt: true, trip: { select: { packageId: true } } } }),
    prisma.materialRequest.findMany({ where, select: { id: true, packageId: true } }),
    prisma.evidenceFile.findMany({ where, select: { id: true, mimeType: true, dailyLog: { select: { projectId: true, packageId: true, logDate: true } }, record: { select: { projectId: true, packageId: true } } } }),
  ]);
  const metadata: PhotoSourceMetadata[] = library.documents.flatMap<PhotoSourceMetadata>(d => {
    const t = d.manage; if (!t) return [];
    if (t.type === "daily-photo") { const log = logs.find(l => l.id === t.id); return log ? [{ documentId: d.id, packageId: log.packageId, date: log.logDate.toISOString() }] : []; }
    if (t.type === "qc-photo") { const qc = inspections.find(i => i.id === t.id); return qc ? [{ documentId: d.id, packageId: qc.packageId, date: qc.inspectedAt?.toISOString() }] : []; }
    if (t.type === "receiving-file") { const r = receiving.find(i => i.id === t.id); return r ? [{ documentId: d.id, packageId: r.trip.packageId, date: r.receivedAt.toISOString() }] : []; }
    if (t.type === "material-response") { const r = requests.find(i => i.id === t.id); return r ? [{ documentId: d.id, packageId: r.packageId }] : []; }
    const file = evidence.find(f => f.id === t.id);
    return file ? [{ documentId: d.id, packageId: file.dailyLog?.projectId === projectId ? file.dailyLog.packageId : file.record?.projectId === projectId ? file.record.packageId : null, date: file.dailyLog?.projectId === projectId ? file.dailyLog.logDate.toISOString() : undefined, mimeType: file.mimeType }] : [];
  });
  return buildProjectPhotos(projectId, library, packages, metadata);
}
export type ProjectPhotosData = ReturnType<typeof buildProjectPhotos>;
