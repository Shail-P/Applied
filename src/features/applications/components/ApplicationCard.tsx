import type { Application } from "@/features/applications/types";

type ApplicationCardProps = {
  application: Application;
  onDelete: (applicationId: string) => void;
};

const statusStyles: Record<Application["status"], string> = {
  applied: "bg-blue-100 text-blue-700",
  interview: "bg-amber-100 text-amber-700",
  offer: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
};

const statusLabels: Record<Application["status"], string> = {
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
};

const workplaceLabels: Record<Application["workplaceType"], string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
  unknown: "Workplace unknown",
};

export function ApplicationCard({
  application,
  onDelete,
}: ApplicationCardProps) {
  const appliedDate = new Date(application.appliedAt);
  const formattedDate = Number.isNaN(appliedDate.getTime())
    ? application.appliedAt
    : new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(appliedDate);

  return (
    <article className="liquid-glass p-5 text-left sm:p-6">
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-zinc-500">
            {application.company}
          </p>
          <h2 className="mt-2 text-xl font-semibold leading-tight tracking-[-0.03em] text-zinc-950">
            {application.title}
          </h2>
        </div>

        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[application.status]}`}
        >
          {statusLabels[application.status]}
        </span>
      </div>

      <div className="relative z-10 mt-5 flex flex-wrap gap-x-3 gap-y-1 text-sm text-zinc-500">
        <span>{application.location}</span>
        <span aria-hidden="true">·</span>
        <span>{workplaceLabels[application.workplaceType]}</span>
      </div>

      {application.summary && (
        <p className="relative z-10 mt-4 line-clamp-3 text-sm leading-6 text-zinc-600">
          {application.summary}
        </p>
      )}

      {application.skills.length > 0 && (
        <ul
          className="relative z-10 mt-5 flex flex-wrap gap-2"
          aria-label="Skills"
        >
          {application.skills.map((skill) => (
            <li
              key={skill}
              className="rounded-full border border-zinc-200/80 bg-white/50 px-2.5 py-1 text-xs font-medium text-zinc-600"
            >
              {skill}
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={() => onDelete(application.id)}
        className="relative z-10 mt-5 rounded-full px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
      >
        Delete
      </button>
      <time
        dateTime={application.appliedAt}
        className="relative z-10 mt-5 block text-xs text-zinc-400"
      >
        Added {formattedDate}
      </time>
    </article>
  );
}
