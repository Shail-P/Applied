import { useState, type SubmitEvent } from "react";
import { Check, ArrowLeft } from "lucide-react";
import { parseSkills } from "../application-utils";
import { statusLabels, workplaceLabels, type ApplicationDraft } from "../types";

type ApplicationFormProps = {
  initialValues: ApplicationDraft;
  isEditing: boolean;
  onSave: (draft: ApplicationDraft) => void;
  onCancel: () => void;
};

export function ApplicationForm({
  initialValues,
  isEditing,
  onSave,
  onCancel,
}: ApplicationFormProps) {
  const [draft, setDraft] = useState(initialValues);
  const [skillsText, setSkillsText] = useState(initialValues.skills.join(", "));
  const [error, setError] = useState("");

  function updateField<Key extends keyof ApplicationDraft>(
    field: Key,
    value: ApplicationDraft[Key],
  ) {
    setDraft((current) => ({ ...current, [field]: value }));
    setError("");
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!draft.company.trim() || !draft.title.trim()) {
      setError("Add a company and job title before saving.");
      return;
    }

    // Send only draft fields; saved IDs and dates are owned by the tracker.
    onSave({
      company: draft.company.trim(),
      title: draft.title.trim(),
      location: draft.location.trim() || "Not specified",
      workplaceType: draft.workplaceType,
      status: draft.status,
      summary: draft.summary.trim(),
      skills: parseSkills(skillsText),
      jobDescription: draft.jobDescription,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="editor-content">
      <h2 className="text-xl font-semibold tracking-tight">
        {isEditing ? "Edit application" : "Review the details"}
      </h2>
      <p className="mt-2 mb-6 text-sm leading-6 text-zinc-600">
        {isEditing
          ? "Keep the details and status up to date."
          : "Check the details before adding this application to your tracker."}
      </p>

      <div className="space-y-4">
        <label className="field-label">
          Company <span className="text-zinc-500">(required)</span>
          <input
            className="field mt-1.5"
            autoFocus
            required
            maxLength={200}
            value={draft.company}
            onChange={(event) => updateField("company", event.target.value)}
          />
        </label>
        <label className="field-label">
          Job title <span className="text-zinc-500">(required)</span>
          <input
            className="field mt-1.5"
            required
            maxLength={200}
            value={draft.title}
            onChange={(event) => updateField("title", event.target.value)}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="field-label">
            Location
            <input
              className="field mt-1.5"
              maxLength={200}
              placeholder="City or region"
              value={draft.location}
              onChange={(event) => updateField("location", event.target.value)}
            />
          </label>
          <label className="field-label">
            Workplace
            <select
              className="field mt-1.5"
              value={draft.workplaceType}
              onChange={(event) =>
                updateField(
                  "workplaceType",
                  event.target.value as ApplicationDraft["workplaceType"],
                )
              }
            >
              {Object.entries(workplaceLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="field-label">
          Application status
          <select
            className="field mt-1.5"
            value={draft.status}
            onChange={(event) =>
              updateField(
                "status",
                event.target.value as ApplicationDraft["status"],
              )
            }
          >
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="field-label">
          Skills
          <input
            className="field mt-1.5"
            maxLength={2000}
            placeholder="Python, SQL, communication"
            value={skillsText}
            onChange={(event) => setSkillsText(event.target.value)}
            aria-describedby="skills-hint"
          />
          <span
            id="skills-hint"
            className="mt-1.5 block text-xs font-normal text-zinc-500"
          >
            Separate each skill with a comma.
          </span>
        </label>
        <label className="field-label">
          Summary
          <textarea
            className="field mt-1.5"
            rows={3}
            maxLength={1000}
            placeholder="What stands out about this role?"
            value={draft.summary}
            onChange={(event) => updateField("summary", event.target.value)}
          />
        </label>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 pt-5">
        <button
          type="button"
          onClick={onCancel}
          className="button button-quiet"
        >
          <ArrowLeft size={15} aria-hidden="true" /> Cancel
        </button>
        <button type="submit" className="button button-primary">
          <Check size={16} aria-hidden="true" />{" "}
          {isEditing ? "Save changes" : "Submit application"}
        </button>
      </div>
    </form>
  );
}
