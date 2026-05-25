# Student Support System Module

A comprehensive **guidance counseling and intervention management system** for the Campus Student Welfare Management System (CSWMS). This module enables guidance counselors and administrators to monitor flagged students, manage interventions, and track counseling sessions.

## 🎯 Overview

The Student Support System acts as the intervention and counseling management layer of the CSWMS. It:

- **Aggregates student data** from Attendance Monitoring and Incident Reporting modules
- **Identifies at-risk students** based on attendance patterns and behavioral incidents
- **Manages counseling sessions** with detailed notes and follow-up scheduling
- **Tracks intervention progress** from initial contact through case resolution

## 📁 Module Structure

```
app/student-support/
├── page.tsx                          # Main dashboard (client component)
├── loading.tsx                       # Loading state UI
├── actions.ts                        # Server actions & data fetching
└── components/
    ├── RiskBadge.tsx                # Risk level indicator badge
    ├── SupportStats.tsx             # Dashboard statistics cards
    ├── StudentTable.tsx             # Flagged students data table
    ├── CounselingModal.tsx          # Session creation/editing modal
    └── StudentCaseCard.tsx          # Student profile & case details
```

## ✨ Features

### 1. **Dashboard Overview**
- **Summary Statistics Cards** showing:
  - Active Cases
  - High-Risk Students
  - Pending Follow-Ups
  - Resolved Cases
- **Real-time data** fetched from Supabase
- **Responsive grid layout** matching existing design

### 2. **Flagged Students Table**
- **Search & Filter**: By name, student ID, or grade/section
- **Risk Level Filtering**: Low, Medium, High
- **Column Data**:
  - Student Name & ID
  - Grade & Section
  - Absence Count (with attendance flag)
  - Incident Report Count
  - Risk Level Badge
  - Counseling Status
  - Quick Actions (View Case, Start Intervention)
- **Responsive Design**: Mobile-optimized with collapsible columns

### 3. **Student Case Details**
- **Student Profile Section**: ID, Grade, Guardian Contact
- **Attendance Summary**: Total absences, late records, attendance percentage
- **Incident History**: Recent incidents with severity levels
- **Counseling History**: Previous sessions with notes and counselor details
- **Quick Action**: Start new intervention directly from case view

### 4. **Counseling Session Modal**
- **Form Fields**:
  - Session Date (date picker)
  - Intervention Type (dropdown with predefined options)
  - Detailed Notes (textarea)
  - Follow-up Date (date picker)
  - Case Status (Active, Pending Review, Resolved, Escalated)
- **Action Buttons**:
  - Save Session
  - Resolve Case
  - Cancel
- **Modal Features**: Smooth animations, backdrop blur, form validation

## 🗄️ Database Integration

### Required Supabase Tables

#### `support_interventions`
```sql
CREATE TABLE support_interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  counselor_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE SET NULL,
  intervention_type VARCHAR(100) NOT NULL,
  notes TEXT,
  follow_up_date DATE,
  case_status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (counselor_id) REFERENCES user_profiles(id)
);
```

#### Related Tables (Already Exist)
- `students`: Student profiles with ID, name, grade level
- `attendance_records`: Attendance and absence data
- `incident_reports` & `incident_involvements`: Incident data
- `user_profiles`: Staff profiles including counselors

### Row-Level Security (RLS) Policies

```sql
-- Enable RLS
ALTER TABLE support_interventions ENABLE ROW LEVEL SECURITY;

-- Counselors can view their own sessions
CREATE POLICY "Counselors view own sessions"
  ON support_interventions FOR SELECT
  USING (counselor_id = auth.uid());

-- Admins can view all sessions
CREATE POLICY "Admins view all sessions"
  ON support_interventions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM system_admins WHERE id = auth.uid()
  ));

-- Counselors can create sessions
CREATE POLICY "Counselors create sessions"
  ON support_interventions FOR INSERT
  WITH CHECK (counselor_id = auth.uid());

-- Counselors can update their own sessions
CREATE POLICY "Counselors update own sessions"
  ON support_interventions FOR UPDATE
  USING (counselor_id = auth.uid());
```

## 🔐 Access Control

### Role-Based Access

