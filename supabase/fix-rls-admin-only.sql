-- =====================================================
-- CRITICAL RLS FIX - ADMIN ONLY SIMPLIFIED
-- Run this EXACTLY in Supabase SQL Editor
-- =====================================================

-- Step 1: Disable RLS temporarily to see if that's the issue
ALTER TABLE instructors DISABLE ROW LEVEL SECURITY;
ALTER TABLE exams DISABLE ROW LEVEL SECURITY;
ALTER TABLE rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE duties DISABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_cache DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies
DO $$ 
DECLARE 
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.tablename);
  END LOOP;
END $$;

-- Step 3: Enable RLS again
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE duties ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_cache ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- INSTRUCTORS TABLE - SIMPLE POLICIES
-- =====================================================

-- Everyone with admin role can do everything
CREATE POLICY "admin_all" ON instructors
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Authenticated users can read
CREATE POLICY "auth_read" ON instructors
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- =====================================================
-- EXAMS TABLE - SIMPLE POLICIES
-- =====================================================

CREATE POLICY "admin_all" ON exams
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "auth_read" ON exams
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- =====================================================
-- ROOMS TABLE - SIMPLE POLICIES
-- =====================================================

CREATE POLICY "admin_all" ON rooms
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "auth_read" ON rooms
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- =====================================================
-- DUTIES TABLE - SIMPLE POLICIES
-- =====================================================

CREATE POLICY "admin_all" ON duties
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "auth_read" ON duties
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Instructors can update their own duties
CREATE POLICY "instructor_own_duties" ON duties
  FOR UPDATE
  USING (
    auth.role() = 'authenticated'
    AND instructor_id = (auth.jwt() ->> 'instructor_id')::uuid
  )
  WITH CHECK (
    auth.role() = 'authenticated'
    AND instructor_id = (auth.jwt() ->> 'instructor_id')::uuid
  );

-- =====================================================
-- ANALYTICS_CACHE TABLE - SIMPLE POLICIES
-- =====================================================

CREATE POLICY "admin_all" ON analytics_cache
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "auth_read" ON analytics_cache
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- =====================================================
-- VERIFICATION
-- =====================================================

SELECT 'RLS policies applied successfully! ✅' as status;

-- Show all policies
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
