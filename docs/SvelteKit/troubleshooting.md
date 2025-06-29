# SvelteKit Troubleshooting Guide

## Common Issues and Solutions

### 1. "Not found" Errors in Production

**Problem**: Routes work in development but return 404 in production.

**Solutions**:

```javascript
// 1. Check prerendering configuration
export const prerender = true; // or 'auto'

// 2. For dynamic routes, provide entries function
export async function entries() {
	return [{ slug: 'post-1' }, { slug: 'post-2' }];
}

// 3. Ensure adapter supports dynamic routes
// Some static adapters require all routes to be prerendered
```

**Debugging**:

```bash
# Check build output
npm run build

# Look for warnings about unprerendered routes
# Test with preview
npm run preview
```

### 2. Data Not Updating

**Problem**: Data doesn't refresh when expected.

**Solutions**:

```javascript
// 1. Use invalidation correctly
import { invalidate, invalidateAll } from '$app/navigation';

// Invalidate specific URL
await invalidate('/api/data');

// Invalidate custom dependency
await invalidate('app:data');

// Invalidate everything
await invalidateAll();

// 2. Declare dependencies in load functions
export async function load({ depends }) {
	depends('app:user');
	// This will rerun when invalidate('app:user') is called
}

// 3. Disable aggressive caching
export async function GET({ setHeaders }) {
	setHeaders({
		'cache-control': 'no-cache, no-store, must-revalidate'
	});
}
```

### 3. Form Actions Not Working

**Problem**: Form submissions don't trigger actions.

**Solutions**:

```svelte
<!-- 1. Ensure correct method -->
<form method="POST" action="?/login">
	<!-- Form fields -->
</form>

<!-- 2. Check JavaScript interference -->
<form method="POST" use:enhance>
	<!-- enhance handles progressive enhancement -->
</form>

<!-- 3. Verify action names match -->
<form method="POST" action="?/updateProfile">
	<!-- Must match action name in +page.server.js -->
</form>
```

```javascript
// +page.server.js
export const actions = {
	login: async () => {
		/* ... */
	},
	updateProfile: async () => {
		/* ... */
	},
	default: async () => {
		/* ... */
	}
};
```

### 4. Environment Variables Not Available

**Problem**: Can't access environment variables.

**Solutions**:

```javascript
// 1. Use correct import paths
// Static (build-time) - PUBLIC_ prefix for client
import { PUBLIC_API_URL } from '$env/static/public';
import { SECRET_KEY } from '$env/static/private'; // Server only

// Dynamic (runtime)
import { env } from '$env/dynamic/private'; // Server only
import { env as publicEnv } from '$env/dynamic/public';

// 2. Restart dev server after adding new variables
// 3. Check .env file location (project root)
// 4. Verify variable names start with PUBLIC_ for client access
```

### 5. Hydration Errors

**Problem**: "Hydration failed" or content mismatch errors.

**Solutions**:

```svelte
<!-- 1. Ensure consistent rendering -->
<script>
  import { browser } from '$app/environment';

  // Don't render browser-only content during SSR
  let showBrowserOnly = $state(false);

  $effect(() => {
    if (browser) {
      showBrowserOnly = true;
    }
  });
</script>

{#if showBrowserOnly}
  <BrowserOnlyComponent />
{/if}

<!-- 2. Use proper date formatting -->
<time datetime={post.date.toISOString()}>
  {new Date(post.date).toLocaleDateString('en-US')}
</time>

<!-- 3. Avoid random values during SSR -->
<script>
  // Bad - different on server/client
  const id = Math.random();

  // Good - consistent ID
  import { page } from '$app/state';
  const id = `item-${page.route.id}-${index}`;
</script>
```

### 6. CORS Issues

**Problem**: API requests blocked by CORS.

**Solutions**:

```javascript
// 1. Handle CORS in API routes
export async function GET({ request, setHeaders }) {
	setHeaders({
		'Access-Control-Allow-Origin': '*', // Or specific origin
		'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, Authorization'
	});

	return json(data);
}

export async function OPTIONS() {
	return new Response(null, {
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization'
		}
	});
}

// 2. Use server-side requests
// +page.server.js - No CORS restrictions
export async function load({ fetch }) {
	// This runs on server, no CORS
	const data = await fetch('https://external-api.com/data');
	return {
		data: await data.json()
	};
}

// 3. Proxy through your API
// src/routes/api/proxy/+server.js
export async function GET({ url }) {
	const response = await fetch(`https://external-api.com${url.search}`);
	return new Response(response.body, {
		headers: {
			'content-type': response.headers.get('content-type')
		}
	});
}
```

### 7. Build Errors

**Problem**: Build fails with various errors.

**Common solutions**:

```bash
# 1. Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# 2. Clear SvelteKit cache
rm -rf .svelte-kit

# 3. Check for circular dependencies
npm run check

