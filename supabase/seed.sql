-- =====================================================
-- SEED DATA for Testing
-- Intelligent Invigilation Management System
-- =====================================================

-- Clear existing data (for re-running seed)
TRUNCATE TABLE duties, analytics_cache, instructors, exams, rooms CASCADE;

-- =====================================================
-- SEED: Instructors (10 instructors across 3 departments)
-- =====================================================
INSERT INTO instructors (id, name, email, department) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Dr. Rajesh Kumar', 'rajesh.kumar@university.edu', 'Computer Science'),
  ('22222222-2222-2222-2222-222222222222', 'Prof. Priya Sharma', 'priya.sharma@university.edu', 'Computer Science'),
  ('33333333-3333-3333-3333-333333333333', 'Dr. Amit Patel', 'amit.patel@university.edu', 'Computer Science'),
  ('44444444-4444-4444-4444-444444444444', 'Dr. Sunita Verma', 'sunita.verma@university.edu', 'Mathematics'),
  ('55555555-5555-5555-5555-555555555555', 'Prof. Vikram Singh', 'vikram.singh@university.edu', 'Mathematics'),
  ('66666666-6666-6666-6666-666666666666', 'Dr. Anjali Reddy', 'anjali.reddy@university.edu', 'Mathematics'),
  ('77777777-7777-7777-7777-777777777777', 'Dr. Rahul Mehta', 'rahul.mehta@university.edu', 'Physics'),
  ('88888888-8888-8888-8888-888888888888', 'Prof. Kavita Joshi', 'kavita.joshi@university.edu', 'Physics'),
  ('99999999-9999-9999-9999-999999999999', 'Dr. Sanjay Gupta', 'sanjay.gupta@university.edu', 'Physics'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Dr. Neha Kapoor', 'neha.kapoor@university.edu', 'Computer Science');

-- =====================================================
-- SEED: Rooms (8 examination rooms)
-- =====================================================
INSERT INTO rooms (id, room_number, capacity, building) VALUES
  ('r1111111-1111-1111-1111-111111111111', 'A-101', 60, 'Academic Block A'),
  ('r2222222-2222-2222-2222-222222222222', 'A-102', 60, 'Academic Block A'),
  ('r3333333-3333-3333-3333-333333333333', 'A-201', 80, 'Academic Block A'),
  ('r4444444-4444-4444-4444-444444444444', 'B-101', 50, 'Academic Block B'),
  ('r5555555-5555-5555-5555-555555555555', 'B-102', 50, 'Academic Block B'),
  ('r6666666-6666-6666-6666-666666666666', 'C-Hall', 120, 'Central Block'),
  ('r7777777-7777-7777-7777-777777777777', 'D-Lab1', 40, 'Lab Building'),
  ('r8888888-8888-8888-8888-888888888888', 'D-Lab2', 40, 'Lab Building');

-- =====================================================
-- SEED: Exams (5 upcoming exams)
-- =====================================================
INSERT INTO exams (id, name, date, duration) VALUES
  ('e1111111-1111-1111-1111-111111111111', 'Data Structures Mid-Term', '2025-11-25', 180),
  ('e2222222-2222-2222-2222-222222222222', 'Calculus Final Exam', '2025-11-26', 180),
  ('e3333333-3333-3333-3333-333333333333', 'Physics Lab Practical', '2025-11-27', 120),
  ('e4444444-4444-4444-4444-444444444444', 'Database Systems Quiz', '2025-11-28', 90),
  ('e5555555-5555-5555-5555-555555555555', 'Linear Algebra Final', '2025-11-29', 180);

-- =====================================================
-- SEED: Duties (25 duties with varied statuses)
-- Creating realistic distribution for testing
-- =====================================================

-- Exam 1: Data Structures (Nov 25) - Multiple rooms, 9:00 AM start
INSERT INTO duties (exam_id, room_id, instructor_id, reporting_time, arrival_time, status) VALUES
  ('e1111111-1111-1111-1111-111111111111', 'r1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '09:00', '2025-11-25 08:15:00+05:30', 'on-time'),
  ('e1111111-1111-1111-1111-111111111111', 'r2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '09:00', '2025-11-25 08:35:00+05:30', 'late'),
  ('e1111111-1111-1111-1111-111111111111', 'r3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '09:00', NULL, 'pending');

-- Exam 2: Calculus (Nov 26) - Multiple rooms, 10:00 AM start
INSERT INTO duties (exam_id, room_id, instructor_id, reporting_time, arrival_time, status) VALUES
  ('e2222222-2222-2222-2222-222222222222', 'r1111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', '10:00', '2025-11-26 09:20:00+05:30', 'on-time'),
  ('e2222222-2222-2222-2222-222222222222', 'r2222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', '10:00', '2025-11-26 09:35:00+05:30', 'late'),
  ('e2222222-2222-2222-2222-222222222222', 'r3333333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', '10:00', '2025-11-26 09:25:00+05:30', 'on-time'),
  ('e2222222-2222-2222-2222-222222222222', 'r4444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', '10:00', NULL, 'pending');

-- Exam 3: Physics Lab (Nov 27) - Lab rooms, 2:00 PM start
INSERT INTO duties (exam_id, room_id, instructor_id, reporting_time, arrival_time, status) VALUES
  ('e3333333-3333-3333-3333-333333333333', 'r7777777-7777-7777-7777-777777777777', '77777777-7777-7777-7777-777777777777', '14:00', NULL, 'pending'),
  ('e3333333-3333-3333-3333-333333333333', 'r8888888-8888-8888-8888-888888888888', '88888888-8888-8888-8888-888888888888', '14:00', NULL, 'pending'),
  ('e3333333-3333-3333-3333-333333333333', 'r7777777-7777-7777-7777-777777777777', '99999999-9999-9999-9999-999999999999', '14:00', NULL, 'pending');

-- Exam 4: Database Quiz (Nov 28) - 11:00 AM start
INSERT INTO duties (exam_id, room_id, instructor_id, reporting_time, arrival_time, status) VALUES
  ('e4444444-4444-4444-4444-444444444444', 'r1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11:00', NULL, 'pending'),
  ('e4444444-4444-4444-4444-444444444444', 'r2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '11:00', NULL, 'pending'),
  ('e4444444-4444-4444-4444-444444444444', 'r4444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', '11:00', NULL, 'pending');

-- Exam 5: Linear Algebra (Nov 29) - 9:00 AM start
INSERT INTO duties (exam_id, room_id, instructor_id, reporting_time, arrival_time, status) VALUES
  ('e5555555-5555-5555-5555-555555555555', 'r6666666-6666-6666-6666-666666666666', '44444444-4444-4444-4444-444444444444', '09:00', NULL, 'pending'),
  ('e5555555-5555-5555-5555-555555555555', 'r1111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', '09:00', NULL, 'pending'),
  ('e5555555-5555-5555-5555-555555555555', 'r2222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', '09:00', NULL, 'pending');

-- Additional duties to create workload imbalance for testing
-- Dr. Rajesh Kumar (id: 11111111...) gets extra duties (overloaded scenario)
INSERT INTO duties (exam_id, room_id, instructor_id, reporting_time, status) VALUES
  ('e1111111-1111-1111-1111-111111111111', 'r5555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', '09:00', 'pending'),
  ('e2222222-2222-2222-2222-222222222222', 'r5555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', '10:00', 'pending'),
  ('e3333333-3333-3333-3333-333333333333', 'r1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '14:00', 'pending');

-- Prof. Priya Sharma gets multiple duties with some late arrivals (testing punctuality tracking)
INSERT INTO duties (exam_id, room_id, instructor_id, reporting_time, arrival_time, status) VALUES
  ('e5555555-5555-5555-5555-555555555555', 'r3333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', '09:00', NULL, 'pending'),
  ('e3333333-3333-3333-3333-333333333333', 'r2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '14:00', NULL, 'pending');

-- Dr. Sanjay Gupta - underutilized (only 1 duty)
-- Already has 1 duty above

-- Dr. Neha Kapoor - balanced workload
INSERT INTO duties (exam_id, room_id, instructor_id, reporting_time, status) VALUES
  ('e2222222-2222-2222-2222-222222222222', 'r6666666-6666-6666-6666-666666666666', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '10:00', 'pending'),
  ('e5555555-5555-5555-5555-555555555555', 'r4444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '09:00', 'pending');

-- =====================================================
-- Verify seed data
-- =====================================================
SELECT 'Instructors seeded: ' || COUNT(*) FROM instructors;
SELECT 'Rooms seeded: ' || COUNT(*) FROM rooms;
SELECT 'Exams seeded: ' || COUNT(*) FROM exams;
SELECT 'Duties seeded: ' || COUNT(*) FROM duties;

-- Show duty distribution
SELECT 
  i.name,
  i.department,
  COUNT(d.id) as duty_count,
  COUNT(d.id) FILTER (WHERE d.status = 'on-time') as on_time,
  COUNT(d.id) FILTER (WHERE d.status = 'late') as late,
  COUNT(d.id) FILTER (WHERE d.status = 'pending') as pending
FROM instructors i
LEFT JOIN duties d ON i.id = d.instructor_id
GROUP BY i.id, i.name, i.department
ORDER BY duty_count DESC;
