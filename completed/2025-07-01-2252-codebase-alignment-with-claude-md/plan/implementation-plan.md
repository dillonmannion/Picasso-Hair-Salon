# Implementation Plan: Codebase Alignment with CLAUDE.md

# Iteration: 1

## Schema-First Design

### Define Schemas (Implement First)

Using Zod for runtime validation and TypeScript type derivation:

```typescript
// src/lib/schemas/index.ts - Central schema module
import { z } from 'zod';

// Base schemas with custom error messages
export const UuidSchema = z.string().uuid({
  message: 'Invalid UUID format',
});

export const DateTimeSchema = z.string().datetime({
  message: 'Invalid datetime format',
});

// Profile schema with error messages
export const ProfileSchema = z
  .object({
    id: UuidSchema,
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(20, 'Username must be at most 20 characters')
      .nullable(),
    full_name: z.string().max(100, 'Full name must be at most 100 characters').nullable(),
    avatar_url: z.string().url('Invalid avatar URL').nullable(),
    created_at: DateTimeSchema,
    updated_at: DateTimeSchema,
  })
  .strict();

// OAuth schemas
export const OAuthCallbackParamsSchema = z
  .object({
    code: z.string().min(1, 'Authorization code is required'),
    next: z.string().optional(),
  })
  .strict();

export const OAuthErrorParamsSchema = z
  .object({
    error: z.string().min(1, 'Error type is required'),
    error_code: z.string().optional(),
    error_description: z.string().optional(),
  })
  .strict();

// Component prop schemas
export const ButtonVariantSchema = z.enum(['primary', 'secondary', 'danger']);
export const ButtonSizeSchema = z.enum(['small', 'medium', 'large']);

export const ButtonPropsSchema = z
  .object({
    variant: ButtonVariantSchema.default('primary'),
    size: ButtonSizeSchema.default('medium'),
    disabled: z.boolean().optional(),
    onclick: z.function().optional(),
    class: z.string().optional(),
  })
  .passthrough(); // Allow HTML button attributes

// Supabase schemas
export const SupabaseErrorSchema = z
  .object({
    message: z.string(),
    status: z.number().optional(),
    code: z.string().optional(),
  })
  .strict();

// Derive types from schemas
export type Profile = z.infer<typeof ProfileSchema>;
export type OAuthCallbackParams = z.infer<typeof OAuthCallbackParamsSchema>;
export type OAuthErrorParams = z.infer<typeof OAuthErrorParamsSchema>;
export type ButtonProps = z.infer<typeof ButtonPropsSchema>;
export type SupabaseError = z.infer<typeof SupabaseErrorSchema>;
```

## TDD Implementation Sequence

### Component 1: Schema Validation Layer

**Why this first:** All other components depend on valid data structures

#### Step 1.1: Test Schema Validation Behavior

- **Test file:** `src/lib/schemas/validation.test.ts`
- **Behavior test:**

```typescript
import { describe, it, expect } from 'vitest';
import { ProfileSchema, OAuthCallbackParamsSchema, ButtonPropsSchema } from '$lib/schemas';

describe('Schema validation behavior', () => {
  describe('Profile validation', () => {
    it('should accept valid profile data', () => {
      const validProfile = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'johndoe',
        full_name: 'John Doe',
        avatar_url: 'https://example.com/avatar.jpg',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const result = ProfileSchema.safeParse(validProfile);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.username).toBe('johndoe');
      }
    });

    it('should reject invalid username length', () => {
      const invalidProfile = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'ab', // Too short
        full_name: null,
        avatar_url: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const result = ProfileSchema.safeParse(invalidProfile);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Username must be at least 3 characters');
      }
    });
  });

  describe('OAuth callback validation', () => {
    it('should accept valid callback params', () => {
      const validParams = {
        code: 'auth_code_123',
        next: '/dashboard',
      };

      const result = OAuthCallbackParamsSchema.safeParse(validParams);

      expect(result.success).toBe(true);
    });

    it('should reject missing code', () => {
      const invalidParams = {
        next: '/dashboard',
      };

      const result = OAuthCallbackParamsSchema.safeParse(invalidParams);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Authorization code is required');
      }
    });
  });
});
```

- **Expected result:** RED (schemas not implemented)

#### Step 1.2: Implement Minimal Schemas

- **File:** `src/lib/schemas/index.ts`
- **Minimal implementation:** Just enough to pass tests

### Component 2: Test Data Factories

**Why this second:** All tests need properly typed test data

#### Step 2.1: Test Factory Behavior

- **Test file:** `src/lib/test-utils/factories.test.ts`
- **Test content:**

```typescript
import { describe, it, expect } from 'vitest';
import {
  createMockProfile,
  createMockOAuthCallback,
  createMockButtonProps,
} from '$lib/test-utils/factories';
import { ProfileSchema, OAuthCallbackParamsSchema, ButtonPropsSchema } from '$lib/schemas';

describe('Test data factory behavior', () => {
  it('should create valid profile with defaults', () => {
    const profile = createMockProfile();

    const result = ProfileSchema.safeParse(profile);
    expect(result.success).toBe(true);
  });

  it('should allow profile overrides', () => {
    const profile = createMockProfile({ username: 'custom_user' });

    expect(profile.username).toBe('custom_user');
    const result = ProfileSchema.safeParse(profile);
    expect(result.success).toBe(true);
  });

  it('should create valid OAuth callback params', () => {
    const params = createMockOAuthCallback();

    const result = OAuthCallbackParamsSchema.safeParse(params);
    expect(result.success).toBe(true);
  });
});
```

