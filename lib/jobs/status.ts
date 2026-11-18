// Business rules for job statuses. Pure functions: no database, no framework.
// They are unit tested and shared by the UI (which buttons to show) and the
// server actions (what to allow), so both always agree.

export const JOB_STATUSES = ["new", "assigned", "in_progress", "done"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export const ROLES = ["office", "technician"] as const;
export type Role = (typeof ROLES)[number];

export const STATUS_LABELS: Record<JobStatus, string> = {
  new: "New",
  assigned: "Assigned",
  in_progress: "In progress",
  done: "Done",
};

// Status changes each role may make by hand.
// Leaving "new" only happens by assigning a technician (see statusAfterAssignment).
const TRANSITIONS: Record<
  Role,
  Partial<Record<JobStatus, readonly JobStatus[]>>
> = {
  office: {
    assigned: ["in_progress"],
    in_progress: ["done", "assigned"],
    done: ["in_progress"],
  },
  technician: {
    assigned: ["in_progress"],
    in_progress: ["done"],
  },
};

export function availableTransitions(
  role: Role,
  from: JobStatus,
): readonly JobStatus[] {
  return TRANSITIONS[role][from] ?? [];
}

export function canTransition(role: Role, from: JobStatus, to: JobStatus) {
  return availableTransitions(role, from).includes(to);
}

export function transitionLabel(from: JobStatus, to: JobStatus): string {
  if (from === "assigned" && to === "in_progress") return "Start job";
  if (from === "in_progress" && to === "done") return "Mark as done";
  if (from === "in_progress" && to === "assigned") return "Pause job";
  if (from === "done" && to === "in_progress") return "Reopen";
  return STATUS_LABELS[to];
}

export type AssignmentResult =
  | { ok: true; status: JobStatus }
  | { ok: false; error: string };

// Assigning a technician moves a new job to "assigned"; removing the
// technician sends it back to "new". Work already started is locked.
export function statusAfterAssignment(
  current: JobStatus,
  technicianId: string | null,
): AssignmentResult {
  if (current === "in_progress" || current === "done") {
    return {
      ok: false,
      error: "A job that is in progress or done cannot be reassigned.",
    };
  }
  return { ok: true, status: technicianId ? "assigned" : "new" };
}
