export default function RegisterLoading() {
  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: 'var(--sys-page-bg)', color: 'var(--sys-text-primary)' }}>
      <main className="p-6 md:p-12 animate-in fade-in duration-500">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10 text-center">
            <div className="h-10 w-72 animate-pulse rounded-md mx-auto" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div>
            <div className="h-5 w-96 animate-pulse rounded-md mt-2 mx-auto" style={{ backgroundColor: 'var(--sys-surface-subtle)' }}></div>
          </div>

          <div className="rounded-2xl shadow-xl overflow-hidden border" style={{ backgroundColor: 'var(--sys-surface)', borderColor: 'var(--sys-border)' }}>
            <div className="p-8 md:p-10 space-y-10">
              
              {/* Account Credentials Section */}
              <div className="space-y-4">
                <div className="border-b pb-2" style={{ borderColor: 'var(--sys-border)' }}>
                  <div className="h-4 w-40 animate-pulse rounded-md" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                  <div className="space-y-2">
                    <div className="h-3 w-24 animate-pulse rounded-md" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div>
                    <div className="h-10 w-full border animate-pulse rounded-md" style={{ backgroundColor: 'var(--sys-surface-subtle)', borderColor: 'var(--sys-border)' }}></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-24 animate-pulse rounded-md" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div>
                    <div className="h-10 w-full border animate-pulse rounded-md" style={{ backgroundColor: 'var(--sys-surface-subtle)', borderColor: 'var(--sys-border)' }}></div>
                  </div>
                </div>
              </div>

              {/* Personal Information Section */}
              <div className="space-y-4">
                <div className="border-b pb-2" style={{ borderColor: 'var(--sys-border)' }}>
                  <div className="h-4 w-40 animate-pulse rounded-md" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                  <div className="space-y-2">
                    <div className="h-3 w-24 animate-pulse rounded-md" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div>
                    <div className="h-10 w-full border animate-pulse rounded-md" style={{ backgroundColor: 'var(--sys-surface-subtle)', borderColor: 'var(--sys-border)' }}></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-24 animate-pulse rounded-md" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div>
                    <div className="h-10 w-full border animate-pulse rounded-md" style={{ backgroundColor: 'var(--sys-surface-subtle)', borderColor: 'var(--sys-border)' }}></div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <div className="h-3 w-24 animate-pulse rounded-md" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div>
                    <div className="h-10 w-full border animate-pulse rounded-md" style={{ backgroundColor: 'var(--sys-surface-subtle)', borderColor: 'var(--sys-border)' }}></div>
                  </div>
                </div>
              </div>

              {/* Camera Capture Section */}
              <div className="space-y-4">
                <div className="border-b pb-2" style={{ borderColor: 'var(--sys-border)' }}>
                  <div className="h-4 w-48 animate-pulse rounded-md" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div>
                </div>
                
                <div className="p-4">
                  <div className="h-64 w-full md:w-80 mx-auto border-2 border-dashed animate-pulse rounded-xl" style={{ backgroundColor: 'var(--sys-surface-subtle)', borderColor: 'var(--sys-border)' }}></div>
                </div>
              </div>

              {/* Button */}
              <div className="pt-4 border-t" style={{ borderTopColor: 'var(--sys-border)' }}>
                <div className="h-14 w-full animate-pulse rounded-xl" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
