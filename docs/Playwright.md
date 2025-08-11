# Playwright Documentation

## Overview

**Playwright** is a powerful end-to-end testing framework that enables reliable cross-browser testing for modern web applications. It provides a unified API to automate Chromium, Firefox, and WebKit browsers.

**Current version in project**: 1.49.1

## Why Use Playwright?

- **Cross-Browser**: Test on Chromium, Firefox, and WebKit with a single API
- **Auto-Wait**: Automatically waits for elements to be ready
- **Web-First Assertions**: Built-in assertions that auto-retry
- **Parallel Execution**: Run tests in parallel for speed
- **Powerful Tooling**: Codegen, trace viewer, and UI mode
- **Mobile Testing**: Test responsive web apps and mobile Safari
- **Network Control**: Mock and modify network requests
- **Visual Testing**: Screenshot and visual regression testing

## Installation & Setup

### 1. Install Playwright

```bash
npm init playwright@latest

# Or add to existing project
npm install -D @playwright/test

# Install browsers
npx playwright install
```

### 2. Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './tests',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: 'html',

	use: {
		baseURL: 'http://localhost:5173',
		trace: 'on-first-retry',
		screenshot: 'only-on-failure'
	},

	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		},
		{
			name: 'firefox',
			use: { ...devices['Desktop Firefox'] }
		},
		{
			name: 'webkit',
			use: { ...devices['Desktop Safari'] }
		},
		// Mobile
		{
			name: 'Mobile Chrome',
			use: { ...devices['Pixel 5'] }
		}
	],

	webServer: {
		command: 'npm run dev',
		url: 'http://localhost:5173',
		reuseExistingServer: !process.env.CI
	}
});
```

## Core Concepts

### 1. Writing Tests

```typescript
import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
	await page.goto('/');

	// Click button
	await page.click('button');

	// Fill input
	await page.fill('input[name="email"]', 'test@example.com');

	// Select option
	await page.selectOption('select', 'value');

	// Check checkbox
	await page.check('input[type="checkbox"]');

	// Assert text
	await expect(page.locator('h1')).toContainText('Welcome');

	// Assert visibility
	await expect(page.locator('.success')).toBeVisible();
});
```

### 2. Locators

```typescript
// By role
await page.getByRole('button', { name: 'Submit' }).click();

// By text
await page.getByText('Welcome').click();

// By label
await page.getByLabel('Email').fill('test@example.com');

// By placeholder
await page.getByPlaceholder('Enter password').fill('secret');

// By test id
await page.getByTestId('submit-button').click();

// CSS selector
await page.locator('.class').click();

// Chaining
await page.locator('article').filter({ hasText: 'Product' }).getByRole('button').click();
```

### 3. Auto-Waiting

```typescript
// Playwright auto-waits for:
// - Element to be attached to DOM
// - Element to be visible
// - Element to be stable
// - Element to receive events

// No need for explicit waits
await page.getByRole('button').click(); // Waits automatically

// Custom waiting
await page.waitForSelector('.loading', { state: 'hidden' });
await page.waitForLoadState('networkidle');
await page.waitForTimeout(1000); // Avoid when possible
```

### 4. Assertions

```typescript
// Web-first assertions (auto-retry)
await expect(page).toHaveTitle('My App');
await expect(page).toHaveURL(/.*dashboard/);
await expect(locator).toBeVisible();
await expect(locator).toBeHidden();
await expect(locator).toBeEnabled();
await expect(locator).toBeDisabled();
await expect(locator).toBeChecked();
await expect(locator).toHaveText('Submit');
await expect(locator).toContainText('Welcome');
await expect(locator).toHaveValue('test@example.com');
await expect(locator).toHaveCount(3);
await expect(locator).toHaveClass(/active/);
await expect(locator).toHaveAttribute('role', 'button');
```

## API Reference

### Page Actions

```typescript
// Navigation
await page.goto(url);
await page.goBack();
await page.goForward();
await page.reload();

// Interaction
await page.click(selector);
await page.dblclick(selector);
await page.fill(selector, value);
await page.type(selector, text);
await page.press(selector, key);
await page.selectOption(selector, values);
await page.check(selector);
await page.uncheck(selector);
await page.hover(selector);
await page.focus(selector);

// File operations
await page.setInputFiles(selector, files);

// Drag and drop
await page.dragAndDrop(source, target);

// Keyboard
await page.keyboard.press('Enter');
await page.keyboard.type('Hello');

// Mouse
await page.mouse.click(x, y);
await page.mouse.move(x, y);
```

### Network

```typescript
// Intercept requests
await page.route('**/api/**', (route) => {
	route.fulfill({
		status: 200,
		body: JSON.stringify({ data: 'mocked' })
	});
});

// Wait for response
const response = await page.waitForResponse('**/api/data');
const data = await response.json();

