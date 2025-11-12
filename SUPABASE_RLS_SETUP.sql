-- ============================================================================
-- SUPABASE ROW LEVEL SECURITY (RLS) CONFIGURATION
-- ============================================================================
-- This script enables RLS on all public tables and sets up policies
-- Run this in your Supabase SQL Editor AFTER running SUPABASE_SCHEMA.sql
-- ============================================================================

-- ============================================================================
-- STEP 1: ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 2: CREATE PUBLIC ACCESS POLICIES (Allow all for development)
-- ============================================================================
-- For development/demo purposes, we're allowing all authenticated users to access data
-- For production, you should implement proper user-based policies

-- STUDENTS POLICIES
CREATE POLICY "Allow all authenticated users to select students" ON public.students
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow all authenticated users to insert students" ON public.students
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow all authenticated users to update students" ON public.students
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all authenticated users to delete students" ON public.students
  FOR DELETE
  TO authenticated
  USING (true);

-- CONTACTS POLICIES
CREATE POLICY "Allow all authenticated users to select contacts" ON public.contacts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow all authenticated users to insert contacts" ON public.contacts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow all authenticated users to update contacts" ON public.contacts
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all authenticated users to delete contacts" ON public.contacts
  FOR DELETE
  TO authenticated
  USING (true);

-- GROUPS POLICIES
CREATE POLICY "Allow all authenticated users to select groups" ON public.groups
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow all authenticated users to insert groups" ON public.groups
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow all authenticated users to update groups" ON public.groups
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all authenticated users to delete groups" ON public.groups
  FOR DELETE
  TO authenticated
  USING (true);

-- STUDENT_GROUPS POLICIES
CREATE POLICY "Allow all authenticated users to select student_groups" ON public.student_groups
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow all authenticated users to insert student_groups" ON public.student_groups
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow all authenticated users to update student_groups" ON public.student_groups
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all authenticated users to delete student_groups" ON public.student_groups
  FOR DELETE
  TO authenticated
  USING (true);

-- ATTENDANCE POLICIES
CREATE POLICY "Allow all authenticated users to select attendance" ON public.attendance
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow all authenticated users to insert attendance" ON public.attendance
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow all authenticated users to update attendance" ON public.attendance
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all authenticated users to delete attendance" ON public.attendance
  FOR DELETE
  TO authenticated
  USING (true);

-- PAYMENTS POLICIES
CREATE POLICY "Allow all authenticated users to select payments" ON public.payments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow all authenticated users to insert payments" ON public.payments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow all authenticated users to update payments" ON public.payments
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all authenticated users to delete payments" ON public.payments
  FOR DELETE
  TO authenticated
  USING (true);

-- EVENTS POLICIES
CREATE POLICY "Allow all authenticated users to select events" ON public.events
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow all authenticated users to insert events" ON public.events
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow all authenticated users to update events" ON public.events
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all authenticated users to delete events" ON public.events
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================================
-- STEP 3: VERIFY RLS IS ENABLED
-- ============================================================================

-- Run this query to check RLS status on all tables:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('students', 'contacts', 'groups', 'student_groups', 'attendance', 'payments', 'events');

-- Expected output:
-- All tables should show rowsecurity = true

-- ============================================================================
-- NOTES FOR PRODUCTION DEPLOYMENT
-- ============================================================================
-- 1. These policies allow all authenticated users full access
-- 2. For production, implement user-based access control:
--    - Create users/auth system
--    - Add user_id to relevant tables
--    - Restrict access to own data: USING (auth.uid() = user_id)
--
-- 3. Alternative: Allow anonymous access (if public access needed)
-- Replace "TO authenticated" with "TO anon" and remove auth() checks
--
-- 4. Monitor RLS performance in production (Supabase dashboard)
-- ============================================================================
