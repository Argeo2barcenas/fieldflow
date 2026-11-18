import { z } from "zod";
import { JOB_STATUSES } from "@/lib/jobs/status";

// Empty form fields arrive as "". Treat them as "not provided".
const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

export const createJobSchema = z.object({
  customerId: z.uuid("Choose a customer."),
  title: z
    .string()
    .trim()
    .min(3, "Title must have at least 3 characters.")
    .max(120, "Title is too long (120 characters max)."),
  description: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .trim()
      .max(2000, "Description is too long (2000 characters max).")
      .optional(),
  ),
  price: z
    .string()
    .trim()
    .min(1, "Enter a price.")
    .transform(Number)
    .pipe(
      z
        .number("Enter a valid price.")
        .min(0, "Price cannot be negative.")
        .max(1_000_000, "Price is too high."),
    ),
  scheduledAt: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Enter a valid date and time.")
      .optional(),
  ),
  technicianId: z.preprocess(emptyToUndefined, z.uuid().optional()),
});

export const updateStatusSchema = z.object({
  jobId: z.uuid(),
  status: z.enum(JOB_STATUSES),
});

export const assignSchema = z.object({
  jobId: z.uuid(),
  technicianId: z.preprocess(emptyToUndefined, z.uuid().optional()),
});