// Mock API
await page.route('**/api/users', (route) => {
	route.fulfill({ path: './mocks/users.json' });
});
```

## Code Examples

### Authentication Flow

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
	test('successful login', async ({ page }) => {
		await page.goto('/login');

		// Fill form
		await page.getByLabel('Email').fill('user@example.com');
		await page.getByLabel('Password').fill('password123');

		// Submit
		await page.getByRole('button', { name: 'Sign In' }).click();

		// Assert redirect
		await expect(page).toHaveURL('/dashboard');

		// Assert user is logged in
		await expect(page.getByText('Welcome back')).toBeVisible();
	});

	test('invalid credentials', async ({ page }) => {
		await page.goto('/login');

		await page.getByLabel('Email').fill('wrong@example.com');
		await page.getByLabel('Password').fill('wrongpass');
		await page.getByRole('button', { name: 'Sign In' }).click();

		// Assert error message
		await expect(page.getByText('Invalid credentials')).toBeVisible();
		await expect(page).toHaveURL('/login');
	});
});
```

### Form Testing

```typescript
test('submit contact form', async ({ page }) => {
	await page.goto('/contact');

	// Fill form fields
	await page.getByLabel('Name').fill('John Doe');
	await page.getByLabel('Email').fill('john@example.com');
	await page.getByLabel('Message').fill('This is a test message');

	// Select dropdown
	await page.getByLabel('Subject').selectOption('support');

	// Check checkbox
	await page.getByLabel('Subscribe to newsletter').check();

	// Submit form
	await page.getByRole('button', { name: 'Send Message' }).click();

	// Assert success
	await expect(page.getByText('Message sent successfully')).toBeVisible();
});
```

### API Mocking

```typescript
test('displays mocked data', async ({ page }) => {
	// Mock API response
	await page.route('**/api/products', async (route) => {
		const mockData = [
			{ id: 1, name: 'Product 1', price: 29.99 },
			{ id: 2, name: 'Product 2', price: 39.99 }
		];

		await route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify(mockData)
		});
	});

	await page.goto('/products');

	// Assert mocked data is displayed
	await expect(page.getByText('Product 1')).toBeVisible();
	await expect(page.getByText('$29.99')).toBeVisible();
});
```

### Visual Testing

```typescript
test('visual regression', async ({ page }) => {
	await page.goto('/');

	// Take screenshot
	await expect(page).toHaveScreenshot('homepage.png');

	// Screenshot specific element
	await expect(page.locator('.hero')).toHaveScreenshot('hero-section.png');

	// Full page screenshot
	await expect(page).toHaveScreenshot('full-page.png', {
		fullPage: true
	});
});
```

### Mobile Testing

```typescript
test.describe('Mobile', () => {
	test.use({ ...devices['iPhone 13'] });

	test('responsive navigation', async ({ page }) => {
		await page.goto('/');

		// Open mobile menu
		await page.getByRole('button', { name: 'Menu' }).click();

		// Assert mobile menu is visible
		await expect(page.getByRole('navigation')).toBeVisible();

		// Navigate
		await page.getByRole('link', { name: 'About' }).click();
		await expect(page).toHaveURL('/about');
	});
});
```

## Best Practices

### 1. Test Structure

- Use descriptive test names
- Group related tests with describe
- Keep tests independent
- Use beforeEach for setup

### 2. Locator Strategy

- Prefer user-facing attributes
- Use getByRole, getByLabel, getByText
- Avoid CSS selectors when possible
- Use data-testid sparingly

### 3. Assertions

- Use web-first assertions
- Let assertions auto-retry
- Be specific with expectations
- Test user-visible behavior

### 4. Performance

- Run tests in parallel
- Use test fixtures for setup
- Minimize test dependencies
- Reuse browser context when appropriate

### 5. Debugging

- Use UI mode for development
- Enable trace on failure
- Take screenshots on failure
- Use page.pause() for debugging

## Troubleshooting

### Common Issues

1. **Element not found**
   - Check selector specificity
   - Verify element is visible
   - Use getByRole for accessibility
   - Wait for dynamic content

2. **Timeout errors**
   - Increase timeout for slow operations
   - Check network conditions
   - Verify element states
   - Use proper wait strategies

3. **Flaky tests**
   - Avoid hardcoded waits
   - Use web-first assertions
   - Mock external dependencies
   - Ensure proper test isolation

## Quick Reference

### CLI Commands

```bash
npx playwright test                    # Run all tests
npx playwright test example.spec.ts    # Run specific file
npx playwright test --project=chromium # Run specific browser
npx playwright test --headed           # Run with browser UI
npx playwright test --debug            # Debug mode
npx playwright test --ui               # UI mode
npx playwright show-report             # Show HTML report
npx playwright codegen                 # Generate tests
```

### Common Patterns

```typescript
// Page Object Model
class LoginPage {
	constructor(private page: Page) {}

	async navigate() {
		await this.page.goto('/login');
	}

	async login(email: string, password: string) {
		await this.page.getByLabel('Email').fill(email);
		await this.page.getByLabel('Password').fill(password);
		await this.page.getByRole('button', { name: 'Sign In' }).click();
	}
}

// Test fixtures
type MyFixtures = {
	loggedInPage: Page;
};

const test = base.extend<MyFixtures>({
	loggedInPage: async ({ page }, use) => {
		await page.goto('/login');
		await page.getByLabel('Email').fill('test@example.com');
		await page.getByLabel('Password').fill('password');
		await page.getByRole('button', { name: 'Sign In' }).click();
		await use(page);
	}
});
```
