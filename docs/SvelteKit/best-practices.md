# SvelteKit Best Practices

## Project Structure

### Recommended Directory Structure

```
src/
├── routes/             # Application routes
│   ├── (app)/         # App layout group
│   ├── (marketing)/   # Marketing layout group
│   ├── api/           # API endpoints
│   └── admin/         # Admin section
├── lib/               # Shared code
│   ├── components/    # Reusable components
│   ├── stores/        # Global stores
│   ├── utils/         # Utility functions
│   ├── config/        # Configuration
│   └── server/        # Server-only code
├── params/            # Route parameter matchers
├── hooks.server.js    # Server hooks
├── hooks.client.js    # Client hooks
├── app.html          # HTML template
└── app.d.ts          # TypeScript declarations
```

### Component Organization

```
src/lib/components/
├── ui/               # Generic UI components
│   ├── Button.svelte
│   ├── Modal.svelte
│   └── Input.svelte
├── features/         # Feature-specific components
│   ├── auth/
│   │   ├── LoginForm.svelte
│   │   └── UserMenu.svelte
│   └── products/
│       ├── ProductCard.svelte
│       └── ProductGrid.svelte
└── layout/          # Layout components
    ├── Header.svelte
    ├── Footer.svelte
    └── Sidebar.svelte
```

## Performance Optimization

### 1. Preloading and Prefetching

```svelte
<!-- Preload data on hover -->
<a href="/about" data-sveltekit-preload-data="hover"> About </a>

<!-- Preload immediately -->
<a href="/important" data-sveltekit-preload-data="eager"> Important Page </a>

<!-- Preload code only -->
<a href="/heavy-page" data-sveltekit-preload-code="viewport"> Heavy Page </a>
```

### 2. Code Splitting

```javascript
// Dynamic imports for heavy components
export async function load({ params }) {
	const ChartComponent = await import('$lib/components/Chart.svelte');

	return {
		ChartComponent: ChartComponent.default,
		data: await loadChartData(params.id)
	};
}
```

### 3. Image Optimization

```svelte
<script>
	import { base } from '$app/paths';

	function getSrcset(image) {
		return `
      ${base}/images/${image}-320w.jpg 320w,
      ${base}/images/${image}-640w.jpg 640w,
      ${base}/images/${image}-1280w.jpg 1280w
    `;
	}
</script>

<img
	src="{base}/images/hero-640w.jpg"
	srcset={getSrcset('hero')}
	sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
	alt="Hero image"
	loading="lazy"
	decoding="async"
/>
```

### 4. Resource Hints

```svelte
<!-- src/routes/+layout.svelte -->
<svelte:head>
	<!-- Preconnect to external domains -->
	<link rel="preconnect" href="https://api.example.com" />
	<link rel="dns-prefetch" href="https://cdn.example.com" />

	<!-- Preload critical resources -->
	<link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin />
</svelte:head>
```

## Data Loading Patterns

### 1. Parallel Data Loading

```javascript
// Load multiple resources in parallel
export async function load({ fetch, params }) {
	const [user, posts, comments] = await Promise.all([
		fetch(`/api/users/${params.userId}`).then((r) => r.json()),
		fetch(`/api/users/${params.userId}/posts`).then((r) => r.json()),
		fetch(`/api/users/${params.userId}/comments`).then((r) => r.json())
	]);

	return {
		user,
		posts,
		comments
	};
}
```

### 2. Streaming Data

```javascript
// Stream non-critical data
export async function load({ fetch, params }) {
	return {
		// Critical data - blocks render
		user: await fetch(`/api/users/${params.id}`).then((r) => r.json()),

		// Streamed data - loads after initial render
		streamed: {
			posts: fetch(`/api/users/${params.id}/posts`).then((r) => r.json()),
			followers: fetch(`/api/users/${params.id}/followers`).then((r) => r.json())
		}
	};
}
```

### 3. Conditional Loading

```javascript
// Load data based on conditions
export async function load({ url, parent }) {
	const parentData = await parent();

	const result = {
		...parentData
	};

	// Only load additional data if needed
	if (url.searchParams.has('detailed')) {
		result.details = await loadDetailedInfo();
	}

	return result;
}
```

## Error Handling

