-- =====================================================
-- FIX: Link Rahul's User Account to Instructor Profile
-- This allows him to mark arrivals
-- =====================================================

-- Step 1: Find Rahul's instructor ID
DO $$
DECLARE
  rahul_instructor_id UUID;
  rahul_user_id UUID;
BEGIN
  -- Get Rahul's instructor ID from instructors table
  SELECT id INTO rahul_instructor_id
  FROM instructors
  WHERE name ILIKE '%rahul%' OR email = 'rahul@university.edu'
  LIMIT 1;

  -- Get Rahul's user ID from auth
  SELECT id INTO rahul_user_id
  FROM auth.users
  WHERE email = 'rahul@university.edu';

  -- Update auth metadata with instructor_id
  IF rahul_instructor_id IS NOT NULL AND rahul_user_id IS NOT NULL THEN
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_set(
      jsonb_set(
        COALESCE(raw_user_meta_data, '{}'::jsonb),
        '{role}',
        '"instructor"'
      ),
      '{instructor_id}',
      to_jsonb(rahul_instructor_id::text)
    )
    WHERE id = rahul_user_id;

    -- Update user_profiles
    UPDATE user_profiles
    SET role = 'instructor',
        instructor_id = rahul_instructor_id
    WHERE id = rahul_user_id;

    RAISE NOTICE 'Rahul linked successfully! instructor_id: %', rahul_instructor_id;
  ELSE
    RAISE NOTICE 'Could not find Rahul. instructor_id: %, user_id: %', rahul_instructor_id, rahul_user_id;
  END IF;
END $$;

-- Verify the fix
SELECT 
  'Verification' as status,
  u.email,
  u.raw_user_meta_data->>'role' as role,
  u.raw_user_meta_data->>'instructor_id' as instructor_id_metadata,
  up.instructor_id as profile_instructor_id,
  i.name as instructor_name
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
LEFT JOIN instructors i ON i.id::text = u.raw_user_meta_data->>'instructor_id'
WHERE u.email = 'rahul@university.edu';

SELECT '✅ Rahul can now mark arrivals! Please logout and login again.' as message;