#### Step 2.2: Implement Factory Functions

- **File:** `src/lib/test-utils/factories.ts`
- **Remember:**
  - Use real schemas from `$lib/schemas`
  - Return complete, valid objects
  - Accept optional overrides

### Component 3: ESLint Custom Rules

**Why this third:** Enforce CLAUDE.md principles during development

#### Step 3.1: Test ESLint Rule Behavior

- **Test file:** `eslint-rules/no-any-type.test.ts`
- **Test content:**

```typescript
import { RuleTester } from 'eslint';
import { noAnyTypeRule } from './no-any-type';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
});

describe('no-any-type rule', () => {
  ruleTester.run('no-any-type', noAnyTypeRule, {
    valid: [
      'let x: string = "hello"',
      'let y: unknown = getData()',
      'function process<T>(data: T): T { return data; }',
    ],
    invalid: [
      {
        code: 'let x: any = "hello"',
        errors: [
          { message: 'Use of "any" type is forbidden. Use "unknown" or a specific type instead.' },
        ],
      },
      {
        code: 'function process(data: any): any { return data; }',
        errors: [
          { message: 'Use of "any" type is forbidden. Use "unknown" or a specific type instead.' },
          { message: 'Use of "any" type is forbidden. Use "unknown" or a specific type instead.' },
        ],
      },
    ],
  });
});
```

#### Step 3.2: Implement Custom Rules

- **Files:**
  - `eslint-rules/no-any-type.ts`
  - `eslint-rules/no-comments.ts`
  - `eslint-rules/no-type-assertions.ts`

### Component 4: Authentication Flow with Schemas

**Why this fourth:** Core functionality that demonstrates schema usage

#### Step 4.1: Test OAuth Callback Behavior

- **Test file:** `src/routes/auth/callback/server.test.ts`
- **Test content:**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { GET } from './+server';
import { createMockOAuthCallback, createMockOAuthError } from '$lib/test-utils/factories';

describe('OAuth callback behavior', () => {
  it('should exchange code for session successfully', async () => {
    const mockRequest = new Request('http://localhost/auth/callback?code=valid_code');
    const mockLocals = {
      supabase: {
        auth: {
          exchangeCodeForSession: vi.fn().mockResolvedValue({
            data: { session: { access_token: 'token' } },
            error: null,
          }),
        },
      },
    };

    const response = await GET({ request: mockRequest, locals: mockLocals });

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe('/');
  });

  it('should handle missing code parameter', async () => {
    const mockRequest = new Request('http://localhost/auth/callback');

    const response = await GET({ request: mockRequest, locals: {} });

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe('/auth/error?message=Invalid+authorization+code');
  });
});
```

### Component 5: Button Component with Schema Props

**Why this fifth:** Demonstrates component prop validation

#### Step 5.1: Test Button Behavior

- **Test file:** `src/lib/components/Button.test.ts`
- **Test content:**

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Button from './Button.svelte';
import { createMockButtonProps } from '$lib/test-utils/factories';

describe('Button component behavior', () => {
  it('should render with default props', () => {
    render(Button);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn-primary', 'btn-medium');
  });

  it('should apply variant and size classes', () => {
    const props = createMockButtonProps({
      variant: 'danger',
      size: 'large',
    });

    render(Button, props);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn-danger', 'btn-large');
  });

  it('should handle click events', async () => {
    const onclick = vi.fn();
    const props = createMockButtonProps({ onclick });

    const { component } = render(Button, props);
    const button = screen.getByRole('button');

    await button.click();

    expect(onclick).toHaveBeenCalledOnce();
  });
});
```

## Testing Guidelines

- Test behavior, not implementation
- 100% coverage through behavior tests
- Use factory functions for test data
- Import real schemas (never redefine)
- No 1:1 test-to-implementation mapping

## Success Metrics

- Each test must fail before implementation
- Each implementation must be minimal
- Refactoring assessment after each green
- All behavior covered by tests
- No 'any' types or type assertions

## Code Style Requirements

- Self-documenting (no comments)
- Options objects by default
- Functional programming patterns
- Immutable data structures
- Small, pure functions
- Early returns over nested conditionals

## Implementation Order Summary

1. **Schema definitions** (failing tests → minimal implementation → refactor)
2. **Test factories** (failing tests → minimal implementation → refactor)
3. **ESLint rules** (failing tests → minimal implementation → refactor)
4. **OAuth flow** (failing tests → minimal implementation → refactor)
5. **Button component** (failing tests → minimal implementation → refactor)
6. **Profile management** (failing tests → minimal implementation → refactor)
7. **Protected routes** (failing tests → minimal implementation → refactor)
8. **Pre-commit hooks** (failing tests → minimal implementation → refactor)

Each component follows strict RED-GREEN-REFACTOR cycle with behavior-driven tests.
