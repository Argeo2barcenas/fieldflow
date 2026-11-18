export type ActionResult = { ok: true } | { ok: false; error: string };

export const CREATE_JOB_FIELDS = [
  "customerId",
  "title",
  "description",
  "price",
  "scheduledAt",
  "technicianId",
] as const;
export type CreateJobField = (typeof CREATE_JOB_FIELDS)[number];

// State of the "new job" form: errors per field plus what the user typed,
// so nothing is lost when validation fails.
export type CreateJobState = {
  error?: string;
  fieldErrors?: Partial<Record<CreateJobField, string[]>>;
  values?: Partial<Record<CreateJobField, string>>;
} | null;
