import {
  UserX, SearchX, AlertTriangle, FileWarning, 
  FileText, Activity, UserPlus, Fingerprint,
  Flag, ShieldAlert, CheckCircle, Calendar, 
  Clock, Stethoscope, HeartHandshake, UserCheck, 
  Key, Clock4, Bell, LogIn, LogOut
} from "lucide-react";

export type NotificationSeverity = "info" | "warning" | "critical";
export type NotificationCategory = "Attendance & gates" | "Incident management" | "Early warning system" | "Student support" | "Account management" | "System";

export interface NotificationItem {
  id: string;
  category: NotificationCategory;
  severity: NotificationSeverity;
  title: string;
  message: string;
  timestamp: string; // ISO string
  isRead: boolean;
  icon: any; // Lucide icon
  link?: string;
  roles: string[]; // Role keys that can see this notification
}

const getPastDate = (hoursAgo: number) => {
  const d = new Date();
  d.setHours(d.getHours() - hoursAgo);
  return d.toISOString();
};

export const mockNotifications: NotificationItem[] = [
  // Attendance & gates
  {
    id: "notif-1",
    category: "Attendance & gates",
    severity: "warning",
    title: "Flagged student scans entry",
    message: "A student with an active EWS flag or open counseling case enters campus through the access gate.",
    timestamp: getPastDate(1),
    isRead: false,
    icon: UserX,
    link: "/access-logs",
    roles: ["guard", "school_admin", "super_admin", "it_admin"]
  },
  {
    id: "notif-2",
    category: "Attendance & gates",
    severity: "warning",
    title: "Unknown face detected",
    message: "The scanner fails to match any enrolled student after multiple attempts — possible unregistered or unauthorized individual.",
    timestamp: getPastDate(2),
    isRead: false,
    icon: SearchX,
    link: "/access-logs",
    roles: ["guard", "school_admin", "super_admin", "it_admin"]
  },
  {
    id: "notif-3",
    category: "Attendance & gates",
    severity: "critical",
    title: "Exit scanned with no entry record",
    message: "Student registers an EXIT but has no ENTRY log for the same day — data integrity anomaly.",
    timestamp: getPastDate(5),
    isRead: false,
    icon: AlertTriangle,
    link: "/access-logs",
    roles: ["guard", "school_admin", "super_admin", "it_admin"]
  },
  {
    id: "notif-21",
    category: "Attendance & gates",
    severity: "info",
    title: "Entry recorded",
    message: "Welcome to campus! Your entry has been logged successfully.",
    timestamp: getPastDate(4),
    isRead: true,
    icon: LogIn,
    link: "/student-portal",
    roles: ["student"]
  },
  {
    id: "notif-22",
    category: "Attendance & gates",
    severity: "info",
    title: "Exit recorded",
    message: "Have a safe trip home! Your exit has been logged.",
    timestamp: getPastDate(1),
    isRead: false,
    icon: LogOut,
    link: "/student-portal",
    roles: ["student"]
  },

  // Incident management
  {
    id: "notif-4",
    category: "Incident management",
    severity: "critical",
    title: "High severity incident filed",
    message: "Any incident report submitted with severity = High.",
    timestamp: getPastDate(12),
    isRead: false,
    icon: FileWarning,
    link: "/incident-dashboard",
    roles: ["guidance", "school_admin", "super_admin", "it_admin"]
  },
  {
    id: "notif-5",
    category: "Incident management",
    severity: "info",
    title: "New incident report submitted",
    message: "Any new incident report is filed by a guard or staff member, regardless of severity.",
    timestamp: getPastDate(14),
    isRead: false,
    icon: FileText,
    link: "/incident-dashboard",
    roles: ["school_admin", "super_admin", "it_admin"]
  },
  {
    id: "notif-6",
    category: "Incident management",
    severity: "info",
    title: "Incident status updated",
    message: "An incident they filed has its status changed — e.g. Open → Investigating or Investigating → Closed.",
    timestamp: getPastDate(20),
    isRead: true,
    icon: Activity,
    link: "/incident-dashboard",
    roles: ["guard", "school_admin", "super_admin", "it_admin"]
  },
  {
    id: "notif-7",
    category: "Incident management",
    severity: "warning",
    title: "Student linked to an incident",
    message: "A student is added as an involved party to a report.",
    timestamp: getPastDate(24),
    isRead: true,
    icon: UserPlus,
    link: "/incident-dashboard",
    roles: ["guidance", "student"]
  },
  {
    id: "notif-8",
    category: "Incident management",
    severity: "info",
    title: "AI face match found in evidence",
    message: "The AI matching engine finds a high-confidence face match between an incident evidence photo and an enrolled student.",
    timestamp: getPastDate(30),
    isRead: true,
    icon: Fingerprint,
    link: "/incident-dashboard",
    roles: ["guard", "school_admin", "super_admin", "it_admin"]
  },
  {
    id: "notif-23",
    category: "Incident management",
    severity: "info",
    title: "Incident report received",
    message: "Your incident report has been submitted and is currently under review.",
    timestamp: getPastDate(10),
    isRead: true,
    icon: FileText,
    link: "/incident-reporting",
    roles: ["student"]
  },

  // Early warning system
  {
    id: "notif-9",
    category: "Early warning system",
    severity: "critical",
    title: "Student EWS flag triggered",
    message: "A student crosses the threshold: 1 High, 2 Medium, or 3 Low severity incidents.",
    timestamp: getPastDate(36),
    isRead: true,
    icon: Flag,
    link: "/student-support",
    roles: ["guidance", "school_admin", "super_admin", "it_admin"]
  },
  {
    id: "notif-10",
    category: "Early warning system",
    severity: "critical",
    title: "Student re-flagged after resolution",
    message: "A student whose EWS case was previously Resolved has been flagged again.",
    timestamp: getPastDate(48),
    isRead: true,
    icon: ShieldAlert,
    link: "/student-support",
    roles: ["guidance", "school_admin", "super_admin", "it_admin"]
  },
  {
    id: "notif-11",
    category: "Early warning system",
    severity: "info",
    title: "EWS flag resolved",
    message: "A counselor marks a student's EWS flag as Resolved.",
    timestamp: getPastDate(50),
    isRead: true,
    icon: CheckCircle,
    link: "/student-support",
    roles: ["school_admin", "super_admin", "it_admin"]
  },
  {
    id: "notif-24",
    category: "Early warning system",
    severity: "warning",
    title: "EWS Status Update",
    message: "Please visit the guidance counselor's office regarding a recent flag on your account.",
    timestamp: getPastDate(35),
    isRead: true,
    icon: Flag,
    link: "/student-portal",
    roles: ["student"]
  },

  // Student support
  {
    id: "notif-12",
    category: "Student support",
    severity: "warning",
    title: "Follow-up due tomorrow",
    message: "A scheduled counseling follow-up is 1 day away.",
    timestamp: getPastDate(72),
    isRead: true,
    icon: Calendar,
    link: "/student-support",
    roles: ["guidance"]
  },
  {
    id: "notif-13",
    category: "Student support",
    severity: "critical",
    title: "Follow-up overdue",
    message: "A follow-up date has passed and the case is still Active.",
    timestamp: getPastDate(80),
    isRead: true,
    icon: Clock,
    link: "/student-support",
    roles: ["guidance", "school_admin", "super_admin", "it_admin"]
  },
  {
    id: "notif-14",
    category: "Student support",
    severity: "critical",
    title: "Case status escalated",
    message: "A counseling case's status is changed to Escalated, requiring admin-level review.",
    timestamp: getPastDate(96),
    isRead: true,
    icon: Stethoscope,
    link: "/student-support",
    roles: ["school_admin", "super_admin", "it_admin"]
  },
  {
    id: "notif-15",
    category: "Student support",
    severity: "warning",
    title: "New incident while case is active",
    message: "A student is linked to a new incident report while they already have an open counseling case.",
    timestamp: getPastDate(120),
    isRead: true,
    icon: AlertTriangle,
    link: "/student-support",
    roles: ["guidance"]
  },
  {
    id: "notif-16",
    category: "Student support",
    severity: "info",
    title: "Case resolved",
    message: "A counselor marks a student's case as Resolved.",
    timestamp: getPastDate(140),
    isRead: true,
    icon: HeartHandshake,
    link: "/student-support",
    roles: ["school_admin", "super_admin", "it_admin"]
  },

  // Account management
  {
    id: "notif-17",
    category: "Account management",
    severity: "info",
    title: "New student pending approval",
    message: "A student has completed registration with face enrollment and is waiting for admin approval.",
    timestamp: getPastDate(160),
    isRead: true,
    icon: UserPlus,
    link: "/admin-dashboard",
    roles: ["school_admin", "super_admin", "it_admin"]
  },
  {
    id: "notif-18",
    category: "Account management",
    severity: "warning",
    title: "Student approval pending 3+ days",
    message: "A reminder: a registered student has been waiting for approval for more than 3 days.",
    timestamp: getPastDate(200),
    isRead: true,
    icon: Clock4,
    link: "/admin-dashboard",
    roles: ["school_admin", "super_admin", "it_admin"]
  },
  {
    id: "notif-19",
    category: "Account management",
    severity: "info",
    title: "Account approved",
    message: "The student is notified that their account has been approved.",
    timestamp: getPastDate(240),
    isRead: true,
    icon: UserCheck,
    link: "/",
    roles: ["student"]
  },
  {
    id: "notif-20",
    category: "Account management",
    severity: "warning",
    title: "Password reset performed on your account",
    message: "A security notification sent to any staff or guard whose password was reset by an admin.",
    timestamp: getPastDate(300),
    isRead: true,
    icon: Key,
    link: "/",
    roles: ["guard", "guidance"]
  }
];
