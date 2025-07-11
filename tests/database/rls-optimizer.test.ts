import { describe, it, expect } from 'vitest';
import { generateRLSOptimizationMigration } from '../../src/database/rls-optimizer';

describe('RLS Policy Optimizer', () => {
  it('should generate migration that replaces function-based role checks with JWT claim checks', () => {
    const tableConfig = {
      tableName: 'appointments',
      userIdColumn: 'user_id',
      roleCheckFunction: 'is_staff_member',
      jwtRoleClaim: 'staff_role'
    };
    
    const result = generateRLSOptimizationMigration(tableConfig);
    
    expect(result.migration).toContain('DROP POLICY IF EXISTS');
    expect(result.migration).toContain('CREATE POLICY "optimized_appointments_staff_access"');
    expect(result.migration).toContain("(auth.jwt() -> 'app_metadata' ->> 'staff_role') IS NOT NULL");
    expect(result.migration).toContain('TO authenticated');
    expect(result.migration).toContain('USING ((SELECT auth.uid()) = user_id OR');
  });

  it('should add composite indexes for common query patterns', () => {
    const indexConfig = {
      tableName: 'appointments',
      columns: ['salon_id', 'appointment_date', 'status'],
      indexName: 'idx_appointments_salon_date_status'
    };
    
    const result = generateRLSOptimizationMigration({ indexes: [indexConfig] });
    
    expect(result.migration).toContain('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_appointments_salon_date_status');
    expect(result.migration).toContain('ON appointments USING btree (salon_id, appointment_date, status)');
    expect(result.migration).toContain('TABLESPACE pg_default');
  });

  it('should wrap auth functions in SELECT for performance optimization', () => {
    const policyConfig = {
      tableName: 'services',
      policyName: 'staff_can_manage_services',
      roleCheck: 'is_admin_or_manager'
    };
    
    const result = generateRLSOptimizationMigration({ policies: [policyConfig] });
    
    expect(result.migration).toContain('(SELECT auth.uid())');
    expect(result.migration).toMatch(/USING \(\(SELECT auth\.uid\(\)\)/); // Should have wrapped auth.uid()
    expect(result.migration).toContain('CREATE POLICY "staff_can_manage_services"');
  });

  it('should optimize team membership queries using IN clause instead of joins', () => {
    const teamConfig = {
      tableName: 'team_projects',
      teamIdColumn: 'team_id',
      userTeamTable: 'team_members'
    };
    
    const result = generateRLSOptimizationMigration({ teamAccess: teamConfig });
    
    expect(result.migration).toContain('team_id IN (');
    expect(result.migration).toContain('SELECT team_id FROM team_members');
    expect(result.migration).toContain('WHERE user_id = (SELECT auth.uid())');
    expect(result.migration).not.toContain('JOIN'); // Should avoid joins
  });

  it('should create security definer functions for complex role checks', () => {
    const functionConfig = {
      functionName: 'has_salon_access',
      checkLogic: 'user has role admin OR user owns salon OR user is staff in salon'
    };
    
    const result = generateRLSOptimizationMigration({ securityFunctions: [functionConfig] });
    
    expect(result.migration).toContain('CREATE OR REPLACE FUNCTION has_salon_access(salon_id UUID)');
    expect(result.migration).toContain('RETURNS BOOLEAN');
    expect(result.migration).toContain('LANGUAGE plpgsql');
    expect(result.migration).toContain('STABLE SECURITY DEFINER');
    expect(result.migration).toContain("SET search_path = ''");
  });

  it('should generate indexes for columns used in RLS policies', () => {
    const rlsIndexConfig = {
      tableName: 'customer_bookings',
      rlsColumns: ['customer_id', 'salon_id', 'created_by']
    };
    
    const result = generateRLSOptimizationMigration({ rlsIndexes: rlsIndexConfig });
    
    expect(result.migration).toContain('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customer_bookings_customer_id');
    expect(result.migration).toContain('ON customer_bookings USING btree (customer_id)');
    expect(result.migration).toContain('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customer_bookings_salon_id');
    expect(result.migration).toContain('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customer_bookings_created_by');
  });

  it('should provide rollback migration for all changes', () => {
    const config = {
      tableName: 'services',
      indexes: [{ 
        tableName: 'services', 
        columns: ['salon_id', 'category'], 
        indexName: 'idx_services_salon_category' 
      }],
      policies: [{
        tableName: 'services',
        policyName: 'optimized_service_access',
        roleCheck: 'staff_role'
      }]
    };
    
    const result = generateRLSOptimizationMigration(config);
    
    expect(result.rollback).toBeDefined();
    expect(result.rollback).toContain('DROP INDEX IF EXISTS idx_services_salon_category');
    expect(result.rollback).toContain('DROP POLICY IF EXISTS "optimized_service_access"');
  });

  it('should include performance measurement comments', () => {
    const config = {
      tableName: 'appointments',
      measurePerformance: true
    };
    
    const result = generateRLSOptimizationMigration(config);
    
    expect(result.migration).toContain('-- Performance testing commands:');
    expect(result.migration).toContain('-- EXPLAIN ANALYZE');
    expect(result.migration).toContain('-- set session role authenticated;');
    expect(result.migration).toContain('-- set request.jwt.claims');
  });

  it('should validate input configuration', () => {
    const invalidConfig = {
      tableName: '', // Invalid empty table name
      indexes: []
    };
    
    expect(() => generateRLSOptimizationMigration(invalidConfig))
      .toThrow('Table name is required');
  });

  it('should generate complete migration file content', () => {
    const fullConfig = {
      tableName: 'salon_services',
      policies: [{
        tableName: 'salon_services',
        policyName: 'salon_staff_access',
        roleCheck: 'staff_role'
      }],
      indexes: [{
        tableName: 'salon_services',
        columns: ['salon_id', 'service_id'],
        indexName: 'idx_salon_services_composite'
      }],
      rlsIndexes: {
        tableName: 'salon_services',
        rlsColumns: ['created_by', 'salon_id']
      }
    };
    
    const result = generateRLSOptimizationMigration(fullConfig);
    
    expect(result.migration).toContain('-- RLS Policy Optimization Migration');
    expect(result.migration).toContain('-- Generated:');
    expect(result.migration).toContain('BEGIN;');
    expect(result.migration).toContain('COMMIT;');
    expect(result.filename).toBe('002_optimize_rls_policies.sql');
  });
});