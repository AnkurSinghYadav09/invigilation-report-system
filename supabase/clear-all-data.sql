-- =====================================================
-- CLEAR ALL DATA - Fresh Start
-- Run this to remove all test/seed data from database
-- =====================================================

-- WARNING: This will delete ALL data from the system
-- Only run this if you want a completely fresh start

-- Clear all duties (this will cascade to related records)
TRUNCATE TABLE duties CASCADE;

-- Clear all instructors
TRUNCATE TABLE instructors CASCADE;

-- Clear all exams
TRUNCATE TABLE exams CASCADE;

-- Clear all rooms
TRUNCATE TABLE rooms CASCADE;

-- Clear user profiles (except admin)
DELETE FROM user_profiles WHERE email != 'admin@university.edu';

-- Keep only the admin user in auth.users
-- Note: This keeps admin@university.edu, removes all other users
DELETE FROM auth.users WHERE email != 'admin@university.edu';

-- Verification: Check remaining data
SELECT 'Remaining instructors:' as info, COUNT(*) as count FROM instructors
UNION ALL
SELECT 'Remaining exams:', COUNT(*) FROM exams
UNION ALL
SELECT 'Remaining rooms:', COUNT(*) FROM rooms
UNION ALL
SELECT 'Remaining duties:', COUNT(*) FROM duties
UNION ALL
SELECT 'Remaining users:', COUNT(*) FROM auth.users
UNION ALL
SELECT 'Remaining user_profiles:', COUNT(*) FROM user_profiles;

-- Success message
SELECT '✅ All test data cleared! Dashboard will now show empty.' as status;
