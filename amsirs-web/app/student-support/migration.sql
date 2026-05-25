-- ================================================================================
-- AMSIRS - Student Support System Database Migration
-- 
-- This file contains all SQL migrations needed to set up the Student Support
-- System module. Copy and paste this into your Supabase SQL Editor and execute.
--
-- Prerequisites:
-- - Supabase project already set up
-- - students, attendance_records, incident_reports, user_profiles tables exist
-- - system_admins table exists
--
-- ================================================================================

-- ================================================================================
-- STEP 1: Create support_interventions Table
-- ================================================================================

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
  
  -- Constraints
  CONSTRAINT fk_support_interventions_student 
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_support_interventions_counselor 
    FOREIGN KEY (counselor_id) REFERENCES user_profiles(id) ON DELETE SET NULL
);

-- ================================================================================
-- STEP 2: Create Indexes for Performance
-- ================================================================================

CREATE INDEX IF NOT EXISTS idx_support_interventions_student_id 
  ON support_interventions(student_id);

CREATE INDEX IF NOT EXISTS idx_support_interventions_counselor_id 
  ON support_interventions(counselor_id);

CREATE INDEX IF NOT EXISTS idx_support_interventions_case_status 
  ON support_interventions(case_status);

CREATE INDEX IF NOT EXISTS idx_support_interventions_created_at 
  ON support_interventions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_support_interventions_follow_up_date 
  ON support_interventions(follow_up_date);

-- ================================================================================
-- STEP 3: Add Table Comments (Documentation)
-- ================================================================================

COMMENT ON TABLE support_interventions IS 
  'Records of counseling sessions and student interventions. Tracks all support activities for flagged students.';

COMMENT ON COLUMN support_interventions.id IS 
  'Unique identifier for the intervention record';

COMMENT ON COLUMN support_interventions.student_id IS 
  'Foreign key reference to the students table';

COMMENT ON COLUMN support_interventions.counselor_id IS 
  'Foreign key reference to the user_profiles table (counselor/staff member)';

COMMENT ON COLUMN support_interventions.intervention_type IS 
  'Type of counseling/intervention provided. Examples: Initial Counseling, Follow-up Session, Crisis Intervention, etc.';

COMMENT ON COLUMN support_interventions.notes IS 
  'Detailed notes from the counseling session. Contains observations, recommendations, and session outcomes.';

COMMENT ON COLUMN support_interventions.follow_up_date IS 
  'Scheduled date for the next follow-up session';

COMMENT ON COLUMN support_interventions.case_status IS 
  'Current status of the case. Values: Active, Pending Review, Resolved, Escalated';

COMMENT ON COLUMN support_interventions.created_at IS 
  'Timestamp when the record was created';

COMMENT ON COLUMN support_interventions.updated_at IS 
  'Timestamp when the record was last updated';

-- ================================================================================
-- STEP 4: Enable Row-Level Security (RLS)
-- ================================================================================

ALTER TABLE support_interventions ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies first (safe to run multiple times)
DROP POLICY IF EXISTS "Counselors view own sessions" ON support_interventions;
DROP POLICY IF EXISTS "Admins view all sessions" ON support_interventions;
DROP POLICY IF EXISTS "Counselors create sessions" ON support_interventions;
DROP POLICY IF EXISTS "Admins create sessions" ON support_interventions;
DROP POLICY IF EXISTS "Counselors update own sessions" ON support_interventions;
DROP POLICY IF EXISTS "Admins update all sessions" ON support_interventions;
DROP POLICY IF EXISTS "Admins delete sessions" ON support_interventions;

-- ================================================================================
-- STEP 5: Create RLS Policies - SELECT
-- ================================================================================

-- Guidance counselors can view their own sessions
CREATE POLICY "Counselors view own sessions"
  ON support_interventions 
  FOR SELECT
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
  ON support_interventions 
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM system_admins 
      WHERE id = auth.uid()
    )
  );

-- ================================================================================
-- STEP 6: Create RLS Policies - INSERT
-- ================================================================================

-- Guidance counselors can create sessions
CREATE POLICY "Counselors create sessions"
  ON support_interventions 
  FOR INSERT
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
  ON support_interventions 
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM system_admins 
      WHERE id = auth.uid()
    )
  );

-- ================================================================================
-- STEP 7: Create RLS Policies - UPDATE
-- ================================================================================

-- Counselors can update their own sessions
CREATE POLICY "Counselors update own sessions"
  ON support_interventions 
  FOR UPDATE
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
  ON support_interventions 
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM system_admins 
      WHERE id = auth.uid()
    )
  );

-- ================================================================================
-- STEP 8: Create RLS Policies - DELETE
-- ================================================================================

-- Only admins can delete sessions
CREATE POLICY "Admins delete sessions"
  ON support_interventions 
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM system_admins 
      WHERE id = auth.uid()
    )
  );

-- ================================================================================
-- STEP 9: Create flagged_students_view (PostgreSQL View)
-- ================================================================================
-- This view automatically identifies at-risk students based on:
-- - 3+ absences in 7 days → Medium Risk
-- - 2+ incidents in 30 days → Medium Risk  
-- - Both conditions true → High Risk

