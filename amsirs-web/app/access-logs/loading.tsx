export default function AccessLogsLoading() {
  return (
    <main className="sys-container animate-in fade-in duration-500">
      <div className="mb-10">
        <div className="h-8 w-48 animate-pulse rounded-md mb-2" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div>
        <div className="h-4 w-64 animate-pulse rounded-md" style={{ backgroundColor: 'var(--sys-surface-subtle)' }}></div>
      </div>

      <div className="mb-6">
        <div className="h-6 w-72 animate-pulse rounded-md" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div>
      </div>

      <div className="sys-card">
        {/* Filters Header */}
        <div className="p-4 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" style={{ backgroundColor: 'var(--sys-surface-muted)', borderColor: 'var(--sys-border)' }}>
          <div className="h-5 w-40 animate-pulse rounded-md" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="h-10 w-[140px] border rounded-lg animate-pulse" style={{ backgroundColor: 'var(--sys-surface)', borderColor: 'var(--sys-border)' }}></div>
            <div className="h-10 w-[140px] border rounded-lg animate-pulse" style={{ backgroundColor: 'var(--sys-surface)', borderColor: 'var(--sys-border)' }}></div>
          </div>
        </div>

        {/* Table Wrapper */}
        <div className="sys-table-wrapper">
          <table className="sys-table">
            <thead style={{ backgroundColor: 'var(--sys-table-header-bg)' }}>
              <tr className="table-header-row">
                <th className="table-th w-[100px]"><div className="h-4 w-16 rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div></th>
                <th className="table-th"><div className="h-4 w-24 rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div></th>
                <th className="table-th"><div className="h-4 w-24 rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div></th>
                <th className="table-th"><div className="h-4 w-16 rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div></th>
                <th className="table-th"><div className="h-4 w-16 rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div></th>
                <th className="table-th"><div className="h-4 w-24 rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div></th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--sys-border-subtle)' }}>
              {[...Array(6)].map((_, i) => (
                <tr key={i} className="table-row">
                  <td className="table-td">
                    <div className="w-12 h-12 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }}></div>
                  </td>
                  <td className="table-td">
                    <div className="h-5 w-32 rounded mb-1 animate-pulse" style={{ backgroundColor: 'var(--sys-surface-muted)' }}></div>
                    <div className="h-3 w-20 rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }}></div>
                  </td>
                  <td className="table-td">
                    <div className="h-4 w-24 rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }}></div>
                  </td>
                  <td className="table-td">
                    <div className="h-6 w-16 rounded-full animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }}></div>
                  </td>
                  <td className="table-td">
                    <div className="h-4 w-12 rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }}></div>
                  </td>
                  <td className="table-td">
                    <div className="h-4 w-32 rounded animate-pulse" style={{ backgroundColor: 'var(--sys-surface-subtle)' }}></div>
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
