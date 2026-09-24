import "server-only";
import { getDatabase } from "@/lib/mongodb";
import type { Application } from "../types";

export type StoredApplication = Application & { userId: string };
export function applicationsCollection() {
  return getDatabase().collection<StoredApplication>("applications");
}
export function publicApplication(record: StoredApplication): Application {
  return {
    id: record.id,
    company: record.company,
    title: record.title,
    location: record.location,
    workplaceType: record.workplaceType,
    skills: record.skills,
    summary: record.summary,
    status: record.status,
    jobDescription: record.jobDescription,
    appliedAt: record.appliedAt,
  };
}
