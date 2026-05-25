# Student Support Backend - API Documentation

## Overview

The Student Support module backend provides a comprehensive intervention tracking and student welfare monitoring system. It integrates with attendance records and incident reports to automatically identify at-risk students and allows counselors/admins to create and manage interventions.

## Architecture

### Database Schema

#### `support_interventions` Table
Records all counseling sessions and student interventions.

```sql
CREATE TABLE support_interventions (
  id UUID PRIMARY KEY,
  student_id UUID NOT NULL,
  counselor_id UUID NOT NULL,
  intervention_type VARCHAR(100) NOT NULL,
  notes TEXT,
  follow_up_date DATE,
  case_status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

#### `flagged_students_view` PostgreSQL View
Automatically identifies at-risk students based on:
- **3+ absences in 7 days** → Medium Risk (attendance concern)
- **2+ incidents in 30 days** → Medium Risk (behavioral concern)
- **Both conditions true** → High Risk

---

## API Routes

### 1. GET /api/student-support/flagged

Fetch flagged (at-risk) students with optional filtering and pagination.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `risk_level` | string | - | Filter by risk level: `Low`, `Medium`, `High` |
| `filter_type` | string | `all` | Filter type: `all`, `attendance`, `behavior` |
| `search` | string | - | Search by student name |
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 10 | Items per page (max: 100) |

**Example Request:**
```bash
GET /api/student-support/flagged?risk_level=High&filter_type=all&page=1&limit=10
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "studentId": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Juan Dela Cruz",
      "gradeSection": "10-A",
      "attendanceConcern": true,
      "absenceCount": 5,
      "incidentCount": 2,
      "riskLevel": "High",
      "counselingStatus": "Not Started"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "studentId": "550e8400-e29b-41d4-a716-446655440002",
      "name": "Maria Santos",
      "gradeSection": "10-B",
      "attendanceConcern": true,
      "absenceCount": 3,
      "incidentCount": 0,
      "riskLevel": "Medium",
      "counselingStatus": "Not Started"
    }
  ]
}
```

**Error Response (401/403/500):**
```json
{
  "success": false,
  "error": {
    "code": "AUTH_REQUIRED",
    "message": "User not authenticated",
    "statusCode": 401
  }
}
```

---

### 2. POST /api/student-support/interventions

Create a new counseling intervention for a student.

**Request Body:**
```json
{
  "student_id": "550e8400-e29b-41d4-a716-446655440001",
  "intervention_type": "Initial Counseling",
  "notes": "Student discussed excessive absences. Created attendance improvement plan. Will meet weekly to monitor progress.",
  "follow_up_date": "2025-06-15"
}
```

**Validation:**
- `student_id`: Must be valid UUID and student must exist
- `intervention_type`: Must be one of:
  - `Initial Counseling`
  - `Follow-up Session`
  - `Crisis Intervention`
  - `Academic Support`
  - `Behavioral Intervention`
  - `Parent Conference`
  - `Referral to External Services`
- `notes`: Must be non-empty string, max 5000 characters
- `follow_up_date`: Must be a valid future date (ISO format)

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "interventionId": "550e8400-e29b-41d4-a716-446655440003"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "follow_up_date must be a valid future date",
    "statusCode": 400
  }
}
```

---

### 3. PATCH /api/student-support/interventions/[id]

Update the case status of an intervention.

**Route Parameters:**
- `id`: UUID of the intervention

**Request Body:**
```json
{
  "case_status": "Resolved"
}
```

**Valid Case Statuses:**
- `Active` - Ongoing intervention
- `Pending Review` - Awaiting review
- `Resolved` - Case closed
- `Escalated` - Escalated to higher authority

**Success Response (200):**
```json
{
  "success": true
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Intervention not found",
    "statusCode": 404
  }
}
```

---

### 4. GET /api/student-support/history/[studentId]

Fetch comprehensive support history for a student.

**Route Parameters:**
- `studentId`: UUID of the student

