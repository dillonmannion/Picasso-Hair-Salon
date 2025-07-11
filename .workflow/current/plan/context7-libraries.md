# Context7 Library Documentation References

This file contains documentation references fetched from Context7 for libraries that will be used in the implementation.

## 1. Vercel KV - Edge-Compatible Rate Limiting

**Library ID**: `/vercel/storage`
**Topics**: KV rate limiting edge

### Key Documentation Highlights:

#### Edge Configuration
- Edge runtime support is available through `@vercel/edge-config` package
- Automatic environment variable detection for Vercel deployments
- Supports both Edge Functions and standard Node.js runtimes

#### KV Store Setup
```typescript
import { kv } from '@vercel/kv';

// Basic key-value operations
await kv.set('key', 'value');
const data = await kv.get('key');

// With expiration for rate limiting
await kv.set('key2', 'value2', { ex: 1 }); // expires in 1 second
```

#### SvelteKit Integration
```typescript
import { createClient } from '@vercel/kv';
import { KV_REST_API_URL, KV_REST_API_TOKEN } from '$env/static/private';

const kv = createClient({
  url: KV_REST_API_URL,
  token: KV_REST_API_TOKEN
});

await kv.set('key', 'value');
```

#### Rate Limiting Pattern
- Use KV with expiration for implementing rate limiting
- Keys can be constructed using user identifiers (IP, user ID, etc.)
- Set expiration based on rate limit window
- Increment counters atomically

## 2. Supabase - RLS (Row Level Security) and JWT Claims

**Library ID**: `/supabase/supabase`
**Topics**: RLS row level security JWT claims

### Key Documentation Highlights:

#### Basic RLS Setup
```sql
-- Enable RLS on a table
alter table tablename enable row level security;

-- Create a policy for authenticated users
create policy "Users can query their own data"
on tablename for select to authenticated using (
  auth.uid() = user_id
);
```

#### JWT Claims Access
```sql
-- Access JWT claims in RLS policies
auth.jwt() -- returns full JWT
auth.uid() -- returns user ID from JWT sub claim
auth.jwt()->>'email' -- access email claim
auth.jwt()->>'aal' -- access auth assurance level
auth.jwt()->>'is_anonymous' -- check if anonymous user
```

#### Multi-Factor Authentication Enforcement
```sql
create policy "Require MFA for sensitive operations"
on tablename
as restrictive
for all
to authenticated
using ((select auth.jwt()->>'aal') = 'aal2');
```

#### Custom Claims and RBAC
```sql
-- Access custom claims in app_metadata
create policy "Check user role"
on tablename
to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- Team membership check
create policy "User is in team"
on my_table
to authenticated
using ( team_id in (select auth.jwt() -> 'app_metadata' -> 'teams'));
```

#### SSO Integration
```sql
-- Access SSO provider information
auth.jwt()#>>'{amr,0,method}' -- authentication method
auth.jwt()#>>'{amr,0,provider}' -- SSO provider UUID
auth.jwt()#>>'{user_metadata,iss}' -- identity provider's EntityID
```

#### Performance Optimization
```sql
-- Wrap auth functions in SELECT for performance
create policy "optimized_policy" on test_table
to authenticated
using ( (select auth.uid()) = user_id ); -- Note the wrapping SELECT

-- Specify roles explicitly to avoid unnecessary processing
create policy "select_policy" on your_table 
for select to authenticated -- Excludes 'anon' role
using (auth.uid() = user_id);
```

#### Security Definer Functions for Complex Logic
```sql
create or replace function public.authorize(
  requested_permission app_permission
)
returns boolean as $$
declare
  bind_permissions int;
  user_role public.app_role;
begin
  -- Fetch user role once and store it
  select (auth.jwt() ->> 'user_role')::public.app_role into user_role;

  select count(*)
  into bind_permissions
  from public.role_permissions
  where role_permissions.permission = requested_permission
    and role_permissions.role = user_role;

  return bind_permissions > 0;
end;
$$ language plpgsql stable security definer set search_path = '';
```

## 3. SvelteKit - Adapter Configuration and Route Splitting

**Library ID**: `/sveltejs/kit`
**Topics**: adapter configuration route splitting edge runtime

