-- =====================================================
-- COMPLETE FIX: Auto-confirm emails on signup
-- Run this script in Supabase SQL Editor
-- =====================================================

-- Step 1: Create user_profiles table if not exists
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'pending' CHECK (role IN ('pending', 'admin', 'instructor')),
  instructor_id UUID REFERENCES instructors(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing policies if they exist
DROP POLICY IF EXISTS "user_profiles_admin_all" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_read_own" ON user_profiles;

-- Step 4: Create policies for user_profiles
CREATE POLICY "user_profiles_admin_all" ON user_profiles
  FOR ALL
  USING ((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin')
  WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin');

CREATE POLICY "user_profiles_read_own" ON user_profiles
  FOR SELECT
  USING (id = auth.uid());

-- Step 5: Create/Replace function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-confirm email immediately (confirmed_at is auto-generated from email_confirmed_at)
  UPDATE auth.users
  SET email_confirmed_at = NOW()
  WHERE id = NEW.id;

  -- Create user profile
  INSERT INTO user_profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'pending')
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Step 7: Confirm all existing users (for Rahul and any others)
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;

-- Step 8: Migrate existing users to user_profiles if not already there
INSERT INTO user_profiles (id, email, name, role)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'name', ''),
  COALESCE(raw_user_meta_data->>'role', 'pending')
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Step 9: Verify everything is set up correctly
SELECT 'Setup completed! ✅' as status;

-- Show all users and their confirmation status
SELECT 
  email,
  email_confirmed_at IS NOT NULL as is_confirmed,
  raw_user_meta_data->>'role' as role,
  raw_user_meta_data->>'name' as name
FROM auth.users
ORDER BY email;
