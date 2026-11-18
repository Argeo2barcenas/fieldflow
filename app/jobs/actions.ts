"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { APP_TIME_ZONE, zonedLocalToUtc } from "@/lib/datetime";
import {
  assignJob,
  changeJobStatus,
  getJobStatus,
  insertJob,
  isTechnician,
} from "@/lib/jobs/queries";
import {
  assignSchema,
  createJobSchema,
  updateStatusSchema,
} from "@/lib/jobs/schemas";
import { canTransition, statusAfterAssignment } from "@/lib/jobs/status";
import {
  CREATE_JOB_FIELDS,
  type ActionResult,
  type CreateJobState,
} from "@/lib/jobs/types";
import { createClient } from "@/lib/supabase/server";

const SIGN_IN_AGAIN = "Your session expired. Please sign in again.";
const STALE_JOB =
  "Someone else changed this job. The board was refreshed, please try again.";

function fail(error: string): ActionResult {
  return { ok: false, error };
}

// Unexpected errors are logged for us and never shown to the user as raw text.
function unexpected(context: string, error: unknown): ActionResult {
  console.error(`[jobs] ${context}`, error);
  return fail("Something went wrong. Please try again.");
}

export async function updateJobStatus(
  formData: FormData,
): Promise<ActionResult> {
  const parsed = updateStatusSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail("Invalid request.");

  const user = await getCurrentUser();
  if (!user) return fail(SIGN_IN_AGAIN);

  try {
    const supabase = await createClient();
    const current = await getJobStatus(supabase, parsed.data.jobId);
    if (!current) return fail("Job not found.");

    if (!canTransition(user.role, current, parsed.data.status)) {
      return fail("You cannot make that change to this job.");
    }

    const updated = await changeJobStatus(
      supabase,
      parsed.data.jobId,
      current,
      parsed.data.status,
    );
    if (!updated) {
      revalidatePath("/");
      return fail(STALE_JOB);
    }
  } catch (error) {
    return unexpected("updateJobStatus", error);
  }

  revalidatePath("/");
  return { ok: true };
}

export async function assignTechnician(
  formData: FormData,
): Promise<ActionResult> {
  const parsed = assignSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail("Invalid request.");

  const user = await getCurrentUser();
  if (!user) return fail(SIGN_IN_AGAIN);
  if (user.role !== "office") return fail("Only the office can assign jobs.");

  const technicianId = parsed.data.technicianId ?? null;

  try {
    const supabase = await createClient();
    const current = await getJobStatus(supabase, parsed.data.jobId);
    if (!current) return fail("Job not found.");

    const next = statusAfterAssignment(current, technicianId);
    if (!next.ok) return fail(next.error);

    if (technicianId && !(await isTechnician(supabase, technicianId))) {
      return fail("That person is not a technician.");
    }

    const updated = await assignJob(
      supabase,
      parsed.data.jobId,
      current,
      technicianId,
      next.status,
    );
    if (!updated) {
      revalidatePath("/");
      return fail(STALE_JOB);
    }
  } catch (error) {
    return unexpected("assignTechnician", error);
  }

  revalidatePath("/");
  return { ok: true };
}

export async function createJob(
  _previous: CreateJobState,
  formData: FormData,
): Promise<CreateJobState> {
  // Keep what the user typed so the form can be shown again on errors.
  const values: Record<string, string> = {};
  for (const field of CREATE_JOB_FIELDS) {
    const value = formData.get(field);
    if (typeof value === "string") values[field] = value;
  }

  const user = await getCurrentUser();
  if (!user) return { error: SIGN_IN_AGAIN, values };
  if (user.role !== "office") {
    return { error: "Only the office can create jobs.", values };
  }

  const parsed = createJobSchema.safeParse(values);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const data = parsed.data;

  let scheduledAt: string | null = null;
  if (data.scheduledAt) {
    const utc = zonedLocalToUtc(data.scheduledAt, APP_TIME_ZONE);
    if (!utc) {
      return {
        fieldErrors: { scheduledAt: ["Enter a valid date and time."] },
        values,
      };
    }
    scheduledAt = utc.toISOString();
  }

  try {
    const supabase = await createClient();

    if (data.technicianId && !(await isTechnician(supabase, data.technicianId))) {
      return {
        fieldErrors: { technicianId: ["Choose a valid technician."] },
        values,
      };
    }

    await insertJob(supabase, {
      customerId: data.customerId,
      technicianId: data.technicianId ?? null,
      title: data.title,
      description: data.description ?? null,
      price: Math.round(data.price * 100) / 100,
      scheduledAt,
    });
  } catch (error) {
    console.error("[jobs] createJob", error);
    return { error: "Could not create the job. Please try again.", values };
  }

  revalidatePath("/");
  redirect("/");
}
