# Student Support Backend - Implementation Guide

## Quick Start

This guide walks you through setting up and deploying the Student Support module backend.

## Prerequisites

- Supabase project with auth already configured
- Existing tables: `students`, `user_profiles`, `system_admins`, `attendance_records`, `incident_reports`, `incident_involvements`
- TypeScript 5.9+ and Next.js 16.2+

---

## Step 1: Database Migration

### 1. Run the SQL Migration

1. Open your Supabase dashboard
2. Go to **SQL Editor**
3. Create a new query
4. Copy the entire contents of [migration.sql](./migration.sql)
5. Run the migration

**What this does:**
- Creates `support_interventions` table with proper constraints
- Creates 5 performance indexes
- Enables Row-Level Security (RLS)
- Creates 7 RLS policies for secure access
- Creates `flagged_students_view` view for identifying at-risk students
- Adds comprehensive documentation

### 2. Verify the Migration

Run these verification queries in Supabase SQL Editor:

```sql
-- Check table exists
SELECT tablename FROM pg_tables WHERE tablename = 'support_interventions';

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'support_interventions';

-- Check indexes
SELECT indexname FROM pg_indexes WHERE tablename = 'support_interventions';

-- Check policies
SELECT policyname FROM pg_policies WHERE tablename = 'support_interventions';

-- Check view exists
SELECT table_name FROM information_schema.views WHERE table_name = 'flagged_students_view';
```

---

## Step 2: Project Structure

The complete backend structure:

```
app/
  api/
    student-support/
      flagged/
        route.ts                  # GET /api/student-support/flagged
      interventions/
        route.ts                  # POST /api/student-support/interventions
        [id]/
          route.ts                # PATCH /api/student-support/interventions/[id]
      history/
        [studentId]/
          route.ts                # GET /api/student-support/history/[studentId]
      API_DOCUMENTATION.md        # API Reference (this file)
  student-support/
    lib/
      errors.ts                   # Error classes and handling
      validation.ts               # Input validation functions
    types.ts                       # TypeScript interfaces
    actions.ts                     # Server actions (main backend logic)
    migration.sql                  # Database migration
```

---

## Step 3: Environment Variables

No additional environment variables needed beyond what's already configured:

```env
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

---

## Step 4: Configuration

### Ensure User Roles Exist

The system checks for two role types:

1. **Guidance Counselor** (in `user_profiles.role`)
   ```sql
   UPDATE user_profiles SET role = 'Guidance Counselor' WHERE id = '<counselor-uuid>';
   ```

2. **System Admin** (in `system_admins` table)
   ```sql
   -- Admin users must exist in system_admins table
   -- They're created during app setup
   ```

### Verify Database Relationships

Ensure these tables have proper relationships:

```sql
-- students table
SELECT id, first_name, last_name, grade_level FROM students LIMIT 1;

-- user_profiles table  
SELECT id, role FROM user_profiles LIMIT 1;

-- system_admins table
SELECT id FROM system_admins LIMIT 1;

-- attendance_records table
SELECT id, student_id, is_absent FROM attendance_records LIMIT 1;

-- incident_reports table
SELECT id, created_at FROM incident_reports LIMIT 1;
```

---

## Step 5: Testing

### Test Authentication & Authorization

```bash
# Test as counselor
curl -H "Authorization: Bearer <counselor-token>" \
  http://localhost:3000/api/student-support/flagged

# Test as admin
curl -H "Authorization: Bearer <admin-token>" \
  http://localhost:3000/api/student-support/flagged

# Test without auth (should fail)
curl http://localhost:3000/api/student-support/flagged
# Expected: 401 Unauthorized
```

### Test Flagged Students Endpoint

```bash
# Get all flagged students
GET /api/student-support/flagged

# Filter by high risk
GET /api/student-support/flagged?risk_level=High

# Filter by attendance concerns
GET /api/student-support/flagged?filter_type=attendance&page=1&limit=20

# Search by name
GET /api/student-support/flagged?search=Juan&risk_level=Medium
```

### Test Creating Intervention

```bash
curl -X POST http://localhost:3000/api/student-support/interventions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "student_id": "550e8400-e29b-41d4-a716-446655440001",
    "intervention_type": "Initial Counseling",
    "notes": "Student discussed family issues.",
    "follow_up_date": "2025-06-15"
  }'
```

### Test Updating Case Status

```bash
curl -X PATCH http://localhost:3000/api/student-support/interventions/550e8400-e29b-41d4-a716-446655440003 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "case_status": "Resolved"
  }'
```

### Test Student History

```bash
curl http://localhost:3000/api/student-support/history/550e8400-e29b-41d4-a716-446655440001 \
  -H "Authorization: Bearer <token>"
```

---

## Step 6: Integration in Components

### Using Server Actions in Components

```typescript
'use client';

import { getFlaggedStudents } from '@/app/student-support/actions';

