"use client";

import { useState, useEffect, useRef } from "react";
import IncidentRow from "./incidentRow";
import IncidentDashboardLoading from "./loading";
import {
  fetchIncidentReports,
  fetchIncidentStats,
  searchStudentsForFilter,
} from "./actions";

// Lucide-style inline SVGs
const SearchIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
);
const XIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
);

// ==========================================
// 📋 INCIDENT DASHBOARD PAGE (client component)
// ==========================================
export default function DashboardPage() {
  // ---- Table data ----
  const [reports, setReports] = useState<any[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalReports, setTotalReports] = useState(0);

  // ---- Stat cards ----
  const [stats, setStats] = useState({ today: 0, week: 0, month: 0 });

  // ---- Filters ----
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [timeframeFilter, setTimeframeFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [locationDebounced, setLocationDebounced] = useState("");

  // ---- Student search ----
  const [studentNameInput, setStudentNameInput] = useState("");
  const [studentResults, setStudentResults] = useState<any[]>([]);
  const [studentSearching, setStudentSearching] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [nameDropdownOpen, setNameDropdownOpen] = useState(false);
  const nameRef = useRef<HTMLDivElement>(null);

  const ITEMS_PER_PAGE = 10;

  // ---- Load stats on mount ----
  useEffect(() => {
    fetchIncidentStats().then((res) => {
      if (res.success) setStats({ today: res.today, week: res.week, month: res.month });
    });
  }, []);

  // ---- Click-outside to close student dropdown ----
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (nameRef.current && !nameRef.current.contains(e.target as Node)) {
        setNameDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ---- Debounce location search ----
  useEffect(() => {
    const t = setTimeout(() => setLocationDebounced(locationSearch), 300);
    return () => clearTimeout(t);
  }, [locationSearch]);

  // ---- Student name autocomplete (debounced) ----
  useEffect(() => {
    if (selectedStudent) return; // already pinned
    const t = setTimeout(async () => {
      if (studentNameInput.trim().length >= 2) {
        setStudentSearching(true);
        const res = await searchStudentsForFilter(studentNameInput.trim());
        if (res.success && res.students) {
          setStudentResults(res.students);
          setNameDropdownOpen(true);
        }
        setStudentSearching(false);
      } else {
        setStudentResults([]);
        setNameDropdownOpen(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [studentNameInput, selectedStudent]);

  // ---- Fetch reports when any filter or page changes ----
  useEffect(() => {
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, categoryFilter, timeframeFilter, dateFrom, dateTo, locationDebounced, selectedStudent]);

  async function loadReports() {
    try {
      setTableLoading(true);

      const result = await fetchIncidentReports({
        page: currentPage,
        itemsPerPage: ITEMS_PER_PAGE,
        categoryFilter,
        timeframeFilter,
        dateFrom,
        dateTo,
        locationSearch: locationDebounced,
        studentId: selectedStudent?.id,
        studentName: selectedStudent
          ? `${selectedStudent.first_name} ${selectedStudent.last_name}`
          : undefined,
      });

      if (!result.success) {
        console.error("Failed to fetch reports:", result.error);
        setReports([]);
        return;
      }

      setReports(result.data || []);
      setTotalReports(result.count || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setInitialLoading(false);
      setTableLoading(false);
    }
  }

  // ---- Filter helpers ----
  const hasActiveFilters =
    categoryFilter !== "All" ||
    timeframeFilter !== "All" ||
    dateFrom !== "" ||
    dateTo !== "" ||
    locationDebounced !== "" ||
    selectedStudent !== null;

  function clearFilters() {
    setCategoryFilter("All");
    setTimeframeFilter("All");
    setDateFrom("");
    setDateTo("");
    setLocationSearch("");
    setLocationDebounced("");
    setStudentNameInput("");
    setStudentResults([]);
    setSelectedStudent(null);
    setCurrentPage(1);
  }

  function handleSelectStudent(s: any) {
    setSelectedStudent(s);
    setStudentNameInput(`${s.first_name} ${s.last_name}`);
    setStudentResults([]);
    setNameDropdownOpen(false);
    setCurrentPage(1);
  }

  function handleClearStudent() {
    setSelectedStudent(null);
    setStudentNameInput("");
    setStudentResults([]);
    setCurrentPage(1);
  }

  // ---- Pagination helpers ----
  const totalPages = Math.ceil(totalReports / ITEMS_PER_PAGE);

  // ---- Date range clears preset and vice versa ----
  function handleDateFromChange(v: string) {
    setDateFrom(v);
    if (v) setTimeframeFilter("All");
    setCurrentPage(1);
  }
  function handleDateToChange(v: string) {
    setDateTo(v);
    if (v) setTimeframeFilter("All");
    setCurrentPage(1);
  }
  function handleTimeframeChange(v: string) {
    setTimeframeFilter(v);
    if (v !== "All") {
      setDateFrom("");
      setDateTo("");
    }
    setCurrentPage(1);
  }

  // ---- Initial loading ----
  if (initialLoading) {
    return <IncidentDashboardLoading />;
  }

  return (
    <>
      <main className="sys-container">
        <div className="mb-10">
          <h2 className="sys-title">Recent Incident Reports</h2>
          <p className="sys-subtitle mt-1">
            Official security logs for Cavite National High School. All descriptions are stored with{" "}
            <span className="font-semibold text-cavite-maroon">AES-256 Encryption</span>.
          </p>
        </div>

        {/* ---- STAT CARDS ---- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="stat-card-primary">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl z-0"></div>
            <p className="stat-label-light">Total Reports Last Month</p>
            <p className="stat-value-light">{stats.month}</p>
          </div>
          <div className="stat-card-orange">
            <p className="stat-label-light">Total Reports Last Week</p>
            <p className="stat-value-light">{stats.week}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Total Reports Today</p>
            <p className="stat-value">{stats.today}</p>
          </div>
        </div>

        {/* ---- FILTERS + TABLE CARD ---- */}
        <div className="sys-card">
          {/* FILTER BAR */}
          <div className="p-4 border-b border-cavite-border print:hidden" style={{ backgroundColor: 'var(--sys-surface-subtle)', borderColor: 'var(--sys-border)' }}>
            {/* Row 1: label + dropdowns */}
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h3 className="sys-label m-0 text-sm text-zinc-400 uppercase tracking-wider font-bold flex items-center gap-2">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                Filters
              </h3>

              {/* Time */}
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Time</span>
              <select
                value={timeframeFilter}
                onChange={(e) => handleTimeframeChange(e.target.value)}
                className="border rounded-lg px-3 py-2 text-xs font-semibold shadow-sm focus:ring-2 focus:ring-cavite-maroon/20 focus:border-cavite-maroon outline-none transition-all cursor-pointer"
                style={{ backgroundColor: 'var(--sys-input-bg)', borderColor: 'var(--sys-border)', color: 'var(--sys-input-text)' }}
              >
                <option value="All">All Time</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
              </select>

              {/* Category */}
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Category</span>
              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                className="border rounded-lg px-3 py-2 text-xs font-semibold shadow-sm focus:ring-2 focus:ring-cavite-maroon/20 focus:border-cavite-maroon outline-none transition-all cursor-pointer"
                style={{ backgroundColor: 'var(--sys-input-bg)', borderColor: 'var(--sys-border)', color: 'var(--sys-input-text)' }}
              >
                <option value="All">All Categories</option>
                <option value="Bullying / Peer Abuse">Bullying / Peer Abuse</option>
                <option value="Child Abuse">Child Abuse</option>
                <option value="Physical Violence">Physical Violence</option>
                <option value="Harassment">Harassment</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Row 2: date range + location search + student search */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Date range */}
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">From</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => handleDateFromChange(e.target.value)}
                className="border rounded-lg px-3 py-2 text-xs font-semibold shadow-sm focus:ring-2 focus:ring-cavite-maroon/20 focus:border-cavite-maroon outline-none transition-all"
                style={{ backgroundColor: 'var(--sys-input-bg)', borderColor: 'var(--sys-border)', color: 'var(--sys-input-text)' }}
              />
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">To</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => handleDateToChange(e.target.value)}
                className="border rounded-lg px-3 py-2 text-xs font-semibold shadow-sm focus:ring-2 focus:ring-cavite-maroon/20 focus:border-cavite-maroon outline-none transition-all"
                style={{ backgroundColor: 'var(--sys-input-bg)', borderColor: 'var(--sys-border)', color: 'var(--sys-input-text)' }}
              />

              {/* Location search */}
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Location</span>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search location..."
                  value={locationSearch}
                  onChange={(e) => { setLocationSearch(e.target.value); setCurrentPage(1); }}
                  className="border rounded-lg pl-8 pr-3 py-2 text-xs font-semibold shadow-sm focus:ring-2 focus:ring-cavite-maroon/20 focus:border-cavite-maroon outline-none transition-all w-44"
                  style={{ backgroundColor: 'var(--sys-input-bg)', borderColor: 'var(--sys-border)', color: 'var(--sys-input-text)' }}
                />
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400">
                  <SearchIcon />
                </div>
              </div>

              {/* Student name search */}
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Student</span>
              <div className="relative" ref={nameRef}>
                <input
                  type="text"
                  placeholder="Search name or ID..."
                  value={studentNameInput}
                  onChange={(e) => {
                    setStudentNameInput(e.target.value);
                    if (selectedStudent) {
                      setSelectedStudent(null);
                    }
                  }}
                  className={`border rounded-lg pl-8 pr-8 py-2 text-xs font-semibold shadow-sm focus:ring-2 focus:ring-cavite-maroon/20 focus:border-cavite-maroon outline-none transition-all w-52 ${selectedStudent
                    ? "border-green-300 bg-green-500/20 text-green-500"
                    : ""
                    }`}
                  style={!selectedStudent ? { backgroundColor: 'var(--sys-input-bg)', borderColor: 'var(--sys-border)', color: 'var(--sys-input-text)' } : {}}
                />
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400">
                  <SearchIcon />
                </div>
                {studentSearching && (
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                    <div className="w-3 h-3 border-2 border-cavite-maroon/30 border-t-cavite-maroon rounded-full animate-spin" />
                  </div>
                )}
                {selectedStudent && !studentSearching && (
                  <button
                    onClick={handleClearStudent}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-red-500 transition-colors"
                    title="Clear student filter"
                  >
                    <XIcon />
                  </button>
                )}

                {/* Dropdown */}
                {nameDropdownOpen && studentResults.length > 0 && (
                  <div className="absolute z-30 w-72 mt-1 border rounded-xl shadow-xl overflow-hidden max-h-64 overflow-y-auto" style={{ backgroundColor: 'var(--sys-surface)', borderColor: 'var(--sys-border)' }}>
                    {studentResults.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => handleSelectStudent(s)}
                        className="w-full text-left px-4 py-3 flex items-center gap-3 transition-colors border-b last:border-0 hover:bg-black/5 dark:hover:bg-white/5"
                        style={{ borderColor: 'var(--sys-border-subtle)' }}
                      >
                        <div className="w-8 h-8 rounded-full bg-cavite-maroon/10 flex items-center justify-center text-xs font-bold text-cavite-maroon shrink-0">
                          {s.first_name?.[0]}{s.last_name?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: 'var(--sys-text-primary)' }}>
                            {s.first_name} {s.last_name}
                          </p>
                          <p className="text-xs text-zinc-400 font-mono mt-0.5">
                            {s.student_id}{s.section ? ` • ${s.section}` : ""}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Clear filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-cavite-maroon hover:bg-cavite-hover border border-transparent rounded-lg shadow-sm transition-all"
                >
                  <XIcon /> Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* ---- TABLE ---- */}
          <div className="sys-table-wrapper max-h-[600px] overflow-auto relative">
            <table className="sys-table">
              <thead className="sticky top-0 z-10 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]" style={{ backgroundColor: 'var(--sys-surface)' }}>
                <tr className="table-header-row">
                  <th className="table-th">Date & Time</th>
                  <th className="table-th">Student Involved</th>
                  <th className="table-th">Location</th>
                  <th className="table-th text-left w-32">Category</th>
                  <th className="table-th">Status</th>
                  <th className="table-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderTopColor: 'var(--sys-border-subtle)' }}>
                {/* Inline loading overlay */}
                {tableLoading && (
                  <tr>
                    <td colSpan={6} className="p-0 border-0">
                      <div className="absolute inset-0 z-20 backdrop-blur-[1px] flex items-center justify-center rounded-b-3xl transition-opacity bg-black/5 dark:bg-white/5">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-6 h-6 border-2 border-cavite-maroon/30 border-t-cavite-maroon rounded-full animate-spin" />
                          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Loading…</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                {reports && reports.length > 0 ? (
                  reports.map((report) => (
                    <IncidentRow key={report.id} report={report} />
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-16 text-center border-b-0" style={{ backgroundColor: 'var(--sys-surface)' }}>
                      <div className="flex flex-col items-center text-zinc-400">
                        <svg className="w-8 h-8 mb-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"></path></svg>
                        <p className="text-sm font-medium">No reports found in the secure vault.</p>
                        {hasActiveFilters && <p className="text-xs mt-1">Try adjusting your filters.</p>}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ---- PAGINATION ---- */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-5 py-3 rounded-b-lg" style={{ backgroundColor: 'var(--sys-surface)', borderColor: 'var(--sys-border)' }}>
              <p className="text-sm font-medium" style={{ color: 'var(--sys-text-muted)' }}>
                Page <span className="font-semibold" style={{ color: 'var(--sys-text-primary)' }}>{currentPage}</span> of{" "}
                <span className="font-semibold" style={{ color: 'var(--sys-text-primary)' }}>{totalPages}</span>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="px-4 py-1.5 text-sm font-medium rounded-md transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] disabled:opacity-50 disabled:cursor-not-allowed border hover:bg-black/5 dark:hover:bg-white/5"
                  style={{ backgroundColor: 'var(--sys-surface-muted)', borderColor: 'var(--sys-border)', color: 'var(--sys-text-primary)' }}
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="px-4 py-1.5 text-sm font-medium rounded-md transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] disabled:opacity-50 disabled:cursor-not-allowed border hover:bg-black/5 dark:hover:bg-white/5"
                  style={{ backgroundColor: 'var(--sys-surface-muted)', borderColor: 'var(--sys-border)', color: 'var(--sys-text-primary)' }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ---- Match type legend (only when student filter is active) ---- */}
        {selectedStudent && reports.length > 0 && (
          <div className="mt-4 flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
              <span className="text-green-700">Verified Link</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-zinc-400" />
              <span className="text-zinc-500">Unverified — Name Match</span>
            </span>
          </div>
        )}

        <footer className="mt-12 text-center pb-12">
          <p className="sys-label tracking-[0.4em]">
            AMSIRS Security Intelligence Interface
          </p>
        </footer>
      </main>
    </>
  );
}