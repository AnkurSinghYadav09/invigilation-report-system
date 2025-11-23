-- =====================================================
-- QUICK FIX: Link testing02@newtonschool.co RIGHT NOW
-- =====================================================

-- Step 1: Check current status
SELECT 
  'Current Status:' as info,
  u.email,
  u.raw_user_meta_data->>'role' as role,
  u.raw_user_meta_data->>'instructor_id' as current_instructor_id,
  i.id as actual_instructor_id,
  i.name as instructor_name
FROM auth.users u
LEFT JOIN instructors i ON i.email = u.email
WHERE u.email = 'testing02@newtonschool.co';

-- Step 2: Link the account manually
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{instructor_id}',
  (SELECT to_jsonb(id::text) FROM instructors WHERE email = 'testing02@newtonschool.co')
)
WHERE email = 'testing02@newtonschool.co';

-- Step 3: Verify the link
SELECT 
  'After Linking:' as info,
  u.email,
  u.raw_user_meta_data->>'role' as role,
  u.raw_user_meta_data->>'instructor_id' as instructor_id,
  i.id::text as instructor_table_id,
  CASE 
    WHEN u.raw_user_meta_data->>'instructor_id' = i.id::text THEN '✅ Linked correctly!'
    ELSE '❌ Still not linked - check if instructor exists'
  END as status
FROM auth.users u
LEFT JOIN instructors i ON i.email = u.email
WHERE u.email = 'testing02@newtonschool.co';

-- =====================================================
-- NEXT: Make it work automatically for future instructors
-- =====================================================

-- Check if auto-link trigger exists
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Auto-link trigger exists'
    ELSE '❌ Auto-link trigger NOT created yet - run auto-link-instructors.sql!'
  END as trigger_status
FROM information_schema.triggers
WHERE event_object_table = 'instructors'
  AND trigger_name = 'trigger_link_instructor_to_user';

-- =====================================================
-- WHAT TO DO AFTER RUNNING THIS:
-- =====================================================

SELECT '📝 Next steps:' as todo;
SELECT '1. Run this entire SQL file' as step_1;
SELECT '2. See ✅ Linked correctly! above' as step_2;
SELECT '3. Tell user to LOGOUT completely (close browser tab)' as step_3;
SELECT '4. Tell user to LOGIN again' as step_4;
SELECT '5. User should now see their duties!' as step_5;
SELECT '6. Then run: supabase/auto-link-instructors.sql for future auto-linking' as step_6;