# 4. Verify adapter configuration
```

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-auto';

export default {
	kit: {
		adapter: adapter(),
		// Add if using TypeScript path aliases
		alias: {
			$lib: 'src/lib',
			$components: 'src/lib/components'
		}
	}
};
```

### 8. TypeScript Errors

**Problem**: Type errors in development or build.

**Solutions**:

```typescript
// 1. Sync types
npm run prepare

// 2. Use generated types
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  // params is properly typed
};

// 3. Configure tsconfig.json
{
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "strict": true,
    "allowJs": true,
    "checkJs": true
  }
}

// 4. Type app-specific interfaces
// app.d.ts
declare global {
  namespace App {
    interface Locals {
      user: import('$lib/types').User | null;
    }
    interface Error {
      code?: string;
    }
  }
}

export {};
```

### 9. Memory Leaks

**Problem**: Memory usage increases over time.

**Solutions**:

```javascript
// 1. Clean up subscriptions
import { onDestroy } from 'svelte';

let unsubscribe = store.subscribe((value) => {
	// Handle value
});

onDestroy(() => {
	unsubscribe();
});

// 2. Clean up intervals/timeouts
let interval;

onMount(() => {
	interval = setInterval(() => {
		// Do something
	}, 1000);

	return () => clearInterval(interval);
});

// 3. Remove event listeners
onMount(() => {
	const handler = (e) => console.log(e);
	window.addEventListener('resize', handler);

	return () => {
		window.removeEventListener('resize', handler);
	};
});

// 4. Avoid memory leaks in load functions
export async function load({ fetch }) {
	const controller = new AbortController();

	// Pass signal to fetch
	const response = await fetch('/api/data', {
		signal: controller.signal
	});

	// Cleanup on navigation
	return {
		data: await response.json(),
		// Return cleanup function
		[Symbol.dispose]: () => controller.abort()
	};
}
```

### 10. Performance Issues

**Problem**: Slow page loads or interactions.

**Diagnostic steps**:

```javascript
// 1. Measure load function performance
export async function load({ timing }) {
	timing?.start('database');
	const data = await queryDatabase();
	timing?.end('database');

	timing?.start('processing');
	const processed = await processData(data);
	timing?.end('processing');

	return { processed };
}

// 2. Enable browser performance profiling
import { dev } from '$app/environment';

if (dev && browser) {
	performance.mark('component-start');
	// Component logic
	performance.mark('component-end');
	performance.measure('component', 'component-start', 'component-end');
}

// 3. Optimize heavy computations
import { browser } from '$app/environment';

let result = $state(null);

$effect(() => {
	if (browser && data) {
		// Defer heavy computation
		requestIdleCallback(() => {
			result = expensiveComputation(data);
		});
	}
});
```

## Debugging Techniques

### 1. Enable Debug Logging

```javascript
// src/hooks.server.js
export async function handle({ event, resolve }) {
	console.log(`${event.request.method} ${event.url.pathname}`);

	const response = await resolve(event);

	console.log(`Response: ${response.status}`);

	return response;
}

export async function handleError({ error, event, status, message }) {
	console.error('Server error:', {
		url: event.url.pathname,
		status,
		message,
		stack: error?.stack
	});

	return {
		message: dev ? error?.message : 'Internal error'
	};
}
```

### 2. Browser DevTools

```javascript
// Expose data to console
import { browser } from '$app/environment';

if (browser && dev) {
	window.__APP_DATA__ = {
		page,
		stores: getStores(),
		data
	};
}
```

### 3. Network Inspection

```javascript
// Log all fetch requests
export async function handleFetch({ request, fetch, event }) {
	console.log('Fetching:', request.url);

	const response = await fetch(request);

	console.log('Response:', response.status, response.headers.get('content-type'));

	return response;
}
```

## Getting Help

### Before Asking for Help

1. **Check the error message carefully** - SvelteKit provides detailed error messages
2. **Search existing issues** - GitHub issues often have solutions
3. **Create a minimal reproduction** - Isolate the problem
4. **Check the documentation** - Often the answer is there

### Minimal Reproduction Template

```javascript
// Create a new SvelteKit project
npm create vite@latest my-reproduction -- --template svelte

// Add only necessary dependencies
npm install [required-packages]

// Reproduce the issue with minimal code
// Push to GitHub and share the link
```

### Community Resources

- **Discord**: [Svelte Discord](https://svelte.dev/chat) - Active community help
- **GitHub Issues**: For bug reports and feature requests
- **Stack Overflow**: Tag questions with `sveltekit`
- **Reddit**: r/sveltejs community

### Debug Checklist

- [ ] Clear `.svelte-kit` directory
- [ ] Clear browser cache
- [ ] Check browser console for errors
- [ ] Check server logs
- [ ] Verify environment variables
- [ ] Test in production mode (`npm run preview`)
- [ ] Try different browsers
- [ ] Disable browser extensions
- [ ] Check Network tab in DevTools
- [ ] Verify file names match routes
