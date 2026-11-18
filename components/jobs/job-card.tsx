import { assignTechnician, updateJobStatus } from "@/app/jobs/actions";
import { ActionForm } from "@/components/ui/action-form";
import { SubmitButton } from "@/components/ui/submit-button";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { Job, Technician } from "@/lib/jobs/queries";
import { availableTransitions, transitionLabel } from "@/lib/jobs/status";

// Card shown on the office dispatch board.
export function JobCard({
  job,
  technicians,
}: {
  job: Job;
  technicians: Technician[];
}) {
  const canReassign = job.status === "new" || job.status === "assigned";
  const transitions = availableTransitions("office", job.status);
  const selectId = `technician-${job.id}`;

  return (
    <article className="rounded-lg border border-line bg-surface p-4 shadow-sm">
      <h3 className="font-medium leading-snug">{job.title}</h3>
      <p className="mt-1 text-sm text-muted">
        {job.customers?.name ?? "Unknown customer"}
      </p>
      {job.customers?.address && (
        <p className="text-xs text-muted">{job.customers.address}</p>
      )}

      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div>
          <dt className="text-muted">Scheduled</dt>
          <dd className="font-medium">
            {job.scheduled_at ? formatDateTime(job.scheduled_at) : "Not set"}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Price</dt>
          <dd className="font-medium">{formatCurrency(job.price)}</dd>
        </div>
      </dl>

      <div className="mt-3 border-t border-line pt-3">
        {canReassign ? (
          <ActionForm action={assignTechnician} className="flex gap-2">
            <input type="hidden" name="jobId" value={job.id} />
            <label htmlFor={selectId} className="sr-only">
              Technician for {job.title}
            </label>
            <select
              id={selectId}
              name="technicianId"
              key={job.technician?.id ?? "none"}
              defaultValue={job.technician?.id ?? ""}
              className="min-w-0 flex-1 rounded-md border border-line bg-surface px-2 py-1.5 text-sm"
            >
              <option value="">Unassigned</option>
              {technicians.map((technician) => (
                <option key={technician.id} value={technician.id}>
                  {technician.full_name || "Unnamed technician"}
                </option>
              ))}
            </select>
            <SubmitButton variant="secondary" pendingLabel="Saving...">
              Assign
            </SubmitButton>
          </ActionForm>
        ) : (
          <p className="text-sm">
            <span className="text-muted">Technician: </span>
            <span className="font-medium">
              {job.technician?.full_name || "Unassigned"}
            </span>
          </p>
        )}

        {transitions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {transitions.map((next) => (
              <ActionForm key={next} action={updateJobStatus}>
                <input type="hidden" name="jobId" value={job.id} />
                <input type="hidden" name="status" value={next} />
                <SubmitButton
                  variant={next === "done" ? "primary" : "secondary"}
                  pendingLabel="Saving..."
                >
                  {transitionLabel(job.status, next)}
                </SubmitButton>
              </ActionForm>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
