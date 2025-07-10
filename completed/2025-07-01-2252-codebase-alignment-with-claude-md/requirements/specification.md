# Feature Specification: Codebase Alignment with CLAUDE.md

## Overview

This feature involves a comprehensive refactoring of the Picasso Hair Salon codebase to align with the principles and best practices defined in CLAUDE.md. The refactoring will be done as a full rewrite (not gradual) with strict Test-Driven Development, schema-first design using Zod, and automated enforcement through custom ESLint rules and pre-commit hooks.

## User Behaviors (What users can do)

1. As a developer, I can write code without `any` types so that type safety is guaranteed
2. As a developer, I can use Zod schemas for all data validation so that runtime errors are prevented
3. As a developer, I can write self-documenting code without comments so that the codebase is cleaner
4. As a developer, I can follow TDD workflow so that all code has behavior tests
5. As a developer, I can use immutable data patterns so that state bugs are prevented
6. As a developer, I can run automated checks so that CLAUDE.md principles are enforced

## System Behaviors (How the system responds)

1. When a developer tries to use `any` type, the system prevents compilation with an error
2. When data enters the system, the system validates it against Zod schemas
3. When a developer writes comments in code, the system flags it as a linting error
4. When a developer writes code without tests, the system blocks the commit
5. When a developer tries to mutate data, the system enforces immutable patterns
6. When a developer commits code, the system runs all quality checks automatically

## Technical Requirements

Based on technical questions and context analysis:

1. **TR1**: Create centralized schema module at `src/lib/schemas/` for all Zod definitions
2. **TR2**: Keep authentication as OAuth-only (Google provider)
3. **TR3**: Implement custom ESLint rules to enforce CLAUDE.md principles
4. **TR4**: Include error messages as part of Zod schema definitions
5. **TR5**: Do not use Svelte 5 runes in test files (simpler patterns for tests)
6. **TR6**: Achieve 100% behavior coverage (not line coverage)
7. **TR7**: Use factory functions with real schemas for test data
8. **TR8**: Organize tests by behavior, not by file structure

## Behavior Test Scenarios (For TDD)

### Scenario 1: Schema Validation at Runtime

**Given:** A request arrives at the OAuth callback endpoint  
**When:** The request contains invalid or missing parameters  
**Then:** The system rejects it with a specific validation error

**Test cases:**

- Happy path: Valid OAuth callback with code parameter
- Edge case: Missing code parameter
- Error case: Invalid error parameters in callback

### Scenario 2: Type Safety Without Any

**Given:** A developer is writing a new component  
**When:** They try to use `any` type  
**Then:** TypeScript compilation fails with clear error

**Test cases:**

- Happy path: Component with properly typed props
- Edge case: Component with complex generic types
- Error case: Attempt to use `any` or type assertions

### Scenario 3: Self-Documenting Code

**Given:** A developer is writing a complex function  
**When:** They try to add explanatory comments  
**Then:** ESLint flags it as an error

**Test cases:**

- Happy path: Clear function names and structure
- Edge case: Complex logic refactored into named functions
- Error case: Inline comments detected and flagged

### Scenario 4: Immutable Data Operations

**Given:** A developer is updating application state  
**When:** They try to mutate an object or array  
**Then:** The system enforces immutable update patterns

**Test cases:**

- Happy path: State updated with spread operators
- Edge case: Deep nested object updates
- Error case: Direct mutation attempts

### Scenario 5: TDD Workflow Enforcement

**Given:** A developer is implementing a new feature  
**When:** They try to write implementation before tests  
**Then:** The workflow guides them to write tests first

**Test cases:**

- Happy path: Test written, then minimal implementation
- Edge case: Refactoring after green tests
- Error case: No test coverage for new code

## Data Schemas (Preliminary)

Key data structures that need Zod schemas:

### User/Profile Schemas

```typescript
ProfileSchema = z
  .object({
    id: z.string().uuid(),
    username: z.string().min(3).max(20).nullable(),
    full_name: z.string().max(100).nullable(),
    avatar_url: z.string().url().nullable(),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
  })
  .strict();
```

### Authentication Schemas

```typescript
OAuthCallbackSchema = z
  .object({
    code: z.string().min(1),
    next: z.string().optional(),
  })
  .strict();

OAuthErrorSchema = z
  .object({
    error: z.string(),
    error_code: z.string().optional(),
    error_description: z.string().optional(),
  })
  .strict();
```

### Component Prop Schemas

```typescript
ButtonPropsSchema = z
  .object({
    variant: z.enum(['primary', 'secondary', 'danger']).default('primary'),
    size: z.enum(['small', 'medium', 'large']).default('medium'),
    disabled: z.boolean().optional(),
    onclick: z.function().optional(),
  })
  .passthrough(); // Allow HTML button attributes
```

### API Response Schemas

```typescript
SupabaseErrorSchema = z
  .object({
    message: z.string(),
    status: z.number().optional(),
    code: z.string().optional(),
  })
  .strict();

AuthResponseSchema = z.discriminatedUnion('error', [
  z.object({
    error: z.null(),
    data: z.object({
      user: UserSchema,
      session: SessionSchema,
    }),
  }),
  z.object({
    error: SupabaseErrorSchema,
    data: z.object({
      user: z.null(),
      session: z.null(),
    }),
  }),
]);
```

## Constraints

- No `any` types anywhere in the codebase
- No type assertions (`as Type`) except in exceptional documented cases
- No comments in production code
- All data validated at runtime boundaries
- 100% behavior test coverage required
- All functions must be pure where possible
- Immutable data updates only
- Tests organized by behavior, not file structure
- OAuth-only authentication (no email/password)
- Custom ESLint rules must catch all violations

## Success Criteria

- [ ] All `any` types removed from codebase
- [ ] All type assertions removed or documented
- [ ] All comments removed from production code
- [ ] Zod schemas defined for all data structures
- [ ] 100% behavior test coverage achieved
- [ ] All tests rewritten following TDD
- [ ] Custom ESLint rules implemented and passing
- [ ] Pre-commit hooks enforce all checks
- [ ] All code follows functional programming patterns
- [ ] CI/CD pipeline enforces all requirements
