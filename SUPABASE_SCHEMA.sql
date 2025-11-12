-- Lingoville Dashboard - Complete Supabase PostgreSQL Schema
-- Run this in Supabase SQL Editor to set up the complete database

-- ============================================================================
-- 1. STUDENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS students (
  student_id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  date_of_birth DATE,
  enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated', 'withdrawn')),
  family_id TEXT,
  parent_contact_id TEXT,
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_students_family_id ON students(family_id);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_students_parent_contact_id ON students(parent_contact_id);

-- ============================================================================
-- 2. CONTACTS TABLE (Parents, emergency contacts, etc.)
-- ============================================================================
CREATE TABLE IF NOT EXISTS contacts (
  contact_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  relationship TEXT,
  type TEXT NOT NULL DEFAULT 'Parent' CHECK (type IN ('Parent', 'Emergency', 'Relative', 'Guardian')),
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_contacts_type ON contacts(type);

-- ============================================================================
-- 3. GROUPS (Classes/Courses) TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS groups (
  group_id TEXT PRIMARY KEY,
  group_name TEXT NOT NULL UNIQUE,
  level TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
  description TEXT DEFAULT '',
  capacity INTEGER,
  instructor TEXT,
  schedule TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_groups_status ON groups(status);
CREATE INDEX idx_groups_level ON groups(level);

-- ============================================================================
-- 4. STUDENT_GROUPS (Enrollments) - Junction table
-- ============================================================================
CREATE TABLE IF NOT EXISTS student_groups (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  group_id TEXT NOT NULL REFERENCES groups(group_id) ON DELETE CASCADE,
  group_name TEXT NOT NULL,
  enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed', 'dropped')),
  level TEXT,
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_student_groups_student_id ON student_groups(student_id);
CREATE INDEX idx_student_groups_group_id ON student_groups(group_id);
CREATE INDEX idx_student_groups_status ON student_groups(status);
CREATE UNIQUE INDEX idx_student_groups_unique ON student_groups(student_id, group_id);

-- ============================================================================
-- 5. ATTENDANCE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS attendance (
  attendance_id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  group_id TEXT REFERENCES groups(group_id) ON DELETE SET NULL,
  group_name TEXT NOT NULL,
  attendance_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'excused')),
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_attendance_student_id ON attendance(student_id);
CREATE INDEX idx_attendance_group_id ON attendance(group_id);
CREATE INDEX idx_attendance_date ON attendance(attendance_date);
CREATE INDEX idx_attendance_group_date ON attendance(group_id, attendance_date);
CREATE UNIQUE INDEX idx_attendance_unique ON attendance(student_id, group_id, attendance_date);

-- ============================================================================
-- 6. PAYMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS payments (
  payment_id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  group_id TEXT REFERENCES groups(group_id) ON DELETE SET NULL,
  group_name TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  base_amount DECIMAL(10, 2),
  discount_applied DECIMAL(5, 2) DEFAULT 0,
  payment_date DATE,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'partial', 'refunded')),
  payment_method TEXT,
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payments_student_id ON payments(student_id);
CREATE INDEX idx_payments_group_id ON payments(group_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_due_date ON payments(due_date);

-- ============================================================================
-- 7. EVENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS events (
  event_id TEXT PRIMARY KEY,
  event_name TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME,
  location TEXT,
  description TEXT DEFAULT '',
  group_id TEXT REFERENCES groups(group_id) ON DELETE SET NULL,
  group_name TEXT,
  organizer TEXT,
  capacity INTEGER,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'ongoing', 'completed', 'cancelled')),
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_events_event_date ON events(event_date);
CREATE INDEX idx_events_group_id ON events(group_id);
CREATE INDEX idx_events_status ON events(status);

-- ============================================================================
-- 8. HELPER FUNCTIONS FOR COMMON OPERATIONS
-- ============================================================================

-- Function to get student count for a group
CREATE OR REPLACE FUNCTION get_group_student_count(p_group_id TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) 
    FROM student_groups 
    WHERE group_id = p_group_id AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get discount for family (% off per sibling)
CREATE OR REPLACE FUNCTION get_family_discount(p_family_id TEXT)
RETURNS DECIMAL AS $$
DECLARE
  sibling_count INTEGER;
BEGIN
  SELECT COUNT(DISTINCT student_id) INTO sibling_count
  FROM students
  WHERE family_id = p_family_id;
  
  -- 5% discount per additional sibling (max 15%)
  RETURN LEAST((sibling_count - 1) * 5, 15);
END;
$$ LANGUAGE plpgsql;

-- Function to mark payments as overdue
CREATE OR REPLACE FUNCTION mark_overdue_payments()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE payments
  SET status = 'overdue'
  WHERE status = 'pending' AND due_date < CURRENT_DATE;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 9. TRIGGER FOR UPDATED_AT
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
CREATE TRIGGER trigger_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_groups_updated_at BEFORE UPDATE ON groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_student_groups_updated_at BEFORE UPDATE ON student_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_attendance_updated_at BEFORE UPDATE ON attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 10. SAMPLE DATA (optional - for testing)
-- ============================================================================
-- Insert sample groups
INSERT INTO groups (group_id, group_name, level, status) VALUES
  ('grp_001', 'Arabic Beginners', 'Beginner', 'active'),
  ('grp_002', 'Arabic Intermediate', 'Intermediate', 'active'),
  ('grp_003', 'Quran Basics', 'Beginner', 'active')
ON CONFLICT DO NOTHING;

-- Insert sample students
INSERT INTO students (student_id, first_name, last_name, email, phone, date_of_birth, family_id, status) VALUES
  ('stu_001', 'Ahmed', 'Hassan', 'ahmed@email.com', '555-0001', '2015-03-14', 'fam_001', 'active'),
  ('stu_002', 'Fatima', 'Hassan', 'fatima@email.com', '555-0002', '2017-07-19', 'fam_001', 'active'),
  ('stu_003', 'Zahra', 'Ali', 'zahra@email.com', '555-0003', '2016-05-22', 'fam_002', 'active')
ON CONFLICT DO NOTHING;

-- Insert sample contacts
INSERT INTO contacts (contact_id, name, email, phone, type, relationship) VALUES
  ('con_001', 'Mrs. Amira Hassan', 'amira@email.com', '555-0100', 'Parent', 'Mother'),
  ('con_002', 'Mr. Hassan Hassan', 'hassan.parent@email.com', '555-0101', 'Parent', 'Father')
ON CONFLICT DO NOTHING;

-- Link students to contacts
UPDATE students SET parent_contact_id = 'con_001' WHERE student_id IN ('stu_001', 'stu_002');
UPDATE students SET parent_contact_id = 'con_002' WHERE student_id = 'stu_003';

-- Insert sample enrollments
INSERT INTO student_groups (id, student_id, group_id, group_name, status) VALUES
  ('sg_001', 'stu_001', 'grp_001', 'Arabic Beginners', 'active'),
  ('sg_002', 'stu_001', 'grp_003', 'Quran Basics', 'active'),
  ('sg_003', 'stu_002', 'grp_001', 'Arabic Beginners', 'active'),
  ('sg_004', 'stu_003', 'grp_002', 'Arabic Intermediate', 'active')
ON CONFLICT DO NOTHING;

-- Insert sample attendance
INSERT INTO attendance (attendance_id, student_id, group_id, group_name, attendance_date, status) VALUES
  ('att_001', 'stu_001', 'grp_001', 'Arabic Beginners', CURRENT_DATE - 1, 'present'),
  ('att_002', 'stu_002', 'grp_001', 'Arabic Beginners', CURRENT_DATE - 1, 'present'),
  ('att_003', 'stu_001', 'grp_001', 'Arabic Beginners', CURRENT_DATE, 'absent')
ON CONFLICT DO NOTHING;

-- Insert sample payments
INSERT INTO payments (payment_id, student_id, group_id, group_name, amount, base_amount, due_date, status) VALUES
  ('pay_001', 'stu_001', 'grp_001', 'Arabic Beginners', 150, 150, CURRENT_DATE + 7, 'pending'),
  ('pay_002', 'stu_001', 'grp_003', 'Quran Basics', 100, 100, CURRENT_DATE + 7, 'paid'),
  ('pay_003', 'stu_002', 'grp_001', 'Arabic Beginners', 142.5, 150, CURRENT_DATE - 5, 'overdue')
ON CONFLICT DO NOTHING;

-- Insert sample events
INSERT INTO events (event_id, event_name, event_date, event_time, location, group_id, group_name, status) VALUES
  ('evt_001', 'Midterm Exam', CURRENT_DATE + 7, '10:00:00', 'Main Hall', 'grp_001', 'Arabic Beginners', 'planned'),
  ('evt_002', 'Parent Meeting', CURRENT_DATE + 12, '17:00:00', 'Conference Room', NULL, 'All Groups', 'planned')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- DONE! Your Supabase database is ready.
-- ============================================================================
