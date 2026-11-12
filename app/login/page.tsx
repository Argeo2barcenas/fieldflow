import { Suspense } from "react";
import { login } from "./actions";

const errorMessages: Record<string, string> = {
  invalid: "Enter a valid email and a password.",
  credentials: "Incorrect email or password.",
};

// The page shell (title and form) is static. Only the error message depends on
// the request (searchParams), so it is wrapped in <Suspense>.
export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">FieldFlow</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Demo app with fictional data. Sign in with a demo account.
        </p>
      </div>

      <form action={login} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="rounded border border-zinc-300 px-3 py-2 font-normal"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Password
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="rounded border border-zinc-300 px-3 py-2 font-normal"
          />
        </label>

        <Suspense fallback={null}>
          <ErrorMessage searchParams={searchParams} />
        </Suspense>

        <button
          type="submit"
          className="rounded bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Sign in
        </button>
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
  const message = error ? errorMessages[error] : undefined;
  if (!message) return null;

  return (
    <p role="alert" className="text-sm text-red-600">
      {message}
    </p>
  );
}
