# Vitest Documentation

## Overview

**Vitest** is a next-generation testing framework powered by Vite. It's designed to be fast, feature-rich, and provides a delightful developer experience with native ES modules support, TypeScript integration, and smart watch mode.

**Current version in project**: 3.0.1

## Why Use Vitest?

- **Lightning Fast**: Powered by Vite with instant HMR for tests
- **ES Modules First**: Native ESM support with top-level await
- **Smart Watch Mode**: Only reruns related tests on file changes
- **Compatible APIs**: Jest-compatible APIs for easy migration
- **Built-in Features**: Mocking, snapshots, coverage out of the box
- **TypeScript Support**: First-class TypeScript support
- **Component Testing**: Browser testing for UI components
- **Parallel Execution**: Run tests in parallel with worker threads

## Installation & Setup

### 1. Install Dependencies

```bash
# Install Vitest
npm install -D vitest

# Optional: Install UI
npm install -D @vitest/ui

# Optional: Install coverage
npm install -D @vitest/coverage-v8
```

### 2. Add Test Script

```json
// package.json
{
	"scripts": {
		"test": "vitest",
		"test:ui": "vitest --ui",
		"test:run": "vitest run",
		"coverage": "vitest run --coverage"
	}
}
```

### 3. Configure Vitest

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: ['./src/test/setup.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html']
		}
	}
});
```

Or extend from Vite config:

```typescript
// vite.config.ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite';

export default defineConfig({
	// Vite options
	test: {
		// Vitest options
	}
});
```

## Core Concepts

### 1. Writing Tests

#### Basic Test Structure

```typescript
import { describe, it, expect, test } from 'vitest';

// Using test
test('adds 1 + 2 to equal 3', () => {
	expect(1 + 2).toBe(3);
});

// Using describe and it
describe('math operations', () => {
	it('should add numbers correctly', () => {
		expect(1 + 1).toEqual(2);
	});

	it('should multiply numbers correctly', () => {
		expect(2 * 3).toBe(6);
	});
});
```

#### Async Tests

```typescript
import { test, expect } from 'vitest';

// Using async/await
test('async operation', async () => {
	const data = await fetchData();
	expect(data).toEqual({ name: 'test' });
});

// Using promises
test('promise test', () => {
	return fetchData().then((data) => {
		expect(data).toEqual({ name: 'test' });
	});
});
```

### 2. Assertions

Vitest supports both Jest and Chai assertion styles:

```typescript
import { expect, assert } from 'vitest';

// Jest-style assertions
expect(value).toBe(2);
expect(value).toEqual({ a: 1 });
expect(value).toBeNull();
expect(value).toBeDefined();
expect(value).toBeTruthy();
expect(value).toContain('test');
expect(value).toHaveLength(3);
expect(fn).toThrow();
expect(fn).toHaveBeenCalled();
expect(fn).toHaveBeenCalledWith('arg');

// Chai-style assertions
expect(value).to.equal(2);
expect(value).to.be.true;
assert.equal(value, 2);
assert.isTrue(value);
```

### 3. Mocking

#### Mock Functions

```typescript
import { vi, expect, test } from 'vitest';

// Create a mock function
const mockFn = vi.fn();
mockFn('arg1', 'arg2');

expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledTimes(1);
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');

// Mock implementation
const mockAdd = vi.fn((a, b) => a + b);
expect(mockAdd(1, 2)).toBe(3);

// Mock return values
mockFn.mockReturnValue(42);
mockFn.mockReturnValueOnce(10);
mockFn.mockResolvedValue('async value');
```

#### Module Mocking

```typescript
import { vi } from 'vitest';

// Mock a module
vi.mock('./module', () => ({
	default: vi.fn(),
	namedExport: vi.fn()
}));

// Partial mocking
vi.mock('./module', async (importOriginal) => {
	const actual = await importOriginal();
	return {
		...actual,
		specificFunction: vi.fn()
	};
});
```

#### Spying

```typescript
import { vi, expect } from 'vitest';

const obj = {
	method: (a: number) => a * 2
};

