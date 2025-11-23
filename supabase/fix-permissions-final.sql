-- =====================================================
-- FINAL RLS POLICY FIX
-- Allows authenticated admin users to perform all operations
-- Also enables reading for authenticated users
-- =====================================================

-- Drop all existing policies
DROP POLICY IF EXISTS admin_instructors_all ON instructors;
DROP POLICY IF EXISTS admin_exams_all ON exams;
DROP POLICY IF EXISTS admin_rooms_all ON rooms;
DROP POLICY IF EXISTS admin_duties_all ON duties;
DROP POLICY IF EXISTS admin_analytics_all ON analytics_cache;
DROP POLICY IF EXISTS instructor_read_all ON instructors;
DROP POLICY IF EXISTS instructor_read_duties ON duties;
DROP POLICY IF EXISTS instructor_read_duties_own ON duties;

-- =====================================================
-- INSTRUCTORS TABLE POLICIES
-- =====================================================

-- Admin: Full access (select, insert, update, delete)
CREATE POLICY admin_instructors_select ON instructors
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY admin_instructors_insert ON instructors
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY admin_instructors_update ON instructors
  FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY admin_instructors_delete ON instructors
  FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin');

-- Instructors: Can read all instructors
CREATE POLICY instructors_read ON instructors
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- =====================================================
-- EXAMS TABLE POLICIES
-- =====================================================

-- Admin: Full access
CREATE POLICY admin_exams_select ON exams
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY admin_exams_insert ON exams
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY admin_exams_update ON exams
  FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY admin_exams_delete ON exams
  FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin');

-- Instructors: Can read exams
CREATE POLICY instructors_read_exams ON exams
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- =====================================================
-- ROOMS TABLE POLICIES
-- =====================================================

-- Admin: Full access
CREATE POLICY admin_rooms_select ON rooms
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY admin_rooms_insert ON rooms
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY admin_rooms_update ON rooms
  FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY admin_rooms_delete ON rooms
  FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin');

-- Instructors: Can read rooms
CREATE POLICY instructors_read_rooms ON rooms
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- =====================================================
-- DUTIES TABLE POLICIES
-- =====================================================

-- Admin: Full access
CREATE POLICY admin_duties_select ON duties
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY admin_duties_insert ON duties
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY admin_duties_update ON duties
  FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY admin_duties_delete ON duties
  FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin');

-- Instructors: Can read all duties
CREATE POLICY instructors_read_duties ON duties
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Instructors: Can update own duties (mark arrival)
CREATE POLICY instructors_update_own_duties ON duties
  FOR UPDATE
  USING (
    auth.role() = 'authenticated' 
    AND instructor_id = (auth.jwt() ->> 'instructor_id')::uuid
  )
  WITH CHECK (
    auth.role() = 'authenticated' 
    AND instructor_id = (auth.jwt() ->> 'instructor_id')::uuid
  );

-- =====================================================
-- ANALYTICS_CACHE TABLE POLICIES
-- =====================================================

-- Admin: Full access
CREATE POLICY admin_analytics_all ON analytics_cache
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Instructors: Can read analytics
CREATE POLICY instructors_read_analytics ON analytics_cache
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

SELECT 'RLS policies successfully fixed! ✅' as status;

-- Show all current policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- NEXT STEPS:
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Go to Authentication → Users in Supabase
-- 3. For your admin user, click the three dots → Edit
-- 4. Update "User Metadata" with: {"role": "admin"}
-- 5. For instructor users, set: {"role": "instructor"}
-- 6. Refresh the app and try adding data again
-- =====================================================
