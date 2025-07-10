# Context7 Library Documentation Summary for Phase 1

This document summarizes the most relevant documentation patterns from Context7 for implementing Phase 1 security requirements of the Picasso Hair Salon project.

## SvelteKit Configuration

### CSP Configuration in hooks.server.js

```javascript
// src/hooks.server.js
/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
  const response = await resolve(event, {
    transformPageChunk: ({ html }) => html.replace('%CSP_NONCE%', generateNonce()),
  });

  // Add CSP headers
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'nonce-{CSP_NONCE}'; style-src 'self' 'unsafe-inline';"
  );

  return response;
}
```

### SvelteKit Edge Functions

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-vercel';

export default {
  kit: {
    adapter: adapter({
      // Enable edge functions for better performance
      edge: true,
      runtime: 'edge',
    }),
  },
};
```

### Handle Hook for Authentication

```javascript
// src/hooks.server.js
/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
  // Populate event.locals with user data
  event.locals.user = await getUserFromSession(event.cookies.get('sessionid'));

  const response = await resolve(event);
  return response;
}
```

## Supabase SSR Configuration

### Client Configuration with Cookies

```typescript
// Based on @supabase/ssr design patterns
import { createServerClient } from '@supabase/ssr';

// Server-side client with cookie handling
export function createSupabaseServerClient(cookies) {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookies.set(name, value, options);
        });
      },
    },
  });
}
```

### Authentication Patterns

```typescript
// Authentication with Supabase in SvelteKit
import { createSupabaseServerClient } from '$lib/server/supabase';

export async function load({ cookies }) {
  const supabase = createSupabaseServerClient(cookies);

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (!session) {
    throw redirect(303, '/login');
  }

  return {
    session,
    user: session.user,
  };
}
```

## Zod Schema Validation

### Environment Variable Validation

```typescript
import { z } from 'zod';

// Define environment schema
const EnvSchema = z.object({
  PUBLIC_SUPABASE_URL: z.string().url(),
  PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Validate environment variables
export const env = EnvSchema.parse(process.env);

// Type-safe environment variables
type Env = z.infer<typeof EnvSchema>;
```

### Request/Response Validation

```typescript
// Authentication schemas
const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const UserProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['client', 'stylist', 'admin']),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

// Derive types from schemas
type LoginRequest = z.infer<typeof LoginRequestSchema>;
type UserProfile = z.infer<typeof UserProfileSchema>;

// Use in form actions
export const actions = {
  login: async ({ request }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    // Validate with Zod
    const result = LoginRequestSchema.safeParse(data);

    if (!result.success) {
      return fail(400, {
        errors: result.error.flatten(),
      });
    }

    // Process valid data
    const { email, password } = result.data;
    // ... authentication logic
  },
};
```

## Vitest Testing Configuration

### Basic Configuration for SvelteKit

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ['tests/**/*.{test,spec}.{js,ts}'],
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
});
```

### Testing SvelteKit Hooks

```typescript
// tests/hooks.server.test.ts
import { describe, it, expect, vi } from 'vitest';
import { handle } from '../src/hooks.server';

describe('Server Hooks', () => {
  it('should add CSP headers', async () => {
    const mockEvent = {
      url: new URL('http://localhost'),
      request: new Request('http://localhost'),
      locals: {},
    };

    const mockResolve = vi.fn().mockResolvedValue(new Response('test', { headers: new Headers() }));

    const response = await handle({
      event: mockEvent,
      resolve: mockResolve,
    });

    expect(response.headers.get('Content-Security-Policy')).toBeTruthy();
  });
});
```

### Testing with Supabase Mocks

```typescript
// tests/lib/supabase.test.ts
import { describe, it, expect, vi } from 'vitest';
import { createSupabaseServerClient } from '$lib/server/supabase';

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { user: { id: '123' } } },
        error: null,
      }),
    },
  })),
}));

describe('Supabase Client', () => {
  it('should create server client with cookies', () => {
    const mockCookies = {
      getAll: vi.fn(),
      setAll: vi.fn(),
    };

    const client = createSupabaseServerClient(mockCookies);
    expect(client).toBeDefined();
  });
});
```

## Key Implementation Patterns

### 1. Server-Side Authentication Flow

- Use `hooks.server.js` to validate sessions on every request
- Store user data in `event.locals` for access in load functions
- Use Supabase SSR client with proper cookie handling

### 2. Schema-First Development

- Define all data structures with Zod schemas first
- Derive TypeScript types from schemas
- Use schemas for runtime validation at API boundaries

### 3. Security Headers

- Implement CSP through SvelteKit's handle hook
- Use nonce-based script security
- Configure secure cookie settings

### 4. Testing Strategy

- Test hooks and authentication flows
- Mock Supabase client for unit tests
- Validate schema enforcement

### 5. Environment Configuration

- Validate all environment variables with Zod
- Type-safe access to configuration
- Separate public and private keys

## Migration Considerations

When implementing these patterns:

1. **Hooks Migration**: Move authentication logic from individual routes to `hooks.server.js`
2. **Schema Integration**: Replace ad-hoc validation with Zod schemas
3. **Testing Setup**: Configure Vitest with proper SvelteKit support
4. **Cookie Handling**: Ensure proper cookie configuration for Supabase auth

## References

- SvelteKit Hooks: Focus on `handle`, `handleFetch`, and `handleError`
- Supabase SSR: Cookie-based session management patterns
- Zod: Schema validation and type inference
- Vitest: SvelteKit-specific testing configuration
