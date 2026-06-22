"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  fetchAccessLogs,
  fetchAllFilteredLogs,
  fetchDistinctSections,
  getSnapshotSignedUrls,
  searchStudentsByName,
} from "./actions";
import AccessLogsLoading from "./loading";
import Papa from "papaparse";
import { Download, Printer, X, Search, Filter } from "lucide-react";

// ------------------------------------
// Types
// ------------------------------------
interface StudentResult {
  id: string;
  first_name: string;
  last_name: string;
  student_id: string;
  section?: string;
}

// ------------------------------------
// Select component (shared style)
// ------------------------------------
function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider whitespace-nowrap">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm font-medium px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-cavite-maroon/20 focus:border-cavite-maroon cursor-pointer shadow-sm transition-all min-w-[140px]"
        style={{ backgroundColor: 'var(--sys-input-bg)', borderColor: 'var(--sys-border)', color: 'var(--sys-input-text)' }}
      >
        {children}
      </select>
    </div>
  );
}

// ------------------------------------
// Date input (shared style)
// ------------------------------------
function DateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider whitespace-nowrap">
        {label}
      </label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm font-medium px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-cavite-maroon/20 focus:border-cavite-maroon shadow-sm transition-all"
        style={{ backgroundColor: 'var(--sys-input-bg)', borderColor: 'var(--sys-border)', color: 'var(--sys-input-text)' }}
      />
    </div>
  );
}

