/**
 * API Reference & Integration Examples
 * How to use the Student Support System module from other parts of the application
 */

// ==========================================
// IMPORTS & EXPORTS
// ==========================================

// Import types
export type {
  RiskLevel,
  CounselingStatus,
  InterventionType,
  CaseStatus,
  StudentRecord,
  StudentCaseDetails,
  DashboardStats,
  ActionResponse,
} from './types';

// Import components
export { default as RiskBadge } from './components/RiskBadge';
export { default as SupportStats } from './components/SupportStats';
export { default as StudentTable } from './components/StudentTable';
export { default as CounselingModal } from './components/CounselingModal';
export { default as StudentCaseCard } from './components/StudentCaseCard';

// Import server actions
export {
  verifyStudentSupportAccess,
  getDashboardStats,
  getFlaggedStudents,
  getStudentCaseDetails,
  createCounselingSession,
  updateCaseStatus,
} from './actions';

// ==========================================
// INTEGRATION EXAMPLES
// ==========================================

/**
 * Example 1: Access Student Support Dashboard
 *
 * Usage in admin dashboard or navigation menu:
 */
export const STUDENT_SUPPORT_ROUTE = '/student-support';

/**
 * Example 2: Link to Individual Student Case
 *
 * Usage: Create a link from incident reporting to case details
 */
export function getStudentSupportUrl(studentId: string): string {
  return `/student-support?student=${studentId}&view=case-details`;
}

/**
 * Example 3: Embed SupportStats in Another Dashboard
 *
 * Usage in admin dashboard or main dashboard:
 * ```typescript
 * import { getDashboardStats, SupportStats } from '@/app/student-support';
 *
 * export default function MainDashboard() {
 *   const [stats, setStats] = useState(null);
 *
 *   useEffect(() => {
 *     getDashboardStats().then(res => {
 *       if (res.success) setStats(res.data);
 *     });
 *   }, []);
 *
 *   return (
 *     <div>
 *       {stats && <SupportStats data={stats} />}
 *     </div>
 *   );
 * }
 * ```
 */

/**
 * Example 4: Check if Student Needs Support
 *
 * Usage in incident reporting module:
 * ```typescript
 * import { getFlaggedStudents } from '@/app/student-support';
 *
 * // After creating incident, check if student should be flagged
 * const flaggedStudents = await getFlaggedStudents();
 * if (flaggedStudents.success && flaggedStudents.data) {
 *   const needsSupport = flaggedStudents.data.some(s => s.id === studentId);
 * }
 * ```
 */

/**
 * Example 5: Bulk Create Sessions from Incidents
 *
 * Usage to auto-create counseling sessions from high-severity incidents:
 * ```typescript
 * import { createCounselingSession } from '@/app/student-support';
 *
 * async function createSessionsForHighRiskIncidents() {
 *   const incidents = await fetchHighSeverityIncidents();
 *
 *   for (const incident of incidents) {
 *     for (const studentId of incident.studentIds) {
 *       await createCounselingSession(studentId, {
 *         interventionType: 'Crisis Intervention',
 *         notes: `Auto-created due to incident: ${incident.description}`,
 *         followUpDate: getNextWeekDate(),
 *         caseStatus: 'Active',
 *       });
 *     }
 *   }
 * }
 * ```
 */

/**
 * Example 6: Create Support Status Widget
 *
 * Usage for student portal to show their support status:
 * ```typescript
 * import { getStudentCaseDetails } from '@/app/student-support';
 * import type { StudentCaseDetails } from '@/app/student-support';
 *
 * export default function StudentStatusWidget({ studentId }: { studentId: string }) {
 *   const [caseDetails, setCaseDetails] = useState<StudentCaseDetails | null>(null);
 *
 *   useEffect(() => {
 *     getStudentCaseDetails(studentId).then(res => {
 *       if (res.success) setCaseDetails(res.data);
 *     });
 *   }, [studentId]);
 *
 *   if (!caseDetails) return null;
 *
 *   return (
 *     <div className="p-4 border-l-4 border-cavite-maroon bg-cavite-gray/50 rounded">
 *       <p className="font-bold">Support Status: {caseDetails.riskLevel} Risk</p>
 *       <p className="text-sm text-gray-600">
 *         {caseDetails.counselingHistory.length} sessions completed
 *       </p>
 *     </div>
 *   );
 * }
 * ```
 */

/**
 * Example 7: Add Support Navigation to Sidebar
 *
 * Usage to add link to sidebar based on role:
 * ```typescript
 *
 * const NAVIGATION = [
 *   {
 *     name: 'Dashboards',
 *     items: [
 *       { href: '/admin-dashboard', label: 'System Dashboard' },
 *       { href: '/incident-dashboard', label: 'Incident Reports' },
 *       // Add this line:
 *       { href: '/student-support', label: 'Student Support', role: 'Guidance Counselor' }
 *     ]
 *   }
 * ];
 * ```
 */

/**
 * Example 8: Create Notification for New Student Support Cases
 *
 * Usage to alert counselors of new flagged students:
 * ```typescript
 * import { getFlaggedStudents } from '@/app/student-support';
 *
 * async function notifyNewCases() {
 *   const response = await getFlaggedStudents();
 *   if (response.success && response.data) {
 *     const newCases = response.data.filter(s => s.counselingStatus === 'Not Started');
 *
 *     if (newCases.length > 0) {
 *       // Send notification to all counselors
 *       await notifyStaff({
 *         title: `${newCases.length} New Cases Requiring Intervention`,
 *         message: `${newCases.map(c => c.name).join(', ')} need support`,
 *         link: '/student-support',
 *       });
 *     }
 *   }
 * }
 * ```
 */

