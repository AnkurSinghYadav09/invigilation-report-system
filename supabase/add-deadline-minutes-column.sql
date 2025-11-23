-- =====================================================
-- ADD DEADLINE MINUTES TO DUTIES TABLE
-- Run this ONCE in Supabase SQL Editor
-- =====================================================

-- Add deadline_minutes column to duties table
ALTER TABLE duties 
ADD COLUMN deadline_minutes INTEGER DEFAULT 30;

-- Add comment explaining the column
COMMENT ON COLUMN duties.deadline_minutes IS 'Minutes before reporting_time that instructor must arrive by to be marked on-time';

SELECT '✅ Added deadline_minutes column to duties table' as status;
