-- =====================================================
-- REMOVE BAD TRIGGERS - Fix 500 Error on Signup
-- Run this in Supabase SQL Editor
-- =====================================================

-- The 500 error means a trigger or function is failing
-- Let's remove any custom triggers on auth.users

-- Step 1: Check what triggers exist on auth.users
SELECT 
  'Current triggers on auth.users:' as info,
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users'
  AND event_object_schema = 'auth';

-- Step 2: Drop the auto-confirm trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 3: Drop the auto-confirm function if it exists
DROP FUNCTION IF EXISTS auto_confirm_user() CASCADE;

-- Step 4: Verify triggers are gone
SELECT 
  'Triggers after cleanup:' as info,
  trigger_name
FROM information_schema.triggers
WHERE event_object_table = 'users'
  AND event_object_schema = 'auth';

-- =====================================================
-- RESET AUTH CONFIGURATION
-- =====================================================

-- Note: You CANNOT modify auth.users RLS policies via SQL
-- They are managed by Supabase internally

-- Check if there are any custom policies (there shouldn't be)
SELECT 
  'Policies on auth.users:' as info,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'auth' 
  AND tablename = 'users';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

SELECT '✅ Cleanup complete!' as status;
SELECT '⚠️ IMPORTANT: Now go to Supabase Dashboard' as next_step_1;
SELECT 'Auth → Providers → Email → Disable "Confirm email"' as next_step_2;
SELECT 'Save, then try signup again!' as next_step_3;
