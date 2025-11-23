-- =====================================================
-- COMPLETE SIGNUP FIX - Remove ALL blockers
-- Run this to fix "Database error saving new user"
-- =====================================================

-- Step 1: Remove ANY triggers on auth.users
DO $$
DECLARE
  trigger_record RECORD;
BEGIN
  FOR trigger_record IN 
    SELECT trigger_name 
    FROM information_schema.triggers 
    WHERE event_object_table = 'users' 
      AND event_object_schema = 'auth'
      AND trigger_name NOT LIKE 'trigger_%' -- Keep Supabase internal triggers
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON auth.users CASCADE', trigger_record.trigger_name);
    RAISE NOTICE 'Dropped trigger: %', trigger_record.trigger_name;
  END LOOP;
END $$;

-- Step 2: Remove any custom functions that might be interfering
DROP FUNCTION IF EXISTS auto_confirm_user() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Step 3: Check what triggers remain (should only be Supabase internal ones)
SELECT 
  'Remaining triggers on auth.users:' as info,
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users'
  AND event_object_schema = 'auth'
ORDER BY trigger_name;

-- Step 4: Test user creation manually (if this works, signup should work)
-- This will fail if email confirmation is required
-- Uncomment to test:
/*
DO $$
BEGIN
  -- Try to insert a test user (will fail if confirmation required)
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'test_' || gen_random_uuid() || '@example.com',
    crypt('password123', gen_salt('bf')),
    now(), -- Auto-confirm
    '{"role": "pending", "name": "Test User"}'::jsonb,
    now(),
    now()
  );
  
  RAISE NOTICE 'Test user created successfully! Signup should work.';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Test user creation failed: %', SQLERRM;
    RAISE NOTICE 'This means email confirmation is required or there is an RLS policy blocking it.';
END $$;
*/

-- =====================================================
-- RESULTS & NEXT STEPS
-- =====================================================

SELECT '✅ Cleanup complete!' as status;
SELECT '⚠️ NEXT STEP: You MUST disable email confirmation in Supabase Dashboard' as important;
SELECT 'Go to: Auth → Providers → Email → Turn OFF "Confirm email"' as instruction;
SELECT 'Then try signing up again!' as final_step;

-- Verify no custom triggers remain
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ No custom triggers found - good!'
    ELSE '⚠️ Custom triggers still exist - check output above'
  END as trigger_status
FROM information_schema.triggers
WHERE event_object_table = 'users'
  AND event_object_schema = 'auth'
  AND trigger_name NOT LIKE 'trigger_%';
