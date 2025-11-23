-- ============================================
-- FIX DELETE RLS POLICIES
-- ============================================
-- Run this in Supabase SQL Editor to enable delete buttons
-- This adds DELETE policies for all admin-managed tables

-- PART 1: Duties Table Delete Policy
-- ============================================
DROP POLICY IF EXISTS "admin_delete_duties" ON duties;

CREATE POLICY "admin_delete_duties" ON duties
  FOR DELETE
  USING ((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin');

-- PART 2: Instructors Table Delete Policy
-- ============================================
DROP POLICY IF EXISTS "admin_delete_instructors" ON instructors;

CREATE POLICY "admin_delete_instructors" ON instructors
  FOR DELETE
  USING ((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin');

-- PART 3: Exams Table Delete Policy
-- ============================================
DROP POLICY IF EXISTS "admin_delete_exams" ON exams;

CREATE POLICY "admin_delete_exams" ON exams
  FOR DELETE
  USING ((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin');

-- PART 4: Rooms Table Delete Policy
-- ============================================
DROP POLICY IF EXISTS "admin_delete_rooms" ON rooms;

CREATE POLICY "admin_delete_rooms" ON rooms
  FOR DELETE
  USING ((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin');

-- PART 5: User Profiles Table Delete Policy
-- ============================================
DROP POLICY IF EXISTS "admin_delete_user_profiles" ON user_profiles;

CREATE POLICY "admin_delete_user_profiles" ON user_profiles
  FOR DELETE
  USING ((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin');

-- ============================================
-- VERIFICATION
-- ============================================
-- Run these to verify policies are set correctly:
-- SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check
-- FROM pg_policies
-- WHERE tablename IN ('duties', 'instructors', 'exams', 'rooms', 'user_profiles')
-- AND policyname LIKE '%delete%'
-- ORDER BY tablename, policyname;