### 1. Graceful Degradation

```javascript
// Handle API failures gracefully
export async function load({ fetch, params }) {
	let relatedPosts = [];

	try {
		const response = await fetch(`/api/posts/${params.id}/related`);
		if (response.ok) {
			relatedPosts = await response.json();
		}
	} catch (error) {
		// Log error but don't fail the page
		console.error('Failed to load related posts:', error);
	}

	return {
		post: await loadPost(params.id),
		relatedPosts // May be empty, but page still works
	};
}
```

### 2. Error Boundaries

```svelte
<!-- Error boundary component -->
<script>
	import { onMount } from 'svelte';

	let { children } = $props();
	let hasError = $state(false);
	let error = $state(null);

	onMount(() => {
		window.addEventListener('error', (event) => {
			hasError = true;
			error = event.error;
			event.preventDefault();
		});

		window.addEventListener('unhandledrejection', (event) => {
			hasError = true;
			error = event.reason;
			event.preventDefault();
		});
	});
</script>

{#if hasError}
	<div class="error-boundary">
		<h2>Something went wrong</h2>
		<p>{error?.message || 'Unknown error'}</p>
		<button onclick={() => location.reload()}> Reload page </button>
	</div>
{:else}
	{@render children()}
{/if}
```

### 3. Form Error Handling

```javascript
// Comprehensive form validation
export const actions = {
	updateProfile: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { message: 'Please log in' });
		}

		const data = await request.formData();
		const errors = {};

		// Validate fields
		const email = data.get('email');
		if (!email || !email.includes('@')) {
			errors.email = 'Valid email required';
		}

		const age = Number(data.get('age'));
		if (isNaN(age) || age < 18 || age > 120) {
			errors.age = 'Age must be between 18 and 120';
		}

		if (Object.keys(errors).length > 0) {
			return fail(400, { errors, values: Object.fromEntries(data) });
		}

		try {
			await updateUser(locals.user.id, { email, age });
			return { success: true };
		} catch (error) {
			return fail(500, {
				message: 'Failed to update profile',
				values: Object.fromEntries(data)
			});
		}
	}
};
```

## Security Best Practices

### 1. Input Validation

```javascript
// Always validate on the server
import { z } from 'zod';

const createPostSchema = z.object({
	title: z.string().min(1).max(200),
	content: z.string().min(10).max(10000),
	tags: z.array(z.string()).max(5).optional(),
	published: z.boolean().default(false)
});

export const actions = {
	createPost: async ({ request, locals }) => {
		const formData = await request.formData();
		const data = Object.fromEntries(formData);

		// Parse and validate
		const result = createPostSchema.safeParse(data);

		if (!result.success) {
			return fail(400, {
				errors: result.error.flatten().fieldErrors
			});
		}

		// Safe to use validated data
		const post = await createPost(locals.user.id, result.data);
		return { success: true, post };
	}
};
```

### 2. CSRF Protection

```javascript
// SvelteKit has built-in CSRF protection for forms
// For custom implementations:

// Generate token
export async function load({ cookies }) {
	const token = crypto.randomUUID();

	cookies.set('csrf', token, {
		httpOnly: true,
		secure: true,
		sameSite: 'strict',
		path: '/'
	});

	return { csrfToken: token };
}

// Verify token
export const actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const token = data.get('csrf');

		if (token !== cookies.get('csrf')) {
			return fail(403, { message: 'Invalid CSRF token' });
		}

		// Process form...
	}
};
```

### 3. Content Security Policy

```javascript
// src/hooks.server.js
export async function handle({ event, resolve }) {
	const response = await resolve(event);

	response.headers.set(
		'Content-Security-Policy',
		"default-src 'self'; " +
			"script-src 'self' 'unsafe-inline' https://trusted-cdn.com; " +
			"style-src 'self' 'unsafe-inline'; " +
			"img-src 'self' data: https:; " +
			"font-src 'self' data:; " +
			"connect-src 'self' https://api.example.com; " +
			"frame-ancestors 'none';"
	);

	return response;
}
```

## State Management

### 1. Use URL State When Possible

