"use client";

import { useState, type SubmitEvent } from "react";
import { ApplicationList } from "@/features/applications/components/ApplicationList";
import type { Application } from "@/features/applications/types";

type ReviewApplication = Omit<Application, "id" | "appliedAt">;

const fieldClassName =
  "glass-input w-full px-4 py-3 text-sm text-zinc-950 outline-none placeholder:text-zinc-400";

const emptyReview: ReviewApplication = {
  company: "Unknown company",
  title: "Untitled position",
  location: "Unknown location",
  workplaceType: "unknown",
  skills: [],
  summary: "",
  status: "applied",
  jobDescription: "",
};

export function JobDescriptionForm() {
  const [jobDescription, setJobDescription] = useState("");
  const [review, setReview] = useState<ReviewApplication | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [skillsInput, setSkillsInput] = useState("");

  function handleReview(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanedDescription = jobDescription.trim();

    if (!cleanedDescription) {
      return;
    }

    setReview({ ...emptyReview, jobDescription: cleanedDescription });
    setSkillsInput("");
  }

  function handleReviewChange(field: keyof ReviewApplication, value: string) {
    setReview((currentReview) =>
      currentReview ? { ...currentReview, [field]: value } : currentReview,
    );
  }

  function handleAddToTracker(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!review) {
      return;
    }

    setApplications((currentApplications) => [
      ...currentApplications,
      {
        ...review,
        id: crypto.randomUUID(),
        skills: skillsInput
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
        appliedAt: new Date().toISOString(),
      },
    ]);
    setReview(null);
    setJobDescription("");
    setSkillsInput("");
  }

  function handleDeleteApplication(applicationId: string) {
    setApplications((currentApplications) =>
      currentApplications.filter(
        (application) => application.id !== applicationId,
      ),
    );
  }

  if (review) {
    return (
      <div className="liquid-glass intro-item mt-12 p-4 text-left sm:p-6">
        <div className="relative z-10">
          <p className="text-sm font-semibold text-zinc-500">Review details</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-zinc-950">
            Check this application before adding it
          </h2>
        </div>

        <form
          onSubmit={handleAddToTracker}
          className="relative z-10 mt-6 space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-zinc-700">
              Company
              <input
                value={review.company}
                onChange={(event) =>
                  handleReviewChange("company", event.target.value)
                }
                className={`${fieldClassName} mt-2`}
              />
            </label>
            <label className="block text-sm font-medium text-zinc-700">
              Job title
              <input
                value={review.title}
                onChange={(event) =>
                  handleReviewChange("title", event.target.value)
                }
                className={`${fieldClassName} mt-2`}
              />
            </label>
            <label className="block text-sm font-medium text-zinc-700">
              Location
              <input
                value={review.location}
                onChange={(event) =>
                  handleReviewChange("location", event.target.value)
                }
                className={`${fieldClassName} mt-2`}
              />
            </label>
            <label className="block text-sm font-medium text-zinc-700">
              Workplace
              <select
                value={review.workplaceType}
                onChange={(event) =>
                  handleReviewChange(
                    "workplaceType",
                    event.target.value as Application["workplaceType"],
                  )
                }
                className={`${fieldClassName} mt-2`}
              >
                <option value="unknown">Unknown</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
              </select>
            </label>
            <label className="block text-sm font-medium text-zinc-700">
              Status
              <select
                value={review.status}
                onChange={(event) =>
                  handleReviewChange(
                    "status",
                    event.target.value as Application["status"],
                  )
                }
                className={`${fieldClassName} mt-2`}
              >
                <option value="applied">Applied</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
              </select>
            </label>
            <label className="block text-sm font-medium text-zinc-700">
              Skills
              <input
                value={skillsInput}
                onChange={(event) => setSkillsInput(event.target.value)}
                placeholder="React, TypeScript, SQL"
                className={`${fieldClassName} mt-2`}
              />
            </label>
          </div>

          <label className="block text-sm font-medium text-zinc-700">
            Summary
            <textarea
              value={review.summary}
              onChange={(event) =>
                handleReviewChange("summary", event.target.value)
              }
              rows={3}
              className={`${fieldClassName} mt-2 resize-none`}
            />
          </label>

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setReview(null)}
              className="rounded-full px-4 py-3 text-sm font-semibold text-zinc-500 transition hover:bg-white/50 hover:text-zinc-900"
            >
              Back
            </button>
            <button type="submit" className="liquid-button">
              <span>Add to tracker</span>
              <span className="button-arrow" aria-hidden="true">
                →
              </span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <>
      <form
        onSubmit={handleReview}
        className="liquid-glass intro-item mt-12 p-3 text-left [animation-delay:360ms] sm:p-4"
      >
        <label htmlFor="job-description" className="sr-only">
          Job description
        </label>

        <textarea
          id="job-description"
          name="jobDescription"
          rows={6}
          value={jobDescription}
          onChange={(event) => setJobDescription(event.target.value)}
          placeholder="Paste the full job description here..."
          className="glass-input w-full resize-none p-5 text-base leading-7 text-zinc-950 outline-none placeholder:text-zinc-400"
        />

        <div className="relative z-10 mt-3 flex items-center justify-between px-1 pb-1">
          <p className="hidden text-xs text-zinc-400 sm:block">
            Your posting stays private.
          </p>
          <button type="submit" className="liquid-button ml-auto">
            <span>Review application</span>
            <span className="button-arrow" aria-hidden="true">
              →
            </span>
          </button>
        </div>
      </form>

      <ApplicationList applications={applications} onDelete={handleDeleteApplication} />
    </>
  );
}
