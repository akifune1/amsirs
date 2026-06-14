export default function ActiveSessionsLoading() {
  return (
    <main className="sys-container w-full">
      {/* Title */}
      <div className="mb-10 space-y-2">
        <div className="h-9 w-56 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-5 w-80 bg-gray-100 rounded animate-pulse" />
      </div>

      {/* Table Card */}
      <div className="sys-card">
        {/* Header Bar */}
        <div className="p-4 border-b border-gray-100 bg-zinc-50/50 flex items-center justify-between">
          <div className="h-4 w-52 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Table Header */}
        <div className="px-5 py-3 border-b border-gray-100 flex gap-6">
          {['w-36', 'w-20', 'w-36', 'w-28', 'w-28', 'w-20'].map((w, i) => (
            <div key={i} className={`h-3 ${w} bg-gray-100 rounded animate-pulse`} />
          ))}
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-gray-50">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-6 px-5 py-5">
              <div className="h-5 w-36 bg-gray-100 rounded animate-pulse" />
              <div className="h-5 w-20 bg-gray-100 rounded animate-pulse" />
              <div className="h-5 w-36 bg-gray-100 rounded animate-pulse" />
              <div className="h-5 w-28 bg-gray-50 rounded animate-pulse font-mono" />
              <div className="h-5 w-28 bg-gray-100 rounded animate-pulse" />
              <div className="h-7 w-16 bg-red-50 rounded-md animate-pulse ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
