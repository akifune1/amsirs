'use client';

import React, { useState } from 'react';
import { Calendar, User, FileText, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import RiskBadge from './RiskBadge';
import IntakeSheetModal from '@/app/components/IntakeSheetModal';
import { fetchIntakeSheetData } from '@/app/incident-dashboard/actions';

interface IncidentRecord {
  id: string; // Added ID for toggle tracking
  date: string;
  title: string;
  offenseCategory?: string;
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
  flagReason?: string;
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
  flagReason,
  attendanceStats,
  recentIncidents,
  counselingHistory,
  onStartIntervention,
}: StudentCaseCardProps) {
  // NEW: State to track which incident is expanded
  const [expandedIncident, setExpandedIncident] = useState<string | null>(null);

  // 📄 Intake Sheet State
  const [intakeModalOpen, setIntakeModalOpen] = useState(false);
  const [intakePrefill, setIntakePrefill] = useState<any>(null);
  const [intakeLoading, setIntakeLoading] = useState<string | null>(null);

  const toggleIncident = (id: string) => {
    if (expandedIncident === id) {
      setExpandedIncident(null);
    } else {
      setExpandedIncident(id);
    }
  };



  return (
    <>
    <div className="space-y-6 max-w-4xl animate-in slide-in-from-right-4 duration-300">
      {/* Student Header Card */}
      <div className="sys-card">
        <div className="sys-card-header">
          <div>
            <p className="sys-label">STUDENT PROFILE</p>
            <h1 className="text-2xl font-bold mt-1" style={{ color: 'var(--sys-text-primary)' }}>{studentName}</h1>
          </div>
          <RiskBadge level={riskLevel} />
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 border-b" style={{ borderColor: 'var(--sys-border)' }}>
          <div>
            <p className="sys-label mb-2">Student ID</p>
            <p className="text-lg font-bold" style={{ color: 'var(--sys-text-primary)' }}>{studentId}</p>
          </div>

          <div>
            <p className="sys-label mb-2">Grade & Section</p>
            <p className="text-lg font-bold" style={{ color: 'var(--sys-text-primary)' }}>{gradeSection}</p>
          </div>

          <div>
            <p className="sys-label mb-2">Guardian Contact</p>
            <p className="text-lg font-bold font-mono text-sm" style={{ color: 'var(--sys-text-primary)' }}>{guardianContact}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x" style={{ borderColor: 'var(--sys-border)' }}>
          {/* Attendance Summary */}
          <div className="p-8">
            <h3 className="sys-label mb-4">ATTENDANCE SUMMARY</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-md border" style={{ backgroundColor: 'var(--sys-surface-subtle)', borderColor: 'var(--sys-border)' }}>
                <p className="text-xs font-semibold text-zinc-500 mb-1">Absences</p>
                <p className="text-2xl font-semibold" style={{ color: 'var(--sys-text-primary)' }}>{attendanceStats.totalAbsences}</p>
              </div>

              <div className="p-4 rounded-md border" style={{ backgroundColor: 'var(--sys-surface-subtle)', borderColor: 'var(--sys-border)' }}>
                <p className="text-xs font-semibold text-zinc-500 mb-1">Lates</p>
                <p className="text-2xl font-semibold" style={{ color: 'var(--sys-text-primary)' }}>{attendanceStats.lateRecords}</p>
              </div>

              <div className="p-4 rounded-md border" style={{ backgroundColor: 'var(--sys-surface-subtle)', borderColor: 'var(--sys-border)' }}>
                <p className="text-xs font-semibold text-zinc-500 mb-1">Rate</p>
                <p className="text-2xl font-semibold text-green-500">{attendanceStats.attendancePercentage}%</p>
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

        <div className="divide-y" style={{ borderTopColor: 'var(--sys-border-subtle)' }}>
          {recentIncidents.length > 0 ? (
            recentIncidents.map((incident) => (
              <div key={incident.id} className="transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                
                {/* Clickable Header Row */}
                <div 
                  className="p-6 cursor-pointer flex items-center justify-between gap-4"
                  onClick={() => toggleIncident(incident.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <AlertCircle className="w-4 h-4 text-zinc-400" />
                      {incident.offenseCategory && incident.offenseCategory !== 'Other' && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase bg-cavite-maroon/10 text-cavite-maroon border border-cavite-maroon/20">
                          {incident.offenseCategory}
                        </span>
                      )}
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md" style={{ backgroundColor: 'var(--sys-surface-subtle)', color: 'var(--sys-text-muted)' }}>
                        {incident.status}
                      </span>
                    </div>
                    <p className="font-semibold mb-1" style={{ color: 'var(--sys-text-primary)' }}>{incident.title}</p>
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
                    <div className="p-5 border shadow-inner rounded-md space-y-5" style={{ backgroundColor: 'var(--sys-surface-subtle)', borderColor: 'var(--sys-border)' }}>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-2 h-2 bg-cavite-maroon rounded-full animate-pulse"></span>
                          <p className="sys-label !mb-0">Decrypted Official Report</p>
                        </div>
                        <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap p-4 border rounded-md shadow-sm" style={{ backgroundColor: 'var(--sys-surface)', borderColor: 'var(--sys-border)', color: 'var(--sys-text-primary)' }}>
                          {incident.description}
                        </p>
                      </div>

                      {incident.imageUrl && (
                        <div>
                          <p className="sys-label mb-2">Photographic Evidence</p>
                          <div className="p-2 border rounded-md shadow-sm inline-block" style={{ backgroundColor: 'var(--sys-surface)', borderColor: 'var(--sys-border)' }}>
                            <img 
                              src={incident.imageUrl} 
                              alt="Incident Evidence" 
                              className="max-h-64 object-contain rounded-sm" 
                            />
                          </div>
                        </div>
                      )}

                      {/* Export Intake Sheet Button */}
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          setIntakeLoading(incident.id);
                          try {
                            const result = await fetchIntakeSheetData(incident.id);
                            if (result.success && result.data) {
                              setIntakePrefill(result.data);
                            } else {
                              setIntakePrefill(null);
                            }
                            setIntakeModalOpen(true);
                          } catch (err) {
                            console.error('Failed to fetch intake data:', err);
                            setIntakePrefill(null);
                            setIntakeModalOpen(true);
                          } finally {
                            setIntakeLoading(null);
                          }
                        }}
                        disabled={intakeLoading === incident.id}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-semibold text-xs shadow-sm transition-all border hover:bg-black/5 dark:hover:bg-white/5 active:scale-[0.98]"
                        style={{ backgroundColor: 'var(--sys-surface)', borderColor: 'var(--sys-border)', color: 'var(--sys-text-primary)' }}
                      >
                        {intakeLoading === incident.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-cavite-maroon/30 border-t-cavite-maroon rounded-full animate-spin" />
                            Preparing Intake Sheet...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            Export Intake Sheet
                          </>
                        )}
                      </button>

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

        <div className="divide-y" style={{ borderTopColor: 'var(--sys-border-subtle)' }}>
          {counselingHistory.length > 0 ? (
            counselingHistory.map((session, idx) => (
              <div key={idx} className="p-6 transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-zinc-400" />
                    <p className="font-semibold text-sm" style={{ color: 'var(--sys-text-primary)' }}>{session.type}</p>
                    <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md ${
                      session.caseStatus === 'ongoing' ? 'bg-blue-500/10 text-blue-500' :
                      session.caseStatus === 'resolved' ? 'bg-green-500/10 text-green-500' : ''
                    }`}
                    style={session.caseStatus !== 'ongoing' && session.caseStatus !== 'resolved' ? { backgroundColor: 'var(--sys-surface-muted)', color: 'var(--sys-text-muted)' } : {}}
                    >
                      {session.caseStatus}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-zinc-500">
                    {new Date(session.date).toLocaleDateString('en-PH', {
                      year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </p>
                </div>
                <p className="text-sm mb-2 ml-6 font-medium whitespace-pre-wrap" style={{ color: 'var(--sys-text-secondary)' }}>{session.notes}</p>
                
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

    {/* Intake Sheet Modal */}
    <IntakeSheetModal
      isOpen={intakeModalOpen}
      onClose={() => setIntakeModalOpen(false)}
      prefill={intakePrefill}
    />
    </>
  );
}