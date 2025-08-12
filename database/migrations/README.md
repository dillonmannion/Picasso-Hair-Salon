# Database Migrations

## How to Apply Migrations

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the content of the migration file
4. Paste and run the SQL

### Option 2: Using Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Apply a specific migration
supabase db push --file database/migrations/004_fix_appointment_cancellation_policy.sql
```

## Migration Files

### 001_initial_schema.sql
- Creates the initial database schema
- Sets up all tables and relationships

### 002_booking_wizard_policies.sql
- Updates RLS policies for the booking wizard
- Restricts appointment updates to pending status only

### 003_add_payment_fields.sql
- Adds payment-related fields to appointments table
- Adds paid, payment_session_id, payment_intent_id columns

### 004_fix_appointment_cancellation_policy.sql
- **IMPORTANT: Apply this to fix the cancellation issue**
- Updates RLS policy to allow users to cancel their confirmed appointments
- Allows users to update any non-completed appointment they own

## Current Issue: Appointment Cancellation

Users are currently unable to cancel appointments due to restrictive RLS policies. The error message is:
```
new row violates row-level security policy for table "appointments"
```

**Solution:** Apply migration `004_fix_appointment_cancellation_policy.sql` to fix this issue.

## Quick Fix SQL

If you need to quickly fix the cancellation issue, run this SQL in the Supabase SQL editor:

```sql
-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users can update own pending appointments" ON appointments;

-- Create a more flexible policy
CREATE POLICY "Users can update own non-completed appointments" ON appointments
  FOR UPDATE 
  USING (
    auth.uid() = user_id 
    AND status != 'completed'
  )
  WITH CHECK (
    auth.uid() = user_id
  );
```

This will allow users to update (including cancel) their own appointments as long as they're not completed.