export type Application = {
  id: string;
  company: string;
  title: string;
  location: string;
  workplaceType: "remote" | "hybrid" | "onsite" | "unknown";
  skills: string[];
  summary: string;
  status: "applied" | "interview" | "offer" | "rejected";
  jobDescription: string;
  appliedAt: string;
};

// A draft has all editable fields, but no saved identity or timestamp yet.
export type ApplicationDraft = Omit<Application, "id" | "appliedAt">;

export const statusLabels: Record<Application["status"], string> = {
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
};

export const workplaceLabels: Record<Application["workplaceType"], string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
  unknown: "Not specified",
};
