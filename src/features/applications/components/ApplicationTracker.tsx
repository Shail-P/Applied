"use client";

import { useState } from "react";
import type { Application, ApplicationDraft } from "../types";
import { useApplications } from "../hooks/useApplications";
import { ApplicationForm } from "./ApplicationForm";
import { ApplicationList } from "./ApplicationList";
import { JobDescriptionForm } from "./JobDescriptionForm";

type Editor =
  | { mode: "create"; draft: ApplicationDraft }
  | { mode: "edit"; application: Application };

export function ApplicationTracker() {
  const {
    applications,
    loading,
    loadError,
    pending,
    retry,
    addApplication,
    updateApplication,
    deleteApplication,
  } = useApplications();
  const [editor, setEditor] = useState<Editor | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [notice, setNotice] = useState("");
  const [deleteError, setDeleteError] = useState("");

  function closeEditor() {
    setEditor(null);
    requestAnimationFrame(() =>
      document.getElementById("job-description")?.focus(),
    );
  }

  async function handleSave(draft: ApplicationDraft) {
    if (!editor) return;

    if (editor.mode === "edit") {
      await updateApplication(editor.application.id, draft);
      setNotice("Application updated.");
    } else {
      await addApplication(draft);
      setNotice("Application added to your tracker.");
      setJobDescription("");
    }

    closeEditor();
  }

  function handleEdit(applicationId: string) {
    const application = applications.find((item) => item.id === applicationId);
    if (!application) return;
    setNotice("");
    setEditor({ mode: "edit", application });
  }

  async function handleDelete(applicationId: string) {
    setDeleteError("");
    try {
      await deleteApplication(applicationId);
      setNotice("Application deleted.");
    } catch {
      setDeleteError("Could not delete your application. Please try again.");
    }
  }

  return (
    <>
      <section
        id="application-editor"
        className="surface editor-panel mx-auto max-w-2xl p-5 sm:p-7"
        aria-label="Application editor"
      >
        {editor ? (
          <ApplicationForm
            initialValues={
              editor.mode === "edit" ? editor.application : editor.draft
            }
            isEditing={editor.mode === "edit"}
            disabled={pending || loading || Boolean(loadError)}
            onSave={handleSave}
            onCancel={closeEditor}
          />
        ) : (
          <JobDescriptionForm
            description={jobDescription}
            onDescriptionChange={setJobDescription}
            onReview={(draft) => {
              setNotice("");
              setEditor({ mode: "create", draft });
            }}
          />
        )}
      </section>

      <p
        role="status"
        className="notice-line min-h-10 pt-3 text-center text-sm text-zinc-600"
      >
        {notice}
      </p>

      {deleteError && <p role="alert">{deleteError}</p>}
      {loading ? (
        <p role="status">Loading applications…</p>
      ) : loadError ? (
        <div role="alert">
          {loadError}{" "}
          <button className="button button-secondary" onClick={retry}>
            Retry
          </button>
        </div>
      ) : (
        <ApplicationList
          applications={applications}
          editingId={editor?.mode === "edit" ? editor.application.id : null}
          isEditing={editor !== null || pending}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}
