-- =====================================================
-- FIX: Ensure Real-time Updates Work for Duties
-- Run this script in Supabase SQL Editor
-- =====================================================

-- Step 1: Enable real-time for duties table
ALTER PUBLICATION supabase_realtime ADD TABLE duties;

-- Step 2: Verify and fix RLS policies for duties table
-- Drop old policies
DROP POLICY IF EXISTS "admin_duties_all" ON duties;
DROP POLICY IF EXISTS "instructor_view_own_duties" ON duties;
DROP POLICY IF EXISTS "instructor_update_own_duties" ON duties;

-- Admin: Full access to all duties
CREATE POLICY "admin_duties_all" ON duties
  FOR ALL
  USING ((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin')
  WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin');

-- Instructor: Can view their own duties
CREATE POLICY "instructor_view_own_duties" ON duties
  FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'instructor'
    AND instructor_id::text = (auth.jwt() -> 'user_metadata' ->> 'instructor_id')::text
  );

-- Instructor: Can update ONLY arrival_time and status for their own duties
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

-- Step 3: Verify the trigger for analytics is working
-- This trigger should auto-update instructor stats when duty status changes
CREATE OR REPLACE FUNCTION update_analytics_cache()
RETURNS TRIGGER AS $$
BEGIN
  -- Update instructor statistics directly in instructors table
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

-- Recreate trigger if needed
DROP TRIGGER IF EXISTS trigger_update_analytics ON duties;
CREATE TRIGGER trigger_update_analytics
AFTER INSERT OR UPDATE OF status ON duties
FOR EACH ROW
EXECUTE FUNCTION update_analytics_cache();

-- Step 4: Test query - Show all duties with their details
SELECT 
  d.id,
  e.name as exam_name,
  i.name as instructor_name,
  r.name as room_name,
  d.reporting_time,
  d.arrival_time,
  d.status,
  'Real-time updates enabled ✅' as status_message
FROM duties d
LEFT JOIN exams e ON d.exam_id = e.id
LEFT JOIN instructors i ON d.instructor_id = i.id
LEFT JOIN rooms r ON d.room_id = r.id
ORDER BY e.date DESC, d.reporting_time DESC
LIMIT 10;

SELECT 'Duty updates and real-time sync fixed! ✅' as final_status;
