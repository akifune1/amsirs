# AMSIRS Playwright E2E Testing — Full Implementation Plan

> This file documents the complete testing plan so any agent or developer can continue
> implementation if work is interrupted. It includes every file, every test case, and
> the full code patterns to follow.

---

## STATUS TRACKER

- [x] Analysis complete
- [x] Implementation plan written
- [x] `playwright.config.ts` — Updated
- [x] `tests/helpers/auth.ts` — Created
- [x] `tests/helpers/selectors.ts` — Created
- [x] `tests/global-setup.ts` — Created
- [x] `tests/01-login.spec.ts` — Created
- [x] `tests/02-register.spec.ts` — Created
- [x] `tests/03-sidebar-navigation.spec.ts` — Created
- [x] `tests/04-admin-dashboard-staff.spec.ts` — Created
- [x] `tests/05-admin-dashboard-students.spec.ts` — Created
- [x] `tests/06-incident-reporting.spec.ts` — Created
- [x] `tests/07-incident-dashboard.spec.ts` — Created
- [x] `tests/08-student-portal.spec.ts` — Created
- [x] `tests/09-student-support.spec.ts` — Created
- [x] `tests/10-access-logs.spec.ts` — Created
- [x] `tests/11-campus-status.spec.ts` — Created
- [x] `tests/12-gate-pages.spec.ts` — Created
- [x] `tests/13-authorization.spec.ts` — Created
- [x] `tests/example.spec.ts` — Deleted
- [x] `.gitignore` — Updated to include `.auth/`
- [x] All tests passing

---

## TEST ACCOUNTS

```
Super Admin:  super.admin@cnhs.com   / MabuhayCNHS1902   → /admin-dashboard
IT Admin:     it.admin@cnhs.com      / MabuhayCNHS1902   → /admin-dashboard
School Admin: school.admin@cnhs.com  / MabuhayCNHS1902   → /incident-dashboard
Student:      zack64415@gmail.com    / Zackcloud123      → /student-portal
Guard/Support: guard@amsirs.edu      / test123           → /student-support (guidance role)
```

Guard-related pages (/access-gate, /exit-gate) tested via Super Admin (which has guard access).

---

## FILE 1: playwright.config.ts

Update the existing config:
- Set `baseURL: 'http://localhost:3000'`
- Set `globalSetup: './tests/global-setup.ts'`
- Set `timeout: 60000` and `use.actionTimeout: 15000`
- Enable `webServer` block with `command: 'npm run dev'`, `url: 'http://localhost:3000'`, `reuseExistingServer: !process.env.CI`
- Keep only `chromium` project with `storageState` undefined (login tests run without auth)
- Add 5 additional projects with `storageState` pointing to `.auth/<role>.json`:
  - `super-admin` → `.auth/super-admin.json`
  - `it-admin` → `.auth/it-admin.json`
  - `school-admin` → `.auth/school-admin.json`
  - `student` → `.auth/student.json`
  - `student-support` → `.auth/student-support.json`
- Add `screenshot: 'only-on-failure'`
- Add `trace: 'on-first-retry'`
- Retries: 1 on CI, 0 locally

---

## FILE 2: tests/helpers/auth.ts

```typescript
export const TEST_ACCOUNTS = {
  superAdmin: {
    email: 'super.admin@cnhs.com',
    password: 'MabuhayCNHS1902',
    redirectTo: '/admin-dashboard',
    storageState: '.auth/super-admin.json',
  },
  itAdmin: {
    email: 'it.admin@cnhs.com',
    password: 'MabuhayCNHS1902',
    redirectTo: '/admin-dashboard',
    storageState: '.auth/it-admin.json',
  },
  schoolAdmin: {
    email: 'school.admin@cnhs.com',
    password: 'MabuhayCNHS1902',
    redirectTo: '/incident-dashboard',
    storageState: '.auth/school-admin.json',
  },
  student: {
    email: 'zack64415@gmail.com',
    password: 'Zackcloud123',
    redirectTo: '/student-portal',
    storageState: '.auth/student.json',
  },
  studentSupport: {
    email: 'guard@amsirs.edu',
    password: 'test123',
    redirectTo: '/student-support',
    storageState: '.auth/student-support.json',
  },
} as const;

export type RoleName = keyof typeof TEST_ACCOUNTS;

// Login through the UI form at /
export async function loginAs(page, email: string, password: string) {
  await page.goto('/');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /login/i }).click();
  // Wait for navigation away from login page
  await page.waitForURL(url => !url.pathname.endsWith('/') && url.pathname !== '/login', { timeout: 15000 });
}
```

