# Context7 Library Documentation Cache

## Updated: Using @supabase/ssr (Current Recommended Approach)

The `@supabase/auth-helpers-sveltekit` package is deprecated. Use `@supabase/ssr` instead.

## @supabase/ssr - Server & Browser Client Setup

### Installation:
```bash
npm install @supabase/supabase-js @supabase/ssr
```

### Key Patterns:

1. **Server Client Creation**:
   ```typescript
   import { createServerClient } from '@supabase/ssr'
   
   const supabase = createServerClient(url, key, {
     cookies: {
       getAll: () => event.cookies.getAll(),
       setAll: (cookiesToSet) => {
         cookiesToSet.forEach(({ name, value, options }) => {
           event.cookies.set(name, value, { ...options, path: '/' })
         })
       }
     }
   })
   ```

2. **Browser Client Creation**:
   ```typescript
   import { createBrowserClient } from '@supabase/ssr'
   
   const supabase = createBrowserClient(url, key, {
     global: { fetch },
   })
   ```

3. **Safe Session Helper**:
   ```typescript
   const safeGetSession = async () => {
     const { data: { session } } = await supabase.auth.getSession()
     if (!session) return { session: null, user: null }
     
     const { data: { user }, error } = await supabase.auth.getUser()
     if (error) return { session: null, user: null }
     
     return { session, user }
   }
   ```

## Supabase Auth & SvelteKit Integration (Legacy Patterns)

### Key Patterns:

1. **OAuth with Google**: 
   - Use `supabase.auth.signInWithOAuth({ provider: 'google' })`
   - Server-side redirect: `throw redirect(303, data.url)`

2. **Session Management**:
   - Use `safeGetSession()` helper for secure JWT validation
   - Implement auth state listener with `onAuthStateChange`

3. **Route Protection**:
   - Server hooks: `src/hooks.server.ts` with `sequence(supabase, authorization)`
   - Protected pages: Check session in `+page.server.ts` load functions
   - Protected API routes: Check session in `+server.ts` handlers

4. **Role-Based Access**:
   - Custom claims for roles ('customer', 'staff', 'owner')
   - SQL schema with `user_roles` and `role_permissions` tables

## Zod Validation

### Key Patterns:

1. **Schema Definition**:
   ```typescript
   const UserSchema = z.object({
     email: z.string().email(),
     role: z.enum(['customer', 'staff', 'owner'])
   });
   ```

2. **Input Validation**:
   - Use `.parse()` for synchronous validation
   - Use `.safeParse()` for error handling without try/catch

3. **Form Validation**:
   - Validate request bodies and form data
   - Create schemas for all user inputs

## SvelteKit Security

### Built-in Features:
- CSRF protection (automatic)
- Secure headers via hooks
- Server-side validation in load functions

### Rate Limiting:
- Implement in hooks.server.ts
- Use middleware pattern for API endpoints