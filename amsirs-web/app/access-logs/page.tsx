"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AccessLogsPage() {

  const [logs, setLogs] =
    useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [actionFilter, setActionFilter] = useState('All');
  const ITEMS_PER_PAGE = 15;

  useEffect(() => {
    fetchLogs();
  }, [currentPage, actionFilter]);

  async function fetchLogs() {
    try {
      setLoading(true);
      let query = supabase
        .from("access_logs")
        .select(`
          *,
          students (
            first_name,
            last_name,
            student_id,
            face_photo_path
          )
        `, { count: 'exact' });

      if (actionFilter !== 'All') {
        query = query.eq('action', actionFilter);
      }

      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (error) {
        console.error("Supabase fetch error:", error);
        return;
      }

      setLogs(data || []);
      setTotalLogs(count || 0);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function getSnapshotUrl(path: string) {
    return supabase.storage
      .from("access-snapshots")
      .getPublicUrl(path)
      .data.publicUrl;
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

        {/* TABLE CARD */}
        <div className="sys-card">

          <div className="sys-card-header flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="sys-label">Security Records</p>
              <h2 className="text-lg font-bold text-cavite-black mt-1">
                Student Entry & Exit Logs
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-zinc-500">Filter:</label>
              <select 
                value={actionFilter} 
                onChange={(e) => { setActionFilter(e.target.value); setCurrentPage(1); }}
                className="input-field py-1.5"
              >
                <option value="All">All Actions</option>
                <option value="Entry">Entry</option>
                <option value="Exit">Exit</option>
              </select>
            </div>
          </div>

          <div className="sys-table-wrapper">

            <table className="sys-table">
              <thead>
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

                {loading ? (
                  <tr>
                    <td colSpan={6} className="table-td text-center py-10 text-zinc-400 font-medium text-sm">
                      Loading access logs...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="table-td text-center py-10 text-zinc-400 font-medium text-sm">
                      No access logs found.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="table-td">
                        {log.snapshot_path ? (
                          <img
                            src={getSnapshotUrl(log.snapshot_path)}
                            alt="snapshot"
                            className="w-16 h-16 object-cover rounded-xl"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-md bg-zinc-100 flex items-center justify-center text-xs font-semibold text-zinc-400">
                            NO IMAGE
                          </div>
                        )}
                      </td>
                      <td className="table-td font-semibold text-cavite-black">
                        {log.students?.first_name} {log.students?.last_name}
                      </td>
                      <td className="table-td text-zinc-500 font-mono text-sm">
                        {log.students?.student_id}
                      </td>
                      <td className="table-td">
                        <span
                          className={`badge-primary ${
                            log.action === "ENTRY" ? "badge-success" : "badge-danger"
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="table-td font-semibold text-cavite-black">
                        {log.match_percentage}%
                      </td>
                      <td className="table-td text-zinc-500 text-sm">
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