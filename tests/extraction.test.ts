// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { extractApplication } from "@/features/applications/server/extract-application";

// Next.js enforces this import at build time; the unit test runs in Node.
vi.mock("server-only", () => ({}));

const apiKey = "synthetic-key-used-only-with-mocked-fetch";
const posting = "Bree is hiring a machine learning intern in Toronto.";
const application = {
  company: "Bree",
  title: "Machine Learning Intern",
  location: "Toronto",
  workplaceType: "hybrid",
  skills: ["Python", "SQL"],
  summary: "Build and evaluate credit risk models.",
};
const fetchMock = vi.fn<typeof fetch>();

function responseWithText(text: string, finishReason = "STOP") {
  return {
    candidates: [{ content: { parts: [{ text }] }, finishReason }],
  };
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("GEMINI_API_KEY", apiKey);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("Gemini extraction", () => {
  it("sends the key in a header and requests supported structured output", async () => {
    fetchMock.mockResolvedValueOnce(
      Response.json(responseWithText(JSON.stringify(application))),
    );

    await expect(extractApplication(posting)).resolves.toEqual(application);

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).not.toContain(apiKey);
    expect(options?.headers).toMatchObject({ "x-goog-api-key": apiKey });
    expect(options?.signal).toBeInstanceOf(AbortSignal);
    const request = JSON.parse(options?.body as string);
    expect(request.contents[0].parts[0].text).toContain(posting);
    expect(request.generationConfig.responseMimeType).toBe("application/json");
    expect(
      JSON.stringify(request.generationConfig.responseSchema),
    ).not.toContain("additionalProperties");
  });

  it("combines multipart output and ignores thought text", async () => {
    const text = JSON.stringify(application);
    fetchMock.mockResolvedValueOnce(
      Response.json({
        candidates: [
          {
            finishReason: "STOP",
            content: {
              parts: [
                { text: "Internal reasoning, not JSON", thought: true },
                { text: text.slice(0, 40) },
                { text: text.slice(40) },
              ],
            },
          },
        ],
      }),
    );

    await expect(extractApplication(posting)).resolves.toEqual(application);
  });

  it.each([
    ["missing envelope", {}],
    ["empty candidates", { candidates: [] }],
    [
      "invalid text type",
      { candidates: [{ content: { parts: [{ text: 123 }] } }] },
    ],
    ["empty text", responseWithText("")],
    ["malformed JSON", responseWithText("not json")],
    ["missing fields", responseWithText('{"company":"Bree"}')],
    [
      "unsupported workplace",
      responseWithText(
        JSON.stringify({ ...application, workplaceType: "office" }),
      ),
    ],
    [
      "truncated output",
      responseWithText(JSON.stringify(application), "MAX_TOKENS"),
    ],
  ])("rejects %s", async (_name, body) => {
    fetchMock.mockResolvedValueOnce(Response.json(body));

    await expect(extractApplication(posting)).rejects.toMatchObject({
      name: "ExtractionError",
      status: 502,
    });
  });

  it("reports rate limits without exposing the provider response", async () => {
    fetchMock.mockResolvedValueOnce(
      Response.json({ message: apiKey }, { status: 429 }),
    );

    await expect(extractApplication(posting)).rejects.toMatchObject({
      status: 429,
      message: "The analysis limit has been reached. Please try again shortly.",
    });
  });

  it("sanitizes provider failures and logs only their status", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    fetchMock.mockResolvedValueOnce(
      Response.json({ message: apiKey }, { status: 400 }),
    );

    await expect(extractApplication(posting)).rejects.toMatchObject({
      status: 502,
      message: "Could not analyze this posting. Please try again.",
    });
    expect(log).toHaveBeenCalledWith("Gemini extraction failed", {
      status: 400,
    });
    expect(JSON.stringify(log.mock.calls)).not.toContain(apiKey);
  });

  it("returns a specific timeout error", async () => {
    fetchMock.mockRejectedValueOnce(
      new DOMException("Private timeout details", "TimeoutError"),
    );

    await expect(extractApplication(posting)).rejects.toMatchObject({
      status: 504,
      message: "The analysis took too long. Please try again.",
    });
  });

  it("sanitizes unexpected network errors", async () => {
    fetchMock.mockRejectedValueOnce(new Error(apiKey));

    await expect(extractApplication(posting)).rejects.toMatchObject({
      status: 502,
      message: "Could not analyze this posting. Please try again.",
    });
  });

  it("reports missing configuration before making a request", async () => {
    vi.stubEnv("GEMINI_API_KEY", undefined);

    await expect(extractApplication(posting)).rejects.toMatchObject({
      name: "ExtractionError",
      status: 503,
      message: "Job analysis is not configured yet.",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
