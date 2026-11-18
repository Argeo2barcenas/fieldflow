import Link from "next/link";
import { JobCard } from "@/components/jobs/job-card";
import { formatCurrency } from "@/lib/format";
import { listJobs, listTechnicians } from "@/lib/jobs/queries";
import { JOB_STATUSES, STATUS_LABELS } from "@/lib/jobs/status";
import { createClient } from "@/lib/supabase/server";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

// Kanban-style dispatch board for the office team.
export async function OfficeBoard() {
  const supabase = await createClient();
  const [jobs, technicians] = await Promise.all([
    listJobs(supabase),
    listTechnicians(supabase),
  ]);

  const columns = JOB_STATUSES.map((status) => ({
    status,
    jobs: jobs.filter((job) => job.status === status),
  }));
  const count = (status: (typeof JOB_STATUSES)[number]) =>
    columns.find((column) => column.status === status)?.jobs.length ?? 0;

  const openJobs = jobs.filter((job) => job.status !== "done");
  const openValue = openJobs.reduce((sum, job) => sum + job.price, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Dispatch board
          </h1>
          <p className="text-sm text-muted">
            Assign technicians and follow every job from request to done.
          </p>
        </div>
        <Link
          href="/jobs/new"
          className="inline-flex min-h-9 items-center rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          New job
        </Link>
      </div>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Unassigned" value={String(count("new"))} />
        <Stat label="In progress" value={String(count("in_progress"))} />
        <Stat label="Completed" value={String(count("done"))} />
        <Stat label="Open work value" value={formatCurrency(openValue)} />
      </dl>

      <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-4">
        {columns.map(({ status, jobs: columnJobs }) => (
          <section
            key={status}
            aria-labelledby={`column-${status}`}
            className="rounded-lg bg-surface-muted p-3"
          >
            <h2
              id={`column-${status}`}
              className="mb-3 flex items-center justify-between text-sm font-semibold"
            >
              {STATUS_LABELS[status]}
              <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-muted">
                {columnJobs.length}
              </span>
            </h2>

            {columnJobs.length === 0 ? (
              <p className="rounded-md border border-dashed border-line p-4 text-center text-xs text-muted">
                No jobs here
              </p>
            ) : (
              <div className="space-y-3">
                {columnJobs.map((job) => (
                  <JobCard key={job.id} job={job} technicians={technicians} />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
