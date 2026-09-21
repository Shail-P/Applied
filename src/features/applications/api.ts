import { extractedApplicationSchema } from "./schemas";

// The browser calls our authenticated route. Only the server talks to Gemini.
export async function extractApplication(
  jobDescription: string,
  signal: AbortSignal,
) {
  const response = await fetch("/api/applications/extract", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobDescription }),
    signal,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      typeof data?.error === "string"
        ? data.error
        : "We couldn't read this posting. Please try again or enter it manually.",
    );
  }

  const result = extractedApplicationSchema.safeParse(data?.application);

  if (!result.success) {
    throw new Error(
      "The extracted details were incomplete. Please try again or enter them manually.",
    );
  }

  return result.data;
}
