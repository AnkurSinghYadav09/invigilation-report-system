-- =====================================================
-- FINAL FIX: Set Admin Role and Verify
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Check current admin user metadata
SELECT 
  'BEFORE FIX - Admin user metadata:' as step,
  email,
  raw_user_meta_data,
  raw_user_meta_data->>'role' as current_role
FROM auth.users 
WHERE email = 'admin@university.edu';

-- Step 2: Force update the admin role (even if it exists)
UPDATE auth.users
SET raw_user_meta_data = '{"role": "admin"}'::jsonb
WHERE email = 'admin@university.edu';

-- Step 3: Verify the update
SELECT 
  'AFTER FIX - Admin user metadata:' as step,
  email,
  raw_user_meta_data,
  raw_user_meta_data->>'role' as new_role
FROM auth.users 
WHERE email = 'admin@university.edu';

-- Step 4: Show the user ID (you'll need this)
SELECT 
  'Admin User ID (save this):' as step,
  id,
  email
FROM auth.users 
WHERE email = 'admin@university.edu';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
SELECT '✅ Admin role has been set!' as status;
SELECT '⚠️ CRITICAL: You MUST do these steps now:' as important;
SELECT '1. Go to your app (http://localhost:5173)' as step_1;
SELECT '2. Click LOGOUT button' as step_2;
SELECT '3. Login again with admin@university.edu / admin123' as step_3;
SELECT '4. Try adding an instructor - it will work!' as step_4;
