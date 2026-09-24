import { z } from "zod";

export const MAX_JOB_DESCRIPTION_LENGTH = 30_000;

// Shared by the form and API so both enforce the same input rules.
export const jobDescriptionSchema = z
  .string()
  .trim()
  .min(30, "Paste at least 30 characters from the job description.")
  .max(
    MAX_JOB_DESCRIPTION_LENGTH,
    "Keep the job description to 30,000 characters or fewer.",
  );

export const extractedApplicationSchema = z.object({
  company: z.string().trim().min(1).max(200),
  title: z.string().trim().min(1).max(200),
  location: z.string().trim().min(1).max(200),
  workplaceType: z.enum(["remote", "hybrid", "onsite", "unknown"]),
  skills: z.array(z.string().trim().min(1).max(100)).max(20),
  summary: z.string().trim().max(1_000),
});

export type ExtractedApplication = z.infer<typeof extractedApplicationSchema>;

export const applicationDraftSchema = extractedApplicationSchema.extend({
  status: z.enum(["applied", "interview", "offer", "rejected"]),
  jobDescription: z.string().max(MAX_JOB_DESCRIPTION_LENGTH),
});

export const applicationSchema = applicationDraftSchema.extend({
  id: z.string(),
  appliedAt: z.iso.datetime(),
});
