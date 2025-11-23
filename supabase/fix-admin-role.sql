-- =====================================================
-- FIX: Set admin@university.edu as permanent admin
-- Run this script in Supabase SQL Editor
-- =====================================================

-- Update user_metadata to set role as admin
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@university.edu';

-- Update user_profiles table to reflect admin role
UPDATE user_profiles
SET role = 'admin'
WHERE email = 'admin@university.edu';

-- Verify the changes
SELECT 
  email,
  raw_user_meta_data->>'role' as user_metadata_role,
  raw_user_meta_data->>'name' as name
FROM auth.users
WHERE email = 'admin@university.edu';

SELECT 
  email,
  role as profile_role,
  name
FROM user_profiles
WHERE email = 'admin@university.edu';

SELECT 'Admin role fixed! ✅ Please logout and login again.' as status;
