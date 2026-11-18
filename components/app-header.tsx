import Link from "next/link";
import { connection } from "next/server";
import { logout } from "@/app/login/actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { getCurrentUser } from "@/lib/auth";

const ROLE_LABELS = { office: "Office", technician: "Technician" } as const;

// Reads the session, so it renders at request time (inside <Suspense>).
export async function AppHeader() {
  await connection();
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium leading-tight">
          {user.fullName || "Signed in"}
        </p>
        <p className="text-xs text-muted">{ROLE_LABELS[user.role]}</p>
      </div>
      <form action={logout}>
        <SubmitButton variant="secondary" pendingLabel="Signing out...">
          Sign out
        </SubmitButton>
      </form>
    </div>
  );
}

export function Brand() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 text-lg font-semibold tracking-tight"
    >
      FieldFlow
      <span className="rounded bg-surface-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted">
        Demo
      </span>
    </Link>
  );
}
