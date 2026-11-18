import { updateJobStatus } from "@/app/jobs/actions";
import { StatusBadge } from "@/components/jobs/status-badge";
import { ActionForm } from "@/components/ui/action-form";
import { SubmitButton } from "@/components/ui/submit-button";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { listJobs, type Job } from "@/lib/jobs/queries";
import {
  availableTransitions,
  transitionLabel,
  type JobStatus,
} from "@/lib/jobs/status";
import { createClient } from "@/lib/supabase/server";

// Active work first, finished work last.
const ORDER: Record<JobStatus, number> = {
  in_progress: 0,
  assigned: 1,
  new: 2,
  done: 3,
};

function mapsUrl(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

function TechnicianJobCard({ job }: { job: Job }) {
  const transitions = availableTransitions("technician", job.status);

  return (
    <article className="rounded-lg border border-line bg-surface p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-medium leading-snug">{job.title}</h2>
        <StatusBadge status={job.status} />
      </div>

      <p className="mt-1 text-sm text-muted">
        {job.customers?.name ?? "Unknown customer"}
      </p>
      {job.customers?.address && (
        <a
          href={mapsUrl(job.customers.address)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-accent underline-offset-2 hover:underline"
        >
          {job.customers.address}
        </a>
      )}

      {job.description && <p className="mt-3 text-sm">{job.description}</p>}

      <dl className="mt-3 flex gap-6 text-sm">
        <div>
          <dt className="text-xs text-muted">Scheduled</dt>
          <dd className="font-medium">
            {job.scheduled_at ? formatDateTime(job.scheduled_at) : "Not set"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Price</dt>
          <dd className="font-medium">{formatCurrency(job.price)}</dd>
        </div>
      </dl>

      {transitions.length > 0 && (
        <div className="mt-4 space-y-2">
          {transitions.map((next) => (
            <ActionForm key={next} action={updateJobStatus}>
              <input type="hidden" name="jobId" value={job.id} />
              <input type="hidden" name="status" value={next} />
              <SubmitButton
                className="min-h-11 w-full text-base"
                pendingLabel="Saving..."
              >
                {transitionLabel(job.status, next)}
              </SubmitButton>
            </ActionForm>
          ))}
        </div>
      )}
    </article>
  );
}

// Mobile-first list of the jobs assigned to the signed-in technician.
export async function TechnicianJobs() {
  const supabase = await createClient();
  const jobs = (await listJobs(supabase)).toSorted(
    (a, b) => ORDER[a.status] - ORDER[b.status],
  );

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My jobs</h1>
        <p className="text-sm text-muted">
          {jobs.length === 0
            ? "You have no jobs assigned right now."
            : `${jobs.length} ${jobs.length === 1 ? "job" : "jobs"} assigned to you.`}
        </p>
      </div>

      {jobs.map((job) => (
        <TechnicianJobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
