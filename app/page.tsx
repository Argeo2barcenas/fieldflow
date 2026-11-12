import { Suspense } from "react";
import { connection } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { logout } from "./login/actions";

const profileSchema = z.object({
  full_name: z.string(),
  role: z.enum(["office", "technician"]),
});

const jobsSchema = z.array(
  z.object({
    id: z.string(),
    title: z.string(),
    status: z.enum(["new", "assigned", "in_progress", "done"]),
    price: z.number(),
    customers: z.object({ name: z.string() }).nullable(),
  }),
);

// The page shell is static. Everything that depends on the logged-in user
// (session, profile, jobs) loads at request time inside <Suspense>.
export default function Home() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <Suspense fallback={<p className="text-sm text-zinc-600">Loading...</p>}>
        <Dashboard />
      </Suspense>
    </main>
  );
}

async function Dashboard() {
  // Opt in to request-time rendering before any call that reads the clock
  // (verifying the session token does).
  await connection();

  const supabase = await createClient();

  // proxy.ts already redirects visitors without a session to /login.
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims.sub;

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", userId ?? "")
    .single();
  const profile = profileSchema.safeParse(profileRow);

  // Row Level Security decides which rows come back for this user.
  const { data: jobRows, error: jobsError } = await supabase
    .from("jobs")
    .select("id, title, status, price, customers(name)")
    .order("created_at", { ascending: false });
  const jobs = jobsSchema.safeParse(jobRows);

  return (
    <>
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">FieldFlow</h1>
          {profile.success && (
            <p className="text-sm text-zinc-600">
              Signed in as {profile.data.full_name || "user"} (
              {profile.data.role})
            </p>
          )}
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="rounded border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100"
          >
            Sign out
          </button>
        </form>
      </header>

      <h2 className="mt-8 text-lg font-medium">Jobs</h2>
      <p className="text-sm text-zinc-600">
        The jobs you see depend on your role (Row Level Security).
      </p>

      {jobsError || !jobs.success ? (
        <p role="alert" className="mt-4 text-sm text-red-600">
          Could not load jobs.
        </p>
      ) : jobs.data.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-600">No jobs to show.</p>
      ) : (
        <table className="mt-4 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-300">
              <th className="py-2 pr-4">Job</th>
              <th className="py-2 pr-4">Customer</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 text-right">Price</th>
            </tr>
          </thead>
          <tbody>
            {jobs.data.map((job) => (
              <tr key={job.id} className="border-b border-zinc-200">
                <td className="py-2 pr-4">{job.title}</td>
                <td className="py-2 pr-4">{job.customers?.name ?? "-"}</td>
                <td className="py-2 pr-4">{job.status}</td>
                <td className="py-2 text-right">${job.price.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
