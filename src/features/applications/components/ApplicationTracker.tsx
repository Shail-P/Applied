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
  const { applications, addApplication, updateApplication, deleteApplication } =
    useApplications();
  const [editor, setEditor] = useState<Editor | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [notice, setNotice] = useState("");

  function closeEditor() {
    setEditor(null);
    requestAnimationFrame(() =>
      document.getElementById("job-description")?.focus(),
    );
  }

  function handleSave(draft: ApplicationDraft) {
    if (!editor) return;

    if (editor.mode === "edit") {
      updateApplication(editor.application.id, draft);
      setNotice("Application updated.");
    } else {
      addApplication(draft);
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

  function handleDelete(applicationId: string) {
    deleteApplication(applicationId);
    setNotice("Application deleted.");
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

      <ApplicationList
        applications={applications}
        editingId={editor?.mode === "edit" ? editor.application.id : null}
        isEditing={editor !== null}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </>
  );
}