// Create a spy
const spy = vi.spyOn(obj, 'method');
obj.method(5);

expect(spy).toHaveBeenCalledWith(5);
expect(spy).toHaveReturnedWith(10);

// Restore original implementation
spy.mockRestore();
```

### 4. Setup and Teardown

```typescript
import { beforeEach, afterEach, beforeAll, afterAll } from 'vitest';

// Run before each test
beforeEach(() => {
	// Reset database
	resetDb();
});

// Run after each test
afterEach(() => {
	// Cleanup
	vi.clearAllMocks();
});

// Run once before all tests
beforeAll(async () => {
	// Setup test server
	await startServer();
});

// Run once after all tests
afterAll(async () => {
	// Teardown
	await stopServer();
});
```

### 5. Test Context

```typescript
import { test } from 'vitest';

// Extend test context
const myTest = test.extend({
	db: async ({}, use) => {
		const db = await createTestDatabase();
		await use(db);
		await db.cleanup();
	}
});

myTest('uses database', ({ db }) => {
	// Use the db fixture
	db.insert({ name: 'test' });
});
```

## API Reference

### Test Functions

```typescript
// Define a test
test('name', fn, timeout?)
it('name', fn, timeout?)

// Skip a test
test.skip('name', fn)
it.skip('name', fn)

// Only run specific tests
test.only('name', fn)
it.only('name', fn)

// Todo tests
test.todo('implement this feature')

// Conditional tests
test.skipIf(condition)('name', fn)
test.runIf(condition)('name', fn)

// Concurrent tests
test.concurrent('name', fn)

// Parameterized tests
test.each([
  [1, 1, 2],
  [1, 2, 3],
  [2, 1, 3]
])('add(%i, %i) -> %i', (a, b, expected) => {
  expect(a + b).toBe(expected)
})
```

### Mocking Utilities

```typescript
// Mock functions
vi.fn(implementation?)
vi.spyOn(object, method)

// Mock timers
vi.useFakeTimers()
vi.useRealTimers()
vi.setSystemTime(date)
vi.advanceTimersByTime(ms)

// Mock modules
vi.mock(path, factory?)
vi.unmock(path)
vi.resetModules()

// Mock globals
vi.stubGlobal(name, value)
vi.unstubAllGlobals()

// Clear mocks
vi.clearAllMocks()
vi.resetAllMocks()
vi.restoreAllMocks()
```

## Code Examples

### Testing Async Code

```typescript
import { test, expect } from 'vitest';

// API service
async function fetchUser(id: string) {
	const response = await fetch(`/api/users/${id}`);
	return response.json();
}

// Test
test('fetches user data', async () => {
	const user = await fetchUser('123');

	expect(user).toMatchObject({
		id: '123',
		name: expect.any(String),
		email: expect.stringContaining('@')
	});
});

// With error handling
test('handles fetch errors', async () => {
	await expect(fetchUser('invalid')).rejects.toThrow('User not found');
});
```

### Component Testing

```typescript
import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Button from './Button.svelte';

test('renders button with text', async () => {
	render(Button, { props: { text: 'Click me' } });

	const button = screen.getByRole('button');
	expect(button).toHaveTextContent('Click me');
});

test('handles click events', async () => {
	const handleClick = vi.fn();
	render(Button, {
		props: {
			text: 'Click me',
			onClick: handleClick
		}
	});

	const button = screen.getByRole('button');
	await button.click();

	expect(handleClick).toHaveBeenCalledOnce();
});
```

### Snapshot Testing

```typescript
import { test, expect } from 'vitest';

test('matches snapshot', () => {
	const data = {
		user: 'John',
		age: 30,
		roles: ['admin', 'user']
	};

	expect(data).toMatchSnapshot();
});

// Inline snapshots
test('inline snapshot', () => {
	expect({ name: 'test' }).toMatchInlineSnapshot(`
    {
      "name": "test",
    }
  `);
});
```

### Testing with Fake Timers

```typescript
import { test, expect, vi, beforeEach, afterEach } from 'vitest';

beforeEach(() => {
	vi.useFakeTimers();
});

afterEach(() => {
	vi.useRealTimers();
});

