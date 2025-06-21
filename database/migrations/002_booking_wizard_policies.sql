-- Migration: Add booking wizard specific policies and indexes
-- Date: 2025-06-21

-- Drop existing appointment policies to replace with more specific ones
DROP POLICY IF EXISTS "Users can update own appointments" ON appointments;

-- Add new policy for updating only pending appointments
CREATE POLICY "Users can update own pending appointments" ON appointments
  FOR UPDATE USING (
    auth.uid() = user_id 
    AND status = 'pending'
  );

-- Add composite index for stylist availability queries
CREATE INDEX IF NOT EXISTS idx_appointments_stylist_date 
  ON appointments(stylist_id, appointment_date);

-- Add index for user appointments
CREATE INDEX IF NOT EXISTS idx_appointments_user 
  ON appointments(user_id);

-- Add function to check for appointment conflicts
CREATE OR REPLACE FUNCTION check_appointment_conflict(
  p_stylist_id UUID,
  p_date DATE,
  p_time TIME,
  p_duration INTEGER,
  p_appointment_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_end_time TIME;
  v_conflict_count INTEGER;
BEGIN
  -- Calculate end time
  v_end_time := p_time + (p_duration || ' minutes')::INTERVAL;
  
  -- Check for conflicts
  SELECT COUNT(*)
  INTO v_conflict_count
  FROM appointments a
  JOIN services s ON a.service_id = s.id
  WHERE a.stylist_id = p_stylist_id
    AND a.appointment_date = p_date
    AND a.status NOT IN ('cancelled')
    AND (a.id IS DISTINCT FROM p_appointment_id)
    AND (
      -- New appointment starts during existing appointment
      (p_time >= a.appointment_time AND p_time < a.appointment_time + (s.duration || ' minutes')::INTERVAL)
      OR
      -- New appointment ends during existing appointment
      (v_end_time > a.appointment_time AND v_end_time <= a.appointment_time + (s.duration || ' minutes')::INTERVAL)
      OR
      -- New appointment completely overlaps existing appointment
      (p_time <= a.appointment_time AND v_end_time >= a.appointment_time + (s.duration || ' minutes')::INTERVAL)
    );
    
  RETURN v_conflict_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Add constraint to prevent overlapping appointments
CREATE OR REPLACE FUNCTION prevent_appointment_overlap()
RETURNS TRIGGER AS $$
DECLARE
  v_duration INTEGER;
BEGIN
  -- Get service duration
  SELECT duration INTO v_duration
  FROM services
  WHERE id = NEW.service_id;
  
  -- Check for conflicts
  IF check_appointment_conflict(
    NEW.stylist_id,
    NEW.appointment_date,
    NEW.appointment_time,
    v_duration,
    NEW.id
  ) THEN
    RAISE EXCEPTION 'Appointment time conflicts with existing appointment';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for appointment overlap prevention
DROP TRIGGER IF EXISTS prevent_appointment_overlap_trigger ON appointments;
CREATE TRIGGER prevent_appointment_overlap_trigger
  BEFORE INSERT OR UPDATE OF appointment_date, appointment_time, stylist_id
  ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION prevent_appointment_overlap();

-- Add function to get available time slots
CREATE OR REPLACE FUNCTION get_available_time_slots(
  p_stylist_id UUID,
  p_date DATE,
  p_service_duration INTEGER,
  p_start_hour INTEGER DEFAULT 9,
  p_end_hour INTEGER DEFAULT 18,
  p_slot_interval INTEGER DEFAULT 30
) RETURNS TABLE(slot_time TIME, is_available BOOLEAN) AS $$
DECLARE
  v_current_time TIME;
  v_end_time TIME;
BEGIN
  -- Generate time slots
  v_current_time := (p_start_hour || ':00')::TIME;
  v_end_time := (p_end_hour || ':00')::TIME;
  
  WHILE v_current_time + (p_service_duration || ' minutes')::INTERVAL <= v_end_time LOOP
    RETURN QUERY
    SELECT 
      v_current_time,
      NOT check_appointment_conflict(p_stylist_id, p_date, v_current_time, p_service_duration);
    
    v_current_time := v_current_time + (p_slot_interval || ' minutes')::INTERVAL;
  END LOOP;
END;
$$ LANGUAGE plpgsql;