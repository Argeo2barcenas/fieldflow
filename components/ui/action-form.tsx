"use client";

import { useActionState, type ReactNode } from "react";
import type { ActionResult } from "@/lib/jobs/types";

type ActionFormProps = {
  action: (formData: FormData) => Promise<ActionResult>;
  children: ReactNode;
  className?: string;
};

// A form wired to a server action that reports success or an error message.
// The error is announced to screen readers through role="alert".
export function ActionForm({ action, children, className }: ActionFormProps) {
  const [state, formAction] = useActionState(
    async (_previous: ActionResult | null, formData: FormData) =>
      action(formData),
    null,
  );

  return (
    <form action={formAction} className={className}>
      {children}
      {state && !state.ok && (
        <p role="alert" className="mt-2 text-xs text-danger">
          {state.error}
        </p>
      )}
    </form>
  );
}
