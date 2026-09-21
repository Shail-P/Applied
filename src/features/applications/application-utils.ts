import type { ApplicationDraft } from "./types";

export function createEmptyDraft(jobDescription = ""): ApplicationDraft {
  return {
    company: "",
    title: "",
    location: "",
    workplaceType: "unknown",
    skills: [],
    summary: "",
    status: "applied",
    jobDescription,
  };
}

// The form uses comma-separated text; saved applications use a unique array.
export function parseSkills(value: string): string[] {
  const skills = value
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
  const seen = new Set<string>();

  return skills.filter((skill) => {
    const key = skill.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