---

## FILE 3: tests/helpers/selectors.ts

```typescript
// Reusable selectors
export const SELECTORS = {
  sidebar: {
    container: 'aside',
    navLinks: 'aside nav a',
    logo: 'aside >> text=AMSIRS',
    signOut: 'aside button:has-text("Sign Out")',
    userEmail: 'aside .bg-zinc-50 p',
  },
  login: {
    emailInput: 'input[name="email"]',
    passwordInput: 'input[name="password"]',
    submitButton: 'button[type="submit"]',
    errorMessage: '.alert-error',
    registerLink: 'a:has-text("No Account Yet")',
  },
  tables: {
    wrapper: '.sys-table-wrapper',
    table: '.sys-table',
    headerRow: '.table-header-row',
    emptyState: 'td[colspan]',
  },
  filters: {
    searchBar: 'input[placeholder*="Search"]',
  },
};
```

---

## FILE 4: tests/global-setup.ts

```typescript
import { chromium, FullConfig } from '@playwright/test';
import { TEST_ACCOUNTS } from './helpers/auth';
import * as fs from 'fs';
import * as path from 'path';

async function globalSetup(config: FullConfig) {
  const authDir = path.join(process.cwd(), '.auth');
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  const baseURL = config.projects[0].use.baseURL || 'http://localhost:3000';
  const browser = await chromium.launch();

  for (const [roleName, account] of Object.entries(TEST_ACCOUNTS)) {
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      await page.goto(baseURL);
      await page.waitForLoadState('networkidle');

      // Fill login form
      await page.locator('input[name="email"]').fill(account.email);
      await page.locator('input[name="password"]').fill(account.password);
      await page.locator('button[type="submit"]').click();

      // Wait for redirect (successful login navigates away from /)
      await page.waitForURL(
        url => url.pathname !== '/' && url.pathname !== '/login',
        { timeout: 30000 }
      );

      // Save storage state
      const statePath = path.join(process.cwd(), account.storageState);
      await context.storageState({ path: statePath });
      console.log(`✅ Auth state saved for ${roleName} → ${statePath}`);
    } catch (error) {
      console.error(`❌ Failed to authenticate ${roleName} (${account.email}):`, error);
    }

    await context.close();
  }

  await browser.close();
}

export default globalSetup;
```

---

## FILE 5-17: TEST SPECS

Each spec file follows this general pattern:

```typescript
import { test, expect } from '@playwright/test';

// For authenticated tests, use test.use({ storageState: '.auth/<role>.json' });

test.describe('Feature Name', () => {
  test('test description', async ({ page }) => {
    await page.goto('/route');
    // assertions...
  });
});
```

### 01-login.spec.ts (NO storageState — unauthenticated)
Tests the login page at `/`:
1. Page renders with "AMSIRS" title, "Cavite National High School" subtitle
2. Email + password inputs present with correct types
3. Login button present with "Login" text
4. Error on invalid credentials → "Invalid credentials" message
5. Loading state shows "Verifying Identity..."
6. Super Admin login → redirect to /admin-dashboard
7. IT Admin login → redirect to /admin-dashboard
8. School Admin login → redirect to /incident-dashboard
9. Student login → redirect to /student-portal
10. Student Support login → redirect to /student-support
11. Register link → navigates to /register
12. Footer text "Authorized Personnel Only"
13. /login redirects to /

### 02-register.spec.ts (NO storageState)
Tests the registration page at `/register`:
1. "STUDENT ENROLLMENT" heading
2. Account Credentials section with email + password inputs
3. LRN, firstName, lastName inputs
4. Gender select with Male/Female/Other
5. Birthday date input
6. Address textarea
7. Grade Level select with Grade 11/12
8. Section input
9. Camera capture component (ID Photo section)
10. Data Privacy checkbox
11. Submit button says "Submit Registration"
12. Required fields have `required` attribute

### 03-sidebar-navigation.spec.ts (multiple storageStates)
Uses multiple describe blocks with different auth:
1-3. Sidebar hidden on /, /register, /pending-approval
4. Super Admin sees: Dashboard, Access Gate, Exit Gate, Access Logs, Incidents, Student Support, Campus Status (7 links)
5. IT Admin sees: Dashboard, Access Logs, Campus Status (3 links)
6. School Admin sees: Access Logs, Incidents, Student Support, Campus Status (4 links)
7. Student sees: My Profile, Report Incident (2 links)
8. Active link highlighted with active class
9. AMSIRS branding visible
10. User email displayed
11. Sign Out button present
12. Sign Out works → redirect to login

