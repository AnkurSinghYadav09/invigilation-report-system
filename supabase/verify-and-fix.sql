-- =====================================================
-- COMPLETE VERIFICATION & FIX SCRIPT
-- Run this in Supabase SQL Editor to check everything
-- =====================================================

-- STEP 1: Check if admin user has correct role
SELECT 
  'Checking admin user role...' as step,
  id,
  email,
  raw_user_meta_data,
  raw_user_meta_data->>'role' as role_value
FROM auth.users 
WHERE email = 'admin@university.edu';

-- STEP 2: If role is NULL or not 'admin', fix it
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object('role', 'admin')
WHERE email = 'admin@university.edu'
AND (raw_user_meta_data->>'role' IS NULL OR raw_user_meta_data->>'role' != 'admin');

-- STEP 3: Verify the fix
SELECT 
  'Admin user after fix:' as step,
  email,
  raw_user_meta_data->>'role' as role
FROM auth.users 
WHERE email = 'admin@university.edu';

-- STEP 4: Check current data in tables
SELECT 'Instructors in database:' as step, COUNT(*) as count FROM instructors;
SELECT 'Exams in database:' as step, COUNT(*) as count FROM exams;
SELECT 'Rooms in database:' as step, COUNT(*) as count FROM rooms;
SELECT 'Duties in database:' as step, COUNT(*) as count FROM duties;

-- STEP 5: Show all instructors (if any)
SELECT 'All instructors:' as info;
SELECT id, name, email, department, phone, total_duties, created_at 
FROM instructors 
ORDER BY created_at DESC;

-- STEP 6: Show all exams (if any)
SELECT 'All exams:' as info;
SELECT id, name, date, start_time, end_time, subject, course_code, created_at 
FROM exams 
ORDER BY created_at DESC;

-- STEP 7: Show all rooms (if any)
SELECT 'All rooms:' as info;
SELECT id, name, building, capacity, floor, created_at 
FROM rooms 
ORDER BY created_at DESC;

-- STEP 8: Verify RLS policies have WITH CHECK
SELECT 
  'RLS Policies:' as info,
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN with_check IS NOT NULL THEN 'HAS WITH CHECK ✅'
    ELSE 'MISSING WITH CHECK ❌'
  END as with_check_status
FROM pg_policies
WHERE schemaname = 'public' 
  AND policyname LIKE 'admin%'
ORDER BY tablename;

-- STEP 9: Test if current user can insert (run this AFTER logging in to the app)
-- This will show what role the JWT has
SELECT 
  'Current JWT role:' as info,
  auth.jwt()->>'role' as role,
  auth.jwt()->>'email' as email;

-- =====================================================
-- FINAL MESSAGE
-- =====================================================
SELECT '✅ Verification complete!' as status;
SELECT 'If admin role is NULL above, you need to set it in Supabase Auth dashboard' as action_needed;
SELECT 'After fixing, LOGOUT and LOGIN again in the app for the new role to take effect' as important;
