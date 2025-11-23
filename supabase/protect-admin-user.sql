-- =====================================================
-- PROTECT ADMIN & CREATE METADATA UPDATE FUNCTION
-- Run this script in Supabase SQL Editor
-- =====================================================

-- Step 1: Create function to update user metadata
-- This allows admin to update other users' metadata properly
CREATE OR REPLACE FUNCTION update_user_metadata(
  user_id UUID,
  new_role TEXT,
  new_instructor_id UUID DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- Protect admin@university.edu from role changes
  IF EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = user_id AND email = 'admin@university.edu' AND new_role != 'admin'
  ) THEN
    RAISE EXCEPTION 'Cannot change the role of admin@university.edu';
  END IF;

  -- Update user metadata
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_set(
    jsonb_set(
      COALESCE(raw_user_meta_data, '{}'::jsonb),
      '{role}',
      to_jsonb(new_role)
    ),
    '{instructor_id}',
    CASE 
      WHEN new_instructor_id IS NULL THEN 'null'::jsonb
      ELSE to_jsonb(new_instructor_id::text)
    END
  )
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Add constraint to user_profiles to protect admin
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS protect_admin_email;
ALTER TABLE user_profiles ADD CONSTRAINT protect_admin_email 
  CHECK (email != 'admin@university.edu' OR role = 'admin');

-- Step 3: Ensure admin@university.edu is set correctly NOW
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@university.edu';

UPDATE user_profiles
SET role = 'admin'
WHERE email = 'admin@university.edu';

-- Step 4: Verify admin is protected
SELECT 
  email,
  raw_user_meta_data->>'role' as metadata_role,
  'Protected ✅' as status
FROM auth.users
WHERE email = 'admin@university.edu';

SELECT 'Admin protection enabled! ✅' as final_status;
