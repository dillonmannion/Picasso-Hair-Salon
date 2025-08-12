# SvelteKit API Reference

## App Modules

### $app/environment

Runtime environment information:

```javascript
import { browser, building, dev, version } from '$app/environment';

// browser: true if running in browser, false on server
if (browser) {
	// Client-side only code
}

// building: true during build step
if (building) {
	// Build-time only code
}

// dev: true in development mode
if (dev) {
	console.log('Development mode');
}

// version: from version.json
console.log('App version:', version);
```

### $app/forms

Progressive enhancement for forms:

```javascript
import { enhance, applyAction } from '$app/forms';

// Basic enhancement
<form method="POST" use:enhance />

// Custom enhancement
<form
  method="POST"
  use:enhance={({ formElement, formData, action, cancel, submitter }) => {
    // Before submission
    formData.append('timestamp', Date.now());

    return async ({ result, update }) => {
      // After submission
      if (result.type === 'success') {
        // Custom handling
        await applyAction(result);
      } else {
        // Default behavior
        update();
      }
    };
  }}
/>
```

### $app/navigation

Navigation utilities:

```javascript
import {
	afterNavigate,
	beforeNavigate,
	disableScrollHandling,
	goto,
	invalidate,
	invalidateAll,
	onNavigate,
	preloadCode,
	preloadData,
	pushState,
	replaceState
} from '$app/navigation';

// Navigate programmatically
await goto('/new-page', {
	replaceState: true, // Replace history entry
	noScroll: true, // Don't scroll to top
	keepFocus: true, // Keep keyboard focus
	invalidateAll: true // Reload all data
});

// Preload for performance
await preloadCode('/about'); // Load JS modules
await preloadData('/about'); // Load route data

// Navigation lifecycle
beforeNavigate(({ from, to, cancel }) => {
	if (hasUnsavedChanges) {
		if (!confirm('Leave without saving?')) {
			cancel();
		}
	}
});

afterNavigate(({ from, to, type }) => {
	// type: 'enter', 'leave', 'popstate', 'link', 'goto'
	analytics.pageview(to.url.pathname);
});

// View transitions
onNavigate((navigation) => {
	if (!document.startViewTransition) return;

	return new Promise((resolve) => {
		document.startViewTransition(async () => {
			resolve();
			await navigation.complete;
		});
	});
});

// Invalidate data
await invalidate('/api/data'); // Specific URL
await invalidate('app:products'); // Custom identifier
await invalidate((url) => url.pathname.startsWith('/api'));
await invalidateAll(); // All data

// History manipulation
pushState('', { modal: true });
replaceState('', { tab: 'settings' });

// Disable auto scroll
disableScrollHandling();
```

### $app/paths

Path utilities:

```javascript
import { base, assets, resolveRoute } from '$app/paths';

// base: configured base path
const apiUrl = `${base}/api/data`;

// assets: asset path (CDN in production)
const imageUrl = `${assets}/images/logo.png`;

// resolveRoute: resolve route with params
const userProfile = resolveRoute('/users/[id]', { id: '123' });
// Returns: '/users/123'

const blogPost = resolveRoute('/blog/[...slug]', { slug: '2024/my-post' });
// Returns: '/blog/2024/my-post'
```

### $app/state

Svelte 5 page state (reactive):

```javascript
import { page, navigating, updated } from '$app/state';

// Current page info
$: currentPath = page.url.pathname;
$: queryParams = page.url.searchParams;
$: routeId = page.route.id;
$: pageParams = page.params;
$: pageError = page.error;
$: pageStatus = page.status;
$: pageData = page.data;
$: formData = page.form;

// Navigation state
$: if (navigating.from && navigating.to) {
	console.log(`Navigating from ${navigating.from} to ${navigating.to}`);
}

// Update detection
$: if (updated) {
	showUpdateNotification();
}
```

### $app/stores

Svelte stores (legacy, use $app/state in Svelte 5):

```javascript
import { page, navigating, updated, getStores } from '$app/stores';

// Subscribe to stores
const unsubscribe = page.subscribe(($page) => {
	console.log('Current path:', $page.url.pathname);
});

// Get all stores
const { page, navigating, updated } = getStores();
```

## Server Modules

### $env/static/private

Build-time environment variables (server-only):

```javascript
import { API_KEY, DATABASE_URL, SECRET } from '$env/static/private';

// Only available on server
// Values are inlined at build time
console.log(API_KEY);
```

### $env/static/public

Build-time environment variables (public):

```javascript
import { PUBLIC_API_URL, PUBLIC_APP_NAME } from '$env/static/public';

// Available in browser and server
// Must start with PUBLIC_
console.log(PUBLIC_API_URL);
```

### $env/dynamic/private

Runtime environment variables (server-only):

```javascript
import { env } from '$env/dynamic/private';

// Access any environment variable
console.log(env.NODE_ENV);
console.log(env.CUSTOM_VAR);
```

### $env/dynamic/public

Runtime public environment variables:

```javascript
import { env } from '$env/dynamic/public';

// Only PUBLIC_ variables
console.log(env.PUBLIC_API_URL);
```

## @sveltejs/kit

### Error Handling

```javascript
import { error, isHttpError, isRedirect } from '@sveltejs/kit';

// Throw HTTP errors
error(404, 'Not found');
error(403, { message: 'Forbidden', code: 'FORBIDDEN' });

// Check error types
try {
	// Some operation
} catch (e) {
	if (isHttpError(e)) {
		// Handle HTTP error
		console.log(e.status, e.body);
	} else if (isRedirect(e)) {
		// Handle redirect
		console.log(e.status, e.location);
	} else {
		// Other error
		throw e;
	}
}
```

