import { useState } from "react";
import type { Application, ApplicationDraft } from "../types";

// Temporary storage boundary: replace these operations with API calls for MongoDB.
export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([]);

  function addApplication(draft: ApplicationDraft) {
    const application: Application = {
      ...draft,
      id: crypto.randomUUID(),
      appliedAt: new Date().toISOString(),
    };
    setApplications((currentApplications) => [
      application,
      ...currentApplications,
    ]);
  }

  function updateApplication(applicationId: string, draft: ApplicationDraft) {
    setApplications((currentApplications) =>
      currentApplications.map((application) =>
        application.id === applicationId
          ? {
              ...application,
              ...draft,
              id: application.id,
              appliedAt: application.appliedAt,
              jobDescription: application.jobDescription,
            }
          : application,
      ),
    );
  }

  function deleteApplication(applicationId: string) {
    setApplications((currentApplications) =>
      currentApplications.filter(
        (application) => application.id !== applicationId,
      ),
    );
  }

  return { applications, addApplication, updateApplication, deleteApplication };
}
