export default function CampusStatusLoading() {
  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: 'var(--sys-page-bg)' }}>
      <main className="p-6 md:p-10 animate-in fade-in duration-500">
        
        {/* HEADER */}
        <div className="mb-8">
          <div className="h-10 w-72 animate-pulse rounded-md" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div>
          <div className="h-5 w-96 animate-pulse rounded-md mt-4" style={{ backgroundColor: 'var(--sys-surface-subtle)' }}></div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-3xl shadow-xl border p-6" style={{ backgroundColor: 'var(--sys-surface)', borderColor: 'var(--sys-border)' }}>
              <div className="h-3 w-32 animate-pulse rounded" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div>
              <div className="h-12 w-20 animate-pulse rounded mt-4" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div>
              <div className="h-4 w-48 animate-pulse rounded mt-4" style={{ backgroundColor: 'var(--sys-surface-subtle)' }}></div>
            </div>
          ))}
        </div>

        {/* TABLE CARD SKELETON */}
        <div className="sys-card mt-8">
          <div className="p-4 border-b flex flex-col md:flex-row items-start md:items-center justify-between gap-4" style={{ backgroundColor: 'var(--sys-surface-muted)', borderColor: 'var(--sys-border)' }}>
            <div className="h-5 w-48 animate-pulse rounded-md" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div>
            <div className="w-full md:w-72">
              <div className="h-10 w-full border rounded-md animate-pulse" style={{ backgroundColor: 'var(--sys-surface)', borderColor: 'var(--sys-border)' }}></div>
            </div>
          </div>
          
          <div className="sys-table-wrapper">
            <table className="sys-table">
              <thead style={{ backgroundColor: 'var(--sys-table-header-bg)' }}>
                <tr className="table-header-row">
                  <th className="table-th w-[40%]"><div className="h-4 w-32 rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div></th>
                  <th className="table-th"><div className="h-4 w-24 mx-auto rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div></th>
                  <th className="table-th"><div className="h-4 w-32 mx-auto rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div></th>
                  <th className="table-th"><div className="h-4 w-32 mx-auto rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div></th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderTopColor: 'var(--sys-border-subtle)' }}>
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="table-row">
                    <td className="table-td">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-lg animate-pulse shrink-0" style={{ backgroundColor: 'var(--sys-surface-subtle)' }}></div>
                        <div>
                          <div className="h-4 w-40 rounded mb-2 animate-pulse" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div>
                          <div className="h-3 w-32 rounded mb-2 animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }}></div>
                          <div className="h-4 w-16 rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="table-td">
                      <div className="h-4 w-24 mx-auto rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div>
                    </td>
                    <td className="table-td text-center">
                      <div className="inline-flex flex-col items-center">
                        <div className="h-6 w-12 rounded mb-1 animate-pulse" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div>
                        <div className="h-2 w-16 rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }}></div>
                      </div>
                    </td>
                    <td className="table-td">
                      <div className="h-16 w-24 mx-auto rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }}></div>
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
