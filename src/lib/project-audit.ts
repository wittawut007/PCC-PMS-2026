import { auth } from "@/auth";
import { documentAccess } from "@/lib/document-files";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

/** Commit the business change and its audit record together. */
export async function auditedMutation<T>(meta: { projectId: string | null; action: string; entityId?: string; data: unknown }, work: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("กรุณาเข้าสู่ระบบก่อนทำรายการ");
  if (meta.projectId && !(await documentAccess(meta.projectId, session.user.id)).write) throw new Error("คุณไม่มีสิทธิ์ทำรายการในโครงการนี้");
  return prisma.$transaction(async tx => {
    const result = await work(tx);
    const id = result && typeof result === "object" && "id" in result ? String(result.id) : undefined;
    await tx.auditLog.create({ data: { projectId: meta.projectId, userId: session.user.id, action: meta.action, entityId: meta.entityId || id, data: JSON.parse(JSON.stringify(meta.data)) } });
    return result;
  });
}