CREATE OR REPLACE VIEW flagged_students_view AS
SELECT 
  s.id AS student_id,
  CONCAT(s.first_name, ' ', s.last_name) AS full_name,
  s.grade_level AS grade_section,
  COALESCE(
    (SELECT COUNT(*) FROM attendance_records 
     WHERE student_id = s.id 
     AND is_absent = true 
     AND created_at > now() - INTERVAL '7 days'),
    0
  ) AS absences_7d,
  COALESCE(
    (SELECT COUNT(*) FROM incident_involvements ii
     JOIN incident_reports ir ON ii.incident_id = ir.id
     WHERE ii.student_id = s.id 
     AND ir.created_at > now() - INTERVAL '30 days'),
    0
  ) AS incident_count_30d,
  CASE 
    WHEN (
      (SELECT COUNT(*) FROM attendance_records 
       WHERE student_id = s.id 
       AND is_absent = true 
       AND created_at > now() - INTERVAL '7 days') >= 3
    ) AND (
      (SELECT COUNT(*) FROM incident_involvements ii
       JOIN incident_reports ir ON ii.incident_id = ir.id
       WHERE ii.student_id = s.id 
       AND ir.created_at > now() - INTERVAL '30 days') >= 2
    ) THEN 'High'
    WHEN (
      (SELECT COUNT(*) FROM attendance_records 
       WHERE student_id = s.id 
       AND is_absent = true 
       AND created_at > now() - INTERVAL '7 days') >= 3
    ) OR (
      (SELECT COUNT(*) FROM incident_involvements ii
       JOIN incident_reports ir ON ii.incident_id = ir.id
       WHERE ii.student_id = s.id 
       AND ir.created_at > now() - INTERVAL '30 days') >= 2
    ) THEN 'Medium'
    ELSE 'Low'
  END AS risk_level
FROM students s
WHERE 
  (
    (SELECT COUNT(*) FROM attendance_records 
     WHERE student_id = s.id 
     AND is_absent = true 
     AND created_at > now() - INTERVAL '7 days') >= 3
  ) OR (
    (SELECT COUNT(*) FROM incident_involvements ii
     JOIN incident_reports ir ON ii.incident_id = ir.id
     WHERE ii.student_id = s.id 
     AND ir.created_at > now() - INTERVAL '30 days') >= 2
  );

COMMENT ON VIEW flagged_students_view IS
  'Identifies at-risk students based on attendance and incident patterns. Medium Risk: 3+ absences in 7 days OR 2+ incidents in 30 days. High Risk: Both conditions true.';

-- Grant access to authenticated users (will be filtered by RLS in application)
GRANT SELECT ON flagged_students_view TO authenticated;

-- ================================================================================
-- STEP 10: Make sure Guidance Counselor role exists in user_profiles
-- ================================================================================

-- This is informational - verify that your user_profiles has the following
-- If not, add the role to user_profiles table:

-- Check what roles currently exist:
-- SELECT DISTINCT role FROM user_profiles ORDER BY role;

-- If 'Guidance Counselor' role doesn't exist, you may need to:
-- 1. Update an existing user: UPDATE user_profiles SET role = 'Guidance Counselor' WHERE id = 'user-id';
-- 2. Or ensure new users are created with this role

-- ================================================================================
-- STEP 10: Verify Setup with Test Queries
-- ================================================================================

-- These queries verify the setup is working correctly:

-- Check table exists
-- SELECT * FROM information_schema.tables 
-- WHERE table_name = 'support_interventions';

-- Check RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables 
-- WHERE tablename = 'support_interventions';

-- Check policies are created
-- SELECT tablename, policyname FROM pg_policies 
-- WHERE tablename = 'support_interventions';

-- Check indexes are created
-- SELECT indexname FROM pg_indexes 
-- WHERE tablename = 'support_interventions';

-- ================================================================================
-- STEP 11: Sample Test Insert (Optional)
-- ================================================================================

-- IMPORTANT: Replace the UUIDs below with real IDs from your database!
-- To find real IDs, query: SELECT id FROM students LIMIT 1;

/*
-- Example insert (uncomment and modify with real UUIDs):
INSERT INTO support_interventions (
  student_id,
  counselor_id,
  intervention_type,
  notes,
  follow_up_date,
  case_status
) VALUES (
  'real-student-uuid-here',
  'real-counselor-uuid-here',
  'Initial Counseling',
  'Student discussed attendance concerns. Recommended attendance improvement plan.',
  CURRENT_DATE + INTERVAL '7 days',
  'Active'
);
*/

-- ================================================================================
-- MIGRATION COMPLETE
-- ================================================================================

-- Summary of changes:
-- ✓ Created support_interventions table
-- ✓ Created 5 indexes for query performance
-- ✓ Enabled Row-Level Security
-- ✓ Created 7 RLS policies (SELECT, INSERT, UPDATE, DELETE)
-- ✓ Added table and column comments

-- Next steps:
-- 1. Run this migration in your Supabase SQL Editor
-- 2. Verify all policies and indexes were created
-- 3. Update user_profiles with 'Guidance Counselor' role as needed
-- 4. Start the Next.js application
-- 5. Test by logging in as a counselor and accessing /student-support

-- For more information, see:
-- - README.md: Module overview and features
-- - SETUP.md: Detailed setup and troubleshooting
-- - types.ts: TypeScript type definitions
