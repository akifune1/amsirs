'use client';

import { useEffect, useState } from 'react';
import { logout } from '../auth/actions';
import SupportStats from './components/SupportStats';
import StudentTable from './components/StudentTable';
import CounselingModal, { CounselingSessionData } from './components/CounselingModal';
import StudentCaseCard from './components/StudentCaseCard';
import { 
  getDashboardStats, 
  getFlaggedStudents, 
  createIntervention, 
  getStudentCaseDetails,
  getCurrentUserProfile // <-- New Import
} from './actions';

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

interface StatData {
  activeCases: number;
  highRisk: number;
  pendingFollowUps: number;
  resolvedCases: number;
}

interface StudentCaseDetails {
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
  recentIncidents: any[];
  counselingHistory: any[];
}

type PageView = 'dashboard' | 'case-details';

export default function StudentSupportPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatData | null>(null);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [caseDetails, setCaseDetails] = useState<StudentCaseDetails | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [pageView, setPageView] = useState<PageView>('dashboard');
  
  // --- NEW: User Profile State ---
  const [userProfile, setUserProfile] = useState({ name: 'Loading...', roleLabel: 'Counselor Portal' });

  const [counselingModal, setCounselingModal] = useState(false);
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<StudentRecord | null>(null);
  const [submittingSession, setSubmittingSession] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch current logged-in user profile
      const profileResponse = await getCurrentUserProfile();
      if (profileResponse.success && profileResponse.data) {
        setUserProfile(profileResponse.data);
      }

      // 2. Fetch stats
      const statsResponse = await getDashboardStats();
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }

      // 3. Fetch flagged students
      const studentsResponse = await getFlaggedStudents();
      if (studentsResponse.success && studentsResponse.data) {
        setStudents(studentsResponse.data);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCase = async (studentId: string) => {
    setLoading(true);
    try {
      const response = await getStudentCaseDetails(studentId);
      if (response.success && response.data) {
        setCaseDetails(response.data);
        setSelectedStudent(studentId);
        setPageView('case-details');
      }
    } catch (error) {
      console.error('Error loading case details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartIntervention = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setSelectedStudentForModal(student);
      setCounselingModal(true);
    }
  };

  const handleSaveSession = async (data: CounselingSessionData) => {
    if (!selectedStudentForModal) return;

    setSubmittingSession(true);
    try {
      // Fixed Typo: Using createIntervention instead of createCounselingSession
      const response = await createIntervention(
        selectedStudentForModal.id, 
        data.interventionType,
        data.notes,
        data.followUpDate
      );

      if (response.success) {
        setCounselingModal(false);
        setSelectedStudentForModal(null);
        await loadDashboardData();
      }
    } catch (error) {
      console.error('Error saving session:', error);
    } finally {
      setSubmittingSession(false);
    }
  };

  const handleBackToDashboard = () => {
    setPageView('dashboard');
    setSelectedStudent(null);
    setCaseDetails(null);
  };

  if (loading && pageView === 'dashboard') {
    return (
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
        <nav className="sys-navbar">
          <div className="flex items-center gap-3">
            <div className="badge-primary">AMSIRS</div>
            <div className="hidden md:block">
              <p className="sys-label leading-none">Cavite National High School</p>
              <p className="text-xs font-bold text-gray-700 uppercase tracking-tight">
                Student Support System
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="sys-label text-gray-400">{userProfile.roleLabel}</p>
              <p className="text-xs font-bold text-cavite-maroon mt-0.5">{userProfile.name}</p>
            </div>
          </div>
        </nav>

        <main className="sys-container">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-cavite-gray border-t-cavite-maroon rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Loading Student Support Dashboard...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* TOP NAVIGATION BAR */}
      <nav className="sys-navbar">
        <div className="flex items-center gap-3">
          <div className="badge-primary">AMSIRS</div>
          <div className="hidden md:block">
            <p className="sys-label leading-none">Cavite National High School</p>
            <p className="text-xs font-bold text-gray-700 uppercase tracking-tight">
              Student Support & Intervention
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="sys-label text-gray-400">{userProfile.roleLabel}</p>
            <p className="text-xs font-bold text-cavite-maroon mt-0.5">{userProfile.name}</p>
          </div>

          <form action={logout}>
            <button type="submit" className="btn-ghost">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </form>
        </div>
      </nav>

      <main className="sys-container">
        {pageView === 'dashboard' ? (
          <>
            {/* Page Header */}
            <div className="mb-10">
              <h2 className="text-3xl font-extrabold tracking-tight">Student Support Dashboard</h2>
              <p className="text-gray-500 font-medium mt-1">
                Monitor and manage student interventions, counseling sessions, and case follow-ups.
              </p>
            </div>

            {/* Statistics Cards */}
            {stats && <SupportStats data={stats} />}

            {/* Main Content: Flagged Students Table */}
            <div className="space-y-6">
              <div className="border-b border-cavite-border pb-4">
                <h3 className="text-lg font-bold text-cavite-black">Flagged Students</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Students requiring intervention based on attendance and incident records
                </p>
              </div>

              <StudentTable
                students={students}
                onViewCase={handleViewCase}
                onStartIntervention={handleStartIntervention}
              />
            </div>
          </>
        ) : caseDetails ? (
          <>
            {/* Case Details Header */}
            <div className="mb-8 flex items-center gap-4">
              <button
                onClick={handleBackToDashboard}
                className="btn-ghost"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                Back to Dashboard
              </button>
            </div>

            {/* Student Case Card */}
            <StudentCaseCard
              {...caseDetails}
              onStartIntervention={() => {
                const student = students.find(s => s.id === selectedStudent);
                if (student) {
                  setSelectedStudentForModal(student);
                  setCounselingModal(true);
                }
              }}
            />
          </>
        ) : null}
      </main>

      {/* Counseling Session Modal */}
      <CounselingModal
        isOpen={counselingModal}
        studentName={selectedStudentForModal?.name || ''}
        onClose={() => {
          setCounselingModal(false);
          setSelectedStudentForModal(null);
        }}
        onSave={handleSaveSession}
        isLoading={submittingSession}
      />
    </div>
  );
}