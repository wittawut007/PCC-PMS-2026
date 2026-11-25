import { prisma } from "@/lib/prisma";

const iso = (date: Date | null) => date?.toISOString() ?? null;

export function parseInstallationTaskNotes(notes: string | null) {
  if (!notes) return { notes: null, responsible: null };
  try {
    const meta = JSON.parse(notes);
    if (meta && typeof meta === "object" && !Array.isArray(meta)) return {
      notes: typeof meta.notes === "string" ? meta.notes : null,
      responsible: typeof meta.responsible === "string" ? meta.responsible : null,
    };
    return { notes: typeof meta === "string" ? meta : null, responsible: null };
  } catch { return { notes, responsible: null }; }
}

export function summarizeInstallationTasks(tasks: { status: string; isGate: boolean }[]) {
  const installation = tasks.filter(t => !t.isGate && t.status !== "SKIPPED");
  const total = installation.length;
  const done = installation.filter(t => t.status === "DONE" || t.status === "QC_PASSED").length;
  const qc = installation.filter(t => t.status === "QC_PASSED").length;
  return { total, done, qc, donePct: total ? Math.round(done / total * 100) : 0, qcPct: total ? Math.round(qc / total * 100) : 0 };
}

export interface InstallationGate {
  id: string;
  projectCode: string;
  packageId: string | null;
  packageCode: string | null;
  code: string;
  title: string;
  status: string;
  approver: string | null;
  action: string;
  zone: string | null;
  testResult: string | null;
  standardRef: string | null;
  notes: string | null;
  updatedAt: string | null;
  source: "record" | "plan";
  plannedStart: string | null;
  plannedEnd: string | null;
  responsible: string | null;
  taskStatus: string | null;
}

interface GatePlanPackage {
  id: string;
  projectCode: string;
  code: string;
  zone: string | null;
  tasks: { id: string; code: string; name: string; isGate: boolean; gateCode: string | null; status: string; plannedStart: string | null; plannedEnd: string | null; responsible: string | null; dependsOn: string[] }[];
}

export function mergeInstallationGates(packages: GatePlanPackage[], records: InstallationGate[]): InstallationGate[] {
  const result = [...records];
  for (const p of packages) {
    for (const t of p.tasks.filter(task => task.isGate)) {
      const code = t.gateCode || t.code;
      // A project-wide decision covers its code across packages. A package decision covers only that package.
      const covered = result.some(g => g.projectCode === p.projectCode && g.code === code && (g.packageId === null || g.packageId === p.id));
      if (covered) continue;
      const next = p.tasks.filter(task => task.dependsOn.some(dependency => dependency === t.id || dependency.split(/\s+/)[0] === t.code));
      result.push({
        id: `plan-${t.id}`, projectCode: p.projectCode, packageId: p.id, packageCode: p.code,
        code, title: t.name, status: "NO_DECISION", approver: null,
        action: next.length ? next.map(task => `${task.code} · ${task.name}`).join(" / ") : "ยังไม่ระบุขั้นตอนถัดไปที่เชื่อมกับจุดตรวจนี้",
        zone: p.zone, testResult: null, standardRef: null, notes: null, updatedAt: null,
        source: "plan", plannedStart: t.plannedStart, plannedEnd: t.plannedEnd, responsible: t.responsible, taskStatus: t.status,
      });
    }
  }
  return result.sort((a, b) => a.projectCode.localeCompare(b.projectCode, "en", { numeric: true }) || (a.packageCode || "").localeCompare(b.packageCode || "", "en", { numeric: true }) || a.code.localeCompare(b.code, "en", { numeric: true }));
}

