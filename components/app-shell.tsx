import { Suspense, type ReactNode } from "react";
import { AppHeader, Brand } from "@/components/app-header";
import { HeaderSkeleton } from "@/components/ui/skeletons";

// Page frame: the brand is static, the user menu streams in.
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Brand />
          <Suspense fallback={<HeaderSkeleton />}>
            <AppHeader />
          </Suspense>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
