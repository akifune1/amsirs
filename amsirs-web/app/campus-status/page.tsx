"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchCampusStatus } from "../access-logs/actions";
import CampusStatusLoading from "./loading";

export default function CampusStatusPage() {

  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  const filteredStudents = students.filter(log => 
    log.students?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.students?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.students?.student_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / ITEMS_PER_PAGE));
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    loadCampusStatus();
  }, []);

  async function loadCampusStatus() {
    try {
      setLoading(true);
      const result = await fetchCampusStatus();
      
      if (!result.success) {
        console.error("Failed to fetch campus status:", result.error);
        setStudents([]);
        return;
      }
      
      setStudents(result.data || []);
    } catch (error) {
      console.error("Caught system error in loadCampusStatus:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <CampusStatusLoading />;
  }

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: 'var(--sys-page-bg)' }}>

      {/* NAVBAR */}



      {/* MAIN */}

      <main className="p-6 md:p-10">

        {/* HEADER */}

        <div className="mb-8">

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight" style={{ color: 'var(--sys-text-primary)' }}>
            Campus Status Monitor
          </h1>

          <p className="font-medium mt-2" style={{ color: 'var(--sys-text-secondary)' }}>
            Real-time monitoring of students currently inside the school campus.
          </p>

        </div>

        {/* STATS */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

          <div className="rounded-3xl shadow-xl p-6 border" style={{ backgroundColor: 'var(--sys-surface)', borderColor: 'var(--sys-border)' }}>

            <p className="text-xs font-black tracking-[0.2em] uppercase" style={{ color: 'var(--sys-text-muted)' }}>
              Current Population
            </p>

            <p className="text-5xl font-black text-green-600 mt-3">
              {students.length}
            </p>

            <p className="mt-2 font-medium" style={{ color: 'var(--sys-text-secondary)' }}>
              Students currently inside campus
            </p>

          </div>

          <div className="rounded-3xl shadow-xl p-6 border" style={{ backgroundColor: 'var(--sys-surface)', borderColor: 'var(--sys-border)' }}>

            <p className="text-xs font-black tracking-[0.2em] uppercase" style={{ color: 'var(--sys-text-muted)' }}>
              System Status
            </p>

            <p className="text-3xl font-black text-green-600 mt-3">
              ACTIVE
            </p>

            <p className="mt-2 font-medium" style={{ color: 'var(--sys-text-secondary)' }}>
              Real-time campus tracking enabled
            </p>

          </div>

          <div className="bg-cavite-maroon rounded-3xl shadow-xl p-6 text-white">

            <p className="text-xs font-black tracking-[0.2em] uppercase text-red-200">
              AMSIRS SECURITY
            </p>

            <p className="text-2xl font-black mt-3">
              Campus Monitoring Active
            </p>

            <p className="text-red-100 mt-2 text-sm leading-relaxed">
              Student campus presence is determined through
              biometric entry and exit verification logs.
            </p>

          </div>

        </div>



        {/* EMPTY */}

        {students.length === 0 && (

          <div className="rounded-3xl shadow-xl p-16 text-center border" style={{ backgroundColor: 'var(--sys-surface)', borderColor: 'var(--sys-border)' }}>

            <div className="text-3xl font-black" style={{ color: 'var(--sys-text-primary)' }}>
              No Students Inside Campus
            </div>

            <p className="mt-3" style={{ color: 'var(--sys-text-secondary)' }}>
              All recorded students have exited the campus.
            </p>

          </div>
        )}

        {/* STUDENT TABLE */}

        {students.length > 0 && (

          <div className="sys-card mt-8">
            <div className="p-4 border-b flex flex-col md:flex-row items-start md:items-center justify-between gap-4" style={{ backgroundColor: 'var(--sys-surface-subtle)', borderColor: 'var(--sys-border)' }}>
              <h3 className="sys-label m-0 text-sm" style={{ color: 'var(--sys-text-primary)' }}>Active Campus Presence</h3>
              <div className="w-full md:w-72">
                <input
                  type="text"
                  placeholder="Search by ID or Name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-cavite-maroon focus:border-cavite-maroon shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all"
                  style={{ backgroundColor: 'var(--sys-input-bg)', borderColor: 'var(--sys-border)', color: 'var(--sys-input-text)' }}
                />
              </div>
            </div>
            
            <div className="sys-table-wrapper max-h-[600px] overflow-auto">
              <table className="sys-table">
                <thead className="sticky top-0 z-10 shadow-[0_1px_3px_0_rgba(0,0,0,0.08)]" style={{ backgroundColor: 'var(--sys-table-header-bg)' }}>
                  <tr className="table-header-row">
                    <th className="table-th w-[40%]">Student Identity</th>
                    <th className="table-th text-center">Entry Time</th>
                    <th className="table-th text-center">Match Accuracy</th>
                    <th className="table-th text-center">Access Gate Proof</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderTopColor: 'var(--sys-border-subtle)' }}>
                  {paginatedStudents.map((log: any) => (
                    <tr key={log.id} className="transition-colors group hover:bg-black/5 dark:hover:bg-white/5">
                      <td className="table-td" data-label="Student Identity">
                        <div className="flex items-center gap-4">
                          {log.faceUrl ? (
                            <img src={log.faceUrl} alt="" className="w-14 h-14 rounded-lg object-cover border border-zinc-200 shrink-0 shadow-sm" />
                          ) : (
                            <div className="w-14 h-14 rounded-lg border flex items-center justify-center text-[9px] font-bold shrink-0" style={{ backgroundColor: 'var(--sys-surface-muted)', borderColor: 'var(--sys-border)', color: 'var(--sys-text-muted)' }}>NO PIC</div>
                          )}
                          <div>
                            <p className="text-sm font-bold leading-tight" style={{ color: 'var(--sys-text-primary)' }}>
                              {log.students.last_name}, {log.students.first_name}
                            </p>
                            <p className="text-xs font-mono text-zinc-500 leading-none mt-1.5 mb-1.5">
                              {log.students.student_id} • {log.students.grade_level} {log.students.section}
                            </p>
                            <span className="inline-flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 text-green-500 px-2 py-[2px] rounded text-[9px] font-black uppercase tracking-wider">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                              INSIDE
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="table-td text-center" data-label="Entry Time">
                        <span className="text-sm font-semibold" style={{ color: 'var(--sys-text-primary)' }}>
                          {new Date(log.created_at).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="table-td text-center" data-label="Match Accuracy">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-lg font-black text-blue-600">{log.match_percentage}%</span>
                          <span className="text-[10px] font-bold tracking-wider text-blue-400 uppercase">Confidence</span>
                        </div>
                      </td>
                      <td className="table-td text-center relative" data-label="Access Gate Proof">
                        <div className="flex justify-center h-16 items-center">
                          {log.snapshotUrl ? (
                            <img 
                              src={log.snapshotUrl} 
                              alt="Access proof" 
                              className="w-24 h-16 rounded object-cover border group-hover:scale-[2.5] group-hover:z-50 group-hover:shadow-2xl group-hover:-translate-x-10 transition-all duration-300 origin-right cursor-zoom-in relative z-10" 
                              style={{ backgroundColor: 'var(--sys-surface)', borderColor: 'var(--sys-border)' }}
                            />
                          ) : (
                            <span className="text-xs font-medium italic px-3 py-1.5 rounded-md border border-dashed" style={{ backgroundColor: 'var(--sys-surface-subtle)', borderColor: 'var(--sys-border)', color: 'var(--sys-text-muted)' }}>No snapshot recorded</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {totalPages > 1 && (
              <div className="p-4 border-t flex justify-between items-center text-sm rounded-b-xl" style={{ borderColor: 'var(--sys-border)', backgroundColor: 'var(--sys-surface)' }}>
                <span className="font-medium" style={{ color: 'var(--sys-text-muted)' }}>Page <span className="font-semibold" style={{ color: 'var(--sys-text-primary)' }}>{currentPage}</span> of <span className="font-semibold" style={{ color: 'var(--sys-text-primary)' }}>{totalPages}</span></span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 border rounded-md disabled:opacity-50 font-semibold text-xs shadow-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5" style={{ borderColor: 'var(--sys-border)', color: 'var(--sys-text-primary)' }}>Previous</button>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 border rounded-md disabled:opacity-50 font-semibold text-xs shadow-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5" style={{ borderColor: 'var(--sys-border)', color: 'var(--sys-text-primary)' }}>Next</button>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

    </div>
  );
}