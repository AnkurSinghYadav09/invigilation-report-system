-- =====================================================
-- AUTO-LINK INSTRUCTOR ACCOUNTS
-- When an instructor is created/updated, automatically link
-- to user account if email matches
-- =====================================================

-- Function: Link instructor to user account by email
CREATE OR REPLACE FUNCTION link_instructor_to_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if there's a user account with this email
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{instructor_id}',
    to_jsonb(NEW.id::text)
  )
  WHERE email = NEW.email
    AND (raw_user_meta_data->>'role')::text = 'instructor';

  -- Log if we linked an account
  IF FOUND THEN
    RAISE NOTICE 'Linked instructor % to user account with email %', NEW.id, NEW.email;
  ELSE
    RAISE NOTICE 'No matching user account found for email %', NEW.email;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger on instructors table
DROP TRIGGER IF EXISTS trigger_link_instructor_to_user ON instructors;

CREATE TRIGGER trigger_link_instructor_to_user
  AFTER INSERT OR UPDATE OF email
  ON instructors
  FOR EACH ROW
  EXECUTE FUNCTION link_instructor_to_user();

-- =====================================================
-- ALSO: Function to manually link instructor accounts
-- Run this to link all existing instructors to accounts
-- =====================================================

CREATE OR REPLACE FUNCTION link_all_instructors()
RETURNS TABLE(
  instructor_email TEXT,
  instructor_id UUID,
  linked BOOLEAN,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH updates AS (
    UPDATE auth.users u
    SET raw_user_meta_data = jsonb_set(
      COALESCE(u.raw_user_meta_data, '{}'::jsonb),
      '{instructor_id}',
      to_jsonb(i.id::text)
    )
    FROM instructors i
    WHERE u.email = i.email
      AND (u.raw_user_meta_data->>'role')::text = 'instructor'
      AND COALESCE(u.raw_user_meta_data->>'instructor_id', '') = ''
    RETURNING i.email, i.id, true as linked
  )
  SELECT 
    i.email::TEXT,
    i.id,
    CASE 
      WHEN u.linked IS NOT NULL THEN true 
      ELSE false 
    END as linked,
    CASE 
      WHEN u.linked IS NOT NULL THEN 'Successfully linked'
      WHEN EXISTS(SELECT 1 FROM auth.users WHERE email = i.email) THEN 'User exists but role is not instructor'
      ELSE 'No user account found with this email'
    END::TEXT as message
  FROM instructors i
  LEFT JOIN updates u ON u.email = i.email;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION link_all_instructors() TO authenticated;

-- =====================================================
-- RUN THIS TO LINK ALL EXISTING INSTRUCTORS
-- =====================================================

SELECT '✅ Trigger created - new instructors will auto-link to accounts!' as status;
SELECT 'Run: SELECT * FROM link_all_instructors(); to link existing instructors' as next_step;

-- Uncomment to link all existing instructors now:
-- SELECT * FROM link_all_instructors();
