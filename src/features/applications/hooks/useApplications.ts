import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";
import { applicationSchema } from "../schemas";
import type { Application, ApplicationDraft } from "../types";

async function request(path = "", options?: RequestInit) {
  const response = await fetch(`/api/applications${path}`, {
    ...options,
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });
  const data = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(
      data?.error || "Could not reach the server. Please try again.",
    );
  return data;
}

export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [pending, setPending] = useState(false);
  const busy = useRef(false);
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    request("", { signal: controller.signal })
      .then((data) => {
        const records = z.array(applicationSchema).parse(data.applications);
        if (!controller.signal.aborted) {
          setApplications(records);
          setLoadError("");
        }
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setLoadError("Could not load your applications. Please try again.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [attempt]);

  async function mutate(
    path: string,
    method: string,
    draft?: ApplicationDraft,
  ) {
    if (busy.current || loading || loadError)
      throw new Error(
        "Wait for your applications to load before saving changes.",
      );
    busy.current = true;
    setPending(true);
    try {
      const data = await request(path, {
        method,
        body: draft ? JSON.stringify(draft) : undefined,
      });
      if (method === "DELETE") {
        setApplications((current) =>
          current.filter((item) => `/${encodeURIComponent(item.id)}` !== path),
        );
      } else {
        const saved = applicationSchema.parse(data.application);
        setApplications((current) =>
          method === "POST"
            ? [saved, ...current]
            : current.map((item) => (item.id === saved.id ? saved : item)),
        );
      }
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  return {
    applications,
    loading,
    loadError,
    pending,
    retry,
    addApplication: (draft: ApplicationDraft) => mutate("", "POST", draft),
    updateApplication: (id: string, draft: ApplicationDraft) =>
      mutate(`/${encodeURIComponent(id)}`, "PATCH", draft),
    deleteApplication: (id: string) =>
      mutate(`/${encodeURIComponent(id)}`, "DELETE"),
  };
}
