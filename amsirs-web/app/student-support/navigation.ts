/**
 * Student Support Navigation Configuration
 * 
 * Use this file to add the Student Support System to your application's
 * navigation menus, breadcrumbs, and routing configuration.
 */

export interface NavItem {
  href: string;
  label: string;
  description?: string;
  icon?: string; // Lucide React icon name
  requiredRoles?: string[];
  badge?: string;
  children?: NavItem[];
}

// ==========================================
// Main Navigation Item
// ==========================================

export const STUDENT_SUPPORT_NAV: NavItem = {
  href: '/student-support',
  label: 'Student Support',
  description: 'Manage student interventions and counseling sessions',
  icon: 'Heart', // Lucide React icon
  requiredRoles: ['Guidance Counselor', 'System Admin'],
  badge: 'NEW',
  children: [
    {
      href: '/student-support#dashboard',
      label: 'Dashboard',
      icon: 'LayoutDashboard',
    },
    {
      href: '/student-support?view=table',
      label: 'Flagged Students',
      icon: 'Users',
    },
  ],
};

// ==========================================
// Full Navigation Structure
// ==========================================

export const FULL_NAVIGATION: NavItem[] = [
  {
    href: '/',
    label: 'Home',
    icon: 'Home',
  },
  {
    href: '/admin-dashboard',
    label: 'Admin Dashboard',
    icon: 'LayoutGrid',
    requiredRoles: ['System Admin'],
  },
  {
    href: '/incident-dashboard',
    label: 'Incident Reports',
    icon: 'AlertTriangle',
    requiredRoles: ['System Admin', 'Security Personnel'],
  },
  STUDENT_SUPPORT_NAV, // ADD STUDENT SUPPORT MODULE
  {
    href: '/student-portal',
    label: 'Student Portal',
    icon: 'BookOpen',
    requiredRoles: ['Student'],
  },
];

// ==========================================
// Breadcrumb Navigation
// ==========================================

export interface Breadcrumb {
  label: string;
  href?: string;
  active?: boolean;
}

export function getBreadcrumbs(pathname: string): Breadcrumb[] {
  if (pathname === '/student-support') {
    return [
      { label: 'Dashboard', href: '/' },
      { label: 'Student Support', active: true },
    ];
  }

  if (pathname.includes('/student-support')) {
    return [
      { label: 'Dashboard', href: '/' },
      { label: 'Student Support', href: '/student-support' },
      { label: 'Case Details', active: true },
    ];
  }

  return [{ label: 'Dashboard', href: '/', active: true }];
}

// ==========================================
// Role-Based Access
// ==========================================

export interface RolePermission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export const ROLE_PERMISSIONS: Record<string, RolePermission> = {
  'Guidance Counselor': {
    view: true,
    create: true,
    edit: true, // Own sessions only
    delete: false,
  },
  'System Admin': {
    view: true,
    create: true,
    edit: true,
    delete: true,
  },
  Student: {
    view: false,
    create: false,
    edit: false,
    delete: false,
  },
  Default: {
    view: false,
    create: false,
    edit: false,
    delete: false,
  },
};

// ==========================================
// Sidebar Navigation
// ==========================================

export const SIDEBAR_SECTIONS = {
  main: [
    { href: '/', label: 'Dashboard', icon: 'Home' },
  ],
  management: [
    {
      href: '/incident-dashboard',
      label: 'Incident Reports',
      icon: 'AlertTriangle',
      roles: ['System Admin'],
    },
    {
      href: '/student-support',
      label: 'Student Support',
      icon: 'Heart',
      roles: ['Guidance Counselor', 'System Admin'],
      badge: 'NEW',
    },
  ],
  admin: [
    {
      href: '/admin-dashboard',
      label: 'Administration',
      icon: 'Settings',
      roles: ['System Admin'],
    },
  ],
};

// ==========================================
// Quick Action Links (for dashboard/home)
// ==========================================

export const QUICK_ACTIONS = [
  {
    label: 'Go to Student Support',
    href: '/student-support',
    description: 'Manage student interventions',
    icon: 'Heart',
    roles: ['Guidance Counselor', 'System Admin'],
    color: 'maroon',
  },
  {
    label: 'View Flagged Students',
    href: '/student-support?view=table',
    description: 'Students requiring attention',
    icon: 'AlertTriangle',
    roles: ['Guidance Counselor', 'System Admin'],
    color: 'red',
  },
];

// ==========================================
// Meta Information
// ==========================================

export const MODULE_META = {
  name: 'Student Support System',
  version: '1.0.0',
  status: 'active',
  icon: 'Heart',
  color: 'maroon',
  description: 'Guidance counseling and intervention management',
  shortDescription: 'Student support & case management',
  documentationUrl: '/documentation/student-support',
  supportUrl: '/help/student-support',
  releaseDate: '2024-05-01',
  lastUpdate: '2024-05-22',
};

// ==========================================
// Route Protection Helper
// ==========================================

export function isStudentSupportRoute(pathname: string): boolean {
  return pathname.startsWith('/student-support');
}

export function canAccessStudentSupport(userRole: string): boolean {
  const allowedRoles = ['Guidance Counselor', 'System Admin'];
  return allowedRoles.includes(userRole);
}