### 04-admin-dashboard-staff.spec.ts (Super Admin storageState)
Tests /admin-dashboard?tab=staff:
1. "Root Control" heading, "Administrative Tier Isolation Active" subtitle
2. Staff tab active by default ("Institutional Staff" selected)
3. Table columns: ID, Last Name, First Name, Date Added, Role, Status, Actions
4. Table has at least 1 staff row
5. Role shows readable names (Guard, Guidance, etc.)
6. Status badges (Active green, Suspended red)
7. Role filter dropdown works
8. Status filter dropdown works
9. Search filters by name
10. Create Staff button opens modal
11. Create Staff modal has fields: email, password, firstName, lastName, role
12. Edit Staff button opens modal with pre-filled data
13. Reset PW button visible
14. Pagination renders
15. School Admin cannot access → redirect to /unauthorized

### 05-admin-dashboard-students.spec.ts (Super Admin storageState)
Tests /admin-dashboard?tab=students:
1. Click "Student Body" tab → student table appears
2. Table columns: ✓, Student ID, Last Name, First Name, Date Reg., Grade Level, Section, Status, Actions
3. At least 1 student row
4. Approval badges (Approved/Pending)
5. Grade filter works
6. Status filter works
7. Search by name
8. Edit Student modal opens
9. Bulk approve checkboxes on pending students
10. Bulk Approve button visible
11. Reset PW button present
12. Pagination renders

### 06-incident-reporting.spec.ts (Super Admin storageState — has guard access)
Tests /incident-reporting:
1. "INCIDENT REPORTING" heading
2. "Secure Form v2.0" header, "System Online" badge
3. Student name fields (lastName, firstName)
4. Add Another Student button works
5. Remove student button works (when >1 student)
6. Location field present
7. Add Another Location works
8. Severity dropdown: Low, Medium, High
9. Description textarea with "AES-256 Encrypted" badge
10. File input for photographic evidence
11. Data Privacy checkbox
12. Submit button text "Submit Secured Report"
13. Submit with valid data → success toast message
14. Submit loading state "Processing Security Protocol..."

### 07-incident-dashboard.spec.ts (Super Admin storageState)
Tests /incident-dashboard:
1. "Recent Incident Reports" heading
2. AES-256 encryption notice
3. Three stat cards (Total Reports, High Severity, Status=Secure)
4. Table columns: Date & Time, Student Involved, Location, Severity, Actions
5. At least 1 report row
6. Timeframe filter (Last 7 Days, Last 30 Days)
7. Severity filter (High, Medium, Low)
8. Search by location
9. Incident row expand on click (IncidentRow component)
10. Decrypt button works → shows plaintext
11. Student linking search → results appear
12. Pagination renders
13. Footer "AMSIRS Security Intelligence Interface"

### 08-student-portal.spec.ts (Student storageState)
Tests /student-portal:
1. "STUDENT PORTAL" heading
2. "Personal Information & Involvement Records" subtitle
3. "Identity Matrix" card label
4. Student ID number displayed
5. LRN shown (or "Not provided")
6. First Name + Last Name fields populated
7. Gender + Date of Birth section
8. Complete Address section
9. Grade Level + Section shown
10. Profile photo area renders (img or "No Scan" placeholder)
11. "Involvement Logs" card with "Encrypted" badge
12. Mobile "File a New Report" link (viewport test)

### 09-student-support.spec.ts (Student Support storageState)
Tests /student-support:
1. Loading spinner shows briefly
2. "Student Support Dashboard" heading after load
3. "Monitor and manage student interventions..." subtitle
4. Stats cards: Active Cases, High Risk, Pending Follow-Ups, Resolved Cases
5. "Flagged Students" section heading
6. Student table renders (may be empty if no flagged students)
7. View Case button → case details view
8. Start Intervention button → counseling modal opens
9. Case details shows student name + risk level
10. Case details shows attendance stats
11. Case details shows incident history
12. Case details shows counseling history
13. Back to Dashboard button works
14. Counseling modal fields: intervention type, notes, follow-up date, case status
15. Counseling modal close button works

