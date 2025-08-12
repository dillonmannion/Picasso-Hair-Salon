# SvelteKit Documentation

## Overview

**SvelteKit** is a full-stack web application framework built on top of Svelte. It provides everything you need to build production-ready web applications with optimal performance, including:

- **File-based routing** - Routes are defined by your file structure
- **Server-side rendering (SSR)** - For better SEO and initial page loads
- **Client-side navigation** - For smooth, app-like transitions
- **API routes** - Build backend APIs alongside your frontend
- **Build optimizations** - Code splitting, prerendering, and more
- **TypeScript support** - First-class TypeScript integration

**Current version in project**: 2.22.0

## Why Use SvelteKit?

- **Performance**: Compiles to vanilla JavaScript with minimal runtime overhead
- **Developer Experience**: Hot module replacement, TypeScript support, and intuitive APIs
- **Flexibility**: Can build SPAs, SSR apps, static sites, or hybrid applications
- **Full-Stack**: Frontend and backend in one framework
- **Production-Ready**: Built-in optimizations, security headers, and deployment adapters

## Installation & Setup

```bash
# Create a new SvelteKit project
npx sv create my-app
cd my-app
npm install
npm run dev
```

For existing projects:

```bash
npm install -D @sveltejs/kit
```

## Core Concepts

### 1. File-Based Routing

Routes are defined by your directory structure:

```
src/routes/
├── +page.svelte        # / route
├── about/
│   └── +page.svelte    # /about route
├── blog/
│   ├── +page.svelte    # /blog route
│   └── [slug]/
│       └── +page.svelte # /blog/:slug dynamic route
└── api/
    └── posts/
        └── +server.js  # /api/posts API endpoint
```

### 2. Route Files

#### +page.svelte

The UI component for a route:

```svelte
<!-- src/routes/+page.svelte -->
<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="/about">About</a> to learn more.</p>
```

#### +page.js / +page.server.js

Load data for the page:

```javascript
// src/routes/blog/[slug]/+page.js
export async function load({ params }) {
	const post = await getPost(params.slug);

	if (!post) {
		error(404, 'Post not found');
	}

	return {
		post
	};
}
```

Server-only version (has access to databases, private environment variables):

```javascript
// src/routes/blog/[slug]/+page.server.js
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/database';

export async function load({ params }) {
	const post = await db.getPost(params.slug);

	if (!post) {
		error(404, 'Post not found');
	}

	return {
		post
	};
}
```

#### +layout.svelte

Shared UI wrapper for nested routes:

```svelte
<!-- src/routes/+layout.svelte -->
<script>
	let { children } = $props();
</script>

<nav>
	<a href="/">Home</a>
	<a href="/about">About</a>
	<a href="/blog">Blog</a>
</nav>

<main>
	{@render children()}
</main>

<footer>
	<p>&copy; 2024 My Site</p>
</footer>
```

#### +server.js

API endpoints that handle HTTP methods:

```javascript
// src/routes/api/posts/+server.js
import { json } from '@sveltejs/kit';

export async function GET({ url }) {
	const limit = Number(url.searchParams.get('limit') ?? '10');
	const posts = await getPosts(limit);

	return json(posts);
}

export async function POST({ request }) {
	const data = await request.json();
	const post = await createPost(data);

	return json(post, { status: 201 });
}
```

### 3. Loading Data

The `load` function runs before rendering and provides data to pages:

```javascript
// Runs on both server and client
export async function load({ params, fetch, depends }) {
	// Use the provided fetch for proper request handling
	const response = await fetch(`/api/posts/${params.id}`);
	const post = await response.json();

	// Declare a dependency for manual invalidation
	depends('app:post');

	return {
		post
	};
}
```

Accessing loaded data in components:

```svelte
<script>
	let { data } = $props();
</script>

<h1>{data.post.title}</h1><div>{@html data.post.content}</div>
```

### 4. Form Actions

Handle form submissions with progressive enhancement:

```javascript
// src/routes/contact/+page.server.js
import { fail } from '@sveltejs/kit';

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const email = data.get('email');
		const message = data.get('message');

		if (!email || !message) {
			return fail(400, {
				error: 'Please fill in all fields'
			});
		}

		await sendEmail(email, message);

		return {
			success: true
		};
	}
};
```

Using in a form:

```svelte
<script>
	let { form } = $props();
</script>

{#if form?.success}
	<p>Message sent successfully!</p>
{/if}

{#if form?.error}
	<p class="error">{form.error}</p>
{/if}

<form method="POST">
	<input name="email" type="email" required />
	<textarea name="message" required></textarea>
	<button>Send</button>
</form>
```

## API Reference

### Navigation

```javascript
import { goto, invalidate, preloadData } from '$app/navigation';

// Navigate programmatically
await goto('/about');

// Reload data for current page
await invalidate('app:data');

// Preload data for a route
const result = await preloadData('/blog/post-1');
```

### Stores