// ==========================================
// Navigation Filtering Helper
// ==========================================

export function filterNavigationByRole(
  navigation: NavItem[],
  userRole: string
): NavItem[] {
  return navigation.filter(item => {
    if (!item.requiredRoles) return true;
    return item.requiredRoles.includes(userRole);
  });
}

// ==========================================
// Navigation Components (for use in React)
// ==========================================

/**
 * Usage in React component:
 * ```tsx
 * import { FULL_NAVIGATION, filterNavigationByRole } from '@/app/student-support/navigation';
 *
 * export function Navigation({ userRole }: { userRole: string }) {
 *   const allowedItems = filterNavigationByRole(FULL_NAVIGATION, userRole);
 *
 *   return (
 *     <nav>
 *       {allowedItems.map(item => (
 *         <NavLink key={item.href} item={item} />
 *       ))}
 *     </nav>
 *   );
 * }
 * ```
 */

/**
 * Usage in breadcrumb component:
 * ```tsx
 * import { getBreadcrumbs } from '@/app/student-support/navigation';
 * import { usePathname } from 'next/navigation';
 *
 * export function Breadcrumbs() {
 *   const pathname = usePathname();
 *   const breadcrumbs = getBreadcrumbs(pathname);
 *
 *   return (
 *     <nav aria-label="breadcrumb">
 *       {breadcrumbs.map((crumb, i) => (
 *         <a key={crumb.href} href={crumb.href}>
 *           {crumb.label}
 *           {i < breadcrumbs.length - 1 && ' / '}
 *         </a>
 *       ))}
 *     </nav>
 *   );
 * }
 * ```
 */

// ==========================================
// Integration Examples
// ==========================================

/**
 * Example 1: Add to Existing Navigation
 *
 * In your layout or navigation component:
 * ```tsx
 * import { STUDENT_SUPPORT_NAV } from '@/app/student-support/navigation';
 *
 * const navigationItems = [
 *   // ... existing items
 *   STUDENT_SUPPORT_NAV,
 * ];
 * ```
 */

/**
 * Example 2: Role-Based Menu
 *
 * ```tsx
 * import { SIDEBAR_SECTIONS, canAccessStudentSupport } from '@/app/student-support/navigation';
 *
 * export function Sidebar({ userRole }: { userRole: string }) {
 *   return (
 *     <sidebar>
 *       {Object.values(SIDEBAR_SECTIONS).map(section =>
 *         section
 *           .filter(item => !item.roles || item.roles.includes(userRole))
 *           .map(item => <NavLink key={item.href} {...item} />)
 *       )}
 *     </sidebar>
 *   );
 * }
 * ```
 */

/**
 * Example 3: Quick Actions
 *
 * ```tsx
 * import { QUICK_ACTIONS, canAccessStudentSupport } from '@/app/student-support/navigation';
 *
 * export function QuickActions({ userRole }: { userRole: string }) {
 *   const actions = QUICK_ACTIONS.filter(
 *     action => !action.roles || action.roles.includes(userRole)
 *   );
 *
 *   return (
 *     <div className="quick-actions">
 *       {actions.map(action => (
 *         <a key={action.href} href={action.href} className="action-button">
 *           {action.label}
 *         </a>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */

// ==========================================
// URL Helpers
// ==========================================

export function getStudentSupportUrl(view?: string, studentId?: string): string {
  const base = '/student-support';
  const params = new URLSearchParams();

  if (view) params.append('view', view);
  if (studentId) params.append('student', studentId);

  const queryString = params.toString();
  return queryString ? `${base}?${queryString}` : base;
}

export function getStudentCaseUrl(studentId: string): string {
  return `/student-support?view=case-details&student=${studentId}`;
}

export function getFlaggedStudentsUrl(): string {
  return '/student-support?view=table';
}

// ==========================================
// Navigation Titles & Descriptions
// ==========================================

export const NAVIGATION_METADATA = {
  '/student-support': {
    title: 'Student Support System',
    description: 'Manage student interventions and counseling sessions',
    icon: 'Heart',
  },
  '/student-support?view=table': {
    title: 'Flagged Students',
    description: 'Students requiring intervention',
    icon: 'AlertTriangle',
  },
  '/student-support?view=case-details': {
    title: 'Case Details',
    description: 'Student support profile',
    icon: 'FileText',
  },
};

export function getPageMetadata(pathname: string): {
  title: string;
  description: string;
  icon?: string;
} {
  return (
    NAVIGATION_METADATA[pathname as keyof typeof NAVIGATION_METADATA] || {
      title: 'Student Support',
      description: 'Student support system',
    }
  );
}

// ==========================================
// Export all for convenient importing
// ==========================================

export default {
  STUDENT_SUPPORT_NAV,
  FULL_NAVIGATION,
  SIDEBAR_SECTIONS,
  QUICK_ACTIONS,
  MODULE_META,
  ROLE_PERMISSIONS,
  isStudentSupportRoute,
  canAccessStudentSupport,
  filterNavigationByRole,
  getStudentSupportUrl,
  getStudentCaseUrl,
  getFlaggedStudentsUrl,
  getBreadcrumbs,
  getPageMetadata,
};
