'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, Eye } from 'lucide-react';
import RiskBadge from './RiskBadge';

interface StudentRecord {
  id: string;
  studentId: string;
  name: string;
  gradeSection: string;
  attendanceConcern: boolean;
  absenceCount: number;
  incidentCount: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  counselingStatus: 'Active' | 'Pending' | 'Resolved' | 'Not Started';
  lastInteraction?: string;
}

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

  const filteredStudents = students.filter(student => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.gradeSection.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRisk = filterRisk === 'All' || student.riskLevel === filterRisk;

    return matchesSearch && matchesRisk;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRisk]);

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
        return 'bg-zinc-100 text-zinc-600 border border-cavite-border';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name, ID, or grade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
          />
        </div>

        <div className="flex gap-2">
          {(['All', 'Low', 'Medium', 'High'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setFilterRisk(level)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filterRisk === level
                  ? 'bg-cavite-maroon text-white border border-cavite-maroon shadow-sm'
                  : 'bg-white border border-cavite-border text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="sys-card">
        <div className="sys-table-wrapper">
          <table className="sys-table">
            <thead>
              <tr className="table-header-row">
                <th className="table-th">Student Name</th>
                <th className="table-th">Grade & Section</th>
                <th className="table-th">Absences</th>
                <th className="table-th">Incident Reports</th>
                <th className="table-th">Risk Level</th>
                <th className="table-th">Counseling Status</th>
                <th className="table-th">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedStudents.length > 0 ? (
                paginatedStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="table-td">
                      <div className="flex flex-col">
                        <span className="font-semibold text-cavite-black">{student.name}</span>
                        <span className="text-xs text-zinc-500 font-mono">ID: {student.studentId}</span>
                      </div>
                    </td>
                    <td className="table-td text-zinc-600 text-sm">{student.gradeSection}</td>
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-cavite-black">{student.absenceCount}</span>
                        {student.attendanceConcern && (
                          <span className="badge-warning">
                            FLAGGED
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="table-td">
                      <span className="font-semibold text-cavite-black">{student.incidentCount}</span>
                    </td>
                    <td className="table-td">
                      <RiskBadge level={student.riskLevel} />
                    </td>
                    <td className="table-td">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-md inline-block ${getCounselingStatusColor(
                          student.counselingStatus
                        )}`}
                      >
                        {student.counselingStatus}
                      </span>
                    </td>
                    <td className="table-td text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onViewCase(student.id)}
                          className="btn-text"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </button>
                        <button
                          onClick={() => onStartIntervention(student.id)}
                          className="btn-primary flex items-center"
                        >
                          <ChevronRight className="w-4 h-4 mr-1" />
                          Start
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="table-td text-center py-16">
                    <p className="text-zinc-400 text-sm font-medium">No students found matching your criteria</p>
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
          Showing <span className="font-semibold text-cavite-black">{filteredStudents.length}</span> of{' '}
          <span className="font-semibold text-cavite-black">{students.length}</span> flagged students
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
