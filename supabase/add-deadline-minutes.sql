-- Add deadline_minutes column to duties table
-- This allows admins to set custom arrival deadlines per duty
-- Default is 30 minutes before reporting time

ALTER TABLE duties 
ADD COLUMN IF NOT EXISTS deadline_minutes INTEGER DEFAULT 30;

COMMENT ON COLUMN duties.deadline_minutes IS 'Minutes before reporting time that instructor must arrive to be on-time (default: 30)';
