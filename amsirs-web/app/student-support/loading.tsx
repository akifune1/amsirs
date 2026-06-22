export default function StudentSupportLoading() {
  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: 'var(--sys-page-bg)', color: 'var(--sys-text-primary)' }}>


      <main className="sys-container">
        {/* Page Title Skeleton */}
        <div className="mb-10 space-y-2">
          <div className="h-8 w-96 rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-muted)' }} />
          <div className="h-5 w-full max-w-2xl rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }} />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="stat-card animate-pulse">
              <div className="h-4 w-24 rounded mb-2" style={{ backgroundColor: 'var(--sys-surface-muted)' }} />
              <div className="h-10 w-20 rounded" style={{ backgroundColor: 'var(--sys-surface-muted)' }} />
            </div>
          ))}
        </div>

        {/* Table Skeleton */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="h-6 w-48 rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-muted)' }} />
            <div className="h-4 w-80 rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }} />
          </div>

          {/* Search & Filter Skeleton */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 h-10 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--sys-surface-muted)' }} />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 w-16 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--sys-surface-muted)' }} />
              ))}
            </div>
          </div>

          {/* Table Skeleton */}
          <div className="sys-card">
            <div className="space-y-4 p-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-12 rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
