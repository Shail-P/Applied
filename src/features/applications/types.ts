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