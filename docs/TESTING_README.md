# Testing Guide for SvelteKit + Supabase Applications

This guide provides comprehensive testing strategies and best practices for fullstack SvelteKit applications using Vite and Supabase.

## Table of Contents

1. [Overview](#overview)
2. [Testing Stack](#testing-stack)
3. [Setup and Configuration](#setup-and-configuration)
4. [Unit Testing](#unit-testing)
5. [Component Testing](#component-testing)
6. [API/Server Testing](#apiserver-testing)
7. [Database Testing](#database-testing)
8. [E2E Testing](#e2e-testing)
9. [Mocking Strategies](#mocking-strategies)
10. [CI/CD Integration](#cicd-integration)

## Overview

Testing in a SvelteKit + Supabase application requires different strategies for different layers:

- **Unit Tests**: Test individual functions and utilities
- **Component Tests**: Test Svelte components in isolation
- **API Tests**: Test server-side endpoints and load functions
- **Database Tests**: Test database schemas, RLS policies, and functions
- **E2E Tests**: Test complete user flows

## Testing Stack

- **Vitest**: Unit and component testing
- **@testing-library/svelte**: Component testing utilities
- **Playwright**: E2E testing
- **pgTAP**: Database testing
- **MSW (Mock Service Worker)**: API mocking

## Setup and Configuration

### Install Testing Dependencies

```bash
pnpm add -D vitest @vitest/ui @testing-library/svelte @testing-library/jest-dom @testing-library/user-event
pnpm add -D jsdom happy-dom
pnpm add -D @playwright/test
pnpm add -D msw
```

### Vitest Configuration

```ts
// vitest.config.ts
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
	plugins: [svelte({ hot: !process.env.VITEST })],
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: ['./src/test/setup.ts'],
		include: ['src/**/*.{test,spec}.{js,ts}'],
		coverage: {
			reporter: ['text', 'json', 'html'],
			exclude: ['node_modules/', 'src/test/']
		}
	}
});
```

### Test Setup File

```ts
// src/test/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock environment variables
vi.stubGlobal('import.meta.env', {
	VITE_SUPABASE_URL: 'http://localhost:54321',
	VITE_SUPABASE_ANON_KEY: 'test-anon-key',
	DEV: true,
	PROD: false,
	SSR: false
});

// Setup MSW if needed
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

export const server = setupServer(...handlers);

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Clean up after all tests
afterAll(() => server.close());
```

## Unit Testing

### Testing Utilities and Pure Functions

```ts
// src/lib/utils/format.test.ts
import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate } from './format';

describe('formatCurrency', () => {
	it('formats USD currency correctly', () => {
		expect(formatCurrency(10.5)).toBe('$10.50');
		expect(formatCurrency(1000)).toBe('$1,000.00');
	});

	it('handles zero and negative values', () => {
		expect(formatCurrency(0)).toBe('$0.00');
		expect(formatCurrency(-10)).toBe('-$10.00');
	});
});

describe('formatDate', () => {
	it('formats dates in the expected format', () => {
		const date = new Date('2024-01-15T10:30:00Z');
		expect(formatDate(date)).toBe('January 15, 2024');
	});
});
```

## Component Testing

### Basic Component Test

```ts
// src/lib/components/Button.test.ts
import { render, fireEvent } from '@testing-library/svelte';
import { vi } from 'vitest';
import Button from './Button.svelte';

describe('Button Component', () => {
	it('renders with props', () => {
		const { getByText } = render(Button, {
			props: { variant: 'primary' },
			// Pass slot content
			slots: { default: 'Click me' }
		});

		expect(getByText('Click me')).toBeInTheDocument();
	});

	it('handles click events', async () => {
		const handleClick = vi.fn();
		const { getByRole } = render(Button, {
			props: { onclick: handleClick }
		});

		const button = getByRole('button');
		await fireEvent.click(button);

		expect(handleClick).toHaveBeenCalledTimes(1);
	});
});
```

### Testing Components with Stores

```ts
// src/lib/components/UserProfile.test.ts
import { render } from '@testing-library/svelte';
import { readable } from 'svelte/store';
import UserProfile from './UserProfile.svelte';
import { setContext } from 'svelte';

// Mock Supabase store
const mockUser = {
	id: '123',
	email: 'test@example.com',
	user_metadata: { name: 'Test User' }
};

describe('UserProfile Component', () => {
	it('displays user information', () => {
		const { getByText } = render(UserProfile, {
			context: new Map([['user', readable(mockUser)]])
		});

		expect(getByText('Test User')).toBeInTheDocument();
		expect(getByText('test@example.com')).toBeInTheDocument();
	});
});
```

## API/Server Testing

### Testing Load Functions

```ts
// src/routes/products/+page.server.test.ts
import { describe, it, expect, vi } from 'vitest';
import { load } from './+page.server';
import type { RequestEvent } from '@sveltejs/kit';

// Mock Supabase client
vi.mock('$lib/supabase', () => ({
	supabase: {
		from: vi.fn(() => ({
			select: vi.fn(() => ({
				order: vi.fn(() =>
					Promise.resolve({
						data: [
							{ id: 1, name: 'Product 1', price: 10 },
							{ id: 2, name: 'Product 2', price: 20 }
						],
						error: null
					})
				)
			}))
		}))
	}
}));

describe('Products page load function', () => {
	it('fetches and returns products', async () => {
		const mockEvent = {
			locals: {
				supabase: {
					from: vi.fn(() => ({
						select: vi.fn(() => ({
							order: vi.fn(() =>
								Promise.resolve({
									data: [{ id: 1, name: 'Test Product' }],
									error: null
								})
							)
						}))
					}))
				}
			}
		} as unknown as RequestEvent;

		const result = await load(mockEvent);

		expect(result.products).toHaveLength(1);
		expect(result.products[0].name).toBe('Test Product');
	});

	it('handles database errors', async () => {
		const mockEvent = {
			locals: {
				supabase: {
					from: vi.fn(() => ({
						select: vi.fn(() => ({
							order: vi.fn(() =>
								Promise.resolve({
									data: null,
									error: { message: 'Database error' }
								})
							)
						}))
					}))
				}
			}
		} as unknown as RequestEvent;

		await expect(load(mockEvent)).rejects.toThrow('Database error');
	});
});
```

### Testing API Routes

```ts
// src/routes/api/checkout/+server.test.ts
import { describe, it, expect, vi } from 'vitest';
import { POST } from './+server';
import type { RequestEvent } from '@sveltejs/kit';

describe('POST /api/checkout', () => {
	it('creates a checkout session', async () => {
		const mockRequest = new Request('http://localhost/api/checkout', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				items: [{ id: 'prod_123', quantity: 2 }]
			})
		});

		const mockEvent = {
			request: mockRequest,
			locals: {
				getSession: () => ({ user: { id: 'user_123' } })
			}
		} as unknown as RequestEvent;

		const response = await POST(mockEvent);
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data).toHaveProperty('sessionId');
	});
});
```

## Database Testing

### Setting Up Database Tests

```bash
# Create test directory
mkdir -p supabase/tests/database

# Create a test file
supabase test new auth_policies.test
```

### Testing RLS Policies with pgTAP

```sql
-- supabase/tests/database/auth_policies.test.sql
begin;
create extension if not exists pgtap with schema extensions;

select plan(4);

-- Setup test data
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'user1@test.com'),
  ('22222222-2222-2222-2222-222222222222', 'user2@test.com');

insert into profiles (id, username, full_name) values
  ('11111111-1111-1111-1111-111111111111', 'user1', 'User One'),
  ('22222222-2222-2222-2222-222222222222', 'user2', 'User Two');

-- Test as User 1
set local role authenticated;
set local request.jwt.claims.sub = '11111111-1111-1111-1111-111111111111';

select results_eq(
  'select count(*) from profiles where id = auth.uid()',
  ARRAY[1::bigint],
  'User can see their own profile'
);

select lives_ok(
  $$update profiles set full_name = 'Updated Name' where id = auth.uid()$$,
  'User can update their own profile'
);

-- Test as User 2
set local request.jwt.claims.sub = '22222222-2222-2222-2222-222222222222';

select results_eq(
  'select count(*) from profiles where id != auth.uid()',
  ARRAY[0::bigint],
  'User cannot see other profiles'
);

select throws_ok(
  $$update profiles set full_name = 'Hacked' where id = '11111111-1111-1111-1111-111111111111'$$,
  '42501',
  'new row violates row-level security policy for table "profiles"',
  'User cannot update other profiles'
);

select * from finish();
rollback;
```

### Testing with Supabase Test Helpers

```sql
-- First, install test helpers
select dbdev.install('basejump-supabase_test_helpers');
create extension if not exists "basejump-supabase_test_helpers";

-- Then use in tests
begin;
select plan(3);

-- Create test users easily
select tests.create_supabase_user('testuser@example.com');

-- Authenticate as user
select tests.authenticate_as('testuser@example.com');

-- Test authenticated operations
select lives_ok(
  $$insert into user_data (name, user_id) values ('Test', auth.uid())$$,
  'Authenticated user can insert their data'
);

-- Clear authentication
select tests.clear_authentication();

-- Test anonymous access
select throws_ok(
  $$insert into user_data (name, user_id) values ('Test', gen_random_uuid())$$,
  '42501',
  null,
  'Anonymous users cannot insert data'
);

select * from finish();
rollback;
```

## E2E Testing

### Playwright Configuration

```ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: 'html',
	use: {
		baseURL: 'http://localhost:5173',
		trace: 'on-first-retry'
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		}
	],
	webServer: {
		command: 'pnpm run build && pnpm run preview',
		port: 4173,
		reuseExistingServer: !process.env.CI
	}
});
```

### E2E Test Example

```ts
// e2e/auth.test.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
	test('user can sign up and sign in', async ({ page }) => {
		await page.goto('/auth/signup');

		// Fill signup form
		await page.fill('[name="email"]', 'test@example.com');
		await page.fill('[name="password"]', 'TestPassword123!');
		await page.fill('[name="confirmPassword"]', 'TestPassword123!');

		// Submit form
		await page.click('button[type="submit"]');

		// Wait for redirect
		await page.waitForURL('/dashboard');

		// Verify user is logged in
		await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
	});
});
```

## Mocking Strategies

### Mocking Supabase Client

```ts
// src/test/mocks/supabase.ts
import { vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';

export function createMockSupabaseClient(): SupabaseClient {
	return {
		auth: {
			getUser: vi.fn().mockResolvedValue({
				data: { user: null },
				error: null
			}),
			signInWithPassword: vi.fn().mockResolvedValue({
				data: { user: { id: '123' }, session: {} },
				error: null
			}),
			signOut: vi.fn().mockResolvedValue({ error: null })
		},
		from: vi.fn((table: string) => ({
			select: vi.fn().mockReturnThis(),
			insert: vi.fn().mockReturnThis(),
			update: vi.fn().mockReturnThis(),
			delete: vi.fn().mockReturnThis(),
			eq: vi.fn().mockReturnThis(),
			single: vi.fn().mockResolvedValue({ data: {}, error: null }),
			order: vi.fn().mockReturnThis(),
			limit: vi.fn().mockResolvedValue({ data: [], error: null })
		}))
	} as unknown as SupabaseClient;
}
```

### Using MSW for API Mocking

```ts
// src/test/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
	// Mock Supabase Auth
	http.post('*/auth/v1/token', () => {
		return HttpResponse.json({
			access_token: 'mock-token',
			token_type: 'bearer',
			expires_in: 3600,
			refresh_token: 'mock-refresh-token',
			user: {
				id: '123',
				email: 'test@example.com'
			}
		});
	}),

	// Mock Supabase Database
	http.get('*/rest/v1/products', () => {
		return HttpResponse.json([
			{ id: 1, name: 'Product 1', price: 100 },
			{ id: 2, name: 'Product 2', price: 200 }
		]);
	})
];
```

### Mocking in Components

```ts
// Mock a specific module
vi.mock('$lib/supabase', () => ({
	supabase: createMockSupabaseClient()
}));

// Mock stores
vi.mock('$app/stores', () => ({
	page: readable({
		url: new URL('http://localhost'),
		params: {},
		route: { id: '/' },
		status: 200,
		error: null,
		data: {},
		form: undefined
	})
}));

// Mock environment
vi.mock('$app/environment', () => ({
	browser: true,
	dev: true,
	building: false,
	version: 'test'
}));
```

## CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run unit tests
        run: pnpm run test:unit

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  database-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: supabase/setup-cli@v1

      - name: Start Supabase
        run: supabase start

      - name: Run database tests
        run: supabase test db

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps

      - name: Start Supabase
        run: supabase start

      - name: Run E2E tests
        run: pnpm run test:e2e

      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

## Best Practices

1. **Test Isolation**: Each test should be independent and not rely on other tests
2. **Mock External Dependencies**: Always mock Supabase and other external services in unit tests
3. **Use Factories**: Create factory functions for common test data
4. **Test User Flows**: Focus E2E tests on critical user journeys
5. **Database Rollback**: Always use transactions and rollback in database tests
6. **Parallel Testing**: Configure tests to run in parallel where possible
7. **Meaningful Assertions**: Write clear, specific assertions that test actual behavior
8. **Error Cases**: Always test error scenarios and edge cases
9. **CI Integration**: Run all test suites in CI/CD pipeline
10. **Coverage Goals**: Aim for 80%+ coverage but focus on critical paths

## Debugging Tips

### Vitest UI

```bash
pnpm run test:unit:ui
```

### Playwright Debugging

```bash
# Debug mode
pnpm run test:e2e -- --debug

# UI mode
pnpm run test:e2e -- --ui
```

### Database Test Debugging

```sql
-- Add debug output
select diag('Debug message here');
select diag('User ID: ' || auth.uid()::text);
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Svelte](https://testing-library.com/docs/svelte-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [pgTAP Documentation](https://pgtap.org/)
- [Supabase Testing Guide](https://supabase.com/docs/guides/database/testing)
- [MSW Documentation](https://mswjs.io/)
