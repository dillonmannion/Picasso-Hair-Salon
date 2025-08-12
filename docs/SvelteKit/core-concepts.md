# SvelteKit Core Concepts

## Routing

### File-Based Routing

SvelteKit uses your file system to define routes. Files and directories in `src/routes` create your application's URL structure.

#### Basic Routes

```
src/routes/
├── +page.svelte        → /
├── about/+page.svelte  → /about
├── blog/+page.svelte   → /blog
└── contact/+page.svelte → /contact
```

#### Dynamic Routes

Use square brackets for dynamic segments:

```
src/routes/
├── blog/
│   ├── +page.svelte       → /blog
│   └── [slug]/
│       └── +page.svelte   → /blog/any-post-title
├── users/
│   └── [id]/
│       └── +page.svelte   → /users/123
└── products/
    └── [category]/
        └── [id]/
            └── +page.svelte → /products/electronics/phone-123
```

#### Rest Parameters

Capture multiple segments with `[...rest]`:

```
src/routes/
└── docs/
    └── [...path]/
        └── +page.svelte → /docs/any/number/of/segments
```

#### Optional Parameters

Make parameters optional with double brackets:

```
src/routes/
└── [[lang]]/
    ├── +page.svelte     → / or /en or /fr
    └── about/
        └── +page.svelte → /about or /en/about
```

### Route Files

#### +page.svelte

The UI component for a route:

```svelte
<script>
	// Component logic
	let { data } = $props();
</script>

<!-- Your UI --><h1>{data.title}</h1>
```

#### +page.js / +page.server.js

Load data before rendering:

```javascript
// +page.js - runs on server and client
export async function load({ params, url, fetch }) {
	const response = await fetch(`/api/posts/${params.id}`);
	const post = await response.json();

	return {
		post,
		currentUrl: url.pathname
	};
}
```

```javascript
// +page.server.js - runs only on server
import { db } from '$lib/server/database';

export async function load({ params, cookies }) {
	const userId = cookies.get('userId');
	const post = await db.posts.findOne(params.id);

	return {
		post,
		user: userId ? await db.users.findOne(userId) : null
	};
}
```

#### +layout.svelte

Shared UI for nested routes:

```svelte
<script>
	let { data, children } = $props();
</script>

<div class="app">
	<header>
		<nav>
			<!-- Navigation -->
		</nav>
	</header>

	<main>
		{@render children()}
	</main>

	<footer>
		<!-- Footer content -->
	</footer>
</div>
```

#### +layout.js / +layout.server.js

Load data for layouts:

```javascript
export async function load({ url }) {
	return {
		currentPath: url.pathname,
		sections: await loadNavigationSections()
	};
}
```

#### +server.js

Create API endpoints:

```javascript
import { json, error } from '@sveltejs/kit';

// GET /api/posts
export async function GET({ url }) {
	const limit = Number(url.searchParams.get('limit') ?? 10);
	const posts = await getPosts(limit);
	return json(posts);
}

// POST /api/posts
export async function POST({ request, cookies }) {
	const user = cookies.get('user');
	if (!user) {
		error(401, 'Unauthorized');
	}

	const data = await request.json();
	const post = await createPost(data);

	return json(post, { status: 201 });
}

// Handle any other method
export async function fallback({ request }) {
	return new Response(`Method ${request.method} not allowed`, {
		status: 405,
		headers: {
			Allow: 'GET, POST'
		}
	});
}
```

#### +error.svelte

Custom error pages:

```svelte
<script>
	import { page } from '$app/state';
</script>

<h1>Error {page.status}</h1>
<p>{page.error.message}</p>

{#if page.status === 404}
	<p>The page you're looking for doesn't exist.</p>
	<a href="/">Go home</a>
{:else}
	<p>Something went wrong. Please try again later.</p>
{/if}
```

## Load Functions

### Universal vs Server Load

