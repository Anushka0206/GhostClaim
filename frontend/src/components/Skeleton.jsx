export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-ink-100 rounded ${className}`} />;
}

export function DashboardSkeleton() {
  return (
    <div className="px-4 md:px-8 py-7 max-w-[1280px]">
      <Skeleton className="h-8 w-72 mb-2" />
      <Skeleton className="h-4 w-96 mb-7" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-ink-100 shadow-panel px-5 py-4">
            <Skeleton className="h-3 w-24 mb-3" />
            <Skeleton className="h-9 w-16 mb-2" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
        <div className="bg-white rounded-lg border border-ink-100 shadow-panel overflow-hidden">
          <div className="px-5 py-4 border-b border-ink-100 flex justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-7 w-48" />
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-ink-100 last:border-0">
              <Skeleton className="w-14 h-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-12" />
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg border border-ink-100 shadow-panel overflow-hidden h-fit">
          <div className="px-5 py-4 border-b border-ink-100">
            <Skeleton className="h-4 w-40 mb-2" />
            <Skeleton className="h-3 w-48" />
          </div>
          <div className="px-5 py-4 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1.5">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-14" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CaseDetailSkeleton() {
  return (
    <div className="px-4 md:px-8 py-7 max-w-[1100px]">
      <Skeleton className="h-3 w-32 mb-4" />
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-72" />
          <Skeleton className="h-5 w-28 mt-2" />
        </div>
        <Skeleton className="w-[110px] h-[70px] rounded-full shrink-0" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
        <div className="space-y-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-ink-100 shadow-panel">
              <div className="px-5 py-4 border-b border-ink-100">
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="px-5 py-4 space-y-3">
                {[...Array(4)].map((_, j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg border border-ink-100 shadow-panel h-fit">
          <div className="px-5 py-4 border-b border-ink-100">
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="px-5 py-4">
            <Skeleton className="h-32 w-full rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuditTrailSkeleton() {
  return (
    <div className="px-4 md:px-8 py-7 max-w-[920px]">
      <Skeleton className="h-8 w-64 mb-2" />
      <Skeleton className="h-4 w-full max-w-lg mb-6" />
      <Skeleton className="h-16 w-full rounded-lg mb-6" />
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex gap-4 mb-5">
          <Skeleton className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-20 w-full rounded-md" />
            <Skeleton className="h-3 w-64" />
          </div>
        </div>
      ))}
    </div>
  );
}
