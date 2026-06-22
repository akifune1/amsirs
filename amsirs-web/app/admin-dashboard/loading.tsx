export default function AdminDashboardLoading() {
  return (
    <main className="sys-container">
      {/* Title */}
      <div className="mb-10 space-y-2">
        <div className="h-9 w-80 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--sys-surface-muted)' }} />
        <div className="h-5 w-64 rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }} />
      </div>

      {/* Tab Bar Skeleton */}
      <div className="flex gap-4 mb-8 border-b pb-3" style={{ borderColor: 'var(--sys-border)' }}>
        <div className="h-9 w-24 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--sys-surface-muted)' }} />
        <div className="h-9 w-28 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }} />
        <div className="h-9 w-24 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }} />
      </div>

      {/* Filter / Search / Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 h-10 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }} />
        <div className="flex gap-3">
          <div className="h-10 w-28 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }} />
          <div className="h-10 w-28 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }} />
          <div className="h-10 w-36 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--sys-surface-muted)' }} />
        </div>
      </div>

      {/* Table Card */}
      <div className="sys-card">
        {/* Table Header */}
        <div className="p-4 border-b flex gap-6" style={{ borderColor: 'var(--sys-border)' }}>
          {[120, 90, 100, 80, 80, 60].map((w, i) => (
            <div key={i} className="h-4 rounded animate-pulse" style={{ width: w, backgroundColor: 'var(--sys-surface-subtle)' }} />
          ))}
        </div>

        {/* Table Rows */}
        <div className="divide-y" style={{ borderTopColor: 'var(--sys-border-subtle)' }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-6 px-4 py-4">
              <div className="h-5 w-28 rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }} />
              <div className="h-5 w-24 rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }} />
              <div className="h-5 w-20 rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }} />
              <div className="h-6 w-16 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--sys-surface-muted)' }} />
              <div className="h-6 w-16 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--sys-surface-muted)' }} />
              <div className="h-7 w-14 rounded-md animate-pulse ml-auto" style={{ backgroundColor: 'var(--sys-surface-subtle)' }} />
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t flex justify-between items-center" style={{ borderColor: 'var(--sys-border)' }}>
          <div className="h-4 w-40 rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }} />
          <div className="flex gap-2">
            <div className="h-8 w-20 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }} />
            <div className="h-8 w-16 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }} />
          </div>
        </div>
      </div>
    </main>
  );
}
