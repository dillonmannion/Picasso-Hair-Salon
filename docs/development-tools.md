# Development Tools Documentation

This document covers ESLint, Prettier, TypeScript, and other development tools used in the project.

## ESLint

**Current version in project**: 9.17.0

### Overview

ESLint is a static code analysis tool for identifying problematic patterns in JavaScript/TypeScript code.

### Configuration

```javascript
// eslint.config.js
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import typescript from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import svelteParser from 'svelte-eslint-parser';

export default [
	js.configs.recommended,
	{
		files: ['**/*.ts', '**/*.tsx'],
		plugins: {
			'@typescript-eslint': typescript
		},
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaVersion: 2022,
				sourceType: 'module'
			}
		},
		rules: {
			'@typescript-eslint/no-unused-vars': 'warn',
			'@typescript-eslint/no-explicit-any': 'warn'
		}
	},
	{
		files: ['**/*.svelte'],
		plugins: {
			svelte
		},
		languageOptions: {
			parser: svelteParser,
			parserOptions: {
				parser: tsParser
			}
		},
		rules: svelte.configs.recommended.rules
	}
];
```

### Common Rules

```javascript
{
  // TypeScript
  '@typescript-eslint/no-unused-vars': 'error',
  '@typescript-eslint/explicit-function-return-type': 'off',
  '@typescript-eslint/no-explicit-any': 'warn',

  // Svelte
  'svelte/valid-compile': 'error',
  'svelte/no-unused-svelte-ignore': 'warn',

  // General
  'no-console': 'warn',
  'no-debugger': 'error',
  'prefer-const': 'error',
  'no-var': 'error'
}
```

### Scripts

```json
{
	"scripts": {
		"lint": "eslint . --ext .js,.ts,.svelte",
		"lint:fix": "eslint . --ext .js,.ts,.svelte --fix"
	}
}
```

## Prettier

**Current version in project**: 3.4.2

### Overview

Prettier is an opinionated code formatter that ensures consistent code style.

### Configuration

```javascript
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "always",
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-svelte"],
  "overrides": [
    {
      "files": "*.svelte",
      "options": {
        "parser": "svelte"
      }
    }
  ]
}
```

### Ignore Files

```
# .prettierignore
node_modules
dist
build
coverage
.svelte-kit
package-lock.json
pnpm-lock.yaml
```

### Scripts

```json
{
	"scripts": {
		"format": "prettier --write .",
		"format:check": "prettier --check ."
	}
}
```

## TypeScript

**Current version in project**: 5.7.3

### Overview

TypeScript adds static typing to JavaScript, enabling better tooling and error detection.

### Configuration

```json
// tsconfig.json
{
	"extends": "./.svelte-kit/tsconfig.json",
	"compilerOptions": {
		"allowJs": true,
		"checkJs": true,
		"esModuleInterop": true,
		"forceConsistentCasingInFileNames": true,
		"resolveJsonModule": true,
		"skipLibCheck": true,
		"sourceMap": true,
		"strict": true,
		"target": "ES2022",
		"module": "ES2022",
		"moduleResolution": "bundler",
		"lib": ["ES2022", "DOM", "DOM.Iterable"],
		"types": ["vite/client", "vitest/globals"],
		"paths": {
			"$lib": ["./src/lib"],
			"$lib/*": ["./src/lib/*"]
		}
	},
	"include": ["src/**/*.ts", "src/**/*.js", "src/**/*.svelte"],
	"exclude": ["node_modules"]
}
```

### Common Types

```typescript
// Svelte component props
interface Props {
	name: string;
	age?: number;
	onUpdate: (value: string) => void;
}

// API types
interface User {
	id: string;
	email: string;
	name: string;
	createdAt: Date;
}

// Form types
interface FormData {
	email: string;
	password: string;
}

// Utility types
type Nullable<T> = T | null;
type Optional<T> = T | undefined;
```

## svelte-check

**Current version in project**: 4.1.2

### Overview

Type-checks Svelte components and provides diagnostics.

### Usage

```bash
# Check all files
npx svelte-check

# Watch mode
npx svelte-check --watch

# Specific tsconfig
npx svelte-check --tsconfig ./tsconfig.json
```

### Scripts

```json
{
	"scripts": {
		"check": "svelte-check --tsconfig ./tsconfig.json",
		"check:watch": "svelte-check --tsconfig ./tsconfig.json --watch"
	}
}
```

## @sveltejs/package

**Current version in project**: 2.3.7

### Overview

Tool for packaging Svelte libraries for distribution.

### Configuration

```json
// package.json for library
{
	"name": "my-svelte-lib",
	"exports": {
		".": {
			"types": "./dist/index.d.ts",
			"svelte": "./dist/index.js"
		}
	},
	"files": ["dist"],
	"svelte": "./dist/index.js",
	"types": "./dist/index.d.ts"
}
```

### Usage

```bash
# Package library
svelte-package

# With options
svelte-package --input ./src/lib --output ./dist
```

## publint

**Current version in project**: 0.2.12

### Overview

