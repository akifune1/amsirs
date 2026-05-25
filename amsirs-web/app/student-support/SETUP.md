# Student Support System - Installation & Setup Guide

This guide walks through setting up the Student Support System module in your CSWMS installation.

## 📋 Quick Setup Checklist

- [ ] Understand existing Supabase schema
- [ ] Create `support_interventions` table
- [ ] Add Row-Level Security (RLS) policies
- [ ] Update user_profiles role column values
- [ ] Test database connections
- [ ] Verify authentication flow
- [ ] Deploy to production

## 🗄️ Step 1: Create Support Interventions Table

### SQL Migration Script

Run this SQL in your Supabase SQL Editor:

```sql
-- ========================================
-- Create support_interventions table
-- ========================================

CREATE TABLE IF NOT EXISTS support_interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  counselor_id UUID NOT NULL,
  intervention_type VARCHAR(100) NOT NULL,
  notes TEXT,
  follow_up_date DATE,
  case_status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT fk_support_interventions_student 
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_support_interventions_counselor 
    FOREIGN KEY (counselor_id) REFERENCES user_profiles(id) ON DELETE SET NULL
);

-- ========================================
-- Create indexes for better query performance
-- ========================================

CREATE INDEX idx_support_interventions_student_id 
  ON support_interventions(student_id);

CREATE INDEX idx_support_interventions_counselor_id 
  ON support_interventions(counselor_id);

CREATE INDEX idx_support_interventions_case_status 
  ON support_interventions(case_status);

CREATE INDEX idx_support_interventions_created_at 
  ON support_interventions(created_at DESC);

-- ========================================
-- Add comments for documentation
-- ========================================

COMMENT ON TABLE support_interventions IS 
  'Records of counseling sessions and interventions for students';

COMMENT ON COLUMN support_interventions.intervention_type IS 
  'Type of intervention: Initial Counseling, Follow-up Session, Crisis Intervention, etc.';

COMMENT ON COLUMN support_interventions.notes IS 
  'Detailed notes from the counseling session';

COMMENT ON COLUMN support_interventions.follow_up_date IS 
  'Scheduled date for next follow-up';

COMMENT ON COLUMN support_interventions.case_status IS 
  'Current status: Active, Pending Review, Resolved, Escalated';
```

## 🔐 Step 2: Set Up Row-Level Security (RLS)

### Enable RLS

```sql
-- Enable RLS on the table
ALTER TABLE support_interventions ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies (if re-running)
DROP POLICY IF EXISTS "Counselors view own sessions" ON support_interventions;
DROP POLICY IF EXISTS "Admins view all sessions" ON support_interventions;
DROP POLICY IF EXISTS "Counselors manage own sessions" ON support_interventions;
DROP POLICY IF EXISTS "Admins manage all sessions" ON support_interventions;
```

### Create RLS Policies

```sql
-- ========================================
-- SELECT Policies
-- ========================================

-- Counselors can view their own sessions
CREATE POLICY "Counselors view own sessions"
  ON support_interventions FOR SELECT
  USING (
    auth.uid() = counselor_id 
    AND EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'Guidance Counselor'
    )
  );

-- Admins can view all sessions
CREATE POLICY "Admins view all sessions"
  ON support_interventions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM system_admins 
      WHERE id = auth.uid()
    )
  );

-- ========================================
-- INSERT Policies
-- ========================================

-- Counselors can create sessions
CREATE POLICY "Counselors create sessions"
  ON support_interventions FOR INSERT
  WITH CHECK (
    auth.uid() = counselor_id
    AND EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'Guidance Counselor'
    )
  );

-- Admins can create sessions
CREATE POLICY "Admins create sessions"
  ON support_interventions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM system_admins 
      WHERE id = auth.uid()
    )
  );

-- ========================================
-- UPDATE Policies
-- ========================================

-- Counselors can update their own sessions
CREATE POLICY "Counselors update own sessions"
  ON support_interventions FOR UPDATE
  USING (
    auth.uid() = counselor_id
    AND EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'Guidance Counselor'
    )
  );

-- Admins can update all sessions
CREATE POLICY "Admins update all sessions"
  ON support_interventions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM system_admins 
      WHERE id = auth.uid()
    )
  );

-- ========================================
-- DELETE Policies
-- ========================================

-- Only admins can delete sessions
CREATE POLICY "Admins delete sessions"
  ON support_interventions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM system_admins 
      WHERE id = auth.uid()
    )
  );
```