export default function StudentSupportPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    try {
      const result = await getFlaggedStudents('High', 'all', '', 1, 10);
      if (result.success) {
        setStudents(result.data);
      } else {
        console.error(result.error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {students.map(student => (
        <StudentCard key={student.id} student={student} />
      ))}
    </div>
  );
}
```

### Using API Routes with Fetch

```typescript
// Client-side hook
export function useFlaggedStudents(riskLevel?: string) {
  const [data, setData] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (riskLevel) params.append('risk_level', riskLevel);
    params.append('page', '1');
    params.append('limit', '10');

    fetch(`/api/student-support/flagged?${params}`)
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error.message);
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [riskLevel]);

  return { data, loading, error };
}
```

### Creating an Intervention

```typescript
async function handleCreateIntervention(
  studentId: string,
  interventionType: string,
  notes: string,
  followUpDate: string
) {
  try {
    const response = await fetch('/api/student-support/interventions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: studentId,
        intervention_type: interventionType,
        notes,
        follow_up_date: followUpDate,
      }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error.message);
    }

    // Success
    console.log('Intervention created:', result.data.interventionId);
    // Refresh data, show toast, etc.
  } catch (error) {
    console.error('Failed to create intervention:', error);
    // Show error toast
  }
}
```

---

## Step 7: Database Query Examples

### Find High-Risk Students

```sql
SELECT * FROM flagged_students_view
WHERE risk_level = 'High'
ORDER BY absences_7d DESC
LIMIT 10;
```

### Get Interventions for a Student

```sql
SELECT * FROM support_interventions
WHERE student_id = 'student-uuid'
ORDER BY created_at DESC;
```

### Active Cases with Follow-ups Due

```sql
SELECT 
  si.id,
  si.student_id,
  si.follow_up_date,
  up.first_name,
  up.last_name
FROM support_interventions si
JOIN user_profiles up ON si.counselor_id = up.id
WHERE si.case_status = 'Active'
  AND si.follow_up_date <= CURRENT_DATE + INTERVAL '3 days'
ORDER BY si.follow_up_date;
```

### Risk Level Distribution

```sql
SELECT 
  risk_level,
  COUNT(*) as count
FROM flagged_students_view
GROUP BY risk_level;
```

---

## Step 8: Error Handling Best Practices

### Always Handle API Errors

```typescript
try {
  const result = await createIntervention(...);
  
  if (!result.success) {
    const errorCode = result.error?.code;
    const errorMessage = result.error?.message;
    
    if (errorCode === 'VALIDATION_ERROR') {
      // Show validation error to user
      showToast(errorMessage, 'error');
    } else if (errorCode === 'AUTH_FORBIDDEN') {
      // Redirect to unauthorized page
      router.push('/unauthorized');
    } else {
      // Generic error handling
      showToast('An error occurred', 'error');
    }
  }
} catch (error) {
  // Network or parsing error
  console.error('Request failed:', error);
}
```

### Validate on Frontend

```typescript
import { validateInterventionInput } from '@/app/student-support/lib/validation';

try {
  validateInterventionInput({
    student_id: formData.studentId,
    intervention_type: formData.type,
    notes: formData.notes,
    follow_up_date: formData.followUpDate,
  });
} catch (error) {
  if (error instanceof ValidationError) {
    showToast(error.message, 'error');
  }
}
```

---

## Step 9: Performance Optimization

### Use Pagination

```typescript
// Don't load all students at once
const page1 = await getFlaggedStudents(undefined, undefined, undefined, 1, 10);
const page2 = await getFlaggedStudents(undefined, undefined, undefined, 2, 10);
```

### Cache Results

```typescript
import { useMemo } from 'react';

export function StudentList({ riskLevel }) {
  const memoizedStudents = useMemo(
    () => getFlaggedStudents(riskLevel),
    [riskLevel]
  );

  return <>{/* render */}</>;
}
```

### Batch Operations

```typescript
// Instead of creating interventions one-by-one in a loop,
// consider batch operations if backend supports it
const interventions = students.map(s => ({
  student_id: s.id,
  intervention_type: 'Initial Counseling',
  notes: 'Batch intervention',
  follow_up_date: '2025-06-15'
}));
```

---

## Troubleshooting

### Issue: "User not authenticated"

**Cause**: No active Supabase session  
**Solution**: Ensure user is logged in before accessing protected routes

### Issue: "Insufficient permissions"

**Cause**: User role is not `Guidance Counselor` or in `system_admins`  
**Solution**: Update user role in database:
```sql
UPDATE user_profiles SET role = 'Guidance Counselor' WHERE id = '<user-id>';
```

### Issue: "Student not found"

**Cause**: Invalid student UUID or student doesn't exist  
**Solution**: Verify UUID format and that student exists in database

### Issue: "follow_up_date must be a valid future date"

**Cause**: Date is in the past or invalid format  
**Solution**: Use ISO format (YYYY-MM-DD) and ensure date is in future

### Issue: RLS policies blocking access

**Cause**: User role not recognized by RLS policies  
**Solution**: Check RLS policies are correct:
```sql
SELECT * FROM pg_policies WHERE tablename = 'support_interventions';
```

---

## Security Checklist

- ✅ RLS policies enabled on `support_interventions`
- ✅ Authentication required on all routes
- ✅ Role-based access control (RBAC) implemented
- ✅ Input validation on server side
- ✅ SQL injection prevention (using parameterized queries)
- ✅ Sensitive data not exposed in logs
- ✅ CORS properly configured (if needed)
- ✅ Rate limiting considered (not implemented, add if needed)

---

## Documentation References

- [TypeScript Types](./types.ts)
- [Error Handling](./lib/errors.ts)
- [Validation Functions](./lib/validation.ts)
- [Server Actions](./actions.ts)
- [API Documentation](./API_DOCUMENTATION.md)
- [Database Migration](./migration.sql)

---

## Next: Frontend Integration

Once backend is set up, integrate with:
- Student Support Dashboard (view flagged students)
- Case Details Page (view student history)
- Intervention Forms (create/update interventions)
- Support Statistics (dashboard metrics)

See component examples in `app/student-support/components/`
