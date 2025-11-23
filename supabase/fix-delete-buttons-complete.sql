-- ============================================
-- FIX DELETE BUTTONS - COMPREHENSIVE SOLUTION
-- ============================================
-- Run this in Supabase SQL Editor to fix all delete operations
-- This addresses both RLS policies and RPC function issues

-- ============================================
-- PART 1: ADD DELETE RLS POLICIES
-- ============================================
-- These policies allow admins to delete records

DROP POLICY IF EXISTS "admin_delete_duties" ON duties;
CREATE POLICY "admin_delete_duties" ON duties
  FOR DELETE
  USING ((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin');

DROP POLICY IF EXISTS "admin_delete_instructors" ON instructors;
CREATE POLICY "admin_delete_instructors" ON instructors
  FOR DELETE
  USING ((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin');

DROP POLICY IF EXISTS "admin_delete_exams" ON exams;
CREATE POLICY "admin_delete_exams" ON exams
  FOR DELETE
  USING ((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin');

DROP POLICY IF EXISTS "admin_delete_rooms" ON rooms;
CREATE POLICY "admin_delete_rooms" ON rooms
  FOR DELETE
  USING ((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin');

DROP POLICY IF EXISTS "admin_delete_user_profiles" ON user_profiles;
CREATE POLICY "admin_delete_user_profiles" ON user_profiles
  FOR DELETE
  USING ((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin');

-- ============================================
-- PART 2: CREATE DELETE USER RPC FUNCTION
-- ============================================
-- Function to delete users (handles both auth.users and user_profiles)

DROP FUNCTION IF EXISTS delete_user_account(uuid);

CREATE OR REPLACE FUNCTION delete_user_account(user_id uuid)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  -- Only admin can delete users
  IF (auth.jwt() -> 'user_metadata' ->> 'role') != 'admin' THEN
    RAISE EXCEPTION 'Only admin can delete users';
  END IF;

  -- Delete from user_profiles first (has FK to auth.users)
  DELETE FROM user_profiles WHERE id = user_id;

  -- Delete from auth.users (this will cascade)
  DELETE FROM auth.users WHERE id = user_id;

  -- Return success
  result := json_build_object('success', true, 'message', 'User deleted successfully');
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  result := json_build_object('success', false, 'error', SQLERRM);
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_account(uuid) TO authenticated;

-- ============================================
-- PART 3: VERIFICATION QUERIES
-- ============================================

-- Check DELETE policies exist
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  qual
FROM pg_policies
WHERE tablename IN ('duties', 'instructors', 'exams', 'rooms', 'user_profiles')
  AND policyname LIKE '%delete%'
ORDER BY tablename, policyname;

-- Check RPC function exists
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name = 'delete_user_account'
  AND routine_schema = 'public';
