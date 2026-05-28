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

  function getSnapshotUrl(
    path: string
  ) {

    return supabase.storage
      .from("access-snapshots")
      .getPublicUrl(path)
      .data.publicUrl;
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">

      {/* NAVBAR */}

      

      {/* MAIN */}

      <main className="p-6 md:p-10">

        <div className="mb-8">

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
            Access Logs
          </h1>

          <p className="text-gray-500 font-medium mt-2">
            Real-time campus biometric access records.
          </p>

        </div>

        {/* TABLE CARD */}

        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">

          <div className="border-b border-gray-100 px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black tracking-[0.2em] uppercase text-gray-400">
                Security Records
              </p>
              <h2 className="text-xl font-bold text-gray-900 mt-1">
                Student Entry & Exit Logs
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">Filter:</label>
              <select 
                value={actionFilter} 
                onChange={(e) => { setActionFilter(e.target.value); setCurrentPage(1); }}
                className="bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold rounded-lg focus:ring-cavite-maroon focus:border-cavite-maroon block w-full p-2.5 outline-none cursor-pointer"
              >
                <option value="All">All Actions</option>
                <option value="Entry">Entry</option>
                <option value="Exit">Exit</option>
              </select>
            </div>
          </div>

          <div className="overflow-auto">

            <table className="w-full">

              <thead className="bg-gray-50 border-b border-gray-200">

                <tr>

                  <th className="text-left p-5 text-xs font-black uppercase tracking-wider text-gray-500">
                    Snapshot
                  </th>

                  <th className="text-left p-5 text-xs font-black uppercase tracking-wider text-gray-500">
                    Student
                  </th>

                  <th className="text-left p-5 text-xs font-black uppercase tracking-wider text-gray-500">
                    Student ID
                  </th>

                  <th className="text-left p-5 text-xs font-black uppercase tracking-wider text-gray-500">
                    Action
                  </th>

                  <th className="text-left p-5 text-xs font-black uppercase tracking-wider text-gray-500">
                    Match
                  </th>

                  <th className="text-left p-5 text-xs font-black uppercase tracking-wider text-gray-500">
                    Timestamp
                  </th>

                </tr>

              </thead>

              <tbody>

                {loading ? (

                  <tr>

                    <td
                      colSpan={6}
                      className="p-10 text-center text-gray-500 font-semibold"
                    >
                      Loading access logs...
                    </td>

                  </tr>

                ) : logs.length === 0 ? (

                  <tr>

                    <td
                      colSpan={6}
                      className="p-10 text-center text-gray-500 font-semibold"
                    >
                      No access logs found.
                    </td>

                  </tr>

                ) : (

                  logs.map((log) => (

                    <tr
                      key={log.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-all"
                    >

                      <td className="p-5">

                        {log.snapshot_path ? (

                          <img
                            src={getSnapshotUrl(log.snapshot_path)}
                            alt="snapshot"
                            className="w-20 h-20 object-cover rounded-2xl border border-gray-200"
                          />

                        ) : (

                          <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">
                            NO IMAGE
                          </div>

                        )}

                      </td>

                      <td className="p-5 font-bold text-gray-800">

                        {log.students?.first_name}{" "}
                        {log.students?.last_name}

                      </td>

                      <td className="p-5 font-semibold text-gray-600">

                        {log.students?.student_id}

                      </td>

                      <td className="p-5">

                        <span
                          className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider ${
                            log.action === "ENTRY"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {log.action}
                        </span>

                      </td>

                      <td className="p-5 font-bold text-gray-800">

                        {log.match_percentage}%

                      </td>

                      <td className="p-5 text-gray-600 font-medium">

                        {new Date(
                          log.created_at
                        ).toLocaleString()}

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>
          </div>
          
          <div className="flex items-center justify-between border-t border-gray-100 bg-white px-6 py-4">
            <p className="text-sm text-gray-500 font-medium">
              Showing <span className="font-bold text-gray-900">{logs.length}</span> logs 
              (Total: <span className="font-bold text-gray-900">{totalLogs}</span>)
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-bold bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors uppercase tracking-widest"
              >
                Prev
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(totalLogs / ITEMS_PER_PAGE), p + 1))}
                disabled={currentPage >= Math.ceil(totalLogs / ITEMS_PER_PAGE)}
                className="px-4 py-2 text-sm font-bold bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors uppercase tracking-widest"
              >
                Next
              </button>
            </div>
          </div>
          
        </div>

      </main>

    </div>
  );
}