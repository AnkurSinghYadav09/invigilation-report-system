-- =====================================================
-- DEBUG: Check Rahul's Setup for Mark Arrival
-- Run this to see if Rahul is properly configured
-- =====================================================

-- Check 1: Rahul's auth user data
SELECT 
  'Auth User Data' as check_type,
  id,
  email,
  raw_user_meta_data->>'role' as role,
  raw_user_meta_data->>'instructor_id' as instructor_id_metadata,
  email_confirmed_at IS NOT NULL as is_confirmed
FROM auth.users
WHERE email = 'rahul@university.edu';

-- Check 2: Rahul's user profile
SELECT 
  'User Profile Data' as check_type,
  id,
  email,
  role,
  instructor_id,
  name
FROM user_profiles
WHERE email = 'rahul@university.edu';

-- Check 3: Find Rahul in instructors table
SELECT 
  'Instructor Record' as check_type,
  id as instructor_id,
  name,
  email,
  department,
  total_duties,
  on_time_count,
  late_count
FROM instructors
WHERE email = 'rahul@university.edu' OR name ILIKE '%rahul%';

-- Check 4: Rahul's duties
SELECT 
  'Rahul Duties' as check_type,
  d.id as duty_id,
  e.name as exam_name,
  d.reporting_time,
  d.arrival_time,
  d.status,
  d.instructor_id
FROM duties d
LEFT JOIN exams e ON d.exam_id = e.id
WHERE d.instructor_id IN (
  SELECT id FROM instructors WHERE email = 'rahul@university.edu' OR name ILIKE '%rahul%'
);

-- Check 5: Test if instructor_id matches
SELECT 
  'ID Matching Check' as check_type,
  (SELECT id FROM instructors WHERE name ILIKE '%rahul%') as instructor_table_id,
  (SELECT raw_user_meta_data->>'instructor_id' FROM auth.users WHERE email = 'rahul@university.edu') as metadata_instructor_id,
  (SELECT instructor_id::text FROM user_profiles WHERE email = 'rahul@university.edu') as profile_instructor_id,
  CASE 
    WHEN (SELECT id::text FROM instructors WHERE name ILIKE '%rahul%') = 
         (SELECT raw_user_meta_data->>'instructor_id' FROM auth.users WHERE email = 'rahul@university.edu')
    THEN '✅ IDs MATCH'
    ELSE '❌ IDs DO NOT MATCH'
  END as match_status;

SELECT '📋 Debug info displayed above' as result;
