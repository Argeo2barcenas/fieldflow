"use client";

import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";

type Variant = "primary" | "secondary";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-accent text-accent-foreground hover:bg-accent-hover",
  secondary:
    "border border-line bg-surface text-foreground hover:bg-surface-muted",
};

type SubmitButtonProps = Omit<ComponentProps<"button">, "type"> & {
  variant?: Variant;
  pendingLabel?: string;
};

// A submit button that disables itself and shows a label while its form is
// being processed, which prevents double submissions.
export function SubmitButton({
  children,
  variant = "primary",
  pendingLabel = "Working...",
  className = "",
  disabled,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      {...props}
      type="submit"
      disabled={pending || disabled}
      aria-busy={pending}
      className={`inline-flex min-h-9 items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${className}`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
