export default function AccessGateLoading() {
  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: 'var(--sys-page-bg)' }}>
      <main className="p-6 md:p-10 animate-in fade-in duration-500">
        
        {/* HEADER SKELETON */}
        <div className="mb-8">
          <div className="h-12 w-96 animate-pulse rounded-md" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div>
          <div className="h-5 w-2/3 max-w-lg animate-pulse rounded-md mt-4" style={{ backgroundColor: 'var(--sys-surface-subtle)' }}></div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* CAMERA FEED SKELETON */}
          <div className="xl:col-span-2">
            <div className="rounded-3xl shadow-xl border overflow-hidden" style={{ backgroundColor: 'var(--sys-surface)', borderColor: 'var(--sys-border)' }}>
              <div className="border-b px-6 py-5 flex items-center justify-between" style={{ borderColor: 'var(--sys-border)' }}>
                <div>
                  <div className="h-3 w-32 animate-pulse rounded-md" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div>
                  <div className="h-6 w-48 animate-pulse rounded-md mt-2" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div>
                </div>
                <div className="h-6 w-16 animate-pulse rounded-full" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div>
              </div>
              <div className="bg-black p-4">
                <div className="w-full h-[650px] bg-gray-800 animate-pulse rounded-2xl border-4 border-gray-700"></div>
              </div>
            </div>
          </div>

          {/* SIDE PANEL SKELETONS */}
          <div className="space-y-6">
            
            {/* Identity Profile Skeleton */}
            <div className="rounded-3xl shadow-xl border overflow-hidden" style={{ backgroundColor: 'var(--sys-surface)', borderColor: 'var(--sys-border)' }}>
              <div className="border-b px-6 py-5" style={{ borderColor: 'var(--sys-border)' }}>
                <div className="h-3 w-32 animate-pulse rounded-md" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div>
                <div className="h-6 w-48 animate-pulse rounded-md mt-2" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div>
              </div>
              <div className="p-6">
                <div className="border rounded-2xl p-6 min-h-[250px] flex flex-col items-center justify-center" style={{ backgroundColor: 'var(--sys-surface-subtle)', borderColor: 'var(--sys-border)' }}>
                  <div className="w-16 h-16 rounded-full animate-pulse mb-4" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div>
                  <div className="h-5 w-32 animate-pulse rounded-md mb-2" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div>
                  <div className="h-4 w-48 animate-pulse rounded-md" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div>
                </div>
              </div>
            </div>

            {/* AI Monitoring Skeleton */}
            <div className="rounded-3xl shadow-xl border overflow-hidden" style={{ backgroundColor: 'var(--sys-surface)', borderColor: 'var(--sys-border)' }}>
              <div className="border-b px-6 py-5" style={{ borderColor: 'var(--sys-border)' }}>
                <div className="h-3 w-32 animate-pulse rounded-md" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div>
                <div className="h-6 w-40 animate-pulse rounded-md mt-2" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-4 w-24 animate-pulse rounded-md" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div>
                    <div className="h-8 w-32 animate-pulse rounded-md mt-2" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div>
                  </div>
                  <div className="w-16 h-16 rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl shadow-xl overflow-hidden h-36 animate-pulse" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div>
            
          </div>
        </div>
      </main>
    </div>
  );
}
