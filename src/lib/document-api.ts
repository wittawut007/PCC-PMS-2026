import { auth } from "@/auth";
import { Prisma } from "@prisma/client";
import { DocumentError, maxDocumentSize } from "@/lib/document-files";

export async function documentActor(request: Request) {
  const session = await auth();
  if (!session?.user?.id) throw new DocumentError("กรุณาเข้าสู่ระบบ", 401);
  const origin = request.headers.get("origin");
  const url = new URL(request.url);
  const allowedOrigins = new Set([url.origin]);
  const host = request.headers.get("host");
  if (host) allowedOrigins.add(new URL(`${url.protocol}//${host}`).origin);
  const configuredUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL;
  if (configuredUrl) allowedOrigins.add(new URL(configuredUrl).origin);
  if (origin && !allowedOrigins.has(origin)) throw new DocumentError("ไม่สามารถดำเนินการจากเว็บไซต์อื่นได้", 403);
  if (Number(request.headers.get("content-length")) > maxDocumentSize + 65536) throw new DocumentError("ไฟล์ต้องมีขนาดไม่เกิน 25 MB", 413);
  return session.user.id;
}
export function documentApiError(error: unknown) {
  if (error instanceof DocumentError) return Response.json({ error: error.message }, { status: error.status });
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") return Response.json({ error: "รายการไฟล์มีการเปลี่ยนแปลง กรุณาโหลดหน้าใหม่แล้วลองอีกครั้ง" }, { status: 409 });
  if (error instanceof SyntaxError || error instanceof TypeError) return Response.json({ error: "ข้อมูลไฟล์ไม่ถูกต้อง กรุณาลองใหม่" }, { status: 400 });
  console.error("Project document operation failed");
  return Response.json({ error: "ไม่สามารถจัดการเอกสารได้ กรุณาลองอีกครั้ง" }, { status: 500 });
}
