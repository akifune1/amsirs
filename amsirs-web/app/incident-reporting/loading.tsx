export default function IncidentReportingLoading() {
  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: 'var(--sys-page-bg)', color: 'var(--sys-text-primary)' }}>
      <main className="sys-container max-w-4xl animate-in fade-in duration-500">
        <div className="mb-10 text-center md:text-left">
          <div className="h-10 w-64 animate-pulse rounded-md mx-auto md:mx-0" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div>
          <div className="h-5 w-48 animate-pulse rounded-md mt-2 mx-auto md:mx-0" style={{ backgroundColor: 'var(--sys-surface-subtle)' }}></div>
        </div>

        <div className="sys-card">
          <div className="sys-card-header flex justify-between">
            <div className="h-4 w-32 animate-pulse rounded-md" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div>
              <div className="h-3 w-20 animate-pulse rounded-md" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div>
            </div>
          </div>

          <div className="p-8 md:p-10 space-y-10">
            {/* Student Section */}
            <div className="space-y-4">
              <div className="border-b pb-2" style={{ borderColor: 'var(--sys-border)' }}>
                <div className="h-4 w-32 animate-pulse rounded-md" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl border" style={{ backgroundColor: 'var(--sys-surface-subtle)', borderColor: 'var(--sys-border)' }}>
                <div className="space-y-2">
                  <div className="h-3 w-24 animate-pulse rounded-md" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div>
                  <div className="h-10 w-full border animate-pulse rounded-md" style={{ backgroundColor: 'var(--sys-surface)', borderColor: 'var(--sys-border)' }}></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-20 animate-pulse rounded-md" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div>
                  <div className="h-10 w-full border animate-pulse rounded-md" style={{ backgroundColor: 'var(--sys-surface)', borderColor: 'var(--sys-border)' }}></div>
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div className="space-y-4">
              <div className="border-b pb-2" style={{ borderColor: 'var(--sys-border)' }}>
                <div className="h-4 w-32 animate-pulse rounded-md" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl border" style={{ backgroundColor: 'var(--sys-surface-subtle)', borderColor: 'var(--sys-border)' }}>
                <div className="space-y-2">
                  <div className="h-3 w-16 animate-pulse rounded-md" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div>
                  <div className="h-10 w-full border animate-pulse rounded-md" style={{ backgroundColor: 'var(--sys-surface)', borderColor: 'var(--sys-border)' }}></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-24 animate-pulse rounded-md" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div>
                  <div className="h-10 w-full border animate-pulse rounded-md" style={{ backgroundColor: 'var(--sys-surface)', borderColor: 'var(--sys-border)' }}></div>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-2">
              <div className="h-3 w-24 animate-pulse rounded-md" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div>
              <div className="h-32 w-full border animate-pulse rounded-md" style={{ backgroundColor: 'var(--sys-surface)', borderColor: 'var(--sys-border)' }}></div>
            </div>

            {/* Button */}
            <div className="pt-4 border-t" style={{ borderTopColor: 'var(--sys-border)' }}>
              <div className="h-12 w-full md:w-64 animate-pulse rounded-lg" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
