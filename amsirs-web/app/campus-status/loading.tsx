export default function CampusStatusLoading() {
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <main className="p-6 md:p-10 animate-in fade-in duration-500">
        
        {/* HEADER */}
        <div className="mb-8">
          <div className="h-10 w-72 bg-gray-300 animate-pulse rounded-md"></div>
          <div className="h-5 w-96 bg-gray-200 animate-pulse rounded-md mt-4"></div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6">
              <div className="h-3 w-32 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-12 w-20 bg-gray-200 animate-pulse rounded mt-4"></div>
              <div className="h-4 w-48 bg-gray-100 animate-pulse rounded mt-4"></div>
            </div>
          ))}
        </div>

        {/* TABLE CARD SKELETON */}
        <div className="sys-card mt-8">
          <div className="p-4 border-b border-cavite-border bg-zinc-50/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="h-5 w-48 bg-gray-200 animate-pulse rounded-md"></div>
            <div className="w-full md:w-72">
              <div className="h-10 w-full bg-white border border-gray-200 rounded-md animate-pulse"></div>
            </div>
          </div>
          
          <div className="sys-table-wrapper">
            <table className="sys-table">
              <thead className="bg-white">
                <tr className="table-header-row">
                  <th className="table-th w-[40%]"><div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div></th>
                  <th className="table-th"><div className="h-4 w-24 mx-auto bg-gray-200 rounded animate-pulse"></div></th>
                  <th className="table-th"><div className="h-4 w-32 mx-auto bg-gray-200 rounded animate-pulse"></div></th>
                  <th className="table-th"><div className="h-4 w-32 mx-auto bg-gray-200 rounded animate-pulse"></div></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="table-row">
                    <td className="table-td">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-lg bg-gray-100 animate-pulse shrink-0"></div>
                        <div>
                          <div className="h-4 w-40 bg-gray-200 rounded mb-2 animate-pulse"></div>
                          <div className="h-3 w-32 bg-gray-100 rounded mb-2 animate-pulse"></div>
                          <div className="h-4 w-16 bg-green-100 rounded animate-pulse"></div>
                        </div>
                      </div>
                    </td>
                    <td className="table-td">
                      <div className="h-4 w-24 mx-auto bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="table-td text-center">
                      <div className="inline-flex flex-col items-center">
                        <div className="h-6 w-12 bg-blue-100 rounded mb-1 animate-pulse"></div>
                        <div className="h-2 w-16 bg-gray-100 rounded animate-pulse"></div>
                      </div>
                    </td>
                    <td className="table-td">
                      <div className="h-16 w-24 mx-auto bg-gray-100 rounded animate-pulse"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