### Key Documentation Highlights:

#### Vercel Adapter Configuration
```javascript
import adapter from '@sveltejs/adapter-vercel';

export default {
  kit: {
    adapter: adapter({
      // Enable route splitting for optimal performance
      split: true,
      
      // Configure image optimization
      images: {
        sizes: [640, 828, 1200, 1920, 3840],
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 300
      }
    })
  }
};
```

#### Edge Runtime Configuration
```javascript
// +page.js or +server.js
export const config = {
  runtime: 'edge',
  regions: ['iad1', 'sfo1'], // Multi-region deployment
};
```

#### Route-Specific Configuration
```javascript
// +layout.js - applies to all child routes
export const config = {
  runtime: 'nodejs22.x',
  regions: ['iad1'],
  memory: 1024,
  maxDuration: 15
};

// +page.js - override for specific page
export const config = {
  runtime: 'edge', // Edge for this specific route
  regions: 'all'
};
```

#### Incremental Static Regeneration (ISR)
```javascript
import { BYPASS_TOKEN } from '$env/static/private';

export const config = {
  isr: {
    expiration: 60,
    bypassToken: BYPASS_TOKEN,
    allowQuery: ['search']
  }
};
```

#### Netlify Adapter with Edge Functions
```javascript
import adapter from '@sveltejs/adapter-netlify';

export default {
  kit: {
    adapter: adapter({
      edge: true, // Use Deno-based edge functions
      split: false // Cannot split with edge functions
    })
  }
};
```

#### Cloudflare Adapter Configuration
```javascript
import adapter from '@sveltejs/adapter-cloudflare';

export default {
  kit: {
    adapter: adapter({
      platformProxy: {
        persist: true
      },
      routes: {
        include: ['/*'],
        exclude: ['<all>']
      }
    })
  }
};
```

#### Route Organization Patterns
```
src/routes/
├ (app)/              # Layout group
│ ├ dashboard/
│ └ +layout.svelte
├ (marketing)/        # Another layout group
│ ├ about/
│ └ +layout.svelte
└ api/
  └ [...path]/        # Catch-all API routes
```

## 4. Vitest - Coverage Configuration

**Library ID**: `/vitest-dev/vitest`
**Topics**: coverage configuration

### Key Documentation Highlights:

#### Basic Coverage Setup
```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      provider: 'v8', // or 'istanbul'
      reporter: ['text', 'html', 'clover', 'json'],
      reportsDirectory: './coverage',
      
      // Include source files
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['**/*.test.{ts,tsx}', '**/node_modules/**'],
      
      // Coverage thresholds
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
        perFile: true,
        autoUpdate: true, // Update thresholds when coverage improves
        100: false // Set all to 100%
      }
    }
  }
})
```

#### Advanced Coverage Options
```typescript
coverage: {
  // Report even on test failure
  reportOnFailure: true,
  
  // Skip files with 100% coverage
  skipFull: true,
  
  // Allow coverage of files outside project root
  allowExternal: false,
  
  // Clean coverage before each run
  clean: true,
  cleanOnRerun: true,
  
  // Exclude after source map remapping
  excludeAfterRemap: false,
  
  // Ignore specific class methods
  ignoreClassMethods: ['constructor'],
  
  // Processing concurrency
  processingConcurrency: Math.min(20, os.cpus().length),
  
  // Watermarks for visual indicators
  watermarks: {
    statements: [50, 80],
    functions: [50, 80],
    branches: [50, 80],
    lines: [50, 80]
  }
}
```

#### Custom Coverage Reporters
```typescript
coverage: {
  reporter: [
    ['lcov', { projectRoot: './src' }],
    ['json', { file: 'coverage.json' }],
    ['text'],
    // Custom reporter
    '@vitest/custom-coverage-reporter',
    ['./custom-reporter.cjs', { someOption: true }]
  ]
}
```

#### Per-File and Pattern-Based Thresholds
```typescript
coverage: {
  thresholds: {
    // Global thresholds
    functions: 95,
    branches: 70,

    // Pattern-specific thresholds
    'src/utils/**.ts': {
      statements: 95,
      functions: 90,
      branches: 85,
      lines: 80,
    },
    
    // Force 100% coverage for specific files
    '**/critical/*.ts': { 100: true }
  }
}
```

