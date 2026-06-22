export default function IncidentDashboardLoading() {
  return (
    <main className="sys-container">
      {/* Title */}
      <div className="mb-10 space-y-2">
        <div className="h-9 w-72 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--sys-surface-muted)' }} />
        <div className="h-5 w-full max-w-lg rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }} />
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
          <div className="h-4 w-16 rounded mb-3" style={{ backgroundColor: 'var(--sys-surface-muted)' }} />
          <div className="h-12 w-20 rounded" style={{ backgroundColor: 'var(--sys-surface-muted)' }} />
        </div>
      </div>

      {/* Table Card */}
      <div className="sys-card">
        {/* Filter Bar */}
        <div className="p-4 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" style={{ backgroundColor: 'var(--sys-surface-muted)', borderColor: 'var(--sys-border)' }}>
          <div className="h-4 w-28 rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-muted)' }} />
          <div className="flex flex-wrap items-center gap-3">
            <div className="h-9 w-24 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }} />
            <div className="h-9 w-24 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }} />
            <div className="h-9 w-56 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }} />
          </div>
        </div>

        {/* Table Header */}
        <div className="px-5 py-3 border-b flex gap-6" style={{ borderColor: 'var(--sys-border)' }}>
          {['w-24', 'w-32', 'w-20', 'w-16', 'w-16', 'w-16'].map((w, i) => (
            <div key={i} className={`h-3 ${w} rounded animate-pulse`} style={{ backgroundColor: 'var(--sys-surface-subtle)' }} />
          ))}
        </div>

        {/* Table Rows */}
        <div className="divide-y" style={{ borderColor: 'var(--sys-border-subtle)' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-6 px-5 py-5">
              <div className="h-5 w-28 rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }} />
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full animate-pulse shrink-0" style={{ backgroundColor: 'var(--sys-surface-muted)' }} />
                <div className="space-y-1.5">
                  <div className="h-4 w-28 rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }} />
                  <div className="h-3 w-20 rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }} />
                </div>
              </div>
              <div className="h-5 w-24 rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }} />
              <div className="h-6 w-16 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--sys-surface-muted)' }} />
              <div className="h-6 w-16 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--sys-surface-muted)' }} />
              <div className="h-7 w-14 rounded-md animate-pulse ml-auto" style={{ backgroundColor: 'var(--sys-surface-subtle)' }} />
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t flex justify-between items-center" style={{ borderColor: 'var(--sys-border)' }}>
          <div className="h-4 w-32 rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }} />
          <div className="flex gap-2">
            <div className="h-8 w-20 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }} />
            <div className="h-8 w-16 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }} />
          </div>
        </div>
      </div>
    </main>
  );
}
