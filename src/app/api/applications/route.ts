import { auth } from "@clerk/nextjs/server";
import { applicationDraftSchema } from "@/features/applications/schemas";
import {
  applicationsCollection,
  publicApplication,
} from "@/features/applications/server/storage";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return Response.json({ error: "Please sign in again." }, { status: 401 });
  try {
    const records = await applicationsCollection()
      .find({ userId })
      .sort({ appliedAt: -1 })
      .toArray();
    return Response.json(
      { applications: records.map(publicApplication) },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    return Response.json(
      { error: "Could not load applications. Please try again." },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId)
    return Response.json({ error: "Please sign in again." }, { status: 401 });
  const parsed = applicationDraftSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return Response.json(
      { error: "Check your application fields and try again." },
      { status: 400 },
    );
  try {
    const record = {
      ...parsed.data,
      id: crypto.randomUUID(),
      appliedAt: new Date().toISOString(),
      userId,
    };
    await applicationsCollection().insertOne(record);
    return Response.json(
      { application: publicApplication(record) },
      { status: 201 },
    );
  } catch {
    return Response.json(
      { error: "Could not save your application. Please try again." },
      { status: 503 },
    );
  }
}