### Redirects

```javascript
import { redirect, isRedirect } from '@sveltejs/kit';

// Throw redirects
redirect(303, '/login'); // See other (POST to GET)
redirect(307, '/new-location'); // Temporary redirect
redirect(308, '/new-location'); // Permanent redirect
```

### Response Helpers

```javascript
import { json, text, fail } from '@sveltejs/kit';

// JSON responses
return json({ message: 'Success' });
return json(data, {
	status: 201,
	headers: {
		'cache-control': 'max-age=3600'
	}
});

// Text responses
return text('Hello World');
return text('Created', { status: 201 });

// Form action failures
return fail(400, {
	message: 'Validation failed',
	errors: { email: 'Invalid email' }
});

return fail(401, {
	message: 'Unauthorized'
});
```

## Service Worker

### $service-worker

Service worker module:

```javascript
import { build, files, prerendered, version } from '$service-worker';

// build: generated JS/CSS files
console.log('Build files:', build);
// ['/app/immutable/entry/app.abc123.js', ...]

// files: static assets
console.log('Static files:', files);
// ['/favicon.png', '/robots.txt', ...]

// prerendered: prerendered pages
console.log('Prerendered:', prerendered);
// ['/', '/about', ...]

// version: unique build version
console.log('Version:', version);
// '1234567890123'

// Example caching strategy
const CACHE = `cache-${version}`;
const ASSETS = [...build, ...files];

self.addEventListener('install', (event) => {
	event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
});
```

## Types

### Generated Types

```typescript
// ./$types - Auto-generated types for each route

// +page.js
import type { PageLoad } from './$types';
export const load: PageLoad = async ({ params }) => {
	// params is typed based on route
};

// +page.server.js
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	// Server-specific parameters
};

export const actions: Actions = {
	default: async ({ request }) => {
		// Form action
	}
};

// +server.js
import type { RequestHandler } from './$types';
export const GET: RequestHandler = async ({ params }) => {
	// API endpoint
};

// +layout.js
import type { LayoutLoad } from './$types';
export const load: LayoutLoad = async () => {
	// Layout data
};

// Component props
import type { PageProps } from './$types';
let { data }: PageProps = $props();
```

### App Types

```typescript
// app.d.ts - Global app types

declare global {
	namespace App {
		interface Error {
			code?: string;
			details?: unknown;
		}

		interface Locals {
			user?: {
				id: string;
				email: string;
				role: 'user' | 'admin';
			};
			session?: string;
		}

		interface PageData {
			flash?: { type: 'success' | 'error'; message: string };
		}

		interface PageState {
			modal?: boolean;
			search?: string;
		}

		interface Platform {
			env?: {
				COUNTER: DurableObjectNamespace;
			};
			context?: ExecutionContext;
		}
	}
}
```

## Configuration

### Handle Hook Options

```javascript
export async function handle({ event, resolve }) {
	const response = await resolve(event, {
		// Transform HTML
		transformPageChunk: ({ html, done }) => {
			return html.replace('%lang%', event.locals.lang);
		},

		// Filter response headers
		filterSerializedResponseHeaders: (name, value) => {
			return !name.startsWith('x-internal');
		},

		// Preload strategy
		preload: ({ type, path }) => {
			return type === 'css' || path.includes('/important/');
		}
	});

	return response;
}
```

### Request Event

```typescript
interface RequestEvent {
	// Request data
	request: Request;
	url: URL;
	params: Record<string, string>;
	route: { id: string | null };

	// Server-only
	cookies: Cookies;
	locals: App.Locals;
	platform?: App.Platform;

	// Methods
	fetch: typeof fetch;
	setHeaders(headers: Record<string, string>): void;
	depends(deps: string): void;

	// Parent data (layouts)
	parent(): Promise<Record<string, any>>;
}
```

### Cookies API

```javascript
// Reading cookies
const sessionId = cookies.get('session');
const allCookies = cookies.getAll();

// Setting cookies
cookies.set('session', value, {
	path: '/',
	httpOnly: true,
	secure: true,
	sameSite: 'lax',
	maxAge: 60 * 60 * 24 * 7, // 1 week
	expires: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000)
});

// Deleting cookies
cookies.delete('session', { path: '/' });

// Serializing
const header = cookies.serialize('name', 'value', options);
```

## Adapters

### Adapter API

```javascript
/** @type {import('@sveltejs/kit').Adapter} */
const adapter = {
	name: 'adapter-custom',

	async adapt(builder) {
		// Clean output directory
		builder.rimraf(out);

		// Copy client files
		builder.writeClient(out + '/client');

		// Copy server files
		builder.writeServer(out + '/server');

		// Prerendered pages
		builder.writePrerendered(out + '/prerendered');

		// Generate manifest
		builder.generateManifest({ relativePath: './server' });

		// Get app dir
		const appDir = builder.getAppPath();

		// Log/warn
		builder.log('Building...');
		builder.log.minor('Details...');
		builder.warn('Warning message');
	},

	async emulate() {
		return {
			async platform({ config, prerender }) {
				// Return platform object
				return {};
			}
		};
	},

	supports: {
		read: ({ config, route }) => {
			// Can use `read` from $app/server?
			return true;
		}
	}
};
```
