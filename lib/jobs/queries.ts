// Data access for jobs. Every function receives the Supabase client, which
// keeps this layer independent from Next.js and easy to test. Row Level
// Security in the database decides which rows each signed-in user can see.
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { JOB_STATUSES, type JobStatus } from "@/lib/jobs/status";

const JOB_SELECT =
  "id, title, description, status, price, scheduled_at, created_at, " +
  "customers(name, address), technician:profiles!technician_id(id, full_name)";

const jobSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  status: z.enum(JOB_STATUSES),
  price: z.number(),
  scheduled_at: z.string().nullable(),
  created_at: z.string(),
  customers: z
    .object({ name: z.string(), address: z.string().nullable() })
    .nullable(),
  technician: z.object({ id: z.string(), full_name: z.string() }).nullable(),
});
export type Job = z.infer<typeof jobSchema>;

const technicianSchema = z.object({ id: z.string(), full_name: z.string() });
export type Technician = z.infer<typeof technicianSchema>;

const customerSchema = z.object({ id: z.string(), name: z.string() });
export type Customer = z.infer<typeof customerSchema>;

export async function listJobs(supabase: SupabaseClient): Promise<Job[]> {
  const { data, error } = await supabase
    .from("jobs")
    .select(JOB_SELECT)
    .order("scheduled_at", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Could not load jobs: ${error.message}`);
  return z.array(jobSchema).parse(data);
}

export async function listTechnicians(
  supabase: SupabaseClient,
): Promise<Technician[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "technician")
    .order("full_name");

  if (error) throw new Error(`Could not load technicians: ${error.message}`);
  return z.array(technicianSchema).parse(data);
}

export async function listCustomers(
  supabase: SupabaseClient,
): Promise<Customer[]> {
  const { data, error } = await supabase
    .from("customers")
    .select("id, name")
    .order("name");

  if (error) throw new Error(`Could not load customers: ${error.message}`);
  return z.array(customerSchema).parse(data);
}

// Returns null when the job does not exist or the user is not allowed to see it.
export async function getJobStatus(
  supabase: SupabaseClient,
  jobId: string,
): Promise<JobStatus | null> {
  const { data, error } = await supabase
    .from("jobs")
    .select("status")
    .eq("id", jobId)
    .maybeSingle();

  if (error) throw new Error(`Could not read the job: ${error.message}`);
  if (!data) return null;
  return z.enum(JOB_STATUSES).parse(data.status);
}

export async function isTechnician(
  supabase: SupabaseClient,
  profileId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", profileId)
    .eq("role", "technician")
    .maybeSingle();

  if (error) throw new Error(`Could not read the technician: ${error.message}`);
  return data !== null;
}

// Both updates below only apply while the job is still in the status the user
// saw (optimistic concurrency). They return false when someone else changed
// the job in the meantime, so a stale screen can never overwrite newer work.
export async function changeJobStatus(
  supabase: SupabaseClient,
  jobId: string,
  from: JobStatus,
  to: JobStatus,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("jobs")
    .update({ status: to })
    .eq("id", jobId)
    .eq("status", from)
    .select("id");

  if (error) throw new Error(`Could not update the job: ${error.message}`);
  return (data?.length ?? 0) > 0;
}

export async function assignJob(
  supabase: SupabaseClient,
  jobId: string,
  currentStatus: JobStatus,
  technicianId: string | null,
  nextStatus: JobStatus,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("jobs")
    .update({ technician_id: technicianId, status: nextStatus })
    .eq("id", jobId)
    .eq("status", currentStatus)
    .select("id");

  if (error) throw new Error(`Could not assign the job: ${error.message}`);
  return (data?.length ?? 0) > 0;
}

export type NewJob = {
  customerId: string;
  technicianId: string | null;
  title: string;
  description: string | null;
  price: number;
  scheduledAt: string | null;
};

export async function insertJob(
  supabase: SupabaseClient,
  job: NewJob,
): Promise<void> {
  const { error } = await supabase.from("jobs").insert({
    customer_id: job.customerId,
    technician_id: job.technicianId,
    title: job.title,
    description: job.description,
    status: job.technicianId ? "assigned" : "new",
    price: job.price,
    scheduled_at: job.scheduledAt,
  });

  if (error) throw new Error(`Could not create the job: ${error.message}`);
}
