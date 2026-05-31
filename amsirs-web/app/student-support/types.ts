/**
 * Type definitions for Student Support System module
 * Provides consistent typing across components and server actions
 */

// ==========================================
// Student & Profile Types
// ==========================================

export type RiskLevel = 'Low' | 'Medium' | 'High';

export type CounselingStatus = 'Active' | 'Pending' | 'Resolved' | 'Not Started';

export type InterventionType =
  | 'Initial Counseling'
  | 'Follow-up Session'
  | 'Crisis Intervention'
  | 'Academic Support'
  | 'Behavioral Intervention'
  | 'Parent Conference'
  | 'Referral to External Services';

export type CaseStatus = 'Active' | 'Pending Review' | 'Resolved' | 'Escalated';

export type IncidentSeverity = 'Low' | 'Medium' | 'High';

// ==========================================
// Student Records
// ==========================================

export interface StudentRecord {
  id: string;
  studentId: string;
  name: string;
  gradeSection: string;
  attendanceConcern: boolean;
  absenceCount: number;
  incidentCount: number;
  riskLevel: RiskLevel;
  counselingStatus: CounselingStatus;
  lastInteraction?: string;
  guardianEmail?: string;
  lowCount?: number;
  mediumCount?: number;
  highCount?: number;
  flagReason?: string;
}

export interface FlaggedStudent {
  student_id: string;
  full_name: string;
  grade_level: string;
  guardian_email?: string;
  risk_level: RiskLevel;
  absence_count: number;
  incident_count: number;
  counseling_status: CounselingStatus;
}

export interface StudentProfile {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  gradeLevel: string;
  guardianEmail?: string;
  accountId?: string;
  createdAt: string;
}

// ==========================================
// Student Case Details
// ==========================================

export interface AttendanceStats {
  totalAbsences: number;
  lateRecords: number;
  attendancePercentage: number;
}

export interface IncidentRecord {
  id: string;
  date: string;
  title: string;
  severity: IncidentSeverity;
  reporter: string;
}

export interface CounselingRecord {
  date: string;
  type: InterventionType;
  notes: string;
  counselor: string;
  followUpDate?: string;
  caseStatus?: CaseStatus;
}

export interface SupportIntervention {
  id: string;
  student_id: string;
  counselor_id: string;
  intervention_type: InterventionType;
  notes: string;
  follow_up_date: string;
  case_status: CaseStatus;
  created_at: string;
  updated_at: string;
}

export interface StudentCaseDetails {
  studentName: string;
  studentId: string;
  lrn?: string;
  gradeSection: string;
  guardianContact: string;
  riskLevel: RiskLevel;
  attendanceStats: AttendanceStats;
  recentIncidents: IncidentRecord[];
  counselingHistory: CounselingRecord[];
  lowCount?: number;
  mediumCount?: number;
  highCount?: number;
  flagReason?: string;
}

// ==========================================
// Counseling Sessions
// ==========================================

