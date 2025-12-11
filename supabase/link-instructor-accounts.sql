-- =====================================================
-- AUTO-LINK INSTRUCTOR ACCOUNTS
-- Automatically links instructor user accounts when they sign up
-- =====================================================

-- Function to link instructor account based on email
CREATE OR REPLACE FUNCTION link_instructor_account()
RETURNS TRIGGER AS $$
DECLARE
  instructor_record RECORD;
BEGIN
  -- Check if a matching instructor exists with this email
  SELECT id INTO instructor_record
  FROM public.instructors
  WHERE email = NEW.email;

  -- If instructor found, update user metadata
  IF FOUND THEN
    -- Update the user's raw_user_meta_data to include instructor_id
    UPDATE auth.users
    SET raw_user_meta_data = 
      COALESCE(raw_user_meta_data, '{}'::jsonb) || 
      jsonb_build_object(
        'instructor_id', instructor_record.id::text,
        'role', 'instructor'
      )
    WHERE id = NEW.id;

    RAISE NOTICE 'Linked user % to instructor %', NEW.email, instructor_record.id;
  ELSE
    RAISE NOTICE 'No instructor found for email %', NEW.email;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-link on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION link_instructor_account();

-- =====================================================
-- MANUAL LINKING FUNCTION
-- For admins to manually link an existing user to instructor
-- =====================================================
CREATE OR REPLACE FUNCTION manually_link_instructor(
  user_email TEXT,
  instructor_email TEXT
)
RETURNS TEXT AS $$
DECLARE
  instructor_record RECORD;
  user_record RECORD;
BEGIN
  -- Find instructor by email
  SELECT id INTO instructor_record
  FROM public.instructors
  WHERE email = instructor_email;

  IF NOT FOUND THEN
    RETURN 'ERROR: No instructor found with email ' || instructor_email;
  END IF;

  -- Find user by email
  SELECT id INTO user_record
  FROM auth.users
  WHERE email = user_email;

  IF NOT FOUND THEN
    RETURN 'ERROR: No user account found with email ' || user_email;
  END IF;

  -- Update user metadata
  UPDATE auth.users
  SET raw_user_meta_data = 
    COALESCE(raw_user_meta_data, '{}'::jsonb) || 
    jsonb_build_object(
      'instructor_id', instructor_record.id::text,
      'role', 'instructor'
    )
  WHERE id = user_record.id;

  RETURN 'SUCCESS: Linked user ' || user_email || ' to instructor ' || instructor_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VERIFICATION QUERY
-- Check which instructors have linked accounts
-- =====================================================
COMMENT ON FUNCTION link_instructor_account() IS 'Automatically links instructor accounts when users sign up with matching email';
COMMENT ON FUNCTION manually_link_instructor(TEXT, TEXT) IS 'Manually link a user account to an instructor record';

-- Example usage of manual linking:
-- SELECT manually_link_instructor('user@example.com', 'instructor@example.com');
