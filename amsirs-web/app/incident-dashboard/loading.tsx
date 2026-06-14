export default function IncidentDashboardLoading() {
  return (
    <main className="sys-container">
      {/* Title */}
      <div className="mb-10 space-y-2">
        <div className="h-9 w-72 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-5 w-full max-w-lg bg-gray-100 rounded animate-pulse" />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Primary gradient card */}
        <div className="stat-card-primary animate-pulse">
          <div className="h-4 w-28 bg-white/20 rounded mb-3" />
          <div className="h-12 w-16 bg-white/20 rounded" />
        </div>
        {/* Orange gradient card */}
        <div className="stat-card-orange animate-pulse">
          <div className="h-4 w-24 bg-white/20 rounded mb-3" />
          <div className="h-12 w-12 bg-white/20 rounded" />
        </div>
        {/* Standard card */}
        <div className="stat-card animate-pulse">
          <div className="h-4 w-16 bg-gray-200 rounded mb-3" />
          <div className="h-12 w-20 bg-gray-200 rounded" />
        </div>
      </div>

      {/* Table Card */}
      <div className="sys-card">
        {/* Filter Bar */}
        <div className="p-4 border-b border-gray-100 bg-zinc-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
          <div className="flex flex-wrap items-center gap-3">
            <div className="h-9 w-24 bg-gray-100 rounded-lg animate-pulse" />
            <div className="h-9 w-24 bg-gray-100 rounded-lg animate-pulse" />
            <div className="h-9 w-56 bg-gray-100 rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Table Header */}
        <div className="px-5 py-3 border-b border-gray-100 flex gap-6">
          {['w-24', 'w-32', 'w-20', 'w-16', 'w-16', 'w-16'].map((w, i) => (
            <div key={i} className={`h-3 ${w} bg-gray-100 rounded animate-pulse`} />
          ))}
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-gray-50">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-6 px-5 py-5">
              <div className="h-5 w-28 bg-gray-100 rounded animate-pulse" />
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse shrink-0" />
                <div className="space-y-1.5">
                  <div className="h-4 w-28 bg-gray-100 rounded animate-pulse" />
                  <div className="h-3 w-20 bg-gray-50 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-5 w-24 bg-gray-100 rounded animate-pulse" />
              <div className="h-6 w-16 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-6 w-16 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-7 w-14 bg-gray-100 rounded-md animate-pulse ml-auto" />
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center">
          <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="h-8 w-20 bg-gray-100 rounded-lg animate-pulse" />
            <div className="h-8 w-16 bg-gray-100 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </main>
  );
}
