-- Confirm ALL user emails (useful for development)
-- Run this in Supabase SQL Editor

UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;

-- Show all users and their confirmation status
SELECT 
  email,
  email_confirmed_at IS NOT NULL as is_confirmed,
  raw_user_meta_data->>'role' as role
FROM auth.users
ORDER BY email;

SELECT 'All emails confirmed! ✅' as status;
