"use server";

import { auditedMutation } from "@/lib/project-audit";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { TaskStatus } from "@prisma/client";
import { getTemplateForWorkType, defaultPlan } from "@/lib/templates";

export interface SerializedTask {
  id: string;
  projectId: string;
  packageId: string;
  code: string;
  name: string;
  stepIndex: number;
  status: "pending" | "in_progress" | "completed" | "blocked";
  plannedStart: string;
  plannedEnd: string;
  actualStart: string | null;
  actualEnd: string | null;
  dependsOn: string[];
  isGate: boolean;
  gateCode: string | null;
  type: "Task" | "Milestone" | "Hold Point" | "Summary";
  responsible: string;
  duration: number;
}

export interface SerializedPackage {
  id: string;
  code: string;
  name: string;
  zone: string;
  target: number;
  unit: string;
  weight: number;
  status: string;
  tasks: SerializedTask[];
}

export interface SerializedProject {
  id: string;
  code: string;
  name: string;
  workType: string;
  status: string;
  clientName: string | null;
  siteAddress: string | null;
  startDate: string | null;
  targetDate: string | null;
  packages: SerializedPackage[];
}

export async function getPlanningData(targetProjectId?: string): Promise<{
  projects: { id: string; code: string; name: string; workType: string }[];
  currentProject: SerializedProject | null;
}> {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  // 1. Get all projects for switcher dropdown
  const projectsList = await prisma.project.findMany({
    orderBy: { code: "asc" },
    select: {
      id: true,
      code: true,
      name: true,
      workType: true,
    },
  });

  if (projectsList.length === 0) {
    return { projects: [], currentProject: null };
  }

  const selectedId = targetProjectId || projectsList[0].id;

  // 2. Fetch full project details with packages and tasks
  const project = await prisma.project.findUnique({
    where: { id: selectedId },
    include: {
      workPackages: {
        orderBy: { code: "asc" },
        include: {
          tasks: {
            orderBy: { stepIndex: "asc" },
          },
        },
      },
    },
  });

  if (!project) {
    return { projects: projectsList, currentProject: null };
  }

  const serializedPackages: SerializedPackage[] = project.workPackages.map((pkg) => {
    const tasks: SerializedTask[] = pkg.tasks.map((t) => {
      let meta: { type?: string; responsible?: string; duration?: number } = {};
      try {
        if (t.notes) meta = JSON.parse(t.notes);
      } catch {
        meta = {};
      }

      let mappedStatus: "pending" | "in_progress" | "completed" | "blocked" = "pending";
      if (t.status === TaskStatus.DONE || t.status === TaskStatus.QC_PASSED) {
        mappedStatus = "completed";
      } else if (t.status === TaskStatus.IN_PROGRESS) {
        mappedStatus = "in_progress";
      } else if (t.status === TaskStatus.BLOCKED) {
        mappedStatus = "blocked";
      }

      const pStart = t.plannedStart ? t.plannedStart.toISOString().slice(0, 10) : "";
      const pEnd = t.plannedEnd ? t.plannedEnd.toISOString().slice(0, 10) : pStart;

      return {
        id: t.id,
        projectId: t.projectId,
        packageId: t.packageId,
        code: t.code,
        name: t.name,
        stepIndex: t.stepIndex,
        status: mappedStatus,
        plannedStart: pStart,
        plannedEnd: pEnd,
        actualStart: t.actualStart ? t.actualStart.toISOString().slice(0, 10) : null,
        actualEnd: t.actualEnd ? t.actualEnd.toISOString().slice(0, 10) : null,
        dependsOn: t.dependsOn,
        isGate: t.isGate,
        gateCode: t.gateCode,
        type: (meta.type as any) || (t.isGate ? "Milestone" : "Task"),
        responsible: meta.responsible || "วิศวกรโครงการ",
        duration: meta.duration || 1,
      };
    });

    return {
      id: pkg.id,
      code: pkg.code,
      name: pkg.name,
      zone: pkg.zone || "",
      target: Number(pkg.target),
      unit: pkg.unit,
      weight: Number(pkg.weight),
      status: pkg.status,
      tasks,
    };
  });

  return {
    projects: projectsList,
    currentProject: {
      id: project.id,
      code: project.code,
      name: project.name,
      workType: project.workType,
      status: project.status,
      clientName: project.clientName,
      siteAddress: project.siteAddress,
      startDate: project.startDate ? project.startDate.toISOString().slice(0, 10) : null,
      targetDate: project.targetDate ? project.targetDate.toISOString().slice(0, 10) : null,
      packages: serializedPackages,
    },
  };
}

export async function updateTaskScheduleAction(data: {
  taskId: string;
  plannedStart: string;
  plannedEnd: string;
  status?: "pending" | "in_progress" | "completed";
  responsible?: string;
}) {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const existing = await prisma.task.findUnique({
    where: { id: data.taskId },
  });

  if (!existing) {
    throw new Error("Task not found");
  }

  let meta: any = {};
  try {
    if (existing.notes) meta = JSON.parse(existing.notes);
  } catch {
    meta = {};
  }

  if (data.responsible) {
    meta.responsible = data.responsible;
  }

  const startMs = new Date(data.plannedStart + "T00:00:00Z").getTime();
  const endMs = new Date(data.plannedEnd + "T00:00:00Z").getTime();
  meta.duration = Math.max(1, Math.round((endMs - startMs) / 86400000) + 1);

  let dbStatus = existing.status;
  if (data.status === "completed") {
    dbStatus = TaskStatus.DONE;
  } else if (data.status === "in_progress") {
    dbStatus = TaskStatus.IN_PROGRESS;
  } else if (data.status === "pending") {
    dbStatus = TaskStatus.PENDING;
  }

  await auditedMutation({ projectId: existing.projectId, action: "PLAN_UPDATED", entityId: existing.id, data: { title: existing.name, reference: existing.code, before: { plannedStart: existing.plannedStart, plannedEnd: existing.plannedEnd, status: existing.status }, after: { ...data, status: dbStatus } } }, async tx => {
  await tx.task.update({
    where: { id: data.taskId },
    data: {
      plannedStart: new Date(data.plannedStart),
      plannedEnd: new Date(data.plannedEnd),
      status: dbStatus,
      notes: JSON.stringify(meta),
    },
  });


  });

  revalidatePath("/planning");
  revalidatePath(`/projects/${existing.projectId}`);
  return { success: true };
}

export async function resetProjectPlanAction(projectId: string, packageId: string) {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });
  if (!project) throw new Error("Project not found");

  const template = getTemplateForWorkType(project.workType);
  const startStr = project.startDate ? project.startDate.toISOString().slice(0, 10) : "2026-10-01";
  const planItems = defaultPlan(template, startStr);

  await auditedMutation({ projectId, action: "PLAN_RESET", entityId: packageId, data: { title: "คืนค่าแผนชุดงาน", packageId, startDate: startStr } }, async tx => {
  for (let idx = 0; idx < planItems.length; idx++) {
    const item = planItems[idx];
    const existing = await tx.task.findFirst({
      where: { packageId, code: item.code },
    });

    if (existing) {
      await tx.task.update({
        where: { id: existing.id },
        data: {
          plannedStart: new Date(item.start),
          plannedEnd: new Date(item.end),
          notes: JSON.stringify({ type: item.type, responsible: item.responsible, duration: item.duration }),
        },
      });
    }
  }


  });

  revalidatePath("/planning");
  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}