**Example Request:**
```bash
GET /api/student-support/history/550e8400-e29b-41d4-a716-446655440001
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "studentName": "Juan Dela Cruz",
    "studentId": "550e8400-e29b-41d4-a716-446655440001",
    "gradeSection": "10-A",
    "guardianContact": "juan.parent@email.com",
    "riskLevel": "High",
    "attendanceStats": {
      "totalAbsences": 12,
      "lateRecords": 3,
      "attendancePercentage": 84
    },
    "recentIncidents": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440004",
        "date": "2025-05-20T10:30:00Z",
        "title": "Classroom Disruption",
        "severity": "Medium",
        "reporter": "Mr. Santos"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440005",
        "date": "2025-05-15T14:15:00Z",
        "title": "Fight in Hallway",
        "severity": "High",
        "reporter": "Ms. Reyes"
      }
    ],
    "counselingHistory": [
      {
        "date": "2025-05-18T09:00:00Z",
        "type": "Initial Counseling",
        "notes": "Student discussed family issues affecting school performance. Referred to peer support group.",
        "counselor": "550e8400-e29b-41d4-a716-446655440006",
        "followUpDate": "2025-05-25",
        "caseStatus": "Active"
      },
      {
        "date": "2025-05-11T10:00:00Z",
        "type": "Follow-up Session",
        "notes": "Positive progress observed. Attendance improved to 2 absences this week.",
        "counselor": "550e8400-e29b-41d4-a716-446655440006",
        "followUpDate": "2025-05-18",
        "caseStatus": "Active"
      }
    ]
  }
}
```

---

## Server Actions

### `getDashboardStats()`

Fetch dashboard statistics for the student support module.

```typescript
const result = await getDashboardStats();
// Result: { success: true, data: { activeCases, highRisk, pendingFollowUps, resolvedCases } }
```

### `getFlaggedStudents()`

Alternative to API route for client-side usage via server actions.

```typescript
const result = await getFlaggedStudents(riskLevel, filterType, search, page, limit);
```

### `getStudentCaseDetails(studentId)`

Fetch comprehensive case details for a student.

```typescript
const result = await getStudentCaseDetails(studentId);
```

### `createIntervention()`

Create a new intervention.

```typescript
const result = await createIntervention(studentId, interventionType, notes, followUpDate);
```

### `updateCaseStatus()`

Update an intervention's case status.

```typescript
const result = await updateCaseStatus(interventionId, newStatus);
```

---

## Security & Authentication

### Row-Level Security (RLS) Policies

All data access is protected by PostgreSQL RLS policies:

**SELECT Policy:**
- Counselors can view their own sessions
- Admins can view all sessions

**INSERT Policy:**
- Counselors can only create sessions as themselves
- Admins can create any session

**UPDATE Policy:**
- Counselors can only update their own sessions
- Admins can update any session

**DELETE Policy:**
- Only admins can delete sessions

### Authentication Requirements

All API routes and server actions require:
1. Active Supabase authentication session
2. User role: `Guidance Counselor` or `System Admin`

---

## TypeScript Types

### Core Interfaces

```typescript
export type RiskLevel = 'Low' | 'Medium' | 'High';
export type CaseStatus = 'Active' | 'Pending Review' | 'Resolved' | 'Escalated';

export interface SupportIntervention {
  id: string;
  student_id: string;
  counselor_id: string;
  intervention_type: string;
  notes: string;
  follow_up_date: string;
  case_status: CaseStatus;
  created_at: string;
  updated_at: string;
}

export interface FlaggedStudent {
  student_id: string;
  full_name: string;
  grade_section: string;
  absences_7d: number;
  incident_count_30d: number;
  risk_level: RiskLevel;
}

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
}

export interface StudentCaseDetails {
  studentName: string;
  studentId: string;
  gradeSection: string;
  guardianContact: string;
  riskLevel: RiskLevel;
  attendanceStats: AttendanceStats;
  recentIncidents: IncidentRecord[];
  counselingHistory: CounselingRecord[];
}
```

---

## Error Handling

### Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "statusCode": 400
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `AUTH_REQUIRED` | 401 | User not authenticated |
| `AUTH_FORBIDDEN` | 403 | User lacks permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `DB_ERROR` | 500 | Database operation failed |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Rate Limiting & Performance

- No explicit rate limiting (implement as needed)
- Pagination recommended for large datasets
- Maximum 100 items per page
- Indexes created on: `student_id`, `counselor_id`, `case_status`, `created_at`, `follow_up_date`

---

## Next Steps

1. **Run the migration**: Execute `migration.sql` in Supabase SQL Editor
2. **Test the views**: Verify `flagged_students_view` returns expected data
3. **Test RLS policies**: Ensure proper access control
4. **Integrate UI components**: Use server actions and API routes in React components
5. **Set up error handling**: Wrap API calls in try-catch with user feedback
