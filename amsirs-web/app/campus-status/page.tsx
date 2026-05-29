"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchCampusStatus } from "../access-logs/actions";

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

  return (
    <div className="min-h-screen bg-gray-100 font-sans">

      {/* NAVBAR */}



      {/* MAIN */}

      <main className="p-6 md:p-10">

        {/* HEADER */}

        <div className="mb-8">

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
            Campus Status Monitor
          </h1>

          <p className="text-gray-500 font-medium mt-2">
            Real-time monitoring of students currently inside the school campus.
          </p>

        </div>

        {/* STATS */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6">

            <p className="text-xs font-black tracking-[0.2em] uppercase text-gray-400">
              Current Population
            </p>

            <p className="text-5xl font-black text-green-600 mt-3">
              {students.length}
            </p>

            <p className="text-gray-500 mt-2 font-medium">
              Students currently inside campus
            </p>

          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6">

            <p className="text-xs font-black tracking-[0.2em] uppercase text-gray-400">
              System Status
            </p>

            <p className="text-3xl font-black text-green-600 mt-3">
              ACTIVE
            </p>

            <p className="text-gray-500 mt-2 font-medium">
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

        {/* LOADING */}

        {loading && (

          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-16 text-center">

            <div className="text-2xl font-bold text-gray-700">
              Loading campus status...
            </div>

          </div>
        )}

        {/* EMPTY */}

        {!loading &&
          students.length === 0 && (

          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-16 text-center">

            <div className="text-3xl font-black text-gray-700">
              No Students Inside Campus
            </div>

            <p className="text-gray-500 mt-3">
              All recorded students have exited the campus.
            </p>

          </div>
        )}

        {/* STUDENT GRID */}

        {!loading &&
          students.length > 0 && (

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

            {paginatedStudents.map(
              (log: any) => (

                <div
                  key={log.id}
                  className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden"
                >

                  {/* HEADER */}

                  <div className="border-b border-gray-100 px-6 py-5 flex items-center justify-between">

                    <div>

                      <p className="text-xs font-black tracking-[0.2em] uppercase text-gray-400">
                        Campus Status
                      </p>

                      <h2 className="text-lg font-bold text-gray-900 mt-1">
                        Student Presence
                      </h2>

                    </div>

                    <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">

                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>

                      INSIDE

                    </div>

                  </div>

                  {/* BODY */}

                  <div className="p-6">

                    <div className="space-y-4">

                      <div>

                        <p className="text-3xl font-black text-gray-900">
                          {log.students.first_name}{" "}
                          {log.students.last_name}
                        </p>

                        <p className="text-gray-500 font-medium mt-1">
                          Student ID:{" "}
                          {log.students.student_id}
                        </p>

                      </div>

                      <div className="grid grid-cols-2 gap-4">

                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">

                          <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                            Grade
                          </p>

                          <p className="text-xl font-bold text-gray-800 mt-1">
                            {log.students.grade_level}
                          </p>

                        </div>

                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">

                          <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                            Section
                          </p>

                          <p className="text-xl font-bold text-gray-800 mt-1">
                            {log.students.section}
                          </p>

                        </div>

                      </div>

                      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">

                        <p className="text-xs font-black uppercase tracking-wider text-blue-400">
                          Match Accuracy
                        </p>

                        <p className="text-3xl font-black text-blue-700 mt-1">
                          {log.match_percentage}%
                        </p>

                      </div>

                      <div className="pt-2">

                        <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                          Last Entry Time
                        </p>

                        <p className="text-sm font-semibold text-gray-700 mt-1">
                          {new Date(
                            log.created_at
                          ).toLocaleString()}
                        </p>

                      </div>

                    </div>

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </main>

    </div>
  );
}