"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { supabase } from "@/lib/supabase";

export default function CampusStatusPage() {

  const [students, setStudents] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    loadCampusStatus();

  }, []);

  async function loadCampusStatus() {

    try {

      // =========================
      // LOAD ACCESS LOGS
      // =========================

      const {
        data: logs,
        error,
      } = await supabase
        .from("access_logs")
        .select(`
          *,
          students (
            first_name,
            last_name,
            student_id,
            grade_level,
            section
          )
        `)
        .order(
          "created_at",
          {
            ascending: false,
          }
        );

      if (
        error ||
        !logs
      ) {

        console.error(error);

        return;
      }

      // =========================
      // GET LATEST ACTION
      // =========================

      const latestLogs =
        new Map();

      for (const log of logs) {

        if (
          !latestLogs.has(
            log.student_id
          )
        ) {

          latestLogs.set(
            log.student_id,
            log
          );
        }
      }

      // =========================
      // FILTER ENTRY ONLY
      // =========================

      const insideCampus =
        Array.from(
          latestLogs.values()
        ).filter(
          (log: any) =>
            log.action ===
            "ENTRY"
        );

      setStudents(
        insideCampus
      );

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">

      {/* NAVBAR */}

      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">

        <div className="flex items-center gap-3">

          <div className="bg-cavite-maroon text-white px-3 py-1.5 rounded-lg font-black text-lg shadow-sm">
            AMSIRS
          </div>

          <div className="hidden md:block">

            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] leading-none">
              Cavite National High School
            </p>

            <p className="text-xs font-bold text-gray-700 uppercase tracking-tight">
              Access Monitoring System
            </p>

          </div>

        </div>

        {/* NAV LINKS */}

        <div className="flex items-center gap-3 flex-wrap">

          <Link
            href="/access-gate"
            className="text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
          >
            Entry Gate
          </Link>

          <Link
            href="/exit-gate"
            className="text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
          >
            Exit Gate
          </Link>

          <Link
            href="/access-logs"
            className="text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
          >
            Access Logs
          </Link>

          <Link
            href="/campus-monitor"
            className="text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl bg-cavite-maroon text-white shadow-lg"
          >
            Campus Monitor
          </Link>

          <Link
            href="/incident-dashboard"
            className="text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
          >
            Incident Logs
          </Link>

        </div>

      </nav>

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

            {students.map(
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