import { useState } from "react";
import { FileText, Search } from "lucide-react";
import { statusLabels, type Application } from "../types";
import { ApplicationCard } from "./ApplicationCard";

type ApplicationListProps = {
  applications: Application[];
  editingId: string | null;
  isEditing: boolean;
  onDelete: (applicationId: string) => void;
  onEdit: (applicationId: string) => void;
};

export function ApplicationList({
  applications,
  editingId,
  isEditing,
  onDelete,
  onEdit,
}: ApplicationListProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const visibleApplications = applications.filter((application) => {
    const searchableText = [
      application.company,
      application.title,
      application.location,
      application.summary,
      ...application.skills,
    ]
      .join(" ")
      .toLowerCase();
    const matchesSearch = searchableText.includes(search.trim().toLowerCase());
    const matchesStatus = status === "all" || application.status === status;
    return matchesSearch && matchesStatus;
  });

  function clearFilters() {
    setSearch("");
    setStatus("all");
  }

  return (
    <section
      id="applications"
      className="list-enter mt-6 min-w-0"
      aria-labelledby="applications-title"
    >
      <div className="mb-5 flex items-center justify-between gap-3 px-1">
        <h2
          id="applications-title"
          className="text-xl font-semibold tracking-tight"
        >
          Your applications
        </h2>
        <p className="text-sm text-zinc-500">
          {applications.length}{" "}
          {applications.length === 1 ? "application" : "applications"}
        </p>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <label htmlFor="application-search" className="sr-only">
            Search applications
          </label>
          <Search
            size={16}
            className="pointer-events-none absolute top-3.5 left-4 text-zinc-400"
            aria-hidden="true"
          />
          <input
            id="application-search"
            type="search"
            className="field rounded-full pl-11"
            placeholder="Search company, role, location, or skill"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="sm:w-40">
          <label htmlFor="status-filter" className="sr-only">
            Filter by status
          </label>
          <select
            id="status-filter"
            className="field rounded-full px-4"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="all">All statuses</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="surface state-enter flex min-h-60 flex-col items-center justify-center px-6 py-10 text-center">
          <FileText
            size={28}
            strokeWidth={1.3}
            className="mb-4 text-zinc-400"
            aria-hidden="true"
          />
          <h3 className="font-semibold">No applications yet</h3>
          <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
            Paste a job posting above to add your first application.
          </p>
        </div>
      ) : visibleApplications.length === 0 ? (
        <div className="surface state-enter px-6 py-12 text-center">
          <h3 className="font-semibold">No matching applications</h3>
          <p className="mt-2 text-sm text-zinc-500">
            Try a different search or status.
          </p>
          <button
            type="button"
            className="button button-secondary mt-5"
            onClick={clearFilters}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleApplications.map((application) => (
            <ApplicationCard
              key={application.id}
              className="motion-card"
              application={application}
              isEditing={application.id === editingId}
              actionsDisabled={isEditing}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
      <p role="status" className="sr-only">
        {visibleApplications.length} applications shown.
      </p>
    </section>
  );
}
