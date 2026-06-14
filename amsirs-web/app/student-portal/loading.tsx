export default function StudentPortalLoading() {
  return (
    <div className="min-h-screen">
      <main className="sys-container">
        {/* Title */}
        <div className="mb-10 space-y-2">
          <div className="h-9 w-60 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-5 w-80 bg-gray-100 rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: Identity Card */}
          <section className="col-span-1">
            <div className="sys-card">
              <div className="sys-card-header">
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="p-6 md:p-8 space-y-6">
                {/* Photo + ID */}
                <div className="flex items-center gap-5 border-b border-gray-100 pb-6">
                  <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse shrink-0" />
                  <div className="space-y-2">
                    <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
                    <div className="h-7 w-24 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
                  </div>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2].map(i => (
                    <div key={i} className="space-y-2">
                      <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
                      <div className="h-10 w-full bg-gray-50 rounded-2xl animate-pulse" />
                    </div>
                  ))}
                </div>

                {/* Demographics */}
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2].map(i => (
                    <div key={i} className="space-y-2">
                      <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
                      <div className="h-10 w-full bg-gray-50 rounded-2xl animate-pulse" />
                    </div>
                  ))}
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <div className="h-3 w-28 bg-gray-100 rounded animate-pulse" />
                  <div className="h-16 w-full bg-gray-50 rounded-2xl animate-pulse" />
                </div>

                {/* Academics */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  {[1, 2].map(i => (
                    <div key={i} className="space-y-2">
                      <div className="h-3 w-14 bg-gray-100 rounded animate-pulse" />
                      <div className="h-10 w-full bg-gray-50 rounded-2xl animate-pulse" />
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
                <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" />
                <div className="h-5 w-16 bg-gray-100 rounded-xl animate-pulse" />
              </div>
              <div className="divide-y divide-gray-50">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-5 flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-40 bg-gray-100 rounded animate-pulse" />
                      <div className="h-3 w-full max-w-sm bg-gray-50 rounded animate-pulse" />
                      <div className="flex gap-3 mt-1">
                        <div className="h-5 w-14 bg-gray-200 rounded-lg animate-pulse" />
                        <div className="h-5 w-16 bg-gray-200 rounded-lg animate-pulse" />
                      </div>
                    </div>
                    <div className="h-4 w-20 bg-gray-100 rounded animate-pulse shrink-0" />
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