```svelte
<script>
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	// Read from URL
	$: currentTab = page.url.searchParams.get('tab') || 'overview';

	// Update URL
	function setTab(tab) {
		const url = new URL(page.url);
		url.searchParams.set('tab', tab);
		goto(url, { noScroll: true, keepFocus: true });
	}
</script>
```

### 2. Global State with Context

```javascript
// src/lib/stores/app.svelte.js
import { getContext, setContext } from 'svelte';

class AppState {
	user = $state(null);
	theme = $state('light');

	login(user) {
		this.user = user;
	}

	logout() {
		this.user = null;
	}

	toggleTheme() {
		this.theme = this.theme === 'light' ? 'dark' : 'light';
	}
}

const APP_STATE_KEY = 'app-state';

export function initAppState() {
	return setContext(APP_STATE_KEY, new AppState());
}

export function getAppState() {
	return getContext(APP_STATE_KEY);
}
```

### 3. Form State Management

```svelte
<script>
	import { enhance } from '$app/forms';

	let { form } = $props();

	// Preserve form state
	let formData = $state({
		name: form?.values?.name || '',
		email: form?.values?.email || '',
		message: form?.values?.message || ''
	});

	// Track form state
	let submitting = $state(false);
	let isDirty = $state(false);
</script>

<form
	method="POST"
	use:enhance={() => {
		submitting = true;

		return async ({ update }) => {
			await update();
			submitting = false;

			if (!form?.errors) {
				isDirty = false;
			}
		};
	}}
>
	<input
		name="name"
		bind:value={formData.name}
		oninput={() => (isDirty = true)}
		aria-invalid={form?.errors?.name ? 'true' : undefined}
	/>

	{#if form?.errors?.name}
		<span class="error">{form.errors.name}</span>
	{/if}

	<button disabled={submitting || !isDirty}>
		{submitting ? 'Saving...' : 'Save'}
	</button>
</form>
```

## Testing Strategies

### 1. Component Testing

```javascript
// src/lib/components/Button.test.js
import { render, fireEvent } from '@testing-library/svelte';
import { expect, test, vi } from 'vitest';
import Button from './Button.svelte';

test('calls onClick when clicked', async () => {
	const handleClick = vi.fn();

	const { getByRole } = render(Button, {
		props: {
			onclick: handleClick
		}
	});

	const button = getByRole('button');
	await fireEvent.click(button);

	expect(handleClick).toHaveBeenCalledOnce();
});
```

### 2. Integration Testing

```javascript
// src/routes/api/posts/[id]/+server.test.js
import { expect, test } from 'vitest';
import { GET } from './+server.js';

test('returns post by id', async () => {
	const response = await GET({
		params: { id: '123' },
		fetch: globalThis.fetch
	});

	expect(response.status).toBe(200);

	const data = await response.json();
	expect(data).toHaveProperty('id', '123');
	expect(data).toHaveProperty('title');
});
```

### 3. E2E Testing

```javascript
// tests/auth.spec.js
import { test, expect } from '@playwright/test';

test('user can log in', async ({ page }) => {
	await page.goto('/login');

	await page.fill('input[name="email"]', 'test@example.com');
	await page.fill('input[name="password"]', 'password123');
	await page.click('button[type="submit"]');

	await expect(page).toHaveURL('/dashboard');
	await expect(page.locator('h1')).toContainText('Welcome back');
});
```

## Deployment Checklist

### Before Deployment

1. **Environment Variables**

   - Set all required environment variables
   - Use different values for production
   - Never commit sensitive data

2. **Build Configuration**

   - Choose appropriate adapter
   - Configure prerendering
   - Set up error pages

3. **Performance**

   - Enable compression
   - Configure caching headers
   - Optimize images and assets

4. **Security**

   - Set security headers
   - Enable HTTPS
   - Configure CORS properly

5. **Monitoring**
   - Set up error tracking
   - Configure analytics
   - Enable performance monitoring

### Production Configuration

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-vercel';

export default {
	kit: {
		adapter: adapter({
			runtime: 'edge',
			regions: ['iad1'],
			split: true
		}),

		csp: {
			directives: {
				'script-src': ['self', 'strict-dynamic']
			}
		},

		prerender: {
			handleHttpError: 'warn',
			handleMissingId: 'warn'
		}
	}
};
```