Lints npm packages to ensure they're published correctly.

### Usage

```bash
# Lint package
npx publint

# With specific directory
npx publint ./dist

# Check before publish
npm run build && npx publint
```

## @testing-library/svelte

**Current version in project**: 5.2.6

### Overview

Testing utilities for Svelte components.

### Basic Usage

```typescript
import { render, screen, fireEvent } from '@testing-library/svelte';
import { expect, test } from 'vitest';
import Button from './Button.svelte';

test('renders button', async () => {
	render(Button, { props: { text: 'Click me' } });

	const button = screen.getByRole('button');
	expect(button).toHaveTextContent('Click me');

	await fireEvent.click(button);
});
```

### Common Queries

```typescript
// By role
screen.getByRole('button', { name: /submit/i });
screen.getByRole('textbox', { name: /email/i });

// By label
screen.getByLabelText(/password/i);

// By text
screen.getByText(/welcome/i);

// By placeholder
screen.getByPlaceholderText(/search/i);

// By test id
screen.getByTestId('submit-button');
```

## Zod

**Current version in project**: 3.24.1

### Overview

TypeScript-first schema validation library.

### Basic Usage

```typescript
import { z } from 'zod';

// Define schema
const UserSchema = z.object({
	name: z.string().min(1),
	email: z.string().email(),
	age: z.number().int().positive(),
	role: z.enum(['user', 'admin']),
	metadata: z.record(z.string()).optional()
});

// Infer type
type User = z.infer<typeof UserSchema>;

// Validate
try {
	const user = UserSchema.parse(data);
} catch (error) {
	if (error instanceof z.ZodError) {
		console.log(error.errors);
	}
}

// Safe parse
const result = UserSchema.safeParse(data);
if (result.success) {
	console.log(result.data);
} else {
	console.log(result.error);
}
```

### Form Validation

```typescript
const LoginSchema = z.object({
	email: z.string().email('Invalid email'),
	password: z.string().min(8, 'Password must be at least 8 characters')
});

const RegisterSchema = LoginSchema.extend({
	confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
	message: "Passwords don't match",
	path: ['confirmPassword']
});
```

## date-fns

**Current version in project**: 4.2.0

### Overview

Modern JavaScript date utility library.

### Common Usage

```typescript
import { format, parseISO, addDays, differenceInDays, startOfMonth, endOfMonth } from 'date-fns';

// Format dates
format(new Date(), 'yyyy-MM-dd'); // 2024-01-15
format(new Date(), 'PPP'); // January 15th, 2024

// Parse dates
const date = parseISO('2024-01-15T10:00:00Z');

// Manipulate dates
const tomorrow = addDays(new Date(), 1);
const nextWeek = addDays(new Date(), 7);

// Calculate differences
const days = differenceInDays(new Date('2024-12-25'), new Date());

// Get boundaries
const monthStart = startOfMonth(new Date());
const monthEnd = endOfMonth(new Date());
```

## clsx & tailwind-merge

**Current versions in project**:

- clsx: 2.1.1
- tailwind-merge: 2.7.0

### Overview

Utilities for constructing className strings conditionally.

### Usage

```typescript
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// clsx - conditional classes
const className = clsx(
  'base-class',
  isActive && 'active',
  isDisabled && 'disabled',
  {
    'hover:bg-gray-100': !isDisabled,
    'cursor-not-allowed': isDisabled
  }
);

// tailwind-merge - merge Tailwind classes
const merged = twMerge('px-2 py-1', 'px-4'); // Result: 'py-1 px-4'

// Combined utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage
<div class={cn(
  'rounded-lg p-4',
  variant === 'primary' && 'bg-blue-500 text-white',
  variant === 'secondary' && 'bg-gray-200',
  className
)} />
```

## Best Practices

### 1. Code Quality

- Run linting before commits
- Use Prettier for consistent formatting
- Enable TypeScript strict mode
- Write type-safe code

### 2. Testing

- Use Testing Library queries
- Test user behavior, not implementation
- Mock external dependencies
- Validate with Zod schemas

### 3. Development Workflow

- Use pre-commit hooks
- Run type checking in CI
- Automate formatting
- Keep dependencies updated

### 4. Performance

- Use date-fns for tree-shaking
- Optimize bundle with publint
- Lazy load heavy utilities
- Profile with development tools

## Quick Reference

### Scripts

```json
{
	"scripts": {
		"dev": "vite dev",
		"build": "vite build",
		"preview": "vite preview",
		"test": "vitest",
		"lint": "eslint .",
		"format": "prettier --write .",
		"check": "svelte-check",
		"validate": "npm run lint && npm run check && npm run test:run"
	}
}
```

### VS Code Settings

```json
{
	"editor.formatOnSave": true,
	"editor.defaultFormatter": "esbenp.prettier-vscode",
	"[svelte]": {
		"editor.defaultFormatter": "svelte.svelte-vscode"
	},
	"eslint.validate": ["javascript", "typescript", "svelte"],
	"typescript.tsdk": "node_modules/typescript/lib"
}
```
