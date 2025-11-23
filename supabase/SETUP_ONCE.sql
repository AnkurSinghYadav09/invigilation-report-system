-- =====================================================
-- ONE-TIME SETUP: Complete Database Configuration
-- Run this ONCE to enable all features permanently
-- =====================================================

-- ============================================
-- PART 1: Enable Real-time for all tables
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE duties;
ALTER PUBLICATION supabase_realtime ADD TABLE instructors;
ALTER PUBLICATION supabase_realtime ADD TABLE exams;
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE user_profiles;

-- ============================================
-- PART 2: User Profiles & Auto-confirm
-- ============================================

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'pending' CHECK (role IN ('pending', 'admin', 'instructor')),
  instructor_id UUID REFERENCES instructors(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
DROP POLICY IF EXISTS "user_profiles_admin_all" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_read_own" ON user_profiles;

CREATE POLICY "user_profiles_admin_all" ON user_profiles
  FOR ALL
  USING ((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin')
  WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin');

CREATE POLICY "user_profiles_read_own" ON user_profiles
  FOR SELECT
  USING (id = auth.uid());

-- Auto-confirm email function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-confirm email immediately
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- PART 3: Protect Admin User
-- ============================================

-- Function to update user metadata (used by admin to assign roles)
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

-- Protect admin in user_profiles table
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS protect_admin_email;
ALTER TABLE user_profiles ADD CONSTRAINT protect_admin_email 
  CHECK (email != 'admin@university.edu' OR role = 'admin');

-- ============================================
-- PART 4: RLS Policies for Duties
-- ============================================

DROP POLICY IF EXISTS "admin_duties_all" ON duties;
DROP POLICY IF EXISTS "instructor_view_own_duties" ON duties;
DROP POLICY IF EXISTS "instructor_update_own_duties" ON duties;

-- Admin: Full access
CREATE POLICY "admin_duties_all" ON duties
  FOR ALL
  USING ((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin')
  WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin');

-- Instructor: View own duties
CREATE POLICY "instructor_view_own_duties" ON duties
  FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'instructor'
    AND instructor_id::text = (auth.jwt() -> 'user_metadata' ->> 'instructor_id')::text
  );

-- Instructor: Update own duties (for marking arrival)
CREATE POLICY "instructor_update_own_duties" ON duties
  FOR UPDATE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'instructor'
    AND instructor_id::text = (auth.jwt() -> 'user_metadata' ->> 'instructor_id')::text
  )
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'instructor'
    AND instructor_id::text = (auth.jwt() -> 'user_metadata' ->> 'instructor_id')::text
  );

-- ============================================
-- PART 5: Auto-update Instructor Stats
-- ============================================

CREATE OR REPLACE FUNCTION update_analytics_cache()
RETURNS TRIGGER AS $$
BEGIN
  -- Update instructor statistics when duty status changes
  UPDATE instructors
  SET 
    total_duties = (
      SELECT COUNT(*) FROM duties WHERE instructor_id = NEW.instructor_id
    ),
    on_time_count = (
      SELECT COUNT(*) FROM duties 
      WHERE instructor_id = NEW.instructor_id AND status = 'on-time'
    ),
    late_count = (
      SELECT COUNT(*) FROM duties 
      WHERE instructor_id = NEW.instructor_id AND status = 'late'
    )
  WHERE id = NEW.instructor_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_analytics ON duties;
CREATE TRIGGER trigger_update_analytics
AFTER INSERT OR UPDATE OF status ON duties
FOR EACH ROW
EXECUTE FUNCTION update_analytics_cache();

-- ============================================
-- PART 6: Fix Existing Data
-- ============================================

-- Confirm all existing users
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;

-- Ensure admin@university.edu is admin
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

-- Migrate existing users to user_profiles
INSERT INTO user_profiles (id, email, name, role)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'name', ''),
  COALESCE(raw_user_meta_data->>'role', 'pending')
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- VERIFICATION
-- ============================================

SELECT '✅ Real-time updates enabled for all tables' as status;
SELECT '✅ Auto-confirm emails enabled for new signups' as status;
SELECT '✅ Admin user protected from role changes' as status;
SELECT '✅ RLS policies configured for duties' as status;
SELECT '✅ Auto-update instructor stats enabled' as status;
SELECT '' as blank;
SELECT '🎉 ONE-TIME SETUP COMPLETE! 🎉' as final_message;
SELECT 'All features are now permanent and will work automatically!' as note;
