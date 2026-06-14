"use client";

import { useEffect, useState } from "react";
import { fetchAccessLogs, getSnapshotSignedUrls } from "./actions";
import AccessLogsLoading from "./loading";

export default function AccessLogsPage() {

  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [actionFilter, setActionFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  
  // Need state for signed URLs since they must be fetched async
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  
  const ITEMS_PER_PAGE = 15;

  useEffect(() => {
    loadLogs();
  }, [currentPage, actionFilter, dateFilter]);

  async function loadLogs() {
    try {
      setLoading(true);
      
      const result = await fetchAccessLogs({
        page: currentPage,
        itemsPerPage: ITEMS_PER_PAGE,
        actionFilter: actionFilter,
        dateFilter: dateFilter
      });

      if (!result.success) {
        console.error("Failed to fetch logs:", result.error);
        setLogs([]);
        return;
      }

      const fetchedLogs = result.data || [];
      setLogs(fetchedLogs);
      setTotalLogs(result.count || 0);

      // Fetch signed URLs for all images in ONE bulk call
      const paths = fetchedLogs.map(log => log.snapshot_path).filter(Boolean);
      const urls = await getSnapshotSignedUrls(paths);
      setImageUrls(urls);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <AccessLogsLoading />;
  }

  return (
    <>
      {/* MAIN */}
      <main className="sys-container">
        <div className="mb-10">
          <h1 className="sys-title">
            Access Logs
          </h1>
          <p className="sys-subtitle mt-1">
            Real-time campus biometric access records.
          </p>
        </div>

        <div className="mb-6">
          <h2 className="sys-label">Security Records: Student Entry & Exit Logs</h2>
        </div>

        {/* TABLE CARD */}
        <div className="sys-card">

          <div className="p-4 border-b border-cavite-border bg-zinc-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="sys-label m-0 text-sm">Filter Security Records</h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Date</label>
                <select 
                  value={dateFilter} 
                  onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
                  className="bg-white text-sm font-medium px-3 py-2 rounded-lg border border-cavite-border outline-none focus:ring-2 focus:ring-cavite-maroon/20 focus:border-cavite-maroon cursor-pointer shadow-sm transition-all text-cavite-black min-w-[140px]"
                >
                  <option value="All">All Time</option>
                  <option value="Today">Today</option>
                  <option value="Yesterday">Yesterday</option>
                  <option value="This Week">Last 7 Days</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Action</label>
                <select 
                  value={actionFilter} 
                  onChange={(e) => { setActionFilter(e.target.value); setCurrentPage(1); }}
                  className="bg-white text-sm font-medium px-3 py-2 rounded-lg border border-cavite-border outline-none focus:ring-2 focus:ring-cavite-maroon/20 focus:border-cavite-maroon cursor-pointer shadow-sm transition-all text-cavite-black min-w-[140px]"
                >
                  <option value="All">All Actions</option>
                  <option value="Entry">Entry</option>
                  <option value="Exit">Exit</option>
                </select>
              </div>
            </div>
          </div>

          <div className="sys-table-wrapper max-h-[600px] overflow-auto">

            <table className="sys-table">
              <thead className="sticky top-0 z-10 bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
                <tr className="table-header-row">
                  <th className="table-th">Snapshot</th>
                  <th className="table-th">Student</th>
                  <th className="table-th">Student ID</th>
                  <th className="table-th">Action</th>
                  <th className="table-th">Match</th>
                  <th className="table-th">Timestamp</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">

                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-16 text-center text-zinc-400 bg-white">
                      <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      <p className="text-base font-medium">No access logs found.</p>
                      <p className="text-sm mt-1">Try adjusting your filters.</p>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="table-td" data-label="Snapshot">
                        {log.snapshot_path && imageUrls[log.snapshot_path] ? (
                          <img
                            src={imageUrls[log.snapshot_path]}
                            alt="snapshot"
                            className="w-16 h-16 object-cover rounded-xl"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-md bg-zinc-100 flex items-center justify-center text-xs font-semibold text-zinc-400">
                            NO IMAGE
                          </div>
                        )}
                      </td>
                      <td className="table-td font-semibold text-cavite-black" data-label="Student">
                        {log.students?.first_name} {log.students?.last_name}
                      </td>
                      <td className="table-td text-zinc-500 font-mono text-sm" data-label="Student ID">
                        {log.students?.student_id}
                      </td>
                      <td className="table-td" data-label="Action">
                        <span
                          className={`badge-primary ${
                            log.action === "ENTRY" ? "badge-success" : "badge-danger"
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="table-td font-semibold text-cavite-black" data-label="Match">
                        {log.match_percentage}%
                      </td>
                      <td className="table-td text-zinc-500 text-sm" data-label="Timestamp">
                        {new Date(log.created_at).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))
                )}

              </tbody>

            </table>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 bg-white px-8 py-6 gap-4">
            <p className="text-sm text-zinc-500 font-medium">
              Showing <span className="font-semibold text-cavite-black">{logs.length}</span> logs 
              (Total: <span className="font-semibold text-cavite-black">{totalLogs}</span>)
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn-outline px-4 py-1.5 text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(totalLogs / ITEMS_PER_PAGE), p + 1))}
                disabled={currentPage >= Math.ceil(totalLogs / ITEMS_PER_PAGE)}
                className="btn-outline px-4 py-1.5 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
          
        </div>

      </main>

    </>
  );
}