| Role | Access |
|------|--------|
| **Guidance Counselor** | View flagged students, manage own cases, create sessions |
| **System Admin** | Full access to all features |
| **Other Roles** | No access (redirected to unauthorized) |

### Authorization Pattern

All server actions use `verifyStudentSupportAccess()` to:
1. Check if user is authenticated
2. Verify user is either a Guidance Counselor or System Admin
3. Return user and Supabase client for secure queries

```typescript
// Example from actions.ts
export async function verifyStudentSupportAccess() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized: No active session');

  // Check role: Guidance Counselor or Admin
  const { data: counselor } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .eq('role', 'Guidance Counselor')
    .maybeSingle();

  if (!counselor && !admin) {
    throw new Error('Unauthorized: Insufficient permissions');
  }

  return { user, supabase };
}
```

## 🎨 Design System Integration

### Consistent with Existing Modules

The Student Support module reuses the exact design patterns from Attendance Monitoring and Incident Reporting:

#### Component Classes
- `.sys-navbar`: Top navigation bar with logo and user info
- `.sys-container`: Main content wrapper with max-width
- `.sys-card`: White card with shadow and rounded corners
- `.sys-title` / `.sys-subtitle`: Page heading hierarchy
- `.sys-label`: Uppercase, small, gray helper text
- `.badge-primary`: Maroon badge with white text

#### Form Components
- `.form-label`: Input labels with bold, uppercase styling
- `.input-field`: Consistent input and select styling
- `.btn-primary`, `.btn-ghost`, `.btn-text`: Button variants
- `.alert-success`, `.alert-error`: Alert styling

#### Table Components
- `.sys-table`, `.sys-table-wrapper`: Table container and scroll wrapper
- `.table-header-row`, `.table-th`, `.table-td`: Table cells with consistent spacing

#### Color Variables
- `--color-cavite-maroon`: #800000 (primary)
- `--color-cavite-black`: #1a1a1a (text)
- `--color-cavite-gray`: #f3f4f6 (background)
- `--color-cavite-border`: #e5e7eb (dividers)

### Tailwind Extensions
- Status badges: `bg-green-100`, `bg-yellow-100`, `bg-red-100` text colors
- Interactive states: `hover:bg-cavite-gray/30`, `transition-colors`
- Responsive grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`

## 🚀 Server Actions

### Available Actions

#### `getDashboardStats()`
Returns summary statistics for dashboard cards.

```typescript
const response = await getDashboardStats();
// response.data = {
//   activeCases: number,
//   highRisk: number,
//   pendingFollowUps: number,
//   resolvedCases: number
// }
```

#### `getFlaggedStudents()`
Retrieves all students flagged for intervention based on attendance and incidents.

```typescript
const response = await getFlaggedStudents();
// response.data = StudentRecord[]
```

#### `getStudentCaseDetails(studentId: string)`
Fetches detailed case information for a specific student.

```typescript
const response = await getStudentCaseDetails(studentId);
// response.data = {
//   studentName, studentId, gradeSection, guardianContact,
//   riskLevel, attendanceStats, recentIncidents, counselingHistory
// }
```

#### `createCounselingSession(studentId, data)`
Creates a new counseling session record.

```typescript
const response = await createCounselingSession(studentId, {
  interventionType: 'Initial Counseling',
  notes: 'Session notes...',
  followUpDate: '2024-06-01',
  caseStatus: 'Active'
});
```

#### `updateCaseStatus(interventionId, newStatus)`
Updates the case status of an existing intervention.

```typescript
const response = await updateCaseStatus(interventionId, 'Resolved');
```

#### `generateMockStudents(count)`
Generates mock student data for demonstration without database integration.

```typescript
const mockData = generateMockStudents(12);
```

## 💾 Data Flow

### Flagging Algorithm

Students are flagged if:
- **Attendance concern**: More than 5 absences
- **Incident concern**: One or more incident reports
- **Either condition**: Student appears in flagged list

### Risk Level Calculation

```
Low:     < 5 absences AND ≤ 1 incident
Medium:  > 5 absences OR > 1 incident
High:    > 10 absences AND > 2 incidents
```

### Data Aggregation

```
Flagged Students
  ├─ FROM students table
  ├─ JOIN attendance_records (count absences)
  └─ JOIN incident_involvements (count incidents)

