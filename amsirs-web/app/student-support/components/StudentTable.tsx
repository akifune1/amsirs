'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, Eye } from 'lucide-react';
import RiskBadge from './RiskBadge';
import { StudentRecord } from '../types';

interface StudentTableProps {
  students: StudentRecord[];
  onViewCase: (studentId: string) => void;
  onStartIntervention: (studentId: string) => void;
}

export default function StudentTable({
  students,
  onViewCase,
  onStartIntervention,
}: StudentTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<'All' | 'Low' | 'Medium' | 'High'>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const filteredStudents = students.filter(student => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.gradeSection.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRisk = filterRisk === 'All' || student.riskLevel === filterRisk;
    const matchesStatus = filterStatus === 'All' || student.counselingStatus === filterStatus;

    return matchesSearch && matchesRisk && matchesStatus;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRisk, filterStatus]);

  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getCounselingStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'badge-primary';
      case 'Pending':
        return 'badge-warning';
      case 'Resolved':
        return 'badge-success';
      case 'Not Started':
      default:
        return 'bg-black/5 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 border border-cavite-border dark:border-zinc-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Table */}
      <div className="sys-card">
        <div className="p-4 border-b flex flex-col md:flex-row items-start md:items-center justify-between gap-4" style={{ backgroundColor: 'var(--sys-surface-subtle)', borderColor: 'var(--sys-border)' }}>
          <h3 className="sys-label m-0 text-sm" style={{ color: 'var(--sys-text-primary)' }}>Filter Students</h3>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <div className="flex-1 w-full md:w-64">
              <input
                type="text"
                placeholder="Search by name, ID, or grade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--sys-surface-subtle)' }}>
                {(['All', 'Low', 'Medium', 'High'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setFilterRisk(level)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      filterRisk === level
                        ? 'shadow-sm'
                        : 'hover:opacity-80'
                    }`}
                    style={filterRisk === level ? { backgroundColor: 'var(--sys-surface)', color: 'var(--sys-text-primary)' } : { color: 'var(--sys-text-muted)' }}
                  >
                    {level === 'All' ? 'All Risks' : level}
                  </button>
                ))}
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-sm font-medium px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-cavite-maroon/20 focus:border-cavite-maroon cursor-pointer shadow-sm transition-all min-w-[140px]"
                style={{ backgroundColor: 'var(--sys-input-bg)', borderColor: 'var(--sys-border)', color: 'var(--sys-input-text)' }}
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Resolved">Resolved</option>
                <option value="Not Started">Not Started</option>
              </select>
            </div>
          </div>
        </div>
        <div className="sys-table-wrapper max-h-[600px] overflow-auto">
          <table className="sys-table">
            <thead className="sticky top-0 z-10 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]" style={{ backgroundColor: 'var(--sys-surface)' }}>
              <tr className="table-header-row">
                <th className="table-th">Student Name</th>
                <th className="table-th">Grade & Section</th>
                <th className="table-th">Absences</th>
                <th className="table-th">Incident History</th>
                <th className="table-th">Risk Level</th>
                <th className="table-th">Counseling Status</th>
                <th className="table-th">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderTopColor: 'var(--sys-border-subtle)' }}>
              {paginatedStudents.length > 0 ? (
                paginatedStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <td className="table-td" data-label="Student Name">
                      <div className="flex flex-col">
                        <span className="font-semibold" style={{ color: 'var(--sys-text-primary)' }}>{student.name}</span>
                        <span className="text-xs text-zinc-500 font-mono">ID: {student.studentId}</span>
                      </div>
                    </td>
                    <td className="table-td text-sm" style={{ color: 'var(--sys-text-secondary)' }} data-label="Grade & Section">{student.gradeSection}</td>
                    <td className="table-td" data-label="Absences">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold" style={{ color: 'var(--sys-text-primary)' }}>{student.absenceCount}</span>
                        {student.attendanceConcern && (
                          <span className="badge-warning">
                            FLAGGED
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="table-td" data-label="Incident History">
                      <div className="flex items-center gap-2 text-xs font-bold">
                        {student.highCount !== undefined ? (
                          <>
                            <span className="text-red-500 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded">H: {student.highCount}</span>
                            <span className="text-orange-500 bg-orange-500/10 border border-orange-500/20 px-1.5 py-0.5 rounded">M: {student.mediumCount}</span>
                            <span className="text-green-500 bg-green-500/10 border border-green-500/20 px-1.5 py-0.5 rounded">L: {student.lowCount}</span>
                          </>
                        ) : (
                          <span className="text-zinc-500 px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--sys-surface-subtle)' }}>Total: {student.incidentCount}</span>
                        )}
                      </div>
                    </td>
                    <td className="table-td" data-label="Risk Level">
                      <RiskBadge level={student.riskLevel} />
                    </td>
                    <td className="table-td" data-label="Counseling Status">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-md inline-block ${getCounselingStatusColor(
                          student.counselingStatus
                        )}`}
                      >
                        {student.counselingStatus}
                      </span>
                    </td>
                    <td className="table-td text-right pr-6" data-label="Actions">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onViewCase(student.id)}
                          className="px-3 py-1.5 rounded-md font-semibold text-xs shadow-sm border flex items-center transition-all hover:bg-black/5 dark:hover:bg-white/5"
                          style={{ backgroundColor: 'var(--sys-surface-muted)', borderColor: 'var(--sys-border)', color: 'var(--sys-text-primary)' }}
                        >
                          <Eye className="w-3.5 h-3.5 mr-0 sm:mr-1.5" />
                          <span className="hidden sm:inline">View</span>
                        </button>
                        <button
                          onClick={() => onStartIntervention(student.id)}
                          className="px-3 py-1.5 rounded-md bg-cavite-maroon hover:bg-cavite-hover text-white font-semibold text-xs shadow-sm flex items-center transition-all"
                        >
                          <ChevronRight className="w-3.5 h-3.5 mr-0 sm:mr-1.5" />
                          <span className="hidden sm:inline">Start</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-16 text-center text-zinc-400" style={{ backgroundColor: 'var(--sys-surface)' }}>
                    <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                    <p className="text-base font-medium">No students found matching your criteria</p>
                    <p className="text-sm mt-1">Try adjusting your search or filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Info */}
      <div className="flex justify-between items-center text-sm">
        <p className="text-zinc-500 font-medium">
          Showing <span className="font-semibold" style={{ color: 'var(--sys-text-primary)' }}>{filteredStudents.length}</span> of{' '}
          <span className="font-semibold" style={{ color: 'var(--sys-text-primary)' }}>{students.length}</span> flagged students
        </p>
        
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn-outline px-3 py-1 text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm font-semibold text-zinc-500">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn-outline px-3 py-1 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
