export default function ActiveSessionsLoading() {
  return (
    <main className="sys-container w-full">
      {/* Title */}
      <div className="mb-10 space-y-2">
        <div className="h-9 w-56 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--sys-surface-muted)' }} />
        <div className="h-5 w-80 rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }} />
      </div>

      {/* Table Card */}
      <div className="sys-card">
        {/* Header Bar */}
        <div className="p-4 border-b flex items-center justify-between" style={{ backgroundColor: 'var(--sys-surface-muted)', borderColor: 'var(--sys-border)' }}>
          <div className="h-4 w-52 rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-muted)' }} />
        </div>

        {/* Table Header */}
        <div className="px-5 py-3 border-b flex gap-6" style={{ borderColor: 'var(--sys-border)' }}>
          {['w-36', 'w-20', 'w-36', 'w-28', 'w-28', 'w-20'].map((w, i) => (
            <div key={i} className={`h-3 ${w} rounded animate-pulse`} style={{ backgroundColor: 'var(--sys-surface-subtle)' }} />
          ))}
        </div>

        {/* Table Rows */}
        <div className="divide-y" style={{ borderTopColor: 'var(--sys-border-subtle)' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-6 px-5 py-5">
              <div className="h-5 w-36 rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }} />
              <div className="h-5 w-20 rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }} />
              <div className="h-5 w-36 rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }} />
              <div className="h-5 w-28 rounded animate-pulse font-mono" style={{ backgroundColor: 'var(--sys-surface-subtle)' }} />
              <div className="h-5 w-28 rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }} />
              <div className="h-7 w-16 rounded-md animate-pulse ml-auto" style={{ backgroundColor: 'var(--sys-surface-muted)' }} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
