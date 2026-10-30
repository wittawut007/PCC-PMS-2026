"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { WorkType, ProjectStatus, ProjectMemberRole, WorkPackageStatus } from "@prisma/client";

export interface CreateProjectInput {
  name: string;
  type: "F" | "RW" | "RWF" | "PT";
  client: string;
  location: string;
  contract?: string;
  contractType?: string;
  paymentTerms?: string;
  value: number;
  budget: number;
  start: string;
  end: string;
  stagingArea?: string;
  accessRoute?: string;
  readiness?: string;
  packages: Array<{
    name: string;
    zone: string;
    target: number;
    unit: string;
    weight: number;
    siteStatus?: string;
    crew?: string;
    crewContact?: string;
    crewUserId?: string;
  }>;
  personnel: {
    pm?: string;
    engineer?: string;
    site?: string;
    qc?: string;
    logistics?: string;
    cost?: string;
  };
}

export async function createProjectAction(input: CreateProjectInput) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("กรุณาเข้าสู่ระบบก่อนทำรายการ");
  }

  // Generate project code: find latest project code for 2026
  const count = await prisma.project.count();
  const nextNum = 26001 + count;
  const projectCode = `PCC-${nextNum}`;

  // Validate weight sum
  const totalWeight = input.packages.reduce((sum, p) => sum + Number(p.weight || 0), 0);
  if (Math.abs(totalWeight - 100) > 0.01) {
    throw new Error("น้ำหนักของชุดงานทั้งหมดต้องรวมกันได้ 100%");
  }

  // Map input type to enum
  const workTypeEnum: WorkType =
    input.type === "RW"
      ? WorkType.RW
      : input.type === "RWF"
      ? WorkType.RWF
      : input.type === "PT"
      ? WorkType.PT
      : WorkType.F;

  // Transaction to create Project, Contract, WorkPackages, and ProjectMembers
  const newProject = await prisma.$transaction(async (tx) => {
    // 1. Create Project
    const project = await tx.project.create({
      data: {
        code: projectCode,
        name: input.name,
        workType: workTypeEnum,
        status: ProjectStatus.ACTIVE,
        clientName: input.client,
        contractNo: input.contract || null,
        siteAddress: input.location,
        startDate: input.start ? new Date(input.start) : null,
        targetDate: input.end ? new Date(input.end) : null,
        notes: input.readiness || `${input.contractType || "Turnkey"} · ${input.paymentTerms || ""}`,
      },
    });

    // 2. Create Contract
    const contractNo = input.contract || `CTR-${projectCode}`;
    await tx.contract.create({
      data: {
        projectId: project.id,
        contractNo: contractNo,
        baseValue: input.value || 0,
        signedDate: input.start ? new Date(input.start) : null,
        notes: `งบประมาณที่อนุมัติ: ${input.budget?.toLocaleString() || 0} บาท · เงื่อนไขชำระเงิน: ${input.paymentTerms || "ตามรอบผลงาน"}`,
      },
    });

    // 3. Create Work Packages
    for (let i = 0; i < input.packages.length; i++) {
      const pkg = input.packages[i];
      const pkgCode = `WP-${input.type}-${String(i + 1).padStart(2, "0")}`;
      await tx.workPackage.create({
        data: {
          projectId: project.id,
          code: pkgCode,
          name: pkg.name,
          zone: pkg.zone || `Zone ${String.fromCharCode(65 + i)}`,
          target: pkg.target || 100,
          unit: pkg.unit || "เมตร",
          weight: pkg.weight || 100,
          status: pkg.siteStatus === "ready" ? WorkPackageStatus.IN_PROGRESS : WorkPackageStatus.PENDING,
          notes: pkg.crew ? `ทีมช่าง: ${pkg.crew} (${pkg.crewContact || "—"})` : null,
        },
      });
    }

    // 4. Create Project Members
    const roleMapping: Record<string, ProjectMemberRole> = {
      pm: ProjectMemberRole.PM,
      engineer: ProjectMemberRole.ENGINEER,
      site: ProjectMemberRole.SITE_ENGINEER,
      qc: ProjectMemberRole.QC_INSPECTOR,
      logistics: ProjectMemberRole.WAREHOUSE,
      cost: ProjectMemberRole.COST_CONTROLLER,
    };

    for (const [key, userId] of Object.entries(input.personnel)) {
      if (userId && roleMapping[key]) {
        await tx.projectMember.create({
          data: {
            projectId: project.id,
            userId: userId,
            roleInProject: roleMapping[key],
          },
        });
      }
    }

    return project;
  });

  revalidatePath("/projects");
  revalidatePath("/dashboard");

  return { success: true, projectId: newProject.id, projectCode: newProject.code };
}
