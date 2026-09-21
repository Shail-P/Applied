// @vitest-environment node
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { POST } from "@/app/api/applications/extract/route";
import { ExtractionError } from "@/features/applications/server/extract-application";

const { authMock, extractMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  extractMock: vi.fn(),
}));
vi.mock("@clerk/nextjs/server", () => ({ auth: authMock }));
vi.mock("server-only", () => ({}));
vi.mock("@/features/applications/server/extract-application", async (load) => ({
  ...(await load<object>()),
  extractApplication: extractMock,
}));

const posting = "Bree is hiring a machine learning intern in Toronto.";
const application = {
  company: "Bree",
  title: "ML Intern",
  location: "Toronto",
  workplaceType: "hybrid",
  skills: ["Python"],
  summary: "Evaluate models.",
};

function request(body = JSON.stringify({ jobDescription: posting })) {
  return new Request("https://example.test/api/applications/extract", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
}

beforeEach(() => {
  authMock.mockReset().mockResolvedValue({ userId: "synthetic-user" });
  extractMock.mockReset();
});
afterEach(() => vi.clearAllMocks());

it("rejects signed-out callers without calling the extraction service", async () => {
  authMock.mockResolvedValueOnce({ userId: null });
  const response = await POST(request());
  expect(response.status).toBe(401);
  expect(await response.json()).toEqual({
    error: "Sign in again to analyze a job description.",
  });
  expect(extractMock).not.toHaveBeenCalled();
});

it("rejects malformed JSON before extraction", async () => {
  const response = await POST(request("{broken"));
  expect(response.status).toBe(400);
  expect(await response.json()).toEqual({ error: "Invalid request body." });
  expect(extractMock).not.toHaveBeenCalled();
});

it.each([
  ["short", "short"],
  ["long", "x".repeat(30_001)],
  ["missing", undefined],
])(
  "rejects a %s description before extraction",
  async (_name, jobDescription) => {
    const response = await POST(request(JSON.stringify({ jobDescription })));
    expect(response.status).toBe(400);
    expect(extractMock).not.toHaveBeenCalled();
  },
);

it("returns the application and trims the posting before extraction", async () => {
  extractMock.mockResolvedValueOnce(application);
  const response = await POST(
    request(JSON.stringify({ jobDescription: `  ${posting}  ` })),
  );
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ application });
  expect(extractMock).toHaveBeenCalledExactlyOnceWith(posting);
});

it("maps known errors without exposing private provider details", async () => {
  const error = new ExtractionError("Please try again shortly.", 429);
  error.cause = new Error("private-provider-secret");
  extractMock.mockRejectedValueOnce(error);
  const response = await POST(request());
  expect(response.status).toBe(429);
  expect(await response.json()).toEqual({ error: "Please try again shortly." });
});

it("sanitizes unexpected failures as a 500 response", async () => {
  extractMock.mockRejectedValueOnce(new Error("private-provider-secret"));
  const response = await POST(request());
  expect(response.status).toBe(500);
  expect(await response.json()).toEqual({
    error: "Could not analyze this posting. Please try again.",
  });
});