```javascript
// +page.js - Universal load function
// ✅ Runs on server during SSR
// ✅ Runs on client during navigation
// ❌ No access to server-only resources
export async function load({ fetch, params }) {
	const res = await fetch(`/api/data/${params.id}`);
	return {
		data: await res.json()
	};
}

// +page.server.js - Server load function
// ✅ Only runs on server
// ✅ Access to databases, file system, etc
// ✅ Can read/write cookies
export async function load({ params, cookies, locals }) {
	const session = cookies.get('session');
	const data = await db.query(params.id);

	return {
		data,
		user: locals.user
	};
}
```

### Load Function Parameters

```javascript
export async function load({
	params, // Route parameters
	url, // URL object
	route, // Route information
	fetch, // Enhanced fetch function
	setHeaders, // Set response headers
	depends, // Declare dependencies
	parent, // Parent layout data

	// Server-only:
	cookies, // Cookie handling
	locals, // App-specific data
	platform, // Platform-specific context
	request // Original request
}) {
	// Your load logic
}
```

### Data Invalidation

```javascript
// Declare dependencies
export async function load({ fetch, depends }) {
	// Invalidated by: invalidate('/api/data')
	const res1 = await fetch('/api/data');

	// Invalidated by: invalidate('app:data')
	depends('app:data');

	// Invalidated by: invalidateAll()
	const res2 = await fetch('/api/other');

	return {
		data: await res1.json(),
		other: await res2.json()
	};
}
```

## Form Actions

### Basic Actions

```javascript
// +page.server.js
export const actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const email = data.get('email');
		const password = data.get('password');

		const user = await login(email, password);
		if (!user) {
			return fail(401, {
				email,
				incorrect: true
			});
		}

		cookies.set('session', user.session, {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
			maxAge: 60 * 60 * 24 * 7 // 1 week
		});

		redirect(303, '/dashboard');
	}
};
```

### Multiple Actions

```javascript
export const actions = {
	login: async ({ request }) => {
		// Handle login
	},

	logout: async ({ cookies }) => {
		cookies.delete('session', { path: '/' });
		redirect(303, '/');
	},

	updateProfile: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const data = await request.formData();
		await updateUser(locals.user.id, {
			name: data.get('name'),
			email: data.get('email')
		});

		return { success: true };
	}
};
```

### Using Actions in Forms

```svelte
<script>
	import { enhance } from '$app/forms';
	let { form } = $props();
</script>

<!-- Default action -->
<form method="POST" use:enhance>
	<input name="email" type="email" required />
	<input name="password" type="password" required />
	<button>Login</button>
</form>

<!-- Named action -->
<form method="POST" action="?/updateProfile" use:enhance>
	<input name="name" value={form?.name ?? ''} />
	<button>Update Profile</button>
</form>

<!-- Without progressive enhancement -->
<form method="POST" action="?/logout">
	<button>Logout</button>
</form>
```

## Hooks

### Server Hooks (hooks.server.js)

```javascript
// Handle every request
export async function handle({ event, resolve }) {
	// Before handling request
	event.locals.startTime = Date.now();

	// Add custom headers
	const response = await resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', 'en'),
		filterSerializedResponseHeaders: (name) => name !== 'x-internal'
	});

	// After handling request
	const duration = Date.now() - event.locals.startTime;
	response.headers.set('x-response-time', duration);

	return response;
}

// Handle errors
export async function handleError({ error, event, status, message }) {
	console.error('Error:', error);

	// Log to error tracking service
	await logError({
		error: error.stack,
		url: event.url.pathname,
		userId: event.locals.user?.id
	});

	return {
		message: status === 404 ? 'Page not found' : 'Internal error',
		code: error?.code
	};
}

// Handle fetch requests
export async function handleFetch({ request, fetch, event }) {
	// Forward auth headers to API requests
	if (request.url.startsWith('https://api.example.com')) {
		request.headers.set('authorization', event.request.headers.get('authorization'));
	}

	return fetch(request);
}
```

### Client Hooks (hooks.client.js)

