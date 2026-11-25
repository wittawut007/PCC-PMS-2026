import { revalidatePath } from "next/cache";
import { documentActor, documentApiError } from "@/lib/document-api";
import { documentTarget, uploadProjectDocument, editProjectDocument, deleteProjectDocument } from "@/lib/document-files";
export const runtime = "nodejs";
type Context = { params: Promise<{ projectId: string }> };
export async function POST(request: Request, context: Context) {
  try {
    const userId = await documentActor(request), { projectId } = await context.params;
    const id = await uploadProjectDocument(projectId, userId, await request.formData());
    revalidatePath("/projects/[id]", "page");
    return Response.json({ id }, { status: 201 });
  } catch (error) { return documentApiError(error); }
}
export async function PATCH(request: Request, context: Context) {
  try {
    const userId = await documentActor(request), { projectId } = await context.params, data = await request.formData();
    const target = documentTarget(JSON.parse(String(data.get("target") || "null")));
    const id = await editProjectDocument(projectId, userId, target, data);
    revalidatePath("/projects/[id]", "page");
    return Response.json({ id });
  } catch (error) { return documentApiError(error); }
}
export async function DELETE(request: Request, context: Context) {
  try {
    const userId = await documentActor(request), { projectId } = await context.params;
    const target = documentTarget((await request.json()).target);
    await deleteProjectDocument(projectId, userId, target);
    revalidatePath("/projects/[id]", "page");
    return Response.json({ success: true });
  } catch (error) { return documentApiError(error); }
}
