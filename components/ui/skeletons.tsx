function Block({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-surface-muted ${className}`}
      aria-hidden="true"
    />
  );
}

export function HeaderSkeleton() {
  return (
    <div className="flex items-center gap-3" aria-hidden="true">
      <Block className="h-5 w-24" />
    </div>
  );
}

export function BoardSkeleton() {
  return (
    <div role="status" aria-label="Loading jobs" className="space-y-6">
      <Block className="h-8 w-56" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((n) => (
          <Block key={n} className="h-20" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((n) => (
          <Block key={n} className="h-64" />
        ))}
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div role="status" aria-label="Loading form" className="space-y-4">
      <Block className="h-8 w-40" />
      <Block className="h-96" />
    </div>
  );
}
