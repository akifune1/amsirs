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
        return 'bg-blue-100 text-blue-700 border border-blue-300';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-300';
      case 'Resolved':
        return 'bg-green-100 text-green-700 border border-green-300';
      case 'Not Started':
        return 'bg-gray-100 text-gray-700 border border-gray-300';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-300';
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
              className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                filterRisk === level
                  ? 'bg-cavite-maroon text-white shadow-lg'
                  : 'bg-cavite-gray border border-cavite-border text-gray-700 hover:border-cavite-maroon/30'
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
            <tbody>
              {paginatedStudents.length > 0 ? (
                paginatedStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="table-td hover:bg-cavite-gray/30 transition-colors border-b border-cavite-border/50 last:border-b-0"
                  >
                    <td className="table-td">
                      <div className="flex flex-col">
                        <span className="font-bold text-cavite-black">{student.name}</span>
                        <span className="text-xs text-gray-500">ID: {student.studentId}</span>
                      </div>
                    </td>
                    <td className="table-td">{student.gradeSection}</td>
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{student.absenceCount}</span>
                        {student.attendanceConcern && (
                          <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-1 rounded border border-orange-300 font-bold">
                            FLAGGED
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="table-td">
                      <span className="font-bold">{student.incidentCount}</span>
                    </td>
                    <td className="table-td">
                      <RiskBadge level={student.riskLevel} />
                    </td>
                    <td className="table-td">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded border uppercase tracking-tighter inline-block ${getCounselingStatusColor(
                          student.counselingStatus
                        )}`}
                      >
                        {student.counselingStatus}
                      </span>
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onViewCase(student.id)}
                          className="btn-text flex items-center gap-1 hover:text-cavite-maroon transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">View</span>
                        </button>
                        <button
                          onClick={() => onStartIntervention(student.id)}
                          className="btn-text text-green-600 hover:text-green-700 transition-colors flex items-center gap-1"
                        >
                          <ChevronRight className="w-4 h-4" />
                          <span className="hidden sm:inline">Start</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="table-td text-center py-8 text-gray-500">
                    <p className="font-medium">No students found matching your criteria</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Info */}
      <div className="flex justify-between items-center text-sm">
        <p className="text-gray-500 font-medium">
          Showing <span className="font-bold text-cavite-maroon">{filteredStudents.length}</span> of{' '}
          <span className="font-bold text-cavite-maroon">{students.length}</span> flagged students
        </p>
        
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm font-bold bg-white border border-cavite-border rounded text-gray-700 disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-sm font-bold text-gray-500">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm font-bold bg-white border border-cavite-border rounded text-gray-700 disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
