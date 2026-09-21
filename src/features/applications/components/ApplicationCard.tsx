import { MapPin, Pencil, Trash2, Building2 } from "lucide-react";
import { statusLabels, workplaceLabels, type Application } from "../types";

type ApplicationCardProps = {
  application: Application;
  className?: string;
  isEditing: boolean;
  actionsDisabled: boolean;
  onDelete: (applicationId: string) => void;
  onEdit: (applicationId: string) => void;
};

const statusStyles: Record<Application["status"], string> = {
  applied: "bg-blue-50 text-blue-800",
  interview: "bg-amber-50 text-amber-800",
  offer: "bg-emerald-50 text-emerald-800",
  rejected: "bg-zinc-100 text-zinc-600",
};

export function ApplicationCard({
  application,
  className,
  isEditing,
  actionsDisabled,
  onDelete,
  onEdit,
}: ApplicationCardProps) {
  const formattedDate = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(application.appliedAt));

  return (
    <article
      className={`surface min-w-0 p-5 sm:p-6 ${className ?? ""} ${isEditing ? "ring-2 ring-zinc-400" : ""}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span
            className="hidden size-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-sm font-semibold text-zinc-600 sm:flex"
            aria-hidden="true"
          >
            {application.company.slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-medium break-words text-zinc-500">
              {application.company}
            </p>
            <h3 className="mt-1 text-lg leading-snug font-semibold tracking-tight break-words">
              {application.title}
            </h3>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[application.status]}`}
        >
          {statusLabels[application.status]}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-zinc-500">
        <span className="flex min-w-0 items-start gap-1.5">
          <MapPin size={14} className="shrink-0" aria-hidden="true" />
          <span className="break-words">{application.location}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Building2 size={14} aria-hidden="true" />
          {workplaceLabels[application.workplaceType]}
        </span>
      </div>
      {application.summary && (
        <p className="mt-4 text-sm leading-6 break-words text-zinc-600">
          {application.summary}
        </p>
      )}
      {application.skills.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Skills">
          {application.skills.map((skill) => (
            <li
              key={skill}
              className="max-w-full rounded-md bg-zinc-100 px-2 py-1 text-xs break-words text-zinc-600"
            >
              {skill}
            </li>
          ))}
        </ul>
      )}

      {application.jobDescription && (
        <details className="mt-4 text-sm text-zinc-600">
          <summary className="w-fit text-xs font-medium hover:text-zinc-950">
            Original job posting
          </summary>
          <p className="mt-3 max-h-60 overflow-auto rounded-lg bg-zinc-50 p-3 text-xs leading-6 whitespace-pre-wrap break-words">
            {application.jobDescription}
          </p>
        </details>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 pt-3">
        <time
          dateTime={application.appliedAt}
          className="text-xs text-zinc-500"
        >
          Added {formattedDate}
        </time>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onEdit(application.id)}
            disabled={actionsDisabled}
            className="button button-quiet px-3"
            aria-label={`Edit ${application.title} at ${application.company}`}
          >
            <Pencil size={14} aria-hidden="true" />{" "}
            {isEditing ? "Editing" : "Edit"}
          </button>
          <button
            type="button"
            onClick={() => onDelete(application.id)}
            disabled={actionsDisabled}
            className="button button-quiet px-3 hover:bg-red-50 hover:text-red-700"
            aria-label={`Delete ${application.title} at ${application.company}`}
          >
            <Trash2 size={14} aria-hidden="true" />
            <span className="sm:hidden">Delete</span>
          </button>
        </div>
      </div>
    </article>
  );
}
