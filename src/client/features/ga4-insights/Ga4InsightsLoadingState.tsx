// Skeleton loading state for the GA4 Insights page. Mirrors the loaded layout:
// four totals cards over a trend panel and a tabbed table shell that stays put
// while only the data fills in, matching other pages' loaders.
export function Ga4InsightsLoadingState() {
  return (
    <div className="space-y-4" aria-busy>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="space-y-2 rounded-lg border border-base-300 bg-base-100 p-4"
          >
            <div className="skeleton h-3 w-20" />
            <div className="skeleton h-7 w-24" />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-base-300 bg-base-100">
        <div className="h-[220px] p-4">
          <div className="skeleton h-full w-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="space-y-3 rounded-xl border border-base-300 bg-base-100 p-5"
          >
            <div className="skeleton h-4 w-32" />
            <div className="skeleton h-2 w-full" />
            <div className="skeleton h-2 w-4/5" />
            <div className="skeleton h-2 w-2/3" />
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-base-300 bg-base-100">
        <div className="flex flex-col gap-3 border-b border-base-300 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="skeleton h-8 w-24" />
            <div className="skeleton h-8 w-32" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="skeleton h-8 w-36" />
            <div className="skeleton h-8 w-36" />
            <div className="skeleton h-8 w-36" />
          </div>
        </div>
        <div className="space-y-3 p-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="grid grid-cols-7 gap-3">
              <div className="skeleton col-span-2 h-4" />
              <div className="skeleton h-4" />
              <div className="skeleton h-4" />
              <div className="skeleton h-4" />
              <div className="skeleton h-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
