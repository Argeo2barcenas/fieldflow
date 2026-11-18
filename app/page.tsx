import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { AppShell } from "@/components/app-shell";
import { OfficeBoard } from "@/components/jobs/office-board";
import { TechnicianJobs } from "@/components/jobs/technician-jobs";
import { BoardSkeleton } from "@/components/ui/skeletons";
import { getCurrentUser } from "@/lib/auth";

// The frame is static; what you see inside depends on your role.
export default function Home() {
  return (
    <AppShell>
      <Suspense fallback={<BoardSkeleton />}>
        <Dashboard />
      </Suspense>
    </AppShell>
  );
}

async function Dashboard() {
  // Reading the session happens at request time.
  await connection();

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return user.role === "office" ? <OfficeBoard /> : <TechnicianJobs />;
}
