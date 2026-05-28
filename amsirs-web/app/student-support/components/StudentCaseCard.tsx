'use client';

import React, { useState } from 'react';
import { Calendar, User, FileText, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import RiskBadge from './RiskBadge';

interface IncidentRecord {
  id: string; // Added ID for toggle tracking
  date: string;
  title: string;
  severity: 'Low' | 'Medium' | 'High';
  reporter: string;
  status: string;
  description: string;
  imageUrl: string | null;
}

interface CounselingRecord {
  date: string;
  type: string;
  notes: string;
  counselor: string;
  followUpDate: string;
  caseStatus: string;
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
  // NEW: State to track which incident is expanded
  const [expandedIncident, setExpandedIncident] = useState<string | null>(null);

  const toggleIncident = (id: string) => {
    if (expandedIncident === id) {
      setExpandedIncident(null);
    } else {
      setExpandedIncident(id);
    }
  };

  const getSeverityColor = (severity: 'Low' | 'Medium' | 'High') => {
    switch (severity) {
      case 'Low':
        return 'badge-success';
      case 'Medium':
        return 'badge-warning';
      case 'High':
        return 'badge-danger';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in slide-in-from-right-4 duration-300">
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
            <div className="bg-zinc-50 p-4 rounded-md border border-cavite-border">
              <p className="sys-label !mb-2">Total Absences</p>
              <p className="text-3xl font-semibold text-cavite-black">{attendanceStats.totalAbsences}</p>
            </div>

            <div className="bg-zinc-50 p-4 rounded-md border border-cavite-border">
              <p className="sys-label !mb-2">Late Records</p>
              <p className="text-3xl font-semibold text-cavite-black">{attendanceStats.lateRecords}</p>
            </div>

            <div className="bg-zinc-50 p-4 rounded-md border border-cavite-border">
              <p className="sys-label !mb-2">Attendance %</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-semibold text-green-600">{attendanceStats.attendancePercentage}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Incident History with Expandable Details */}
      <div className="sys-card">
        <div className="sys-card-header">
          <h3 className="sys-label">INCIDENT HISTORY</h3>
        </div>

        <div className="divide-y divide-cavite-border">
          {recentIncidents.length > 0 ? (
            recentIncidents.map((incident) => (
              <div key={incident.id} className="hover:bg-zinc-50 transition-colors">
                
                {/* Clickable Header Row */}
                <div 
                  className="p-6 cursor-pointer flex items-center justify-between gap-4"
                  onClick={() => toggleIncident(incident.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <AlertCircle className="w-4 h-4 text-zinc-400" />
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase ${getSeverityColor(incident.severity)}`}>
                        {incident.severity}
                      </span>
                      <span className="text-[10px] font-semibold text-zinc-500 uppercase px-2 py-0.5 bg-zinc-100 rounded-md">
                        {incident.status}
                      </span>
                    </div>
                    <p className="font-semibold text-cavite-black mb-1">{incident.title}</p>
                    <p className="text-sm text-zinc-500">Reported by: {incident.reporter.substring(0,8)}...</p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <p className="text-xs font-semibold text-zinc-500 whitespace-nowrap">
                      {new Date(incident.date).toLocaleDateString('en-PH', {
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                    <button className="text-xs font-semibold text-cavite-maroon hover:text-cavite-hover flex items-center gap-1 transition-colors">
                      {expandedIncident === incident.id ? 'Close Brief' : 'Open Brief'}
                      {expandedIncident === incident.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Section */}
                {expandedIncident === incident.id && (
                  <div className="px-6 pb-6 pt-0 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-5 bg-zinc-50 border border-cavite-border shadow-inner rounded-md space-y-5">
                      
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-2 h-2 bg-cavite-maroon rounded-full animate-pulse"></span>
                          <p className="sys-label !mb-0">Decrypted Official Report</p>
                        </div>
                        <p className="text-sm text-cavite-black font-medium leading-relaxed whitespace-pre-wrap bg-white p-4 border border-cavite-border rounded-md shadow-sm">
                          {incident.description}
                        </p>
                      </div>

                      {incident.imageUrl && (
                        <div>
                          <p className="sys-label mb-2">Photographic Evidence</p>
                          <div className="bg-white p-2 border border-cavite-border rounded-md shadow-sm inline-block">
                            <img 
                              src={incident.imageUrl} 
                              alt="Incident Evidence" 
                              className="max-h-64 object-contain rounded-sm" 
                            />
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-zinc-500">
              <p className="font-medium text-sm">No incident records</p>
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
              <div key={idx} className="p-6 hover:bg-zinc-50 transition-colors">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-zinc-400" />
                    <p className="font-semibold text-cavite-black text-sm">{session.type}</p>
                    <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md ${
                      session.caseStatus === 'ongoing' ? 'bg-blue-50 text-blue-700' :
                      session.caseStatus === 'resolved' ? 'bg-green-50 text-green-700' :
                      'bg-zinc-100 text-zinc-600'
                    }`}>
                      {session.caseStatus}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-zinc-500">
                    {new Date(session.date).toLocaleDateString('en-PH', {
                      year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </p>
                </div>
                <p className="text-sm text-zinc-600 mb-2 ml-6 font-medium whitespace-pre-wrap">{session.notes}</p>
                
                <div className="ml-6 flex items-center gap-4 text-xs font-semibold text-zinc-400 mt-3">
                  <p>Follow-up: {new Date(session.followUpDate).toLocaleDateString()}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-zinc-500">
              <p className="font-medium text-sm">No counseling sessions yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}