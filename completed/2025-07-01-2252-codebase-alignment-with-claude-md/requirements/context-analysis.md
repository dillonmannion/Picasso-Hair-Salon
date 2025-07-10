# Context Analysis for Codebase Alignment with CLAUDE.md

## Technology-Specific Best Practices

### Svelte 5 Best Practices (from Context7)

1. **Runes Usage**
   - Use `$state()` for reactive state instead of `let`
   - Use `$derived()` for computed values (replaces `$:`)
   - Use `$effect()` for side effects (replaces `$:` statements)
   - Use `$props()` for component properties (replaces `export let`)
   - Use `$bindable()` for two-way bindings

2. **Component Patterns**
   - Destructure props directly: `let { prop1, prop2 } = $props()`
   - Use options objects for function parameters
   - Components are dynamic by default (no need for `<svelte:component>`)
   - Use `{@render children()}` instead of `<slot />`

3. **Event Handling**
   - Use callback props instead of `createEventDispatcher`
   - Event handlers as properties: `<button {onclick}>` not `<button on:click>`
   - Forward events through props, not re-emitting

4. **TypeScript Integration**
   - Define prop types with interfaces: `let { prop }: Props = $props()`
   - Use `import type` for type-only imports
   - Enable `verbatimModuleSyntax` in tsconfig

### SvelteKit Best Practices (from Context7)

1. **Project Structure**
   - Use `src/lib` for reusable code (aliased as `$lib`)
   - Organize routes semantically
   - Use `+layout` and `+page` conventions consistently

2. **Data Loading**
   - Use `load` functions for data fetching
   - Implement streaming with promises for non-critical data
   - Use `setHeaders` for cache control in load functions

3. **Configuration**
   - Use `defineConfig` from `vite/config` or `vitest/config`
   - Configure adapters based on deployment target
   - Use environment variables properly

4. **Testing**
   - Use Vitest for unit/integration tests
   - Use Playwright for E2E tests
   - Test behavior through public APIs

### Vitest Best Practices (from Context7)

1. **Test Organization**
   - Use `describe` blocks for logical grouping
   - Use `test.concurrent` for parallel execution
   - Use `test.extend` for custom fixtures and context

2. **Configuration**
   - Define projects for different test environments
   - Use `environmentMatchGlobs` for environment-specific tests
   - Configure coverage thresholds appropriately

3. **Testing Patterns**
   - Test behavior, not implementation
   - Use `expect` from test context in concurrent tests
   - Implement in-source testing with `import.meta.vitest` where appropriate

4. **Mocking**
   - Use `vi.hoisted` for mock setup
   - Avoid mocking what you don't own
   - Test through public APIs whenever possible

## Schema-First Design Requirements

Based on the codebase analysis, here are the schemas we need to create:

### 1. User/Profile Schemas

```typescript
// Current database types that need Zod schemas:
- Profile (id, username, full_name, avatar_url, created_at, updated_at)
- User (from Supabase Auth)
```

### 2. Authentication Schemas

```typescript
// OAuth callback validation
-OAuthCallbackParams(code, next) - OAuthErrorParams(error, error_code, error_description);
```

### 3. Component Prop Schemas

```typescript
// Button component props
-ButtonProps(variant, size, HTMLButtonAttributes);
```

### 4. API Response Schemas

```typescript
// Supabase responses
-AuthResponse - ProfileResponse - ErrorResponse;
```

## TDD Implementation Strategy

### Phase 1: Foundation Setup

1. **Install Zod and update dependencies**
2. **Create base schema definitions**
3. **Set up test factories using schemas**
4. **Configure linting rules for CLAUDE.md compliance**

### Phase 2: Test Infrastructure

1. **Remove existing test files (as per Q3 answer)**
2. **Create behavior-driven test structure**
3. **Implement test data factories with Zod schemas**
4. **Set up coverage configuration for 100% behavior coverage**

### Phase 3: Feature Migration

Following strict TDD for each feature:

1. **Authentication Flow**
   - Write behavior tests for login/logout
   - Implement with minimal code
   - Refactor for clarity

2. **Profile Management**
   - Write behavior tests for profile CRUD
   - Implement with Zod validation
   - Refactor for immutability

3. **Protected Routes**
   - Write behavior tests for access control
   - Implement guards
   - Refactor for reusability

### Phase 4: Automation & Enforcement

1. **ESLint Rules**
   - No `any` types
   - No type assertions
   - No comments in code
   - Enforce functional patterns

2. **Pre-commit Hooks**
   - Run type checking
   - Run linting
   - Run tests
   - Check coverage thresholds

3. **CI/CD Updates**
   - Enforce all checks in pipeline
   - Block merges without 100% behavior coverage

## Migration Risks and Mitigations

### Risks

1. **Breaking existing functionality during refactor**
   - Mitigation: Incremental migration with feature flags

2. **Learning curve for strict TDD**
   - Mitigation: Start with simple features, document patterns

3. **Performance impact from immutability**
   - Mitigation: Profile and optimize hot paths

### Benefits

1. **Type safety at runtime with Zod**
2. **Confidence from 100% behavior coverage**
3. **Maintainable, self-documenting code**
4. **Faster development once patterns established**

## Technical Questions Based on Analysis

Based on this context analysis, I need to ask specific technical questions about your implementation preferences...
