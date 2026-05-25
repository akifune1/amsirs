'use client';

import React from 'react';
import { Calendar, User, FileText, AlertCircle } from 'lucide-react';
import RiskBadge from './RiskBadge';

interface IncidentRecord {
  date: string;
  title: string;
  severity: 'Low' | 'Medium' | 'High';
  reporter: string;
}

interface CounselingRecord {
  date: string;
  type: string;
  notes: string;
  counselor: string;
}

interface StudentCaseCardProps {
  studentName: string;
  studentId: string;
  gradeSection: string;
  guardianContact: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  attendanceStats: {
    totalAbsences: number;
    lateRecords: number;
    attendancePercentage: number;
  };
  recentIncidents: IncidentRecord[];
  counselingHistory: CounselingRecord[];
  onStartIntervention: () => void;
}

export default function StudentCaseCard({
  studentName,
  studentId,
  gradeSection,
  guardianContact,
  riskLevel,
  attendanceStats,
  recentIncidents,
  counselingHistory,
  onStartIntervention,
}: StudentCaseCardProps) {
  const getSeverityColor = (severity: 'Low' | 'Medium' | 'High') => {
    switch (severity) {
      case 'Low':
        return 'bg-green-100 text-green-700 border border-green-300';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-300';
      case 'High':
        return 'bg-red-100 text-red-700 border border-red-300';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Student Header Card */}
      <div className="sys-card">
        <div className="sys-card-header">
          <div>
            <p className="sys-label">STUDENT PROFILE</p>
            <h1 className="text-2xl font-bold text-cavite-black mt-1">{studentName}</h1>
          </div>
          <RiskBadge level={riskLevel} />
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-cavite-border">
          <div>
            <p className="sys-label mb-2">Student ID</p>
            <p className="text-lg font-bold text-cavite-black">{studentId}</p>
          </div>

          <div>
            <p className="sys-label mb-2">Grade & Section</p>
            <p className="text-lg font-bold text-cavite-black">{gradeSection}</p>
          </div>

          <div>
            <p className="sys-label mb-2">Guardian Contact</p>
            <p className="text-lg font-bold text-cavite-black font-mono text-sm">{guardianContact}</p>
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="p-8">
          <h3 className="sys-label mb-4">ATTENDANCE SUMMARY</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-cavite-gray/50 p-4 rounded-lg">
              <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Total Absences</p>
              <p className="text-3xl font-black text-cavite-black">{attendanceStats.totalAbsences}</p>
            </div>

            <div className="bg-cavite-gray/50 p-4 rounded-lg">
              <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Late Records</p>
              <p className="text-3xl font-black text-cavite-black">{attendanceStats.lateRecords}</p>
            </div>

            <div className="bg-cavite-gray/50 p-4 rounded-lg">
              <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Attendance %</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-black text-green-600">{attendanceStats.attendancePercentage}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Incident History */}
      <div className="sys-card">
        <div className="sys-card-header">
          <h3 className="sys-label">INCIDENT HISTORY</h3>
        </div>

        <div className="divide-y divide-cavite-border">
          {recentIncidents.length > 0 ? (
            recentIncidents.map((incident, idx) => (
              <div key={idx} className="p-6 hover:bg-cavite-gray/20 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <AlertCircle className="w-4 h-4 text-gray-400" />
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded border uppercase tracking-tighter ${getSeverityColor(incident.severity)}`}>
                        {incident.severity} Severity
                      </span>
                    </div>
                    <p className="font-bold text-cavite-black mb-1">{incident.title}</p>
                    <p className="text-sm text-gray-600">Reported by: {incident.reporter}</p>
                  </div>
                  <p className="text-xs font-bold text-gray-500 whitespace-nowrap">
                    {new Date(incident.date).toLocaleDateString('en-PH', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p className="font-medium">No incident records</p>
            </div>
          )}
        </div>
      </div>

      {/* Counseling History */}
      <div className="sys-card">
        <div className="sys-card-header justify-between">
          <h3 className="sys-label">COUNSELING HISTORY</h3>
          <button
            onClick={onStartIntervention}
            className="text-xs font-bold text-cavite-maroon hover:text-[#600000] uppercase tracking-widest flex items-center gap-1"
          >
            <span className="w-4 h-4 bg-cavite-maroon text-white rounded-full flex items-center justify-center text-[10px] font-black">+</span>
            New Session
          </button>
        </div>

        <div className="divide-y divide-cavite-border">
          {counselingHistory.length > 0 ? (
            counselingHistory.map((session, idx) => (
              <div key={idx} className="p-6 hover:bg-cavite-gray/20 transition-colors">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <p className="font-bold text-cavite-black text-sm">{session.type}</p>
                  </div>
                  <p className="text-xs font-bold text-gray-500">
                    {new Date(session.date).toLocaleDateString('en-PH', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <p className="text-sm text-gray-700 mb-2 ml-6">{session.notes}</p>
                <p className="text-xs text-gray-500 ml-6">Counselor: {session.counselor}</p>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p className="font-medium">No counseling sessions yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
