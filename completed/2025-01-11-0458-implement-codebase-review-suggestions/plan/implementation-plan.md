# TDD Implementation Plan: Codebase Review Suggestions

## Overview

This plan breaks down the implementation of codebase review suggestions into testable components. Each component follows strict TDD principles with clear behaviors that can be tested independently.

## Implementation Components

### Component 1: Edge-Compatible Rate Limiter
- **name**: Edge-Compatible Rate Limiter
- **status**: complete
- **test_file**: tests/lib/security/edge-rate-limiter.test.ts
- **impl_file**: src/lib/security/edge-rate-limiter.ts
- **behavior**: Implements distributed rate limiting using Vercel KV that persists across serverless instances, maintains 5 attempts per 15-minute window, and properly expires entries
- **libraries**: ["@vercel/kv", "zod"]

### Component 2: Rate Limiter Integration Hook
- **name**: Rate Limiter Integration Hook
- **status**: complete
- **test_file**: tests/hooks/rate-limit-hook.test.ts
- **impl_file**: src/hooks.server.ts
- **behavior**: Integrates edge-compatible rate limiter into SvelteKit hooks, extracting client IP correctly and returning 429 responses when limits are exceeded
- **libraries**: ["@sveltejs/kit", "@vercel/kv"]

### Component 3: Route Splitting Configuration
- **name**: Route Splitting Configuration
- **status**: complete
- **test_file**: tests/config/svelte-config.test.ts
- **impl_file**: svelte.config.js
- **behavior**: Configures SvelteKit adapter with split: true to enable route-level code splitting for optimized edge deployment
- **libraries**: ["@sveltejs/adapter-vercel", "@sveltejs/kit"]

### Component 4: Test Coverage Configuration
- **name**: Test Coverage Configuration
- **status**: complete
- **test_file**: tests/config/vitest-coverage.test.ts
- **impl_file**: vitest.config.ts
- **behavior**: Sets coverage thresholds to 80% for branches, functions, lines, and statements, with clear failure messages when thresholds are not met
- **libraries**: ["vitest", "@vitest/coverage-v8"]

### Component 5: RLS Policy Optimizer
- **name**: RLS Policy Optimizer
- **status**: complete
- **test_file**: tests/database/rls-optimizer.test.ts
- **impl_file**: src/database/migrations/002_optimize_rls_policies.sql
- **behavior**: Generates SQL migration that replaces function-based role checks with JWT claim checks and adds composite indexes for common query patterns
- **libraries**: ["supabase", "zod"]

### Component 6: Button Component Schema Migration
- **name**: Button Component Schema Migration
- **status**: complete
- **test_file**: tests/lib/components/Button.test.ts
- **impl_file**: src/lib/components/Button.svelte
- **behavior**: Refactors Button component to use Zod schema for props validation while maintaining all existing functionality and styling
- **libraries**: ["svelte", "zod", "@testing-library/svelte"]

### Component 7: CSP Configuration Consolidator
- **name**: CSP Configuration Consolidator
- **status**: complete
- **test_file**: tests/lib/security/csp-config.test.ts
- **impl_file**: src/lib/security/csp-config.ts
- **behavior**: Creates single source of truth for CSP configuration with nonce generation support and exports configuration for both development and production
- **libraries**: ["@sveltejs/kit", "zod"]

### Component 8: CSP Hook Integration
- **name**: CSP Hook Integration
- **status**: complete
- **test_file**: tests/hooks/csp-hook.test.ts
- **impl_file**: src/hooks.server.ts
- **behavior**: Integrates consolidated CSP configuration into hooks to apply headers with generated nonces to all responses
- **libraries**: ["@sveltejs/kit"]

### Component 9: Branded Types Implementation
- **name**: Branded Types Implementation
- **status**: complete
- **test_file**: tests/lib/types/branded-types.test.ts
- **impl_file**: src/lib/types/branded.ts
- **behavior**: Implements branded types for UserId, ServiceId, and StaffId with helper functions to create and validate branded values
- **libraries**: ["zod"]

### Component 10: Branded Types Migration
- **name**: Branded Types Migration
- **status**: complete
- **test_file**: tests/lib/types/branded-migration.test.ts
- **impl_file**: src/lib/schemas/index.ts
- **behavior**: Updates existing schemas and types to use branded types ensuring type safety across entity ID usage
- **libraries**: ["zod"]

## Implementation Order

The components are ordered by priority as specified in the codebase review:

1. **Critical** - Edge-Compatible Rate Limiter
2. **Critical** - Rate Limiter Integration Hook  
3. **Critical** - Route Splitting Configuration
4. **Critical** - Test Coverage Configuration
5. **Medium** - RLS Policy Optimizer
6. **Medium** - Button Component Schema Migration
7. **Medium** - CSP Configuration Consolidator
8. **Medium** - CSP Hook Integration
9. **Low** - Branded Types Implementation
10. **Low** - Branded Types Migration

## Success Metrics

Each component will be considered complete when:
- The test file is written and fails initially
- The implementation makes the test pass
- The code is refactored for clarity if needed
- All existing tests continue to pass
- The component integrates cleanly with the existing codebase

## Notes

- All implementations must follow the project's strict TypeScript settings
- No comments are allowed in the code (self-documenting principle)
- All data structures must be schema-first using Zod
- Tests must focus on behavior, not implementation details
- Each component should be atomic and not depend on others where possible