```javascript
import { navigating } from '$app/stores';

// Handle client-side errors
export async function handleError({ error, event, status, message }) {
	console.error('Client error:', error);

	// Send to error tracking
	if (typeof window !== 'undefined' && window.trackError) {
		window.trackError({
			error: error.message,
			stack: error.stack,
			url: location.href
		});
	}

	return {
		message: 'Something went wrong!'
	};
}
```

### Shared Hooks (hooks.js)

```javascript
// Reroute URLs before processing
export async function reroute({ url }) {
	// Redirect old URLs
	if (url.pathname === '/old-blog') {
		return '/blog';
	}

	// Handle i18n
	const lang = url.pathname.split('/')[1];
	if (['en', 'es', 'fr'].includes(lang)) {
		return url.pathname.slice(3); // Remove language prefix
	}
}
```

## Page Options

### Configuration Options

```javascript
// Prerender at build time
export const prerender = true;

// Disable/enable SSR
export const ssr = true;

// Disable/enable client-side rendering
export const csr = true;

// Control trailing slashes
export const trailingSlash = 'always'; // 'never' | 'always' | 'ignore'
```

### Prerendering Configuration

```javascript
// Prerender with dynamic parameters
export const prerender = true;

export async function entries() {
	const posts = await getAllPosts();
	return posts.map((post) => ({ slug: post.slug }));
}

// Conditional prerendering
export const prerender = 'auto';
```

## State Management

### Page State

```javascript
import { page } from '$app/state';

// Access current page info (reactive)
$: console.log(page.url.pathname);
$: console.log(page.params);
$: console.log(page.route.id);
$: console.log(page.status);
$: console.log(page.error);
$: console.log(page.data);
$: console.log(page.form);
```

### Navigation State

```javascript
import { navigating } from '$app/stores';
import { beforeNavigate, afterNavigate } from '$app/navigation';

// Track navigation
$: if ($navigating) {
	console.log('Navigating from', $navigating.from);
	console.log('Navigating to', $navigating.to);
}

// Navigation lifecycle
beforeNavigate(({ from, to, cancel }) => {
	if (hasUnsavedChanges && !confirm('Leave page?')) {
		cancel();
	}
});

afterNavigate(({ from, to }) => {
	console.log('Navigated from', from, 'to', to);
});
```

### Updated Store

```javascript
import { updated } from '$app/stores';

// Check if app has updates
$: if ($updated) {
	showUpdatePrompt();
}
```

## Advanced Patterns

### Layout Inheritance

```
src/routes/
├── +layout.svelte          # Root layout
├── (app)/                  # Layout group
│   ├── +layout.svelte      # App layout
│   ├── dashboard/
│   └── settings/
├── (marketing)/            # Another group
│   ├── +layout.svelte      # Marketing layout
│   ├── +page.svelte        # Home page
│   └── pricing/
└── admin/
    └── +layout@.svelte     # Reset to root layout
```

### Shallow Routing

```javascript
import { pushState } from '$app/navigation';
import { page } from '$app/state';

// Push state without navigation
function openModal(id) {
	pushState('', {
		showModal: true,
		modalId: id
	});
}

// Access state
$: if (page.state.showModal) {
	// Show modal with page.state.modalId
}
```

### Streaming SSR

```javascript
// Stream data after initial render
export async function load() {
	return {
		// Loaded immediately
		critical: await loadCriticalData(),

		// Streamed when ready
		streamed: {
			comments: loadComments(), // Returns promise
			related: loadRelatedPosts()
		}
	};
}
```

### Custom Matchers

```javascript
// src/params/integer.js
export function match(param) {
	return /^\d+$/.test(param);
}

// Use in routes: [id=integer]
```

### Service Workers

```javascript
// src/service-worker.js
import { build, files, version } from '$service-worker';

const CACHE = `cache-${version}`;
const ASSETS = [...build, ...files];

// Cache assets
self.addEventListener('install', (event) => {
	event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
});
```
