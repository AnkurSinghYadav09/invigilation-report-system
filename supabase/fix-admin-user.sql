-- ============================================
-- STEP 1: Verify if user exists
-- ============================================
-- Run this first to check if the admin user exists
SELECT id, email, raw_user_meta_data, created_at
FROM auth.users
WHERE email = 'admin@university.edu';

-- If you see a result, the user exists. If not, you need to create it via the Supabase UI.


-- ============================================
-- STEP 2: Set Admin Role (if user exists)
-- ============================================
-- Run this to set the admin role
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object('role', 'admin')
WHERE email = 'admin@university.edu';


-- ============================================
-- STEP 3: Verify the role was set
-- ============================================
-- Run this to confirm
SELECT email, raw_user_meta_data
FROM auth.users
WHERE email = 'admin@university.edu';

-- You should see: {"role": "admin"} in the raw_user_meta_data column


-- ============================================
-- ALTERNATIVE: If user doesn't exist
-- ============================================
-- You CANNOT create auth users via SQL in newer Supabase versions.
-- You MUST use the Supabase Dashboard:
--
-- 1. Go to: https://app.supabase.com/project/kvjvurositoxndvjuckb/auth/users
-- 2. Click "Add User" → "Create new user"
-- 3. Email: admin@university.edu
-- 4. Password: admin123 (or your choice)
-- 5. Check "Auto Confirm User" ✓
-- 6. Click "Create user"
-- 7. Then run STEP 2 above to set the role


-- ============================================
-- TROUBLESHOOTING: Reset password if needed
-- ============================================
-- If the user exists but password is wrong, you can reset it in the dashboard:
-- 1. Go to Authentication → Users
-- 2. Find admin@university.edu
-- 3. Click the three dots (•••) on the right
-- 4. Click "Reset Password"
-- 5. Set new password: admin123
