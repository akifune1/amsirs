export default function AdminDashboardLoading() {
  return (
    <main className="sys-container">
      {/* Title */}
      <div className="mb-10 space-y-2">
        <div className="h-9 w-80 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-5 w-64 bg-gray-100 rounded animate-pulse" />
      </div>

      {/* Tab Bar Skeleton */}
      <div className="flex gap-4 mb-8 border-b border-gray-200 pb-3">
        <div className="h-9 w-24 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-9 w-28 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-9 w-24 bg-gray-100 rounded-lg animate-pulse" />
      </div>

      {/* Filter / Search / Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 h-10 bg-gray-100 rounded-xl animate-pulse" />
        <div className="flex gap-3">
          <div className="h-10 w-28 bg-gray-100 rounded-xl animate-pulse" />
          <div className="h-10 w-28 bg-gray-100 rounded-xl animate-pulse" />
          <div className="h-10 w-36 bg-gray-200 rounded-xl animate-pulse" />
        </div>
      </div>

      {/* Table Card */}
      <div className="sys-card">
        {/* Table Header */}
        <div className="p-4 border-b border-gray-100 flex gap-6">
          {[120, 90, 100, 80, 80, 60].map((w, i) => (
            <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: w }} />
          ))}
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-gray-50">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-6 px-4 py-4">
              <div className="h-5 w-28 bg-gray-100 rounded animate-pulse" />
              <div className="h-5 w-24 bg-gray-100 rounded animate-pulse" />
              <div className="h-5 w-20 bg-gray-100 rounded animate-pulse" />
              <div className="h-6 w-16 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-6 w-16 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-7 w-14 bg-gray-100 rounded-md animate-pulse ml-auto" />
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center">
          <div className="h-4 w-40 bg-gray-100 rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="h-8 w-20 bg-gray-100 rounded-lg animate-pulse" />
            <div className="h-8 w-16 bg-gray-100 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </main>
  );
}