Case Details
  ├─ Student info
  ├─ Attendance stats from attendance_records
  ├─ Incident history from incident_reports
  └─ Counseling sessions from support_interventions
```

## 📱 Responsive Design

### Breakpoints

- **Mobile (<640px)**: Single column, hidden desktop elements
- **Tablet (640px-1024px)**: Two columns for stats, table scrollable
- **Desktop (>1024px)**: Full four-column grid, responsive tables

### Mobile Optimizations

- Collapsible action buttons on small screens
- Touch-friendly modal sizing
- Swipeable table with horizontal scroll
- Full-width inputs and forms

## 🔧 Configuration & Customization

### Intervention Types

Edit the dropdown in `CounselingModal.tsx`:
```typescript
<option value="Initial Counseling">Initial Counseling</option>
<option value="Follow-up Session">Follow-up Session</option>
<option value="Crisis Intervention">Crisis Intervention</option>
// Add more as needed
```

### Risk Level Thresholds

Modify thresholds in `actions.ts`:
```typescript
if (absenceCount > 10 && incidentCount > 2) riskLevel = 'High';
else if (absenceCount > 5 || incidentCount > 1) riskLevel = 'Medium';
```

### Statistics Calculation

Update stat calculations in `getDashboardStats()` to match your business logic.

## 🧪 Testing & Mock Data

### Using Mock Data

The module includes a fallback mechanism. If real database queries fail, it automatically uses `generateMockStudents()`:

```typescript
const studentsResponse = await getFlaggedStudents();
if (studentsResponse.success) {
  // Use real data
} else {
  // Fallback to mock
  setStudents(generateMockStudents(12));
}
```

### Mock Data Features

- 12 predefined student records
- Realistic grade levels and sections
- Variable absence and incident counts
- Appropriate risk level assignment
- Randomized counseling statuses

## ⚙️ Integration with Other Modules

### From Attendance Monitoring
- Student absence records drive flagging algorithm
- Attendance percentage calculations
- Late record tracking

### From Incident Reporting
- Incident count in student profile
- Incident history in case details
- Severity levels displayed in case card

### To Access Control
- Student portal visibility (if enabled)
- Admin dashboard integration
- Audit logging through system_admins

## 📝 Example Usage

### Dashboard View
1. Counselor logs in → redirected to student-support
2. Dashboard loads with stats, flagged students table
3. Can filter by risk level or search by name/ID
4. Click "View" to see detailed case
5. Click "Start" to open counseling session modal

### Case Management Flow
1. View case details with full profile
2. See attendance, incidents, and previous counseling
3. Create new counseling session
4. Record intervention type, notes, and follow-up date
5. Save session or mark case as resolved
6. Returns to dashboard with updated data

## 🐛 Error Handling

### Authorization Errors
- Non-authenticated users: Redirected to login
- Insufficient permissions: Redirected to unauthorized page
- Server actions throw errors that are caught and displayed

### Data Fetching
- Query failures fallback to mock data
- Errors logged to console
- User-friendly error messages displayed

### Form Validation
- Session date required
- Counseling notes required
- Follow-up date must be selected
- Browser-level HTML5 validation

## 📊 Future Enhancements

Potential improvements for the module:

1. **Advanced Filtering**
   - Date range filtering
   - Counselor assignment filtering
   - Case status filtering

2. **Reporting & Analytics**
   - Intervention effectiveness charts
   - Student progress tracking
   - Counselor workload reports

3. **Notifications**
   - Follow-up date reminders
   - New case alerts
   - Case escalation notifications

4. **Bulk Operations**
   - Batch case status updates
   - Bulk session scheduling
   - Export to PDF/CSV

5. **Communication**
   - In-app messaging with guardians
   - Email notifications
   - Session transcripts

## 🔗 Related Documentation

- **Main README**: `../../README.md`
- **Attendance Module**: `../admin-dashboard/`
- **Incident Module**: `../incident-dashboard/`
- **Supabase Auth**: `../auth/`

## 📧 Support

For questions or issues:
1. Check the code comments in each component
2. Review the Supabase documentation
3. Verify database schema matches requirements
4. Test with mock data first
5. Check browser console for errors

---

**Last Updated**: May 2024  
**Module Version**: 1.0.0  
**Status**: Production Ready