// ------------------------------------
// Main Page
// ------------------------------------
export default function AccessLogsPage() {
  // Table data
  const [logs, setLogs] = useState<any[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  // Existing filters
  const [actionFilter, setActionFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");

  // New filters
  const [sectionFilter, setSectionFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sections, setSections] = useState<string[]>([]);

  // Student ID exact match
  const [studentIdInput, setStudentIdInput] = useState("");
  const [studentIdFilter, setStudentIdFilter] = useState(""); // committed on Enter / blur

  // Student name autocomplete
  const [nameInput, setNameInput] = useState("");
  const [nameResults, setNameResults] = useState<StudentResult[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentResult | null>(null);
  const [nameDropdownOpen, setNameDropdownOpen] = useState(false);
  const nameDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nameRef = useRef<HTMLDivElement>(null);

  // Export
  const [exportLoading, setExportLoading] = useState(false);

  // Print header state (for @media print)
  const [printFilterSummary, setPrintFilterSummary] = useState("");

  const ITEMS_PER_PAGE = 15;

  // ---- Load distinct sections once on mount ----
  useEffect(() => {
    fetchDistinctSections().then((res) => {
      if (res.success && res.sections) setSections(res.sections);
    });
  }, []);

  // ---- Load logs whenever any filter / page changes ----
  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, actionFilter, dateFilter, sectionFilter, studentIdFilter, selectedStudent, dateFrom, dateTo]);

  // ---- Click-outside to close name dropdown ----
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (nameRef.current && !nameRef.current.contains(e.target as Node)) {
        setNameDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function loadLogs() {
    try {
      setTableLoading(true);

      const result = await fetchAccessLogs({
        page: currentPage,
        itemsPerPage: ITEMS_PER_PAGE,
        actionFilter,
        dateFilter,
        dateFrom,
        dateTo,
        sectionFilter,
        studentIdFilter: selectedStudent
          ? selectedStudent.student_id
          : studentIdFilter,
      });

      if (!result.success) {
        console.error("Failed to fetch logs:", result.error);
        setLogs([]);
        return;
      }

      const fetchedLogs = result.data || [];
      setLogs(fetchedLogs);
      setTotalLogs(result.count || 0);

      const paths = fetchedLogs.map((log) => log.snapshot_path).filter(Boolean);
      const urls = await getSnapshotSignedUrls(paths);
      setImageUrls(urls);
    } catch (error) {
      console.error(error);
    } finally {
      setInitialLoading(false);
      setTableLoading(false);
    }
  }

  // ---- Student ID: commit on Enter or blur ----
  function handleStudentIdKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      setStudentIdFilter(studentIdInput.trim());
      setCurrentPage(1);
    }
  }

  function handleStudentIdBlur() {
    setStudentIdFilter(studentIdInput.trim());
    setCurrentPage(1);
  }

  // ---- Name autocomplete ----
  const handleNameInput = useCallback((value: string) => {
    setNameInput(value);
    setSelectedStudent(null);

    if (nameDebounce.current) clearTimeout(nameDebounce.current);

    if (value.trim().length < 2) {
      setNameResults([]);
      setNameDropdownOpen(false);
      return;
    }

    nameDebounce.current = setTimeout(async () => {
      const res = await searchStudentsByName(value);
      if (res.success && res.students) {
        setNameResults(res.students);
        setNameDropdownOpen(res.students.length > 0);
      }
    }, 300);
  }, []);

  function selectStudent(student: StudentResult) {
    setSelectedStudent(student);
    setNameInput(`${student.first_name} ${student.last_name}`);
    setNameDropdownOpen(false);
    setCurrentPage(1);
  }

  // ---- Clear all filters ----
  function clearFilters() {
    setActionFilter("All");
    setDateFilter("All");
    setSectionFilter("All");
    setDateFrom("");
    setDateTo("");
    setStudentIdInput("");
    setStudentIdFilter("");
    setNameInput("");
    setSelectedStudent(null);
    setNameResults([]);
    setCurrentPage(1);
  }

  const hasActiveFilters =
    actionFilter !== "All" ||
    dateFilter !== "All" ||
    sectionFilter !== "All" ||
    dateFrom !== "" ||
    dateTo !== "" ||
    studentIdFilter !== "" ||
    selectedStudent !== null;

  // ---- Build active filter summary (for print header) ----
  function buildFilterSummary() {
    const parts: string[] = [];
    if (actionFilter !== "All") parts.push(`Action: ${actionFilter}`);
    if (dateFilter !== "All") parts.push(`Date: ${dateFilter}`);
    if (dateFrom) parts.push(`From: ${dateFrom}`);
    if (dateTo) parts.push(`To: ${dateTo}`);
    if (sectionFilter !== "All") parts.push(`Section: ${sectionFilter}`);
    if (selectedStudent)
      parts.push(
        `Student: ${selectedStudent.first_name} ${selectedStudent.last_name}`
      );
    else if (studentIdFilter) parts.push(`Student ID: ${studentIdFilter}`);
    return parts.length ? parts.join(" | ") : "All Records";
  }

  // ---- CSV Export ----
  async function handleExportCSV() {
    setExportLoading(true);
    try {
      const res = await fetchAllFilteredLogs({
        actionFilter,
        dateFilter,
        dateFrom,
        dateTo,
        sectionFilter,
        studentIdFilter: selectedStudent
          ? selectedStudent.student_id
          : studentIdFilter,
      });

      if (!res.success || !res.data) {
        alert("Export failed: " + (res.error || "No data"));
        return;
      }

      const rows = res.data.map((log) => ({
        Timestamp: new Date(log.created_at).toLocaleString("en-PH"),
        "Student Name": `${log.students?.first_name ?? ""} ${log.students?.last_name ?? ""}`.trim(),
        "Student ID": log.students?.student_id ?? "",
        Section: log.students?.section ?? "",
        "Grade Level": log.students?.grade_level ?? "",
        Action: log.action,
        "Match %": log.match_percentage ?? "",
      }));

      const csv = Papa.unparse(rows);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `access_logs_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setExportLoading(false);
    }
  }

  // ---- Print/PDF ----
  function handlePrint() {
    setPrintFilterSummary(buildFilterSummary());
    // Small timeout so state propagates before print dialog opens
    setTimeout(() => window.print(), 100);
  }

  if (initialLoading) {
    return <AccessLogsLoading />;
  }

  return (
    <>
      {/* ---- PRINT HEADER (hidden on screen, visible in print) ---- */}
      <div className="hidden print:block mb-6 pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--sys-text-primary)' }}>Access Logs Report</h1>
        <p className="text-sm text-gray-500 mt-1">
          Generated: {new Date().toLocaleString("en-PH")}
        </p>
        <p className="text-sm font-medium mt-1" style={{ color: 'var(--sys-text-secondary)' }}>
          Filters: {printFilterSummary || buildFilterSummary()}
        </p>
      </div>

      {/* MAIN */}
      <main className="sys-container">
        <div className="mb-10">
          <h1 className="sys-title">Access Logs</h1>
          <p className="sys-subtitle mt-1">
            Real-time campus biometric access records.
          </p>
        </div>

        <div className="mb-6">
          <h2 className="sys-label">Security Records: Student Entry &amp; Exit Logs</h2>
        </div>

        {/* TABLE CARD */}
        <div className="sys-card">

          {/* ---- FILTER BAR ---- */}
          <div className="p-4 border-b space-y-3 print:hidden" style={{ backgroundColor: 'var(--sys-surface-subtle)', borderColor: 'var(--sys-border)' }}>

            {/* Row 1: Quick-preset filters + Export buttons */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Filter className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Filters</span>
                </div>

                <FilterSelect
                  label="Date"
                  value={dateFilter}
                  onChange={(v) => { setDateFilter(v); setDateFrom(""); setDateTo(""); setCurrentPage(1); }}
                >
                  <option value="All">All Time</option>
                  <option value="Today">Today</option>
                  <option value="Yesterday">Yesterday</option>
                  <option value="This Week">Last 7 Days</option>
                </FilterSelect>

                <FilterSelect
                  label="Action"
                  value={actionFilter}
                  onChange={(v) => { setActionFilter(v); setCurrentPage(1); }}
                >
                  <option value="All">All Actions</option>
                  <option value="ENTRY">Entry</option>
                  <option value="EXIT">Exit</option>
                </FilterSelect>

                <FilterSelect
                  label="Section"
                  value={sectionFilter}
                  onChange={(v) => { setSectionFilter(v); setCurrentPage(1); }}
                >
                  <option value="All">All Sections</option>
                  {sections.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </FilterSelect>
              </div>

              {/* Export buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md shadow-sm transition-colors border hover:bg-black/5 dark:hover:bg-white/5"
                  style={{ backgroundColor: 'var(--sys-surface)', borderColor: 'var(--sys-border)', color: 'var(--sys-text-primary)' }}
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print PDF
                </button>
                <button
                  onClick={handleExportCSV}
                  disabled={exportLoading}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-cavite-maroon hover:bg-cavite-maroon/90 border border-transparent rounded-md shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Download className="w-3.5 h-3.5" />
                  {exportLoading ? "Exporting…" : "Export CSV"}
                </button>
              </div>
            </div>

            {/* Row 2: Date range + student filters */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Custom date range */}
              <DateInput
                label="From"
                value={dateFrom}
                onChange={(v) => { setDateFrom(v); setDateFilter("All"); setCurrentPage(1); }}
              />
              <DateInput
                label="To"
                value={dateTo}
                onChange={(v) => { setDateTo(v); setDateFilter("All"); setCurrentPage(1); }}
              />

              {/* Student ID exact match */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider whitespace-nowrap">
                  Student ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2024-0001"
                  value={studentIdInput}
                  onChange={(e) => setStudentIdInput(e.target.value)}
                  onKeyDown={handleStudentIdKeyDown}
                  onBlur={handleStudentIdBlur}
                  className="text-sm font-medium px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-cavite-maroon/20 focus:border-cavite-maroon shadow-sm transition-all w-[150px] font-mono"
                  style={{ backgroundColor: 'var(--sys-input-bg)', borderColor: 'var(--sys-border)', color: 'var(--sys-input-text)' }}
                />
              </div>

              {/* Student name autocomplete */}
              <div className="flex items-center gap-2" ref={nameRef}>
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider whitespace-nowrap">
                  Name
                </label>
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search by name…"
                      value={nameInput}
                      onChange={(e) => handleNameInput(e.target.value)}
                      onFocus={() => nameResults.length > 0 && setNameDropdownOpen(true)}
                      className="text-sm font-medium pl-8 pr-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-cavite-maroon/20 focus:border-cavite-maroon shadow-sm transition-all w-[180px]"
                      style={{ backgroundColor: 'var(--sys-input-bg)', borderColor: 'var(--sys-border)', color: 'var(--sys-input-text)' }}
                    />
                    {nameInput && (
                      <button
                        onClick={() => {
                          setNameInput("");
                          setSelectedStudent(null);
                          setNameResults([]);
                          setCurrentPage(1);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Autocomplete dropdown */}
                  {nameDropdownOpen && nameResults.length > 0 && (
                    <div className="absolute top-full left-0 mt-1 w-64 border rounded-xl shadow-lg z-50 overflow-hidden" style={{ backgroundColor: 'var(--sys-surface)', borderColor: 'var(--sys-border)' }}>
                      {nameResults.map((s) => (
                        <button
                          key={s.id}
                          onMouseDown={(e) => e.preventDefault()} // prevent input blur before click
                          onClick={() => selectStudent(s)}
                          className="w-full text-left px-3 py-2.5 transition-colors border-b last:border-0 hover:bg-black/5 dark:hover:bg-white/5"
                          style={{ borderColor: 'var(--sys-border-subtle)' }}
                        >
                          <p className="text-sm font-semibold" style={{ color: 'var(--sys-text-primary)' }}>
                            {s.first_name} {s.last_name}
                          </p>
                          <p className="text-xs text-zinc-400 font-mono mt-0.5">
                            {s.student_id}{s.section ? ` • ${s.section}` : ""}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Clear filters button */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-cavite-maroon hover:bg-cavite-hover border border-transparent rounded-lg shadow-sm transition-all"
                >
                  <X className="w-3 h-3" />
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* ---- TABLE ---- */}
          <div className="sys-table-wrapper max-h-[600px] overflow-auto relative">
            <table className="sys-table">
              <thead className="sticky top-0 z-10 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]" style={{ backgroundColor: 'var(--sys-surface)' }}>
                <tr className="table-header-row">
                  <th className="table-th">Snapshot</th>
                  <th className="table-th">Student</th>
                  <th className="table-th">Student ID</th>
                  <th className="table-th">Section</th>
                  <th className="table-th">Action</th>
                  <th className="table-th">Match</th>
                  <th className="table-th">Timestamp</th>
                </tr>
              </thead>

              <tbody className="divide-y" style={{ borderTopColor: 'var(--sys-border-subtle)' }}>
                {/* Inline loading overlay */}
                {tableLoading && (
                  <tr>
                    <td colSpan={7} className="p-0 border-0">
                      <div className="absolute inset-0 z-20 backdrop-blur-[1px] flex items-center justify-center rounded-b-3xl transition-opacity bg-black/5 dark:bg-white/5">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-6 h-6 border-2 border-cavite-maroon/30 border-t-cavite-maroon rounded-full animate-spin" />
                          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Loading…</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-16 text-center text-zinc-400" style={{ backgroundColor: 'var(--sys-surface)' }}>
                      <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-base font-medium">No access logs found.</p>
                      <p className="text-sm mt-1">Try adjusting your filters.</p>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                      <td className="table-td" data-label="Snapshot">
                        {log.snapshot_path && imageUrls[log.snapshot_path] ? (
                          <img
                            src={imageUrls[log.snapshot_path]}
                            alt="snapshot"
                            className="w-16 h-16 object-cover rounded-xl"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-md flex items-center justify-center text-xs font-semibold text-zinc-400" style={{ backgroundColor: 'var(--sys-surface-subtle)' }}>
                            NO IMAGE
                          </div>
                        )}
                      </td>
                      <td className="table-td font-semibold" style={{ color: 'var(--sys-text-primary)' }} data-label="Student">
                        {log.students?.first_name} {log.students?.last_name}
                      </td>
                      <td className="table-td text-zinc-500 font-mono text-sm" data-label="Student ID">
                        {log.students?.student_id}
                      </td>
                      <td className="table-td text-zinc-500 text-sm" data-label="Section">
                        {log.students?.section ?? (
                          <span className="text-zinc-300">—</span>
                        )}
                      </td>
                      <td className="table-td" data-label="Action">
                        <span
                          className={`badge-primary ${log.action === "ENTRY" ? "badge-success" : "badge-danger"
                            }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="table-td font-semibold" style={{ color: 'var(--sys-text-primary)' }} data-label="Match">
                        {log.match_percentage}%
                      </td>
                      <td className="table-td text-zinc-500 text-sm" data-label="Timestamp">
                        {new Date(log.created_at).toLocaleString("en-PH", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ---- PAGINATION ---- */}
          <div className="flex flex-col sm:flex-row items-center justify-between border-t px-8 py-6 gap-4 print:hidden" style={{ backgroundColor: 'var(--sys-surface)', borderColor: 'var(--sys-border)' }}>
            <p className="text-sm font-medium" style={{ color: 'var(--sys-text-muted)' }}>
              Showing <span className="font-semibold" style={{ color: 'var(--sys-text-primary)' }}>{logs.length}</span> logs
              (Total: <span className="font-semibold" style={{ color: 'var(--sys-text-primary)' }}>{totalLogs}</span>)
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn-outline px-4 py-1.5 text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-zinc-500 font-medium px-1">
                Page {currentPage} of {Math.max(1, Math.ceil(totalLogs / ITEMS_PER_PAGE))}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) =>
                    Math.min(Math.ceil(totalLogs / ITEMS_PER_PAGE), p + 1)
                  )
                }
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