/**
 * Example 9: Generate Support Report
 *
 * Usage to create monthly counseling report:
 * ```typescript
 * import { getDashboardStats } from '@/app/student-support';
 *
 * async function generateMonthlyReport() {
 *   const stats = await getDashboardStats();
 *
 *   if (stats.success) {
 *     return {
 *       month: new Date().toLocaleDateString('en-PH', { month: 'long', year: 'numeric' }),
 *       totalActiveCases: stats.data.activeCases,
 *       highRiskStudents: stats.data.highRisk,
 *       casesResolved: stats.data.resolvedCases,
 *       dateGenerated: new Date().toISOString(),
 *     };
 *   }
 * }
 * ```
 */

/**
 * Example 10: Integration with Email Notifications
 *
 * Usage to email guardians about case status:
 * ```typescript
 * import { getStudentCaseDetails } from '@/app/student-support';
 * import { sendEmail } from '@/lib/email';
 *
 * async function notifyGuardianOfStatus(studentId: string) {
 *   const response = await getStudentCaseDetails(studentId);
 *
 *   if (response.success) {
 *     const caseDetails = response.data;
 *     const lastSession = caseDetails.counselingHistory[0];
 *
 *     await sendEmail({
 *       to: caseDetails.guardianContact,
 *       subject: `Update on ${caseDetails.studentName}'s Support Progress`,
 *       body: `
 *         Dear Guardian,
 *
 *         We wanted to update you on ${caseDetails.studentName}'s progress.
 *
 *         Current Status: ${caseDetails.riskLevel} Risk
 *         Last Session: ${new Date(lastSession.date).toLocaleDateString()}
 *         Next Follow-up: ${new Date(lastSession.followUpDate).toLocaleDateString()}
 *
 *         Please reach out if you have any questions.
 *
 *         Regards,
 *         ${lastSession.counselor}
 *       `,
 *     });
 *   }
 * }
 * ```
 */

// ==========================================
// PERMISSION CHECKING UTILITIES
// ==========================================

/**
 * Check if user can access student support features
 */
export async function canAccessStudentSupport(userId: string): Promise<boolean> {
  try {
    await verifyStudentSupportAccess();
    return true;
  } catch {
    return false;
  }
}

/**
 * Get permission level for user
 */
export async function getUserSupportPermissionLevel(
  userId: string
): Promise<'none' | 'counselor' | 'admin'> {
  try {
    await verifyStudentSupportAccess();
    // Could be extended to check specific roles
    return 'counselor';
  } catch {
    return 'none';
  }
}

// ==========================================
// COMMON QUERIES & WORKFLOWS
// ==========================================

/**
 * Get all active cases needing follow-up
 */
export async function getActiveFollowUpCases() {
  const students = await getFlaggedStudents();
  if (!students.success) return [];

  return (students.data || []).filter(
    (s) => s.counselingStatus === 'Active' || s.counselingStatus === 'Pending'
  );
}

/**
 * Get high-risk students needing immediate attention
 */
export async function getHighRiskStudentsNeedingAttention() {
  const students = await getFlaggedStudents();
  if (!students.success) return [];

  return (students.data || []).filter(
    (s) => s.riskLevel === 'High' && s.counselingStatus !== 'Resolved'
  );
}

// ==========================================
// NAVIGATION CONFIGURATION
// ==========================================

export const NAV_STUDENT_SUPPORT = {
  href: '/student-support',
  label: 'Student Support',
  icon: 'Heart', // Lucide React icon name
  requiredRoles: ['Guidance Counselor', 'System Admin'],
  description: 'Manage student interventions and counseling sessions',
};

// ==========================================
// BREADCRUMB HELPERS
// ==========================================

export interface Breadcrumb {
  label: string;
  href?: string;
}

export function getStudentSupportBreadcrumbs(page: 'dashboard' | 'case-details'): Breadcrumb[] {
  const base: Breadcrumb[] = [
    { label: 'Dashboard', href: '/' },
    { label: 'Student Support', href: '/student-support' },
  ];

  if (page === 'case-details') {
    base.push({ label: 'Case Details' });
  }

  return base;
}

// ==========================================
// MOCK DATA HELPERS
// ==========================================

/**
 * Generate demo data for testing
 */
export function getDemoData() {
  return {
    stats: {
      activeCases: 8,
      highRisk: 3,
      pendingFollowUps: 5,
      resolvedCases: 12,
    },
  };
}

// ==========================================
// Documentation & Help
// ==========================================

/**
 * MODULE DOCUMENTATION
 *
 * Full documentation available in README.md
 * Setup instructions in SETUP.md
 * Type definitions in types.ts
 *
 * Main Features:
 * 1. Dashboard with statistics
 * 2. Flagged students table with search/filter
 * 3. Student case details view
 * 4. Counseling session management
 * 5. Risk level assessment
 * 6. Attendance tracking
 * 7. Incident history integration
 *
 * Database:
 * - Requires: support_interventions table
 * - Requires: students, attendance_records, incident_reports tables
 * - Uses: Supabase Row-Level Security for permissions
 *
 * Authentication:
 * - Requires: Supabase SSR authentication
 * - Requires: User role = 'Guidance Counselor' or admin access
 *
 * Tech Stack:
 * - Next.js 16.2 with App Router
 * - React 19.2 for components
 * - TypeScript for type safety
 * - Tailwind CSS for styling
 * - Lucide React for icons
 */