## 👥 Step 3: Configure User Roles

### Ensure User Profiles Table Has Correct Role Values

```sql
-- Check available roles in user_profiles table
SELECT DISTINCT role FROM user_profiles ORDER BY role;

-- If 'Guidance Counselor' role doesn't exist, add sample counselor
INSERT INTO user_profiles (id, first_name, last_name, email, role, created_at)
SELECT 
  auth.uid(),
  'Maria',
  'Cruz',
  'maria.cruz@cnhs.edu.ph',
  'Guidance Counselor',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM user_profiles 
  WHERE role = 'Guidance Counselor' LIMIT 1
);

-- List all counselors
SELECT id, first_name, last_name, email, role 
FROM user_profiles 
WHERE role = 'Guidance Counselor';

-- List all admins
SELECT id, first_name, last_name, email 
FROM system_admins;
```

## 🔗 Step 4: Verify Related Tables Structure

### Expected Supabase Tables

Ensure these tables exist with the columns shown:

#### students
```
- id (UUID)
- student_id (VARCHAR)
- first_name (VARCHAR)
- last_name (VARCHAR)
- grade_level (VARCHAR)
- guardian_email (VARCHAR)
- account_id (UUID, FK to auth.users)
- created_at (TIMESTAMP)
```

#### attendance_records
```
- id (UUID)
- student_id (UUID, FK to students)
- is_absent (BOOLEAN)
- is_late (BOOLEAN)
- created_at (TIMESTAMP)
```

#### incident_reports
```
- id (UUID)
- location (VARCHAR)
- severity (VARCHAR)
- description (TEXT)
- status (VARCHAR)
- reporting_staff (VARCHAR)
- created_at (TIMESTAMP)
```

#### incident_involvements
```
- id (UUID)
- student_id (UUID, FK to students)
- incident_id (UUID, FK to incident_reports)
- created_at (TIMESTAMP)
```

#### user_profiles
```
- id (UUID)
- first_name (VARCHAR)
- last_name (VARCHAR)
- email (VARCHAR)
- role (VARCHAR)  -- Important: includes 'Guidance Counselor'
- created_at (TIMESTAMP)
```

#### system_admins
```
- id (UUID, FK to user_profiles or auth.users)
```

## 🧪 Step 5: Test Database Queries

### Test 1: Verify RLS Access

```sql
-- As a counselor user (set JWT claim)
BEGIN;
SET LOCAL auth.jwt.claims = 
  jsonb_build_object('sub', 'counselor-uuid', 'role', 'Guidance Counselor');

-- This should work - they can see their own sessions
SELECT * FROM support_interventions 
WHERE counselor_id = 'counselor-uuid'::uuid;

ROLLBACK;

-- As an admin user
BEGIN;
SET LOCAL auth.jwt.claims = 
  jsonb_build_object('sub', 'admin-uuid', 'role', 'admin');

-- This should work - admins can see all
SELECT * FROM support_interventions;

ROLLBACK;
```

### Test 2: Check Data Aggregation