### 10-access-logs.spec.ts (Super Admin storageState)
Tests /access-logs:
1. "Access Logs" heading
2. "Real-time campus biometric access records" subtitle
3. Table columns: Snapshot, Student, Student ID, Action, Match, Timestamp
4. Loading spinner on initial load
5. Date filter (Today, Yesterday, Last 7 Days)
6. Action filter (Entry, Exit)
7. Previous/Next pagination buttons
8. "Showing X logs (Total: Y)" count text
9. ENTRY badge = green, EXIT badge = red (if data exists)
10. Empty state shows "No access logs found" when filters match nothing

### 11-campus-status.spec.ts (Super Admin storageState)
Tests /campus-status:
1. "Campus Status Monitor" heading
2. "Real-time monitoring..." subtitle
3. Three stat cards (Current Population, System Status, AMSIRS Security)
4. Population count = a number
5. System status = "ACTIVE" in green
6. Loading state "Loading campus status..."
7. Search input filters students
8. Table columns: Student Identity, Entry Time, Match Accuracy, Access Gate Proof
9. "INSIDE" badge on present students
10. Pagination on >12 students
11. "No Students Inside Campus" when empty

### 12-gate-pages.spec.ts (Super Admin storageState — UI only, no camera)
Tests /access-gate and /exit-gate:
1. Access Gate: "Facial Recognition Entry Scanner" heading
2. Access Gate: subtitle about real-time biometric entry
3. "Live Security Feed" header
4. "Entry Gate Camera" label
5. LIVE badge (green indicator)
6. "Awaiting Scan" placeholder in identity panel
7. AI Monitoring section showing "ACTIVE"
8. AMSIRS Security card "Facial Recognition Active"
9. Data Privacy Act notice at bottom
10. Exit Gate: "Facial Recognition Exit Scanner" heading
11. Exit Gate: subtitle about real-time biometric exit
12. "EXIT ACTIVE" badge
13. Exit Gate "Awaiting Scan" placeholder

### 13-authorization.spec.ts (multiple storageStates)
Tests role-based access:
1. Unauthenticated user → /admin-dashboard → redirect (no storageState)
2. Student → /admin-dashboard → unauthorized/redirect
3. Student → /incident-dashboard → redirect
4. School Admin → /admin-dashboard → /unauthorized
5. Student → /access-gate → unauthorized
6. Student → /access-logs → unauthorized
7. Unauthorized page has "Access Denied" heading
8. Unauthorized page has warning icon + message
9. "Return to Portal" link on unauthorized page
10. Pending Approval page renders with "Account Pending"

---

## IMPORTANT PATTERNS

### How login form works
The login form is at `/` (root page), NOT at `/login`. `/login` just redirects to `/`.
The form uses `useActionState(login, null)` with server action.
Input names: `email`, `password`. Button type: `submit`.
Error state: `state?.error` renders in `.alert-error`.
Loading state: `isPending` shows "Verifying Identity...".

### How to fill form inputs
```typescript
// The inputs use name attributes, not labels
await page.locator('input[name="email"]').fill('...');
await page.locator('input[name="password"]').fill('...');
await page.locator('button[type="submit"]').click();
```

### How server-side redirect works
Login action checks user role and calls `redirect()`:
- system_admins with role='school_admin' → /incident-dashboard
- system_admins with other roles → /admin-dashboard
- user_profiles with role='guidance' → /student-support
- user_profiles with role='guard' → /incident-dashboard (defaults)
- students with is_approved=false → /pending-approval
- students with is_approved=true → /student-portal
- else → /unauthorized

### Sidebar visibility rules
Sidebar is hidden when pathname is: `/`, `/login`, `/register`, `/pending-approval`

### Role→Links mapping (from Sidebar.tsx)
```
super_admin: Dashboard, Access Gate, Exit Gate, Access Logs, Incidents, Student Support, Campus Status
it_admin: Dashboard, Access Logs, Campus Status
school_admin: Access Logs, Incidents, Student Support, Campus Status
guard: Access Gate, Exit Gate, Access Logs, Incidents, Campus Status
guidance: Student Support, Campus Status
student: My Profile, Report Incident
```

### Admin Dashboard access control
Only `it_admin` and `super_admin` can access. `school_admin` is redirected to `/unauthorized`.

---

## EXECUTION ORDER

1. Update `playwright.config.ts`
2. Create `tests/helpers/auth.ts`
3. Create `tests/helpers/selectors.ts`
4. Create `tests/global-setup.ts`
5. Create test specs 01 through 13 (in order)
6. Delete `tests/example.spec.ts`
7. Update `.gitignore` to add `.auth/`
8. Run tests, fix any issues
