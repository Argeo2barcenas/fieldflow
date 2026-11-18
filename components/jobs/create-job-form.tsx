"use client";

import Link from "next/link";
import { useActionState, type ReactNode } from "react";
import { createJob } from "@/app/jobs/actions";
import { SubmitButton } from "@/components/ui/submit-button";
import type { Customer, Technician } from "@/lib/jobs/queries";
import type { CreateJobField } from "@/lib/jobs/types";

const INPUT =
  "w-full rounded-md border border-line bg-surface px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent aria-[invalid=true]:border-danger";

type ControlProps = {
  id: string;
  "aria-invalid": boolean;
  "aria-describedby": string | undefined;
};

type FieldProps = {
  field: CreateJobField;
  label: string;
  hint?: string;
  error?: string;
  children: (props: ControlProps) => ReactNode;
};

// Label + control + hint/error, with the accessibility attributes wired up.
function Field({ field, label, hint, error, children }: FieldProps) {
  const id = `field-${field}`;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      {children({
        id,
        "aria-invalid": Boolean(error),
        "aria-describedby": describedBy,
      })}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function CreateJobForm({
  customers,
  technicians,
}: {
  customers: Customer[];
  technicians: Technician[];
}) {
  const [state, formAction] = useActionState(createJob, null);

  const value = (field: CreateJobField) => state?.values?.[field] ?? "";
  const error = (field: CreateJobField) => state?.fieldErrors?.[field]?.[0];

  return (
    <form
      action={formAction}
      noValidate
      className="space-y-5 rounded-lg border border-line bg-surface p-5"
    >
      {state?.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}

      <Field field="customerId" label="Customer" error={error("customerId")}>
        {(props) => (
          <select
            {...props}
            name="customerId"
            defaultValue={value("customerId")}
            className={INPUT}
          >
            <option value="">Choose a customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        )}
      </Field>

      <Field field="title" label="Title" error={error("title")}>
        {(props) => (
          <input
            {...props}
            name="title"
            defaultValue={value("title")}
            maxLength={120}
            className={INPUT}
          />
        )}
      </Field>

      <Field
        field="description"
        label="Description (optional)"
        error={error("description")}
      >
        {(props) => (
          <textarea
            {...props}
            name="description"
            defaultValue={value("description")}
            rows={3}
            maxLength={2000}
            className={INPUT}
          />
        )}
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field field="price" label="Price (USD)" error={error("price")}>
          {(props) => (
            <input
              {...props}
              name="price"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              defaultValue={value("price")}
              className={INPUT}
            />
          )}
        </Field>

        <Field
          field="scheduledAt"
          label="Scheduled (optional)"
          hint="Central time (Kansas City and Dallas)."
          error={error("scheduledAt")}
        >
          {(props) => (
            <input
              {...props}
              name="scheduledAt"
              type="datetime-local"
              defaultValue={value("scheduledAt")}
              className={INPUT}
            />
          )}
        </Field>
      </div>

      <Field
        field="technicianId"
        label="Technician (optional)"
        hint="Leave empty to assign later from the board."
        error={error("technicianId")}
      >
        {(props) => (
          <select
            {...props}
            name="technicianId"
            defaultValue={value("technicianId")}
            className={INPUT}
          >
            <option value="">Unassigned</option>
            {technicians.map((technician) => (
              <option key={technician.id} value={technician.id}>
                {technician.full_name || "Unnamed technician"}
              </option>
            ))}
          </select>
        )}
      </Field>

      <div className="flex items-center justify-end gap-3">
        <Link
          href="/"
          className="text-sm text-muted underline-offset-2 hover:underline"
        >
          Cancel
        </Link>
        <SubmitButton pendingLabel="Creating...">Create job</SubmitButton>
      </div>
    </form>
  );
}
