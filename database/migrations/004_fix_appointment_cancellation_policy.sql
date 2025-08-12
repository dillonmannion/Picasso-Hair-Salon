-- Fix appointment cancellation policy
-- Allow users to update their own appointments if they're not completed

-- Drop the restrictive policy that only allows updating pending appointments
DROP POLICY IF EXISTS "Users can update own pending appointments" ON appointments;

-- Create a more flexible policy that allows users to update their own appointments
-- as long as they're not completed (allowing cancellation of pending/confirmed appointments)
CREATE POLICY "Users can update own non-completed appointments" ON appointments
  FOR UPDATE 
  USING (
    auth.uid() = user_id 
    AND status != 'completed'
  )
  WITH CHECK (
    auth.uid() = user_id
  );

-- Add a comment explaining the policy
COMMENT ON POLICY "Users can update own non-completed appointments" ON appointments IS 
  'Users can update their own appointments unless they are already completed. This allows cancellation and rescheduling.';