#### Coverage Performance Optimization
```bash
# Debug slow coverage generation
DEBUG=vitest:coverage vitest --run --coverage
```

## 5. Zod - Schema-First Component Props

**Library ID**: `/colinhacks/zod`
**Topics**: schema-first component props patterns

### Key Documentation Highlights:

#### Basic Object Schema Definition
```typescript
import { z } from 'zod';

// Define schema first
const PersonSchema = z.object({
  name: z.string(),
  age: z.number(),
  email: z.string().email()
});

// Derive type from schema
type Person = z.infer<typeof PersonSchema>;
```

#### Component Props Pattern
```typescript
// Define props schema
const ButtonPropsSchema = z.object({
  label: z.string(),
  variant: z.enum(['primary', 'secondary', 'danger']),
  size: z.enum(['small', 'medium', 'large']).optional(),
  disabled: z.boolean().optional(),
  onClick: z.function().args().returns(z.void()).optional()
});

// Derive props type
type ButtonProps = z.infer<typeof ButtonPropsSchema>;

// Use in Svelte component
<script lang="ts">
  export let label: ButtonProps['label'];
  export let variant: ButtonProps['variant'];
  export let size: ButtonProps['size'] = 'medium';
  export let disabled: ButtonProps['disabled'] = false;
  export let onClick: ButtonProps['onClick'];
</script>
```

#### Schema Composition and Extension
```typescript
// Base schema
const BasePropsSchema = z.object({
  className: z.string().optional(),
  style: z.record(z.string()).optional()
});

// Extend with spread operator (recommended)
const ButtonPropsSchema = z.object({
  ...BasePropsSchema.shape,
  label: z.string(),
  variant: z.enum(['primary', 'secondary'])
});

// Or use merge
const ExtendedSchema = BasePropsSchema.merge(ButtonPropsSchema);
```

#### Optional and Nullable Patterns
```typescript
// Make specific fields optional
const PartialSchema = PersonSchema.partial({
  email: true,
  age: true
});

// Make all fields optional
const AllOptionalSchema = PersonSchema.partial();

// Nullable fields
const NullableSchema = z.object({
  name: z.string(),
  nickname: z.string().nullable(), // string | null
  bio: z.string().nullish() // string | null | undefined
});
```

#### Advanced Patterns for Components
```typescript
// Discriminated unions for variant props
const ButtonSchema = z.discriminatedUnion('variant', [
  z.object({
    variant: z.literal('link'),
    href: z.string().url(),
    target: z.enum(['_blank', '_self']).optional()
  }),
  z.object({
    variant: z.literal('button'),
    type: z.enum(['button', 'submit', 'reset']),
    form: z.string().optional()
  })
]);

// Recursive schemas for nested components
const MenuItemSchema = z.object({
  label: z.string(),
  icon: z.string().optional(),
  get children() {
    return z.array(MenuItemSchema).optional();
  }
});

// Runtime validation in components
const validateProps = <T>(schema: z.ZodSchema<T>, props: unknown): T => {
  const result = schema.safeParse(props);
  if (!result.success) {
    console.error('Invalid props:', result.error.format());
    throw new Error('Invalid component props');
  }
  return result.data;
};
```

#### Form Integration Pattern
```typescript
// Form schema
const ContactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters')
});

// Use with form validation
const validateForm = (data: unknown) => {
  return ContactFormSchema.safeParse(data);
};

// Extract field-level schemas
const emailFieldSchema = ContactFormSchema.shape.email;
```

## Summary

These documentation references provide comprehensive guidance for implementing:

1. **Vercel KV**: Edge-compatible key-value storage for rate limiting with automatic expiration
2. **Supabase RLS**: Fine-grained access control using JWT claims and PostgreSQL policies
3. **SvelteKit**: Flexible adapter configuration for edge deployment and route optimization
4. **Vitest**: Comprehensive coverage configuration with thresholds and reporting
5. **Zod**: Type-safe schema-first development patterns for component props

All libraries have been selected for their edge compatibility, TypeScript support, and alignment with the TDD workflow requirements.