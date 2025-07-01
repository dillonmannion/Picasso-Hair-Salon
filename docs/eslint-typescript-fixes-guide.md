# ESLint and TypeScript Error Fixing Guide for SvelteKit 5

## Overview

This guide contains the latest documentation for fixing TypeScript and ESLint errors in a SvelteKit 5 project with the following stack:

- SvelteKit 5 with runes mode
- TypeScript with strict mode
- ESLint with TypeScript plugin
- Svelte ESLint plugin

## Key Configuration Files

### 1. TypeScript Configuration (tsconfig.json)

Key strict mode settings:

```json
{
	"compilerOptions": {
		"strict": true,
		"strictNullChecks": true,
		"noImplicitAny": true,
		"strictPropertyInitialization": true,
		"verbatimModuleSyntax": true,
		"isolatedModules": true,
		"lib": ["esnext", "DOM", "DOM.Iterable"],
		"moduleResolution": "bundler",
		"module": "esnext",
		"target": "esnext"
	}
}
```

### 2. ESLint Configuration for SvelteKit

```js
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

export default ts.config(
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig
			}
		}
	}
);
```

## Common TypeScript Errors and Fixes

### 1. Implicit Any Type (TS7006)

**Error**: Parameter 'x' implicitly has an 'any' type

**Fix**: Add explicit type annotations

```ts
// Bad
function foo(x) {}

// Good
function foo(x: string) {}
```

### 2. Strict Null Checks (TS2454)

**Error**: Variable is used before being assigned

**Fix**: Initialize variables or use definite assignment assertion

```ts
// Bad
let y: string;
y.toLowerCase();

// Good
let y: string = '';
y.toLowerCase();

// Or with optional
let y: string | undefined;
y?.toLowerCase();
```

### 3. Reserved Words in Strict Mode (TS1213)

**Error**: Identifier expected. 'yield' is a reserved word in strict mode

**Fix**: Avoid using reserved words as identifiers

```ts
// Bad
let yield: string;

// Good
let yieldValue: string;
```

### 4. Module Imports (Verbatim Module Syntax)

**Error**: Import type issues

**Fix**: Use explicit type imports

```ts
// Bad
import { SomeType } from './types';

// Good
import type { SomeType } from './types';
```

## Common ESLint TypeScript Rules

### 1. @typescript-eslint/no-explicit-any

**Fix**: Avoid using `any` type

```ts
// Bad
let data: any;

// Good
let data: unknown;
// or specific type
let data: { name: string; age: number };
```

### 2. @typescript-eslint/no-unused-vars

**Fix**: Remove or use variables

```ts
// Bad
const unused = 42;

// Good
const used = 42;
console.log(used);

// Or prefix with underscore for intentionally unused
const _unused = 42;
```

### 3. @typescript-eslint/no-floating-promises

**Fix**: Handle promises properly

```ts
// Bad
asyncFunction();

// Good
await asyncFunction();
// or
void asyncFunction();
// or
asyncFunction().catch(handleError);
```

### 4. @typescript-eslint/strict-boolean-expressions

**Fix**: Be explicit with boolean checks

```ts
// Bad
if (value) {
}

// Good
if (value !== null && value !== undefined) {
}
// or
if (value ?? false) {
}
```

### 5. @typescript-eslint/no-unsafe-assignment

**Fix**: Avoid assigning `any` typed values

```ts
// Bad
const foo = JSON.parse(str);

// Good
const foo = JSON.parse(str) as { name: string };
// or validate
const foo = validateData(JSON.parse(str));
```

## Svelte-Specific ESLint Rules

### 1. svelte/no-at-html-tags

**Fix**: Avoid using `{@html}` directive

```svelte
<!-- Bad -->
{@html content}

<!-- Good -->
{content}
<!-- Or use a sanitization library if HTML is needed -->
```

### 2. svelte/require-store-reactive-access

**Fix**: Use $ prefix for store access

```svelte
<script>
	import { myStore } from './stores';
</script>

<!-- Bad -->
{myStore}

<!-- Good -->
{$myStore}
```

### 3. svelte/valid-compile

**Fix**: Address Svelte compiler warnings

```svelte
<!-- Bad -->
<img src={url} />

<!-- Good -->
<img src={url} alt="Description" />
```

### 4. svelte/no-reactive-reassign

**Fix**: Don't reassign reactive values

```svelte
<script>
	export let value = 0;

	// Bad
	value = value + 1;

	// Good (for props in runes mode)
	let localValue = $state(value);
	localValue = localValue + 1;
</script>
```

## SvelteKit 5 Runes Mode Specific

### 1. Using $state and $derived

```svelte
<script>
	// State management
	let count = $state(0);

	// Derived values
	let doubled = $derived(count * 2);

	// Effects
	$effect(() => {
		console.log('Count changed:', count);
	});
</script>
```

### 2. Props with TypeScript

```svelte
<script lang="ts">
	interface Props {
		name: string;
		age?: number;
	}

	let { name, age = 18 }: Props = $props();
</script>
```

### 3. Migrating from Stores to State

```svelte
<script>
	// Old (stores)
	import { page } from '$app/stores';
	$: currentPath = $page.url.pathname;

	// New (state)
	import { page } from '$app/state';
	let currentPath = $derived(page.url.pathname);
</script>
```

## Best Practices

1. **Enable TypeScript strict mode** for better type safety
2. **Use type imports** with `import type` for types
3. **Avoid `any` type** - use `unknown` and type guards
4. **Handle all promise rejections** explicitly
5. **Be explicit with null checks** using optional chaining
6. **Use ESLint auto-fix** where possible: `p lint --fix`
7. **Run type checking** regularly: `p type-check`

## Common Fix Commands

```bash
# Format code
p format

# Fix linting issues
p lint --fix

# Type check
p type-check

# Run all checks
p check:fix
```

## Migration Tips

1. Start with `p format` to fix formatting
2. Run `p lint --fix` to auto-fix simple issues
3. Address TypeScript errors with `p type-check`
4. Fix remaining ESLint errors manually
5. Use `// @ts-expect-error` sparingly for temporary fixes
6. Gradually enable stricter rules as you fix issues
