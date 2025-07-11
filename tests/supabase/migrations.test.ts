import { describe, it, expect } from 'vitest';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

describe('RLS Migration Script', () => {
  const migrationPath = join(process.cwd(), 'supabase/migrations/00002_rls_optimizations.sql');

  it('should create optimized RLS policies for profiles table', async () => {
    const migration = await readFile(migrationPath, 'utf-8');

    // Check for profiles table RLS policies
    expect(migration).toContain('CREATE POLICY "profiles_select_policy"');
    expect(migration).toContain('FOR SELECT');
    expect(migration).toContain("USING (auth.uid() = id OR role = 'admin')");

    expect(migration).toContain('CREATE POLICY "profiles_update_policy"');
    expect(migration).toContain('FOR UPDATE');
    expect(migration).toContain('USING (auth.uid() = id)');
  });

  it('should create security definer functions for role-based access', async () => {
    const migration = await readFile(migrationPath, 'utf-8');

    // Check for security definer function
    expect(migration).toContain('CREATE OR REPLACE FUNCTION check_user_role');
    expect(migration).toContain('SECURITY DEFINER');
    expect(migration).toContain('RETURNS boolean');
    expect(migration).toContain('SELECT role FROM profiles WHERE id = auth.uid()');
  });

  it('should create proper indexes for RLS performance', async () => {
    const migration = await readFile(migrationPath, 'utf-8');

    // Check for indexes
    expect(migration).toContain('CREATE INDEX IF NOT EXISTS idx_profiles_id_role');
    expect(migration).toContain('ON profiles(id, role)');

    expect(migration).toContain('CREATE INDEX IF NOT EXISTS idx_profiles_auth_lookup');
    expect(migration).toContain('ON profiles(id) WHERE role IS NOT NULL');
  });

  it('should enable RLS on all relevant tables', async () => {
    const migration = await readFile(migrationPath, 'utf-8');

    // Check for RLS enablement
    expect(migration).toContain('ALTER TABLE profiles ENABLE ROW LEVEL SECURITY');
    expect(migration).toContain('ALTER TABLE appointments ENABLE ROW LEVEL SECURITY');
    expect(migration).toContain('ALTER TABLE services ENABLE ROW LEVEL SECURITY');
  });

  it('should create policies for appointments table with proper access control', async () => {
    const migration = await readFile(migrationPath, 'utf-8');

    // Customer can see their own appointments
    expect(migration).toContain('CREATE POLICY "appointments_customer_select"');
    expect(migration).toContain('USING (customer_id = auth.uid() OR EXISTS');

    // Staff can see appointments assigned to them
    expect(migration).toContain('CREATE POLICY "appointments_staff_select"');
    expect(migration).toContain('staff_id = auth.uid()');
  });

  it('should create policies for services table with public read access', async () => {
    const migration = await readFile(migrationPath, 'utf-8');

    // Public can read active services
    expect(migration).toContain('CREATE POLICY "services_public_select"');
    expect(migration).toContain('FOR SELECT');
    expect(migration).toContain('USING (active = true)');

    // Only admins can modify services
    expect(migration).toContain('CREATE POLICY "services_admin_all"');
    expect(migration).toContain("check_user_role('admin')");
  });

  it('should include rollback statements for safe migration', async () => {
    const migration = await readFile(migrationPath, 'utf-8');

    // Check for transaction and rollback capability
    expect(migration).toContain('BEGIN;');
    expect(migration).toContain('COMMIT;');

    // Should have comments for manual rollback
    expect(migration).toContain('-- Rollback:');
    expect(migration).toContain('DROP POLICY IF EXISTS');
  });
});