export async function getInstallationTimeline(projectId?: string) {
  const where = projectId ? { projectId } : {};
  const [packages, inspections, gates, logs, ncrs] = await Promise.all([
    prisma.workPackage.findMany({ where, include: { project: { select: { id: true, code: true, name: true } }, tasks: { orderBy: [{ stepIndex: "asc" }, { code: "asc" }] } }, orderBy: [{ projectId: "asc" }, { code: "asc" }] }),
    prisma.qcInspection.findMany({ where, include: { workPackage: { select: { code: true } }, project: { select: { code: true } } }, orderBy: { createdAt: "asc" } }),
    prisma.approvalGate.findMany({ where, include: { workPackage: { select: { code: true } }, project: { select: { code: true } } }, orderBy: { gateCode: "asc" } }),
    prisma.dailyLog.findMany({ where, include: { createdBy: { select: { name: true } }, project: { select: { code: true } } }, orderBy: { logDate: "asc" } }),
    prisma.ncrRecord.findMany({ where, include: { project: { select: { code: true } } }, orderBy: { createdAt: "desc" } }),
  ]);
  const workPackages = packages.map(p => ({
    id: p.id, projectId: p.projectId, projectCode: p.project.code, projectName: p.project.name,
    code: p.code, name: p.name, zone: p.zone, target: Number(p.target), unit: p.unit, weight: Number(p.weight), status: p.status,
    ...summarizeInstallationTasks(p.tasks),
    tasks: p.tasks.map(t => ({ id: t.id, code: t.code, name: t.name, step: t.stepIndex, status: t.status, isGate: t.isGate, gateCode: t.gateCode, plannedStart: iso(t.plannedStart), plannedEnd: iso(t.plannedEnd), actualStart: iso(t.actualStart), actualEnd: iso(t.actualEnd), dependsOn: t.dependsOn, ...parseInstallationTaskNotes(t.notes) })),
  }));
  const approvalGates = mergeInstallationGates(workPackages, gates.map(g => ({
    id: g.id, projectCode: g.project.code, packageId: g.packageId, packageCode: g.workPackage?.code ?? null,
    code: g.gateCode, title: g.title, status: g.status, approver: g.approver, action: g.unlockedAction,
    zone: g.pourZone, testResult: g.testResult, standardRef: g.standardRef, notes: g.notes, updatedAt: iso(g.updatedAt),
    source: "record", plannedStart: null, plannedEnd: null, responsible: null, taskStatus: null,
  })));
  // Apply package weights within each project, then average projects equally.
  const projectIds = [...new Set(workPackages.map(p => p.projectId))];
  const progress = (field: "donePct" | "qcPct") => {
    if (!projectIds.length) return 0;
    return Math.round(projectIds.reduce((sum, id) => {
      const group = workPackages.filter(p => p.projectId === id);
      const weights = group.reduce((n, p) => n + Math.max(0, p.weight), 0);
      return sum + group.reduce((n, p) => n + p[field] * (weights ? Math.max(0, p.weight) / weights : 1 / group.length), 0);
    }, 0) / projectIds.length);
  };
  return {
    workPackages,
    stats: { donePct: progress("donePct"), qcPct: progress("qcPct"), pendingGates: gates.filter(g => ["PENDING", "SUBMITTED", "UNDER_REVIEW"].includes(g.status)).length, approvedGates: gates.filter(g => ["PASSED", "APPROVED"].includes(g.status)).length, totalGates: approvalGates.length, unrecordedGates: approvalGates.filter(g => g.source === "plan").length, openNcrs: ncrs.filter(n => n.status !== "CLOSED").length },
    gates: approvalGates,
    inspections: inspections.map(i => ({ id: i.id, projectCode: i.project.code, packageId: i.packageId, packageCode: i.workPackage?.code ?? null, code: i.inspectionNo, scope: i.scope, drawingRef: i.drawingRef, status: i.status, inspector: i.inspector, inspectedAt: iso(i.inspectedAt), createdAt: iso(i.createdAt), notes: i.notes, ncrCode: i.ncrCode,
      checklist: Array.isArray(i.checklist) ? i.checklist.flatMap(value => {
        if (!value || typeof value !== "object" || Array.isArray(value)) return [];
        return [{ item: String(value.item ?? "รายการตรวจ"), status: String(value.statusLabel ?? value.status ?? "ยังไม่ระบุ"), ref: String(value.ref ?? "") }];
      }) : [] })),
    logs: logs.map(l => ({ id: l.id, projectCode: l.project.code, packageId: l.packageId, taskId: l.taskId, date: iso(l.logDate), activity: l.activity, location: l.location, quantity: l.quantity === null ? null : Number(l.quantity), unit: l.unit, status: l.status, qcStatus: l.qcStatus, description: l.description, issues: l.issues, by: l.createdBy?.name ?? null })),
    ncrs: ncrs.map(n => ({ id: n.id, projectCode: n.project?.code, code: n.code, description: n.description, status: n.status, assignedTo: n.assignedTo, location: n.location, dueDate: iso(n.dueDate), correctiveAction: n.correctiveAction, referenceDoc: n.referenceDoc })),
  };
}

export type InstallationTimelineData = Awaited<ReturnType<typeof getInstallationTimeline>>;
