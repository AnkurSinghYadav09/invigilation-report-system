-- =====================================================
-- INTELLIGENT INVIGILATION MANAGEMENT SYSTEM
-- Database Schema with Row Level Security
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: instructors
-- Stores instructor profile information
-- =====================================================
CREATE TABLE instructors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  department TEXT NOT NULL,
  phone TEXT,
  total_duties INTEGER DEFAULT 0,
  on_time_count INTEGER DEFAULT 0,
  late_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- TABLE: exams
-- Stores exam definitions
-- =====================================================
CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  subject TEXT,
  course_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- TABLE: rooms
-- Stores venue/room information
-- =====================================================
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  building TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  floor TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- TABLE: duties
-- Core junction table linking exams, rooms, and instructors
-- Tracks arrival times and punctuality status
-- =====================================================
CREATE TABLE duties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  instructor_id UUID REFERENCES instructors(id) ON DELETE CASCADE,
  reporting_time TIME NOT NULL,
  arrival_time TIMESTAMPTZ,
  status TEXT CHECK (status IN ('pending', 'on-time', 'late')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE: analytics_cache
-- Performance optimization for aggregated statistics
-- =====================================================
CREATE TABLE analytics_cache (
  instructor_id UUID PRIMARY KEY REFERENCES instructors(id) ON DELETE CASCADE,
  late_count INTEGER DEFAULT 0,
  ontime_count INTEGER DEFAULT 0,
  total_duties INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES for Performance Optimization
-- =====================================================
CREATE INDEX idx_duties_instructor ON duties(instructor_id);
CREATE INDEX idx_duties_exam ON duties(exam_id);
CREATE INDEX idx_duties_status ON duties(status);
CREATE INDEX idx_duties_exam_date ON duties(exam_id);
CREATE INDEX idx_exams_date ON exams(date);

-- =====================================================
-- FUNCTION: Update instructor stats when duty status changes
-- =====================================================
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
-- TRIGGER: Auto-update analytics cache on duty changes
-- =====================================================
CREATE TRIGGER trigger_update_analytics
AFTER INSERT OR UPDATE OF status ON duties
FOR EACH ROW
EXECUTE FUNCTION update_analytics_cache();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE duties ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_cache ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- ADMIN POLICIES (Full Access)
-- Admins can perform all operations on all tables
-- =====================================================

-- Instructors table - Admin policies
CREATE POLICY admin_instructors_all ON instructors
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Exams table - Admin policies
CREATE POLICY admin_exams_all ON exams
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Rooms table - Admin policies
CREATE POLICY admin_rooms_all ON rooms
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Duties table - Admin policies
CREATE POLICY admin_duties_all ON duties
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Analytics cache - Admin policies
CREATE POLICY admin_analytics_all ON analytics_cache
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');


-- =====================================================
-- INSTRUCTOR POLICIES (Limited Access)
-- Instructors can only view their own data
-- =====================================================

-- Instructors can view all instructors (for comparison)
CREATE POLICY instructor_view_all_instructors ON instructors
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'instructor');

-- Instructors can view all exams
CREATE POLICY instructor_view_exams ON exams
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'instructor');

-- Instructors can view all rooms
CREATE POLICY instructor_view_rooms ON rooms
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'instructor');

-- Instructors can view only their own duties
CREATE POLICY instructor_view_own_duties ON duties
  FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'instructor' 
    AND instructor_id::text = auth.jwt() ->> 'instructor_id'
  );

-- Instructors can update only their own duties (for marking arrival)
CREATE POLICY instructor_update_own_duties ON duties
  FOR UPDATE
  USING (
    auth.jwt() ->> 'role' = 'instructor' 
    AND instructor_id::text = auth.jwt() ->> 'instructor_id'
  )
  WITH CHECK (
    auth.jwt() ->> 'role' = 'instructor' 
    AND instructor_id::text = auth.jwt() ->> 'instructor_id'
  );

-- Instructors can view their own analytics
CREATE POLICY instructor_view_own_analytics ON analytics_cache
  FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'instructor' 
    AND instructor_id::text = auth.jwt() ->> 'instructor_id'
  );

-- =====================================================
-- HELPER VIEWS for Common Queries
-- =====================================================

-- View: Duties with full details (exam, room, instructor)
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


-- View: Instructor statistics
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


-- =====================================================
-- COMMENTS for Documentation
-- =====================================================
COMMENT ON TABLE instructors IS 'Stores instructor profile information';
COMMENT ON TABLE exams IS 'Stores exam definitions and schedules';
COMMENT ON TABLE rooms IS 'Stores examination room/venue information';
COMMENT ON TABLE duties IS 'Core table linking exams, rooms, and instructors with attendance tracking';
COMMENT ON TABLE analytics_cache IS 'Cached aggregated statistics for performance optimization';
COMMENT ON COLUMN duties.status IS 'Attendance status: pending (not yet arrived), on-time (arrived 30+ min before), late (arrived <30 min before)';
COMMENT ON COLUMN duties.reporting_time IS 'Time when exam starts (instructors must arrive 30 min before)';
