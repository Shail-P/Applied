import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { jobDescriptionSchema } from "@/features/applications/schemas";
import {
  extractApplication,
  ExtractionError,
} from "@/features/applications/server/extract-application";

const requestSchema = z.object({ jobDescription: jobDescriptionSchema });

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return Response.json(
      { error: "Sign in again to analyze a job description." },
      { status: 401 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      {
        error: "Paste a job description between 30 and 30,000 characters long.",
      },
      { status: 400 },
    );
  }

  try {
    const application = await extractApplication(parsed.data.jobDescription);
    return Response.json({ application });
  } catch (error) {
    if (error instanceof ExtractionError) {
      return Response.json({ error: error.message }, { status: error.status });
    }

    return Response.json(
      { error: "Could not analyze this posting. Please try again." },
      { status: 500 },
    );
  }
}
