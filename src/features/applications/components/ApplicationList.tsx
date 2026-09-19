import type { Application } from "@/features/applications/types";
import { ApplicationCard } from "@/features/applications/components/ApplicationCard";
type ApplicationListProps = {
  applications: Application[];
  onDelete: (applicationId: string) => void;
};

export function ApplicationList({ applications, onDelete }: ApplicationListProps) {
  return (
    <section aria-labelledby="tracker-title">
      <h2 id="tracker-title">Your applications</h2>

      {applications.map((application) => (
        <ApplicationCard key={application.id} application={application} onDelete={onDelete} />
      ))}
    </section>
  );
}
