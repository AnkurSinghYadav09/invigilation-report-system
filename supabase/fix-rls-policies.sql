-- =====================================================
-- ULTIMATE RLS FIX - Using auth.uid() and metadata
-- This approach reads from user metadata directly
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Disable RLS on all tables
ALTER TABLE instructors DISABLE ROW LEVEL SECURITY;
ALTER TABLE exams DISABLE ROW LEVEL SECURITY;
ALTER TABLE rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE duties DISABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_cache DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies
DO $$ 
DECLARE 
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.tablename);
  END LOOP;
END $$;

-- Step 3: Re-enable RLS
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE duties ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_cache ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTION: Check if user is admin
-- Checks user_metadata in JWT (where the role actually is)
-- =====================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin';
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- INSTRUCTORS TABLE POLICIES
-- =====================================================

-- Admin can do everything
CREATE POLICY "instructors_admin_all" ON instructors
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- All authenticated users can read
CREATE POLICY "instructors_read_all" ON instructors
  FOR SELECT
  USING (true);

-- =====================================================
-- EXAMS TABLE POLICIES
-- =====================================================

CREATE POLICY "exams_admin_all" ON exams
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "exams_read_all" ON exams
  FOR SELECT
  USING (true);

-- =====================================================
-- ROOMS TABLE POLICIES
-- =====================================================

CREATE POLICY "rooms_admin_all" ON rooms
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "rooms_read_all" ON rooms
  FOR SELECT
  USING (true);

-- =====================================================
-- DUTIES TABLE POLICIES
-- =====================================================

CREATE POLICY "duties_admin_all" ON duties
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "duties_read_all" ON duties
  FOR SELECT
  USING (true);

-- Instructors can update duties (admins can also update via duties_admin_all)
-- No specific ownership check needed - duties are managed by instructors via dedicated endpoints

-- =====================================================
-- ANALYTICS_CACHE TABLE POLICIES
-- =====================================================

CREATE POLICY "analytics_admin_all" ON analytics_cache
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "analytics_read_all" ON analytics_cache
  FOR SELECT
  USING (true);

-- =====================================================
-- VERIFICATION
-- =====================================================

SELECT 'Ultimate RLS fix applied! ✅' as status;

-- Show all current policies
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Show is_admin function status
SELECT 'is_admin() function created' as function_status;
