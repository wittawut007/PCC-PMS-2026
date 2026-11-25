import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { documentApiError } from "@/lib/document-api";
import { DocumentError, requireDocumentAccess, readManagedDocument } from "@/lib/document-files";
export const runtime = "nodejs";
export async function GET(request: Request, context: { params: Promise<{ projectId: string; fileId: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new DocumentError("กรุณาเข้าสู่ระบบ", 401);
    const { projectId, fileId } = await context.params;
    await requireDocumentAccess(projectId, session.user.id);
    const file = await prisma.evidenceFile.findFirst({ where: { id: fileId, projectId } });
    if (!file) throw new DocumentError("ไม่พบไฟล์ของโครงการนี้", 404);
    const bytes = await readManagedDocument(file.storagePath);
    const filename = encodeURIComponent(file.filename).replace(/['()*]/g, c => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
    const disposition = new URL(request.url).searchParams.get("inline") === "1" && ["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.mimeType) ? "inline" : "attachment";
    return new Response(new Uint8Array(bytes), { headers: { "Content-Type": file.mimeType, "Content-Length": String(bytes.length), "Content-Disposition": `${disposition}; filename="document"; filename*=UTF-8''${filename}`, "X-Content-Type-Options": "nosniff", "Cache-Control": "private, no-store", "Content-Security-Policy": "sandbox" } });
  } catch (error) { return documentApiError(error); }
}
