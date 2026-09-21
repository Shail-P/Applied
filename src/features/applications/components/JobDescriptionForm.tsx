import { useEffect, useRef, useState, type SubmitEvent } from "react";
import { ArrowRight, LoaderCircle, Sparkles } from "lucide-react";
import { createEmptyDraft } from "../application-utils";
import { extractApplication } from "../api";
import { jobDescriptionSchema, MAX_JOB_DESCRIPTION_LENGTH } from "../schemas";
import type { ApplicationDraft } from "../types";

type JobDescriptionFormProps = {
  description: string;
  onDescriptionChange: (description: string) => void;
  onReview: (draft: ApplicationDraft) => void;
};

export function JobDescriptionForm({
  description,
  onDescriptionChange,
  onReview,
}: JobDescriptionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const activeRequest = useRef<AbortController | null>(null);

  // Opening an existing application cancels any extraction still in progress.
  useEffect(() => () => activeRequest.current?.abort(), []);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (activeRequest.current) return;

    const result = jobDescriptionSchema.safeParse(description);
    if (!result.success) {
      setError("Paste a job posting between 30 and 30,000 characters long.");
      return;
    }

    const controller = new AbortController();
    activeRequest.current = controller;
    setIsLoading(true);
    setError("");

    try {
      const details = await extractApplication(result.data, controller.signal);
      if (!controller.signal.aborted) {
        onReview({ ...createEmptyDraft(result.data), ...details });
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        setError(
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
        );
      }
    } finally {
      activeRequest.current = null;
      if (!controller.signal.aborted) setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-busy={isLoading} className="editor-content">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <label htmlFor="job-description" className="text-sm font-semibold">
          Job description
        </label>
        <span className="flex items-center gap-1.5 text-xs text-zinc-500">
          <Sparkles size={13} aria-hidden="true" /> AI assisted
        </span>
      </div>
      <textarea
        id="job-description"
        className="field min-h-56 p-4 text-base leading-7"
        placeholder="Paste the full job posting here…"
        rows={7}
        maxLength={MAX_JOB_DESCRIPTION_LENGTH}
        value={description}
        onChange={(event) => {
          onDescriptionChange(event.target.value);
          setError("");
        }}
        disabled={isLoading}
        aria-describedby={
          error ? "description-error posting-note" : "posting-note"
        }
        aria-invalid={Boolean(error)}
      />
      {error && (
        <p
          id="description-error"
          role="alert"
          className="mt-3 text-sm leading-5 text-red-700"
        >
          {error}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          className="button button-quiet px-2"
          disabled={isLoading}
          onClick={() => onReview(createEmptyDraft(description.trim()))}
        >
          Enter manually
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="button button-primary"
        >
          {isLoading && (
            <LoaderCircle
              size={16}
              className="animate-spin"
              aria-hidden="true"
            />
          )}
          {isLoading ? "Reading posting…" : "Review application"}
          {!isLoading && <ArrowRight size={16} aria-hidden="true" />}
        </button>
      </div>
      <p id="posting-note" className="mt-4 text-xs leading-5 text-zinc-500">
        AI review sends this posting to Google Gemini. You can check and edit
        every detail before saving.
      </p>
      <p role="status" className="sr-only">
        {isLoading
          ? "Reading your job posting. This may take up to a minute."
          : ""}
      </p>
    </form>
  );
}
