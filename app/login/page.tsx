import type { Metadata } from "next";
import { Suspense } from "react";
import { SubmitButton } from "@/components/ui/submit-button";
import { login } from "./actions";

export const metadata: Metadata = { title: "Sign in" };

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "Enter a valid email and a password.",
  credentials: "Incorrect email or password.",
};

const INPUT =
  "w-full rounded-md border border-line bg-surface px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent";

// The page shell (title and form) is static. Only the error message depends
// on the request (searchParams), so it is wrapped in <Suspense>.
export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">FieldFlow</h1>
        <p className="mt-1 text-sm text-muted">
          Demo app with fictional data. Sign in with a demo account.
        </p>
      </div>

      <form
        action={login}
        className="space-y-4 rounded-lg border border-line bg-surface p-5"
      >
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={INPUT}
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className={INPUT}
          />
        </div>

        <Suspense fallback={null}>
          <ErrorMessage searchParams={searchParams} />
        </Suspense>

        <SubmitButton className="w-full" pendingLabel="Signing in...">
          Sign in
        </SubmitButton>
      </form>
    </main>
  );
}

async function ErrorMessage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const message = error ? ERROR_MESSAGES[error] : undefined;
  if (!message) return null;

  return (
    <p role="alert" className="text-sm text-danger">
      {message}
    </p>
  );
}
