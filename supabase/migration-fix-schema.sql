-- =====================================================
-- QUICK FIX MIGRATION
-- Run this in Supabase SQL Editor to fix the schema
-- =====================================================

-- Step 1: Add missing columns to instructors table
ALTER TABLE instructors 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS on_time_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS late_count INTEGER DEFAULT 0;

-- Step 2: Add missing columns to exams table
ALTER TABLE exams 
ADD COLUMN IF NOT EXISTS start_time TIME,
ADD COLUMN IF NOT EXISTS end_time TIME,
ADD COLUMN IF NOT EXISTS subject TEXT,
ADD COLUMN IF NOT EXISTS course_code TEXT;

-- Step 3: Fix rooms table (rename column if it exists)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'rooms' AND column_name = 'room_number'
  ) THEN
    ALTER TABLE rooms RENAME COLUMN room_number TO name;
  END IF;
END $$;

-- Step 4: Add floor column to rooms
ALTER TABLE rooms 
ADD COLUMN IF NOT EXISTS floor TEXT;

-- Step 5: Make building NOT NULL if it isn't already
ALTER TABLE rooms 
ALTER COLUMN building SET NOT NULL;

-- Step 6: Update the duties_detailed view
DROP VIEW IF EXISTS duties_detailed CASCADE;
CREATE OR REPLACE VIEW duties_detailed AS
SELECT 
  d.id,
  d.reporting_time,
  d.arrival_time,
  d.status,
  d.created_at,
  e.id as exam_id,
  e.name as exam_name,
  e.date as exam_date,
  e.start_time,
  e.end_time,
  r.id as room_id,
  r.name as room_name,
  r.capacity as room_capacity,
  r.building,
  i.id as instructor_id,
  i.name as instructor_name,
  i.email as instructor_email,
  i.department
FROM duties d
JOIN exams e ON d.exam_id = e.id
JOIN rooms r ON d.room_id = r.id
JOIN instructors i ON d.instructor_id = i.id;

-- Step 7: Update the instructor_stats view
DROP VIEW IF EXISTS instructor_stats CASCADE;
CREATE OR REPLACE VIEW instructor_stats AS
SELECT 
  i.id,
  i.name,
  i.email,
  i.department,
  i.phone,
  i.total_duties,
  i.on_time_count,
  i.late_count,
  CASE 
    WHEN i.total_duties > 0 THEN 
      ROUND((i.on_time_count::NUMERIC / i.total_duties::NUMERIC) * 100, 2)
    ELSE 0
  END as punctuality_percentage
FROM instructors i;

-- Step 8: Update the analytics function
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
$$ LANGUAGE plpgsql;

-- =====================================================
-- VERIFICATION
-- =====================================================
SELECT 'Migration complete! ✅' as status;

-- Show the updated table structures
SELECT 'Instructors table columns:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'instructors' 
ORDER BY ordinal_position;

SELECT 'Exams table columns:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'exams' 
ORDER BY ordinal_position;

SELECT 'Rooms table columns:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'rooms' 
ORDER BY ordinal_position;

SELECT 'Now refresh your app (F5) and try creating an instructor!' as next_step;
