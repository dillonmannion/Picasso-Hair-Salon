-- Migration: Optimized RLS Policies
-- Purpose: Create row-level security policies with proper indexes for performance

BEGIN;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION check_user_role(required_role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role FROM profiles WHERE id = auth.uid() INTO user_role;
  RETURN user_role = required_role;
END;
$$;

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Profiles table policies
CREATE POLICY "profiles_select_policy" ON profiles
  FOR SELECT
  USING (auth.uid() = id OR role = 'admin');

CREATE POLICY "profiles_update_policy" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_insert_policy" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Appointments table policies
CREATE POLICY "appointments_customer_select" ON appointments
  FOR SELECT
  USING (customer_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')
  ));

CREATE POLICY "appointments_staff_select" ON appointments
  FOR SELECT
  USING (staff_id = auth.uid());

CREATE POLICY "appointments_customer_insert" ON appointments
  FOR INSERT
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "appointments_admin_all" ON appointments
  FOR ALL
  USING (check_user_role('admin'))
  WITH CHECK (check_user_role('admin'));

-- Services table policies
CREATE POLICY "services_public_select" ON services
  FOR SELECT
  USING (active = true);

CREATE POLICY "services_admin_all" ON services
  FOR ALL
  USING (check_user_role('admin'))
  WITH CHECK (check_user_role('admin'));

-- Create indexes for RLS performance
CREATE INDEX IF NOT EXISTS idx_profiles_id_role ON profiles(id, role);
CREATE INDEX IF NOT EXISTS idx_profiles_auth_lookup ON profiles(id) WHERE role IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_staff_id ON appointments(staff_id);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(active);

COMMIT;

-- Rollback: Run these commands to undo this migration
-- BEGIN;
-- DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
-- DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
-- DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
-- DROP POLICY IF EXISTS "appointments_customer_select" ON appointments;
-- DROP POLICY IF EXISTS "appointments_staff_select" ON appointments;
-- DROP POLICY IF EXISTS "appointments_customer_insert" ON appointments;
-- DROP POLICY IF EXISTS "appointments_admin_all" ON appointments;
-- DROP POLICY IF EXISTS "services_public_select" ON services;
-- DROP POLICY IF EXISTS "services_admin_all" ON services;
-- DROP FUNCTION IF EXISTS check_user_role(text);
-- DROP INDEX IF EXISTS idx_profiles_id_role;
-- DROP INDEX IF EXISTS idx_profiles_auth_lookup;
-- DROP INDEX IF EXISTS idx_appointments_customer_id;
-- DROP INDEX IF EXISTS idx_appointments_staff_id;
-- DROP INDEX IF EXISTS idx_services_active;
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE services DISABLE ROW LEVEL SECURITY;
-- COMMIT;