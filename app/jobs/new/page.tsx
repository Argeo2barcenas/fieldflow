import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { AppShell } from "@/components/app-shell";
import { CreateJobForm } from "@/components/jobs/create-job-form";
import { FormSkeleton } from "@/components/ui/skeletons";
import { getCurrentUser } from "@/lib/auth";
import { listCustomers, listTechnicians } from "@/lib/jobs/queries";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "New job" };

export default function NewJobPage() {
  return (
    <AppShell>
      <Suspense fallback={<FormSkeleton />}>
        <NewJobContent />
      </Suspense>
    </AppShell>
  );
}

async function NewJobContent() {
  await connection();

  const user = await getCurrentUser();
  if (!user) redirect("/login");
  // Only the office creates jobs; technicians are sent back to their list.
  if (user.role !== "office") redirect("/");

  const supabase = await createClient();
  const [customers, technicians] = await Promise.all([
    listCustomers(supabase),
    listTechnicians(supabase),
  ]);

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div>
        <Link
          href="/"
          className="text-sm text-muted underline-offset-2 hover:underline"
        >
          Back to the board
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">New job</h1>
      </div>
      <CreateJobForm customers={customers} technicians={technicians} />
    </div>
  );
}