```javascript
import { page } from '$app/state';
import { navigating } from '$app/stores';

// Access current page info (Svelte 5 state)
console.log(page.url.pathname);
console.log(page.params);

// Check if navigating (Svelte store)
$: if ($navigating) {
	console.log('Navigating to', $navigating.to);
}
```

### Environment Variables

```javascript
// Public variables (available in browser)
import { PUBLIC_API_URL } from '$env/static/public';

// Private variables (server-only)
import { DB_PASSWORD } from '$env/static/private';

// Dynamic variables (can change at runtime)
import { env } from '$env/dynamic/private';
```

### Error Handling

```javascript
import { error, redirect } from '@sveltejs/kit';

// Throw an error
error(404, 'Page not found');

// Redirect
redirect(307, '/login');
```

## Code Examples

### Dynamic Routes with Parameters

```svelte
<!-- src/routes/products/[category]/[id]/+page.svelte -->
<script>
	import { page } from '$app/state';

	// Access route parameters
	$: category = page.params.category;
	$: productId = page.params.id;
</script>

<h1>Product {productId} in {category}</h1>
```

### API Route with CORS

```javascript
// src/routes/api/data/+server.js
import { json } from '@sveltejs/kit';

export async function GET({ setHeaders }) {
	setHeaders({
		'Access-Control-Allow-Origin': '*',
		'Cache-Control': 'max-age=3600'
	});

	const data = await fetchData();
	return json(data);
}

export async function OPTIONS() {
	return new Response(null, {
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type'
		}
	});
}
```

### Protected Routes

```javascript
// src/hooks.server.js
export async function handle({ event, resolve }) {
	const session = await getSession(event.cookies.get('session'));
	event.locals.user = session?.user;

	// Protect admin routes
	if (event.url.pathname.startsWith('/admin')) {
		if (!event.locals.user?.isAdmin) {
			return redirect(303, '/login');
		}
	}

	return resolve(event);
}
```

### Streaming SSR

```javascript
// src/routes/+page.server.js
export async function load({ fetch }) {
	return {
		// This will be awaited before rendering
		critical: await loadCriticalData(),

		// This will stream in after initial render
		streamed: {
			posts: loadPosts()
		}
	};
}
```

## Best Practices

### 1. Data Loading

- Use `+page.server.js` for sensitive operations
- Use `+page.js` for data that can be fetched client-side
- Always use the provided `fetch` function in load functions
- Declare dependencies with `depends()` for granular invalidation

### 2. Performance

- Enable prerendering for static content: `export const prerender = true;`
- Use `link` preloading: `<a data-sveltekit-preload-data href="/about">About</a>`
- Lazy load heavy components with dynamic imports
- Optimize images and use appropriate caching headers

### 3. Security

- Never expose sensitive data in `+page.js` files
- Validate all user input on the server
- Use CSRF protection (built-in for forms)
- Set appropriate security headers in `hooks.server.js`

### 4. SEO

- Use proper `<head>` tags with `<svelte:head>`
- Implement structured data
- Create a sitemap
- Use descriptive URLs and proper HTTP status codes

## Troubleshooting

### Common Issues

1. **"Not found" errors in production**
   - Ensure your adapter is configured correctly
   - Check that dynamic routes have `entries` function if prerendering

2. **Data not updating**
   - Use `invalidate()` or `invalidateAll()` to refresh data
   - Check your `depends()` declarations
   - Ensure you're not caching too aggressively

3. **Form actions not working**
   - Ensure you're using `method="POST"` on forms
   - Check that JavaScript is not preventing default behavior
   - Verify your action names match

4. **Environment variables not available**
   - Use correct import path (`$env/static/private` vs `$env/static/public`)
   - Ensure `.env` files are in the project root
   - Restart dev server after adding new variables

### Debugging Tips

```javascript
// Enable debug mode
export const dev = true;

// Log route information
export async function load({ route, params, url }) {
	console.log('Route ID:', route.id);
	console.log('Params:', params);
	console.log('URL:', url.toString());

	// Your load logic
}
```

## Quick Reference

### File Naming Convention

- `+page.svelte` - Page component
- `+page.js` - Universal load function
- `+page.server.js` - Server-only load function
- `+layout.svelte` - Layout component
- `+layout.js` - Layout load function
- `+server.js` - API endpoint
- `+error.svelte` - Error page
- `app.html` - HTML template

### Route Parameters

- `[param]` - Dynamic parameter
- `[...rest]` - Rest parameters
- `[[optional]]` - Optional parameter
- `[param=matcher]` - Parameter with matcher

### Page Options

```javascript
export const prerender = true; // Generate at build time
export const ssr = true; // Server-side render
export const csr = true; // Client-side render
export const trailingSlash = 'always'; // URL trailing slash
```

### Useful Imports

```javascript
// Navigation and state
import { goto, invalidate, preloadData, pushState } from '$app/navigation';
import { page } from '$app/state';
import { navigating } from '$app/stores';
import { base, assets } from '$app/paths';

// Utilities
import { error, redirect, json, text } from '@sveltejs/kit';
import { dev, building } from '$app/environment';

// Build-time modules
import { env } from '$env/dynamic/private';
```