export interface CounselingSession {
  id: string;
  studentId: string;
  counselorId: string;
  interventionType: InterventionType;
  notes: string;
  followUpDate: string;
  caseStatus: CaseStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CounselingSessionData {
  sessionDate: string;
  interventionType: InterventionType;
  notes: string;
  followUpDate: string;
  caseStatus: CaseStatus;
}

export interface CounselingSessionInput {
  interventionType: string;
  notes: string;
  followUpDate: string;
  caseStatus: string;
}

// ==========================================
// Dashboard Statistics
// ==========================================

export interface DashboardStats {
  activeCases: number;
  highRisk: number;
  pendingFollowUps: number;
  resolvedCases: number;
}

export interface StatCard {
  label: string;
  value: number;
  icon?: React.ReactNode;
  color?: 'primary' | 'danger' | 'success' | 'warning';
  trend?: 'up' | 'down';
}

// ==========================================
// Server Action Responses
// ==========================================

export interface ActionResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface DashboardStatsResponse extends ActionResponse<DashboardStats> {}

export interface FlaggedStudentsResponse extends ActionResponse<StudentRecord[]> {}

export interface StudentCaseDetailsResponse extends ActionResponse<StudentCaseDetails> {}

export interface CreateSessionResponse extends ActionResponse<{ sessionId: string }> {}

export interface UpdateCaseStatusResponse extends ActionResponse<void> {}

// ==========================================
// API / Query Parameters
// ==========================================

export interface StudentFilterParams {
  searchTerm?: string;
  riskLevel?: RiskLevel | 'All';
  counselingStatus?: CounselingStatus;
  gradeLevel?: string;
  sortBy?: 'name' | 'risk' | 'absences' | 'incidents';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

// ==========================================
// Form Data
// ==========================================

export interface CounselingFormData {
  sessionDate: string;
  interventionType: InterventionType;
  notes: string;
  followUpDate: string;
  caseStatus: CaseStatus;
}

// ==========================================
// User Context
// ==========================================

export interface UserContext {
  id: string;
  email: string;
  role: 'Guidance Counselor' | 'System Admin' | 'Other';
  firstName?: string;
  lastName?: string;
}

// ==========================================
// Component Props
// ==========================================

export interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
}

export interface SupportStatsProps {
  data: DashboardStats;
  loading?: boolean;
}

export interface StudentTableProps {
  students: StudentRecord[];
  onViewCase: (studentId: string) => void;
  onStartIntervention: (studentId: string) => void;
  loading?: boolean;
}

export interface CounselingModalProps {
  isOpen: boolean;
  studentName: string;
  onClose: () => void;
  onSave: (data: CounselingSessionData) => Promise<void> | void;
  isLoading?: boolean;
}

export interface StudentCaseCardProps {
  studentName: string;
  studentId: string;
  gradeSection: string;
  guardianContact: string;
  riskLevel: RiskLevel;
  attendanceStats: AttendanceStats;
  recentIncidents: IncidentRecord[];
  counselingHistory: CounselingRecord[];
  onStartIntervention: () => void;
}

// ==========================================
// Database Models (Supabase)
// ==========================================



export interface FlaggedStudent {
  student_id: string;
  full_name: string;
  grade_section: string;
  absences_7d: number;
  incident_count_30d: number;
  risk_level: RiskLevel;
}

// ==========================================
// API Request/Response Types
// ==========================================

export interface CreateInterventionRequest {
  student_id: string;
  intervention_type: InterventionType;
  notes: string;
  follow_up_date: string;
}

export interface UpdateCaseStatusRequest {
  case_status: CaseStatus;
}

export interface FlaggedStudentsQueryParams {
  risk_level?: RiskLevel;
  filter_type?: 'all' | 'attendance' | 'behavior';
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface StudentSupportHistory {
  student_id: string;
  full_name: string;
  grade_section: string;
  current_risk_level: RiskLevel;
  attendance_summary: {
    total_absences_7d: number;
    total_absences_30d: number;
    total_incidents_30d: number;
  };
  recent_incidents: IncidentRecord[];
  counseling_history: CounselingRecord[];
}

// ==========================================
// Utility Types
// ==========================================

export type Optional<T> = T | null | undefined;

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'Guidance Counselor' | 'System Admin';
}



export interface AttendanceRecord {
  id: string;
  student_id: string;
  is_absent: boolean;
  is_late: boolean;
  created_at: string;
}

export interface IncidentReport {
  id: string;
  location: string;
  severity: string;
  description: string;
  status: string;
  reporting_staff: string;
  image_path: string | null;
  created_at: string;
}

export interface IncidentInvolvement {
  id: string;
  student_id: string;
  incident_id: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  created_at: string;
}

// ==========================================
// Utility Types & Enums
// ==========================================

export enum SeverityLevel {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
}

export enum InterventionTypeEnum {
  InitialCounseling = 'Initial Counseling',
  FollowUpSession = 'Follow-up Session',
  CrisisIntervention = 'Crisis Intervention',
  AcademicSupport = 'Academic Support',
  BehavioralIntervention = 'Behavioral Intervention',
  ParentConference = 'Parent Conference',
  ReferralToExternalServices = 'Referral to External Services',
}

export const INTERVENTION_TYPE_OPTIONS: Array<{ label: string; value: InterventionType }> = [
  { label: 'Initial Counseling', value: 'Initial Counseling' },
  { label: 'Follow-up Session', value: 'Follow-up Session' },
  { label: 'Crisis Intervention', value: 'Crisis Intervention' },
  { label: 'Academic Support', value: 'Academic Support' },
  { label: 'Behavioral Intervention', value: 'Behavioral Intervention' },
  { label: 'Parent Conference', value: 'Parent Conference' },
  { label: 'Referral to External Services', value: 'Referral to External Services' },
];

export const CASE_STATUS_OPTIONS: Array<{ label: string; value: CaseStatus }> = [
  { label: 'Active - Ongoing Support', value: 'Active' },
  { label: 'Pending Review', value: 'Pending Review' },
  { label: 'Resolved - Case Closed', value: 'Resolved' },
  { label: 'Escalated - Requires Admin', value: 'Escalated' },
];

// ==========================================
// Utility Functions (Type Guards)
// ==========================================

export function isHighRisk(student: StudentRecord): boolean {
  return student.riskLevel === 'High';
}

export function isMediumRisk(student: StudentRecord): boolean {
  return student.riskLevel === 'Medium';
}

export function isLowRisk(student: StudentRecord): boolean {
  return student.riskLevel === 'Low';
}

export function isActiveCase(session: CounselingSession): boolean {
  return session.caseStatus === 'Active';
}

export function isResolvedCase(session: CounselingSession): boolean {
  return session.caseStatus === 'Resolved';
}

export function needsFollowUp(session: CounselingSession): boolean {
  return session.caseStatus === 'Pending Review' || session.caseStatus === 'Active';
}
