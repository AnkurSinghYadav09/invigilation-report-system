-- Manually confirm Rahul's email address
-- Run this in Supabase SQL Editor

-- Confirm the email for rahul.mehta@university.edu
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'rahul.mehta@university.edu';

-- Verify the update
SELECT 
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  raw_user_meta_data->>'role' as role
FROM auth.users
WHERE email = 'rahul.mehta@university.edu';

SELECT 'Rahul email confirmed! ✅' as status;
