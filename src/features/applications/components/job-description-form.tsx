"use client";

import { useState, type SubmitEvent } from "react";

export function JobDescriptionForm() {
  const [jobDescription, setJobDescription] = useState("");

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanedDescription = jobDescription.trim();

    if (!cleanedDescription) {
      return;
    }

    console.log(cleanedDescription);

    setJobDescription("");
  }

  return (
    <form
      onSubmit={handleSubmit}
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
          <span>Add to tracker</span>
          <span className="button-arrow" aria-hidden="true">
            →
          </span>
        </button>
      </div>
    </form>
  );
}
