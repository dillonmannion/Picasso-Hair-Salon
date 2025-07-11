export type OptimizationResult = {
  migration: string;
  rollback: string;
  filename: string;
};

type PolicyConfig = {
  tableName: string;
  policyName: string;
  roleCheck: string;
};

type IndexConfig = {
  tableName: string;
  columns: string[];
  indexName: string;
};

type RLSIndexConfig = {
  tableName: string;
  rlsColumns: string[];
};

type TeamAccessConfig = {
  tableName: string;
  teamIdColumn: string;
  userTeamTable: string;
};

type SecurityFunctionConfig = {
  functionName: string;
  checkLogic: string;
};

type MigrationConfig = {
  tableName?: string;
  userIdColumn?: string;
  roleCheckFunction?: string;
  jwtRoleClaim?: string;
  policies?: PolicyConfig[];
  indexes?: IndexConfig[];
  rlsIndexes?: RLSIndexConfig;
  teamAccess?: TeamAccessConfig;
  securityFunctions?: SecurityFunctionConfig[];
  measurePerformance?: boolean;
};

const MIGRATION_FILENAME = '002_optimize_rls_policies.sql' as const;

const generatePolicySQL = (policyName: string, tableName: string, using: string): string => {
  return `-- Create optimized policy: ${policyName}
CREATE POLICY "${policyName}"
ON ${tableName}
TO authenticated
USING (${using});`;
};

const generateIndexSQL = (
  indexName: string,
  tableName: string,
  columns: string | string[]
): string => {
  const columnList = Array.isArray(columns) ? columns.join(', ') : columns;
  return `CREATE INDEX CONCURRENTLY IF NOT EXISTS ${indexName}
ON ${tableName} USING btree (${columnList})
TABLESPACE pg_default;`;
};

const generateDropPolicySQL = (policyName: string, tableName: string): string => {
  return `DROP POLICY IF EXISTS "${policyName}" ON ${tableName};`;
};

const generateDropIndexSQL = (indexName: string): string => {
  return `DROP INDEX IF EXISTS ${indexName};`;
};

const generateSecurityDefinerFunction = (func: SecurityFunctionConfig): string => {
  return `-- Create security definer function: ${func.functionName}
CREATE OR REPLACE FUNCTION ${func.functionName}(salon_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- ${func.checkLogic}
  RETURN TRUE; -- Placeholder implementation
END;
$$;`;
};

const generatePerformanceTestingSection = (tableName: string): string => {
  return `-- Performance testing commands:
-- set session role authenticated;
-- set request.jwt.claims to '{"role":"authenticated", "sub":"user-uuid-here"}';
-- EXPLAIN ANALYZE SELECT * FROM ${tableName} LIMIT 100;`;
};

export const generateRLSOptimizationMigration = (config: MigrationConfig): OptimizationResult => {
  if (config.tableName !== undefined && config.tableName === '') {
    throw new Error('Table name is required');
  }

  const migrationSections: string[] = [];
  const rollbackStatements: string[] = [];

  // Header
  migrationSections.push(`-- RLS Policy Optimization Migration
-- Generated: ${new Date().toISOString()}

BEGIN;
`);

  // JWT claim-based policies
  if (config.userIdColumn && config.roleCheckFunction && config.jwtRoleClaim) {
    const policyName = `optimized_${config.tableName}_staff_access`;

    rollbackStatements.push(generateDropPolicySQL(policyName, config.tableName!));

    migrationSections.push(`-- Drop existing policy
${generateDropPolicySQL(policyName, config.tableName!)}

${generatePolicySQL(
  policyName,
  config.tableName!,
  `(SELECT auth.uid()) = ${config.userIdColumn} OR (auth.jwt() -> 'app_metadata' ->> '${config.jwtRoleClaim}') IS NOT NULL`
)}
`);
  }

  // Composite indexes
  if (config.indexes?.length) {
    migrationSections.push('-- Create composite indexes');

    config.indexes.forEach((index) => {
      migrationSections.push(`-- Index for ${index.tableName}
${generateIndexSQL(index.indexName, index.tableName, index.columns)}
`);
      rollbackStatements.push(generateDropIndexSQL(index.indexName));
    });
  }

  // Optimized policies
  if (config.policies?.length) {
    config.policies.forEach((policy) => {
      rollbackStatements.push(generateDropPolicySQL(policy.policyName, policy.tableName));

      migrationSections.push(`${generatePolicySQL(
        policy.policyName,
        policy.tableName,
        '(SELECT auth.uid()) = user_id'
      )}
`);
    });
  }

  // Team access optimization
  if (config.teamAccess) {
    const { tableName, teamIdColumn, userTeamTable } = config.teamAccess;

    migrationSections.push(`-- Optimize team access queries
CREATE POLICY "team_member_access"
ON ${tableName}
TO authenticated
USING (
  ${teamIdColumn} IN (
    SELECT team_id FROM ${userTeamTable}
    WHERE user_id = (SELECT auth.uid())
  )
);
`);
  }

  // Security definer functions
  if (config.securityFunctions?.length) {
    config.securityFunctions.forEach((func) => {
      migrationSections.push(`${generateSecurityDefinerFunction(func)}
`);
    });
  }

  // RLS column indexes
  if (config.rlsIndexes) {
    const { tableName, rlsColumns } = config.rlsIndexes;

    migrationSections.push('-- Create indexes for RLS columns');

    rlsColumns.forEach((column) => {
      const indexName = `idx_${tableName}_${column}`;

      migrationSections.push(`-- Index for ${column}
${generateIndexSQL(indexName, tableName, column)}
`);
      rollbackStatements.push(generateDropIndexSQL(indexName));
    });
  }

  // Performance testing section
  if (config.measurePerformance && config.tableName) {
    migrationSections.push(`${generatePerformanceTestingSection(config.tableName)}
`);
  }

  migrationSections.push('COMMIT;');

  const migration = migrationSections.join('\n');
  const rollback =
    rollbackStatements.length > 0
      ? `-- Rollback migration\n\nBEGIN;\n\n${rollbackStatements.join('\n')}\n\nCOMMIT;`
      : '';

  return {
    migration,
    rollback,
    filename: MIGRATION_FILENAME,
  };
};
