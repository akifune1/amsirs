export default function AccessLogsLoading() {
  return (
    <main className="sys-container animate-in fade-in duration-500">
      <div className="mb-10">
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded-md mb-2"></div>
        <div className="h-4 w-64 bg-gray-100 animate-pulse rounded-md"></div>
      </div>

      <div className="mb-6">
        <div className="h-6 w-72 bg-gray-200 animate-pulse rounded-md"></div>
      </div>

      <div className="sys-card">
        {/* Filters Header */}
        <div className="p-4 border-b border-cavite-border bg-zinc-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="h-5 w-40 bg-gray-200 animate-pulse rounded-md"></div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="h-10 w-[140px] bg-white border border-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-10 w-[140px] bg-white border border-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Table Wrapper */}
        <div className="sys-table-wrapper">
          <table className="sys-table">
            <thead className="bg-white">
              <tr className="table-header-row">
                <th className="table-th w-[100px]"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div></th>
                <th className="table-th"><div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div></th>
                <th className="table-th"><div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div></th>
                <th className="table-th"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div></th>
                <th className="table-th"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div></th>
                <th className="table-th"><div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[...Array(6)].map((_, i) => (
                <tr key={i} className="table-row">
                  <td className="table-td">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 animate-pulse"></div>
                  </td>
                  <td className="table-td">
                    <div className="h-5 w-32 bg-gray-200 rounded mb-1 animate-pulse"></div>
                    <div className="h-3 w-20 bg-gray-100 rounded animate-pulse"></div>
                  </td>
                  <td className="table-td">
                    <div className="h-4 w-24 bg-gray-100 rounded animate-pulse"></div>
                  </td>
                  <td className="table-td">
                    <div className="h-6 w-16 bg-gray-100 rounded-full animate-pulse"></div>
                  </td>
                  <td className="table-td">
                    <div className="h-4 w-12 bg-gray-100 rounded animate-pulse"></div>
                  </td>
                  <td className="table-td">
                    <div className="h-4 w-32 bg-gray-100 rounded animate-pulse"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
