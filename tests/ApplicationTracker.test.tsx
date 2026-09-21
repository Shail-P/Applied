import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApplicationTracker } from "@/features/applications/components/ApplicationTracker";
import type { ExtractedApplication } from "@/features/applications/schemas";

const posting =
  "Bree is hiring a Machine Learning Engineering Intern in Toronto for an eight-month hybrid co-op.";
const extracted: ExtractedApplication = {
  company: "Bree",
  title: "Machine Learning Engineering Intern",
  location: "Toronto",
  workplaceType: "hybrid",
  skills: ["Python", "SQL"],
  summary: "Build credit risk models and production monitoring tools.",
};

const fetchMock = vi.fn<typeof fetch>();
let user: ReturnType<typeof userEvent.setup>;

beforeEach(() => {
  user = userEvent.setup();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

async function reviewPosting(details = extracted) {
  fetchMock.mockResolvedValueOnce(Response.json({ application: details }));
  fireEvent.change(screen.getByLabelText("Job description"), {
    target: { value: posting },
  });
  await user.click(screen.getByRole("button", { name: "Review application" }));
  await screen.findByRole("heading", { name: "Review the details" });
}

async function addApplication(details = extracted) {
  await reviewPosting(details);
  await user.click(screen.getByRole("button", { name: "Submit application" }));
}

describe("ApplicationTracker", () => {
  it("reviews extracted fields, lets the user correct them, and adds a card", async () => {
    render(<ApplicationTracker />);
    expect(
      screen.getByRole("heading", { name: "No applications yet" }),
    ).toBeDefined();

    await reviewPosting();
    expect((screen.getByLabelText(/Company/) as HTMLInputElement).value).toBe(
      "Bree",
    );
    expect(
      (screen.getByRole("textbox", { name: /Skills/ }) as HTMLInputElement)
        .value,
    ).toBe("Python, SQL");

    fireEvent.change(screen.getByLabelText(/Job title/), {
      target: { value: "ML Engineering Co-op" },
    });
    await user.click(
      screen.getByRole("button", { name: "Submit application" }),
    );

    const card = within(screen.getByRole("article"));
    expect(
      card.getByRole("heading", { name: "ML Engineering Co-op" }),
    ).toBeDefined();
    expect(card.getByText("Bree")).toBeDefined();
    expect(card.getByText("Hybrid")).toBeDefined();
    expect(card.getByText("Python")).toBeDefined();
    expect(screen.getByText("1 application")).toBeDefined();
    expect(
      (screen.getByLabelText("Job description") as HTMLTextAreaElement).value,
    ).toBe("");

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/applications/extract");
    expect(options?.method).toBe("POST");
    expect(JSON.parse(options?.body as string)).toEqual({
      jobDescription: posting,
    });
  });

  it("edits the existing card while preserving its original posting and date", async () => {
    render(<ApplicationTracker />);
    await addApplication();
    const originalDate = screen.getByText(/^Added /).getAttribute("datetime");

    await user.click(screen.getByRole("button", { name: /^Edit .+ at Bree$/ }));
    expect((screen.getByLabelText(/Company/) as HTMLInputElement).value).toBe(
      "Bree",
    );
    expect(
      (screen.getByRole("textbox", { name: /Skills/ }) as HTMLInputElement)
        .value,
    ).toBe("Python, SQL");
    fireEvent.change(screen.getByLabelText(/Company/), {
      target: { value: "Bree Financial" },
    });
    await user.selectOptions(
      screen.getByLabelText("Application status"),
      "interview",
    );
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(screen.getAllByRole("article")).toHaveLength(1);
    const card = within(screen.getByRole("article"));
    expect(card.getByText("Bree Financial")).toBeDefined();
    expect(card.getByText("Interview")).toBeDefined();
    expect(card.getByText(/^Added /).getAttribute("datetime")).toBe(
      originalDate,
    );
    await user.click(card.getByText("Original job posting"));
    expect(card.getByText(posting)).toBeDefined();
    expect(screen.getByText("1 application")).toBeDefined();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("cancels a new review without losing the pasted posting or adding a card", async () => {
    render(<ApplicationTracker />);
    await reviewPosting();
    fireEvent.change(screen.getByLabelText(/Company/), {
      target: { value: "Unsaved change" },
    });
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(
      (screen.getByLabelText("Job description") as HTMLTextAreaElement).value,
    ).toBe(posting);
    expect(screen.queryByRole("article")).toBeNull();
    expect(screen.getByText("0 applications")).toBeDefined();
  });

  it("keeps a separately pasted posting when saving edits to an existing application", async () => {
    render(<ApplicationTracker />);
    await addApplication();
    const pendingPosting =
      "Northstar is hiring a frontend developer to build accessible interfaces in Vancouver.";
    fireEvent.change(screen.getByLabelText("Job description"), {
      target: { value: pendingPosting },
    });

    await user.click(screen.getByRole("button", { name: /^Edit .+ at Bree$/ }));
    await user.selectOptions(
      screen.getByLabelText("Application status"),
      "interview",
    );
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    const postingInput = screen.getByLabelText(
      "Job description",
    ) as HTMLTextAreaElement;
    expect(postingInput.value).toBe(pendingPosting);
    expect(
      within(screen.getByRole("article")).getByText("Interview"),
    ).toBeDefined();
    await waitFor(() => expect(document.activeElement).toBe(postingInput));
  });

  it("aborts pending analysis when editing a saved application and ignores its late response", async () => {
    render(<ApplicationTracker />);
    await addApplication();
    let finishRequest!: (response: Response) => void;
    fetchMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishRequest = resolve;
        }),
    );
    fireEvent.change(screen.getByLabelText("Job description"), {
      target: {
        value: "Northstar is hiring a frontend developer in Vancouver.",
      },
    });
    await user.click(
      screen.getByRole("button", { name: "Review application" }),
    );
    const signal = fetchMock.mock.calls[1][1]?.signal;
    expect(signal?.aborted).toBe(false);

    await user.click(screen.getByRole("button", { name: /^Edit .+ at Bree$/ }));
    expect(signal?.aborted).toBe(true);
    // Even a provider that completes after cancellation must not replace the editor.
    await act(async () => {
      finishRequest(
        Response.json({ application: { ...extracted, company: "Northstar" } }),
      );
    });

    expect(
      screen.getByRole("heading", { name: "Edit application" }),
    ).toBeDefined();
    expect((screen.getByLabelText(/Company/) as HTMLInputElement).value).toBe(
      "Bree",
    );
    expect(
      screen.queryByRole("heading", { name: "Review the details" }),
    ).toBeNull();
    expect(screen.getAllByRole("article")).toHaveLength(1);
  });

  it("cancels edits without changing the saved application", async () => {
    render(<ApplicationTracker />);
    await addApplication();
    await user.click(screen.getByRole("button", { name: /^Edit .+ at Bree$/ }));
    fireEvent.change(screen.getByLabelText(/Company/), {
      target: { value: "Unsaved company" },
    });
    await user.selectOptions(
      screen.getByLabelText("Application status"),
      "rejected",
    );
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    const card = within(screen.getByRole("article"));
    expect(card.getByText("Bree")).toBeDefined();
    expect(card.getByText("Applied")).toBeDefined();
    expect(card.queryByText("Unsaved company")).toBeNull();
  });

  it("searches every useful field and combines search with status filters", async () => {
    render(<ApplicationTracker />);
    await addApplication();
    await addApplication({
      company: "Northstar",
      title: "Frontend Developer",
      location: "Vancouver",
      workplaceType: "remote",
      skills: ["React"],
      summary: "Build accessible interfaces.",
    });
    expect(screen.getAllByRole("article")).toHaveLength(2);

    const search = screen.getByRole("searchbox", {
      name: "Search applications",
    });
    for (const query of [
      "  BREE  ",
      "machine learning",
      "toronto",
      "python",
      "monitoring",
    ]) {
      fireEvent.change(search, { target: { value: query } });
      expect(screen.getAllByRole("article")).toHaveLength(1);
      expect(
        within(screen.getByRole("article")).getByText("Bree"),
      ).toBeDefined();
    }

    await user.selectOptions(
      screen.getByLabelText("Filter by status"),
      "offer",
    );
    expect(screen.queryByRole("article")).toBeNull();
    expect(
      screen.getByRole("heading", { name: "No matching applications" }),
    ).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(screen.getAllByRole("article")).toHaveLength(2);
    expect((search as HTMLInputElement).value).toBe("");
    expect(
      (screen.getByLabelText("Filter by status") as HTMLSelectElement).value,
    ).toBe("all");

    fireEvent.change(search, {
      target: { value: "a company that does not exist" },
    });
    expect(
      screen.getByRole("heading", { name: "No matching applications" }),
    ).toBeDefined();
  });

  it("deletes a saved application immediately", async () => {
    render(<ApplicationTracker />);
    await addApplication();
    await user.click(
      screen.getByRole("button", { name: /^Delete .+ at Bree$/ }),
    );

    expect(screen.queryByRole("article")).toBeNull();
    expect(screen.getByText("0 applications")).toBeDefined();
    expect(screen.getByText("Application deleted.")).toBeDefined();
    expect(
      screen.getByRole("heading", { name: "No applications yet" }),
    ).toBeDefined();
  });

  it("disables editing and prevents duplicate analysis while a request is pending", async () => {
    let finishRequest!: (response: Response) => void;
    fetchMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishRequest = resolve;
        }),
    );
    render(<ApplicationTracker />);
    fireEvent.change(screen.getByLabelText("Job description"), {
      target: { value: posting },
    });
    await user.dblClick(
      screen.getByRole("button", { name: "Review application" }),
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(
      (screen.getByLabelText("Job description") as HTMLTextAreaElement)
        .disabled,
    ).toBe(true);
    expect(
      (
        screen.getByRole("button", {
          name: "Reading posting…",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    expect(
      (
        screen.getByRole("button", {
          name: "Enter manually",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);

    await act(async () => {
      finishRequest(Response.json({ application: extracted }));
    });
    expect(
      screen.getByRole("heading", { name: "Review the details" }),
    ).toBeDefined();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("shows analysis errors and lets the user save manually without another request", async () => {
    fetchMock.mockResolvedValueOnce(
      Response.json({ error: "Please try again shortly." }, { status: 429 }),
    );
    render(<ApplicationTracker />);
    fireEvent.change(screen.getByLabelText("Job description"), {
      target: { value: posting },
    });
    await user.click(
      screen.getByRole("button", { name: "Review application" }),
    );
    expect((await screen.findByRole("alert")).textContent).toBe(
      "Please try again shortly.",
    );
    expect(
      (screen.getByLabelText("Job description") as HTMLTextAreaElement).value,
    ).toBe(posting);

    await user.click(screen.getByRole("button", { name: "Enter manually" }));
    fireEvent.change(screen.getByLabelText(/Company/), {
      target: { value: "Bree" },
    });
    fireEvent.change(screen.getByLabelText(/Job title/), {
      target: { value: "ML Intern" },
    });
    await user.click(
      screen.getByRole("button", { name: "Submit application" }),
    );

    const card = within(screen.getByRole("article"));
    expect(card.getByRole("heading", { name: "ML Intern" })).toBeDefined();
    await user.click(card.getByText("Original job posting"));
    expect(card.getByText(posting)).toBeDefined();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("rejects a short posting before making a request", async () => {
    render(<ApplicationTracker />);
    fireEvent.change(screen.getByLabelText("Job description"), {
      target: { value: "Too short" },
    });
    await user.click(
      screen.getByRole("button", { name: "Review application" }),
    );

    expect(screen.getByRole("alert").textContent).toContain(
      "between 30 and 30,000 characters",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
