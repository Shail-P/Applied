import { auth } from "@clerk/nextjs/server";
import { applicationDraftSchema } from "@/features/applications/schemas";
import {
  applicationsCollection,
  publicApplication,
} from "@/features/applications/server/storage";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  const { userId } = await auth();
  if (!userId)
    return Response.json({ error: "Please sign in again." }, { status: 401 });
  const { id } = await context.params;
  const parsed = applicationDraftSchema
    .omit({ jobDescription: true })
    .safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return Response.json(
      { error: "Check your application fields and try again." },
      { status: 400 },
    );
  try {
    const record = await applicationsCollection().findOneAndUpdate(
      { id, userId },
      { $set: parsed.data },
      { returnDocument: "after" },
    );
    if (!record)
      return Response.json(
        { error: "Application not found." },
        { status: 404 },
      );
    return Response.json({ application: publicApplication(record) });
  } catch {
    return Response.json(
      { error: "Could not update your application. Please try again." },
      { status: 503 },
    );
  }
}

export async function DELETE(_request: Request, context: Context) {
  const { userId } = await auth();
  if (!userId)
    return Response.json({ error: "Please sign in again." }, { status: 401 });
  const { id } = await context.params;
  try {
    const result = await applicationsCollection().deleteOne({ id, userId });
    if (!result.deletedCount)
      return Response.json(
        { error: "Application not found." },
        { status: 404 },
      );
    return new Response(null, { status: 204 });
  } catch {
    return Response.json(
      { error: "Could not delete your application. Please try again." },
      { status: 503 },
    );
  }
}
