-- Create a users table to track all registered users
-- This allows admin to manage users without needing service role key

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'pending' CHECK (role IN ('pending', 'admin', 'instructor')),
  instructor_id UUID REFERENCES instructors(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "user_profiles_admin_all" ON user_profiles
  FOR ALL
  USING ((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin')
  WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin');

-- Users can read their own profile
CREATE POLICY "user_profiles_read_own" ON user_profiles
  FOR SELECT
  USING (id = auth.uid());

-- Function to automatically create user profile on signup
-- AND auto-confirm email for seamless login
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-confirm email immediately (confirmed_at is auto-generated)
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

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Migrate existing users to user_profiles
INSERT INTO user_profiles (id, email, name, role)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'name', ''),
  COALESCE(raw_user_meta_data->>'role', 'pending')
FROM auth.users
ON CONFLICT (id) DO NOTHING;

SELECT 'User profiles table created successfully! ✅' as status;
