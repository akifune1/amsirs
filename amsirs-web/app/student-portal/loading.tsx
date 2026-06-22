export default function StudentPortalLoading() {
  return (
    <div className="min-h-screen">
      <main className="sys-container">
        {/* Title */}
        <div className="mb-10 space-y-2">
          <div className="h-9 w-60 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--sys-surface-muted)' }} />
          <div className="h-5 w-80 rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: Identity Card */}
          <section className="col-span-1">
            <div className="sys-card">
              <div className="sys-card-header">
                <div className="h-3 w-24 rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-muted)' }} />
              </div>
              <div className="p-6 md:p-8 space-y-6">
                {/* Photo + ID */}
                <div className="flex items-center gap-5 border-b pb-6" style={{ borderColor: 'var(--sys-border)' }}>
                  <div className="w-20 h-20 rounded-full animate-pulse shrink-0" style={{ backgroundColor: 'var(--sys-surface-muted)' }} />
                  <div className="space-y-2">
                    <div className="h-3 w-16 rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }} />
                    <div className="h-7 w-24 rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-muted)' }} />
                    <div className="h-3 w-32 rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }} />
                  </div>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2].map(i => (
                    <div key={i} className="space-y-2">
                      <div className="h-3 w-16 rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }} />
                      <div className="h-10 w-full rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }} />
                    </div>
                  ))}
                </div>

                {/* Demographics */}
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2].map(i => (
                    <div key={i} className="space-y-2">
                      <div className="h-3 w-20 rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }} />
                      <div className="h-10 w-full rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }} />
                    </div>
                  ))}
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <div className="h-3 w-28 rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }} />
                  <div className="h-16 w-full rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }} />
                </div>

                {/* Academics */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t" style={{ borderColor: 'var(--sys-border)' }}>
                  {[1, 2].map(i => (
                    <div key={i} className="space-y-2">
                      <div className="h-3 w-14 rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }} />
                      <div className="h-10 w-full rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT COLUMN: Involvement Logs */}
          <section className="col-span-1 lg:col-span-2">
            <div className="sys-card">
              <div className="sys-card-header">
                <div className="h-3 w-28 rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-muted)' }} />
                <div className="h-5 w-16 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }} />
              </div>
              <div className="divide-y" style={{ borderTopColor: 'var(--sys-border-subtle)' }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-5 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg animate-pulse shrink-0" style={{ backgroundColor: 'var(--sys-surface-muted)' }} />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-40 rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }} />
                      <div className="h-3 w-full max-w-sm rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }} />
                      <div className="flex gap-3 mt-1">
                        <div className="h-5 w-14 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--sys-surface-muted)' }} />
                        <div className="h-5 w-16 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--sys-surface-muted)' }} />
                      </div>
                    </div>
                    <div className="h-4 w-20 rounded animate-pulse shrink-0" style={{ backgroundColor: 'var(--sys-surface-subtle)' }} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
