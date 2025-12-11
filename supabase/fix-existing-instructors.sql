-- =====================================================
-- FIX EXISTING INSTRUCTOR ACCOUNTS
-- One-time migration to link existing instructors
-- =====================================================

-- Update all existing users who have matching instructor emails
DO $$
DECLARE
  instructor_record RECORD;
  user_record RECORD;
  linked_count INTEGER := 0;
  total_instructors INTEGER := 0;
BEGIN
  -- Count total instructors
  SELECT COUNT(*) INTO total_instructors FROM public.instructors;
  
  RAISE NOTICE '=== Starting instructor account linking ===';
  RAISE NOTICE 'Total instructors in database: %', total_instructors;
  RAISE NOTICE '';

  -- Loop through all instructors
  FOR instructor_record IN 
    SELECT id, email, name FROM public.instructors
  LOOP
    -- Try to find matching user account
    SELECT id, email INTO user_record
    FROM auth.users
    WHERE email = instructor_record.email;

    IF FOUND THEN
      -- Check if already linked
      IF (
        SELECT raw_user_meta_data->>'instructor_id' 
        FROM auth.users 
        WHERE id = user_record.id
      ) IS NULL THEN
        -- Link the account
        UPDATE auth.users
        SET raw_user_meta_data = 
          COALESCE(raw_user_meta_data, '{}'::jsonb) || 
          jsonb_build_object(
            'instructor_id', instructor_record.id::text,
            'role', 'instructor'
          )
        WHERE id = user_record.id;

        linked_count := linked_count + 1;
        RAISE NOTICE '✅ Linked: % (%) -> instructor_id: %', 
          instructor_record.name, 
          instructor_record.email,
          instructor_record.id;
      ELSE
        RAISE NOTICE '⏭️  Already linked: % (%)', 
          instructor_record.name, 
          instructor_record.email;
      END IF;
    ELSE
      RAISE NOTICE '⚠️  No user account found for: % (%)', 
        instructor_record.name, 
        instructor_record.email;
    END IF;
  END LOOP;

  RAISE NOTICE '';
  RAISE NOTICE '=== Migration Complete ===';
  RAISE NOTICE 'Total instructors: %', total_instructors;
  RAISE NOTICE 'Newly linked accounts: %', linked_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Instructors with linked accounts should logout and login again';
  RAISE NOTICE '2. Instructors without accounts need to sign up using their instructor email';
END $$;

-- =====================================================
-- VERIFICATION QUERY
-- Show linking status for all instructors
-- =====================================================
SELECT 
  i.name,
  i.email,
  i.department,
  CASE 
    WHEN u.id IS NOT NULL THEN '✅ Linked'
    ELSE '❌ Not Linked'
  END as account_status,
  u.email as user_email,
  (u.raw_user_meta_data->>'instructor_id')::uuid as linked_instructor_id,
  CASE 
    WHEN (u.raw_user_meta_data->>'instructor_id')::uuid = i.id THEN '✅ Correct'
    WHEN u.id IS NOT NULL THEN '⚠️ Mismatch'
    ELSE '-'
  END as link_validation
FROM public.instructors i
LEFT JOIN auth.users u ON u.email = i.email
ORDER BY 
  CASE 
    WHEN u.id IS NOT NULL THEN 1
    ELSE 2
  END,
  i.name;