test('debounce function', async () => {
	const callback = vi.fn();
	const debounced = debounce(callback, 1000);

	debounced();
	debounced();
	debounced();

	expect(callback).not.toHaveBeenCalled();

	// Fast-forward time
	vi.advanceTimersByTime(1000);

	expect(callback).toHaveBeenCalledOnce();
});

test('scheduled tasks', () => {
	const callback = vi.fn();

	setInterval(callback, 1000);

	// Fast-forward 5 seconds
	vi.advanceTimersByTime(5000);

	expect(callback).toHaveBeenCalledTimes(5);
});
```

### Coverage Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		coverage: {
			provider: 'v8', // or 'istanbul'
			enabled: true,
			reporter: ['text', 'json', 'html', 'lcov'],
			reportsDirectory: './coverage',
			exclude: ['node_modules/', 'src/test/**', '**/*.d.ts', '**/*.config.*', '**/mockData/**'],
			thresholds: {
				lines: 80,
				functions: 80,
				branches: 80,
				statements: 80
			}
		}
	}
});
```

## Best Practices

### 1. Test Organization

- Group related tests with `describe`
- Use descriptive test names
- Follow AAA pattern: Arrange, Act, Assert
- Keep tests focused and isolated

### 2. Mocking Strategy

- Mock external dependencies
- Use spies for verification
- Reset mocks between tests
- Avoid over-mocking

### 3. Async Testing

- Always await async operations
- Use proper error assertions
- Handle both success and failure cases
- Set appropriate timeouts

### 4. Performance

- Use concurrent tests when possible
- Minimize setup/teardown overhead
- Leverage test.each for similar tests
- Use focused tests during development

### 5. Debugging

- Use test.only to isolate tests
- Enable verbose logging
- Use VS Code debugger integration
- Check test execution order

## Troubleshooting

### Common Issues

1. **Module resolution errors**
   - Check tsconfig paths
   - Verify vitest config aliases
   - Ensure proper file extensions

2. **Timeout errors**
   - Increase test timeout
   - Check for missing await
   - Verify async operations complete

3. **Flaky tests**
   - Ensure proper cleanup
   - Avoid timing dependencies
   - Mock external services
   - Use fake timers for time-based logic

4. **Coverage issues**
   - Check coverage exclude patterns
   - Verify source file imports
   - Ensure tests actually execute code

### Debugging Configuration

```json
// .vscode/launch.json
{
	"version": "0.2.0",
	"configurations": [
		{
			"type": "node",
			"request": "launch",
			"name": "Debug Current Test File",
			"autoAttachChildProcesses": true,
			"skipFiles": ["<node_internals>/**", "**/node_modules/**"],
			"program": "${workspaceRoot}/node_modules/vitest/vitest.mjs",
			"args": ["run", "${relativeFile}"],
			"smartStep": true,
			"console": "integratedTerminal"
		}
	]
}
```

## Quick Reference

### CLI Commands

```bash
vitest              # Run in watch mode
vitest run          # Run once
vitest coverage     # Run with coverage
vitest --ui         # Open UI
vitest bench        # Run benchmarks
vitest --reporter=verbose  # Verbose output
```

### Common Matchers

```typescript
expect(value).toBe(expected)          // Strict equality
expect(value).toEqual(expected)       // Deep equality
expect(value).toBeTruthy()           // Truthy check
expect(value).toContain(item)        // Contains check
expect(value).toHaveLength(n)        // Length check
expect(fn).toThrow(error?)           // Error check
expect(fn).toHaveBeenCalled()        // Call check
expect(promise).resolves.toBe(value) // Promise resolution
expect(promise).rejects.toThrow()    // Promise rejection
```

### Configuration Options

```typescript
{
  globals: true,              // Global test APIs
  environment: 'jsdom',       // Test environment
  setupFiles: [],            // Setup files
  include: ['**/*.test.ts'], // Test file patterns
  exclude: ['node_modules'], // Exclude patterns
  coverage: {},              // Coverage options
  reporters: [],             // Test reporters
  outputFile: {},           // Reporter output
}
```