```sql
-- Get flagged students (high-risk)
SELECT 
  s.id,
  s.student_id,
  s.first_name,
  s.last_name,
  s.grade_level,
  COUNT(DISTINCT a.id) FILTER (WHERE a.is_absent = true) as absence_count,
  COUNT(DISTINCT inv.id) as incident_count
FROM students s
LEFT JOIN attendance_records a ON s.id = a.student_id
LEFT JOIN incident_involvements inv ON s.id = inv.student_id
GROUP BY s.id, s.student_id, s.first_name, s.last_name, s.grade_level
HAVING COUNT(DISTINCT a.id) FILTER (WHERE a.is_absent = true) > 5 
   OR COUNT(DISTINCT inv.id) > 0
ORDER BY absence_count DESC;

-- Get student case details
SELECT 
  s.id,
  s.first_name,
  s.last_name,
  s.student_id,
  s.grade_level,
  COUNT(DISTINCT a.id) FILTER (WHERE a.is_absent = true) as total_absences,
  COUNT(DISTINCT a.id) FILTER (WHERE a.is_late = true) as late_records
FROM students s
LEFT JOIN attendance_records a ON s.id = a.student_id
WHERE s.id = 'student-uuid'::uuid
GROUP BY s.id, s.first_name, s.last_name, s.student_id, s.grade_level;

-- Get incident history for student
SELECT 
  ir.id,
  ir.severity,
  ir.description,
  ir.location,
  ir.created_at,
  ir.reporting_staff
FROM incident_reports ir
WHERE ir.id IN (
  SELECT incident_id FROM incident_involvements 
  WHERE student_id = 'student-uuid'::uuid
)
ORDER BY ir.created_at DESC;

-- Get counseling sessions for student
SELECT 
  si.id,
  si.intervention_type,
  si.notes,
  si.case_status,
  si.follow_up_date,
  si.created_at,
  up.first_name,
  up.last_name
FROM support_interventions si
LEFT JOIN user_profiles up ON si.counselor_id = up.id
WHERE si.student_id = 'student-uuid'::uuid
ORDER BY si.created_at DESC;
```

## 🔑 Step 6: Environment Configuration

### Verify .env.local

```bash
# Should already exist from auth setup
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Check Next.js Configuration

In `next.config.js`:
```javascript
// Should support server actions and middleware
const nextConfig = {
  // ... existing config
  experimental: {
    serverActions: true,
  },
};
```

## 🚀 Step 7: Deploy Changes

### Local Testing

1. Run development server:
```bash
npm run dev
```

2. Test access:
   - Log in as guidance counselor
   - Navigate to `/student-support`
   - Verify dashboard loads with data

### Production Deployment

```bash
# Build and test
npm run build

# Deploy (or use Vercel, etc.)
npm start
```

## ✅ Verification Checklist

- [ ] `support_interventions` table created
- [ ] All indexes created
- [ ] RLS policies enabled
- [ ] At least one user with 'Guidance Counselor' role exists
- [ ] Sample student data with attendance records
- [ ] Sample incident data linked to students
- [ ] Authentication working for counselors and admins
- [ ] Dashboard page loads without errors
- [ ] Flagged students table shows filtered data
- [ ] Can create counseling sessions
- [ ] Can view case details
- [ ] All forms validate correctly

## 🐛 Troubleshooting

### Issue: "Unauthorized" Error on Dashboard

**Cause**: User doesn't have 'Guidance Counselor' role or isn't admin

**Solution**:
1. Check user role in `user_profiles`
2. Update role to 'Guidance Counselor' if needed
3. Or add user ID to `system_admins` table

### Issue: No Students Appearing in Table

**Cause**: No students with attendance data, or filtering excludes all

**Solution**:
1. Check students exist in database
2. Verify attendance records with absences > 5 exist
3. Fallback to mock data works (try creating a new counselor account)

### Issue: Modal Won't Save Session

**Cause**: Invalid form data or authorization issue

**Solution**:
1. Check browser console for errors
2. Verify all required fields filled
3. Check user has permission to create interventions
4. Check `support_interventions` table is created

### Issue: Database Errors in Logs

**Cause**: RLS policies preventing access or incorrect schema

**Solution**:
1. Run verification queries above
2. Check all RLS policies are correctly set
3. Verify user role matches policy requirements
4. Check table and column names exactly match

## 📞 Support

For detailed help:
1. Check the module [README.md](./README.md)
2. Review your existing Supabase setup
3. Check Supabase documentation for RLS
4. Review Next.js server actions documentation

---

**Configuration Status**: Ready for Production  
**Last Updated**: May 2024
