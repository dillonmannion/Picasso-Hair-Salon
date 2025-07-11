-- RLS Policy Optimization Migration
-- Generated: 2025-01-11T04:06:00.000Z
-- 
-- This migration optimizes Row Level Security policies by:
-- 1. Replacing function-based role checks with JWT claim checks
-- 2. Adding composite indexes for common query patterns
-- 3. Using wrapped auth functions for performance
-- 4. Optimizing team membership queries

BEGIN;

-- Drop existing policies that will be replaced
DROP POLICY IF EXISTS "Users can view own appointments" ON appointments;
DROP POLICY IF EXISTS "Staff can view all appointments" ON appointments;
DROP POLICY IF EXISTS "Users can view services" ON services;
DROP POLICY IF EXISTS "Staff can manage services" ON services;

-- Create optimized policies using JWT claims with wrapped auth functions
CREATE POLICY "optimized_appointments_user_access"
ON appointments
TO authenticated
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "optimized_appointments_staff_access"
ON appointments
TO authenticated  
USING (
  (SELECT auth.uid()) = user_id OR 
  (auth.jwt() -> 'app_metadata' ->> 'staff_role') IS NOT NULL
);

CREATE POLICY "optimized_services_public_read"
ON services
FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "optimized_services_staff_write"
ON services
FOR ALL
TO authenticated
USING ((auth.jwt() -> 'app_metadata' ->> 'staff_role') IN ('admin', 'manager', 'staff'));

-- Create composite indexes for common query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_appointments_salon_date_status
ON appointments (salon_id, appointment_date, status)
TABLESPACE pg_default;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_appointments_user_id
ON appointments USING btree (user_id)
TABLESPACE pg_default;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_salon_category
ON services (salon_id, category)
TABLESPACE pg_default;

-- Create indexes for columns used in RLS policies
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_staff_members_user_id
ON staff_members USING btree (user_id)
TABLESPACE pg_default;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_staff_members_salon_id
ON staff_members USING btree (salon_id)
TABLESPACE pg_default;

-- Create security definer function for complex salon access checks
CREATE OR REPLACE FUNCTION has_salon_access(target_salon_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_id UUID;
  is_admin BOOLEAN;
  is_owner BOOLEAN;
  is_staff BOOLEAN;
BEGIN
  user_id := auth.uid();
  
  -- Check if user is admin
  SELECT (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' INTO is_admin;
  IF is_admin THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user owns the salon
  SELECT EXISTS(
    SELECT 1 FROM salons 
    WHERE id = target_salon_id AND owner_id = user_id
  ) INTO is_owner;
  IF is_owner THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user is staff in the salon
  SELECT EXISTS(
    SELECT 1 FROM staff_members
    WHERE salon_id = target_salon_id AND user_id = user_id AND active = true
  ) INTO is_staff;
  
  RETURN is_staff;
END;
$$;

-- Optimize team/salon membership queries using IN clause
CREATE POLICY "optimized_team_projects_access"
ON team_projects
TO authenticated
USING (
  team_id IN (
    SELECT team_id FROM team_members
    WHERE user_id = (SELECT auth.uid()) AND active = true
  )
);

-- Performance testing commands:
-- set session role authenticated;
-- set request.jwt.claims to '{"role":"authenticated", "sub":"user-uuid-here", "app_metadata": {"staff_role": "admin"}}';
-- EXPLAIN ANALYZE SELECT * FROM appointments WHERE salon_id = 'some-uuid' LIMIT 100;
-- EXPLAIN ANALYZE SELECT * FROM services WHERE category = 'hair' LIMIT 100;

COMMIT;