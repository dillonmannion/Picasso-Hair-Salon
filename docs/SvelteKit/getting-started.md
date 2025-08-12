# SvelteKit Getting Started Guide

## Prerequisites

Before starting with SvelteKit, ensure you have:

- **Node.js** version 18.13 or higher
- **npm**, **pnpm**, or **yarn** package manager
- Basic knowledge of HTML, CSS, and JavaScript
- Familiarity with Svelte is helpful but not required

## Creating Your First Project

### Using the Official CLI

The easiest way to start is with the SvelteKit CLI:

```bash
# Create a new project
npx sv create my-sveltekit-app

# Navigate to project directory
cd my-sveltekit-app

# Install dependencies
npm install

# Start development server
npm run dev
```

### Project Structure

After creation, your project will have this structure:

```
my-sveltekit-app/
├── src/
│   ├── routes/          # Your application routes
│   │   └── +page.svelte # Home page
│   ├── app.html         # HTML template
│   ├── app.d.ts         # TypeScript app types
│   └── lib/             # Shared components/utilities
├── static/              # Static assets
├── package.json         # Dependencies and scripts
├── svelte.config.js     # SvelteKit configuration
├── vite.config.js       # Vite configuration
└── tsconfig.json        # TypeScript configuration
```

## Your First Page

### Creating a Basic Page

Edit `src/routes/+page.svelte`:

```svelte
<script>
	let count = 0;

	function increment() {
		count += 1;
	}
</script>

<svelte:head>
	<title>Welcome to SvelteKit</title>
</svelte:head>

<main>
	<h1>Welcome to SvelteKit!</h1>
	<p>This is your first SvelteKit application.</p>

	<button onclick={increment}>
		Clicked {count}
		{count === 1 ? 'time' : 'times'}
	</button>
</main>

<style>
	main {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
		text-align: center;
	}

	button {
		font-size: 1.2rem;
		padding: 0.5rem 1rem;
		background: #ff3e00;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	button:hover {
		background: #ff5a00;
	}
</style>
```

### Adding Navigation

Create a new route at `src/routes/about/+page.svelte`:

```svelte
<h1>About Page</h1>
<p>This is the about page of your SvelteKit app.</p>
<a href="/">Go back home</a>
```

Update your home page to include navigation:

```svelte
<!-- src/routes/+page.svelte -->
<nav>
	<a href="/">Home</a>
	<a href="/about">About</a>
</nav>
```

## Understanding the Basics

### 1. File-Based Routing

SvelteKit uses file-based routing where:

- `src/routes/+page.svelte` → `/`
- `src/routes/about/+page.svelte` → `/about`
- `src/routes/blog/[slug]/+page.svelte` → `/blog/:slug`

### 2. Loading Data

Create `src/routes/+page.js` to load data:

```javascript
export async function load() {
	return {
		title: 'Welcome to SvelteKit',
		items: [
			{ id: 1, name: 'Item 1' },
			{ id: 2, name: 'Item 2' },
			{ id: 3, name: 'Item 3' }
		]
	};
}
```

Access the data in your component:

```svelte
<script>
	let { data } = $props();
</script>

<h1>{data.title}</h1>
<ul>
	{#each data.items as item}
		<li>{item.name}</li>
	{/each}
</ul>
```

### 3. Creating a Layout

Add `src/routes/+layout.svelte` for shared UI:

```svelte
<script>
	let { children } = $props();
</script>

<header>
	<nav>
		<a href="/">Home</a>
		<a href="/about">About</a>
		<a href="/contact">Contact</a>
	</nav>
</header>

<main>
	{@render children()}
</main>

<footer>
	<p>&copy; 2024 My SvelteKit App</p>
</footer>

<style>
	header {
		background: #333;
		color: white;
		padding: 1rem;
	}

	nav a {
		color: white;
		text-decoration: none;
		margin-right: 1rem;
	}

	nav a:hover {
		text-decoration: underline;
	}

	main {
		min-height: calc(100vh - 120px);
		padding: 2rem;
	}

	footer {
		background: #333;
		color: white;
		padding: 1rem;
		text-align: center;
	}
</style>
```

## Development Workflow

### Available Commands

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

# Format code
npm run format

# Type checking
npm run check
```

### Development Features

1. **Hot Module Replacement (HMR)**: Changes appear instantly without page reload
2. **TypeScript Support**: Full TypeScript support out of the box
3. **Error Overlay**: Clear error messages in the browser
4. **Auto-imports**: Components and modules can be auto-imported

## Next Steps

### 1. Add More Routes

Create a contact page at `src/routes/contact/+page.svelte`:

```svelte
<script>
	let name = '';
	let email = '';
	let message = '';

	function handleSubmit(event) {
		event.preventDefault();
		console.log('Form submitted:', { name, email, message });
		// Handle form submission
	}
</script>

<h1>Contact Us</h1>

<form onsubmit={handleSubmit}>
	<label>
		Name:
		<input bind:value={name} required />
	</label>

	<label>
		Email:
		<input type="email" bind:value={email} required />
	</label>

	<label>
		Message:
		<textarea bind:value={message} required></textarea>
	</label>

	<button type="submit">Send Message</button>
</form>
```

### 2. Create an API Endpoint

Add `src/routes/api/hello/+server.js`:

```javascript
import { json } from '@sveltejs/kit';

export function GET() {
	return json({
		message: 'Hello from SvelteKit API!'
	});
}
```

### 3. Fetch Data from API

Update a page to fetch from your API:

```javascript
// src/routes/api-demo/+page.js
export async function load({ fetch }) {
	const response = await fetch('/api/hello');
	const data = await response.json();

	return {
		apiMessage: data.message
	};
}
```

```svelte
<!-- src/routes/api-demo/+page.svelte -->
<script>
	let { data } = $props();
</script>

<h1>API Demo</h1><p>Message from API: {data.apiMessage}</p>
```

## Environment Setup

### 1. Create Environment Variables

Create `.env` file in project root:

```env
PUBLIC_APP_NAME=My SvelteKit App
PUBLIC_API_URL=https://api.example.com
SECRET_API_KEY=your-secret-key
```

### 2. Use Environment Variables

```javascript
// In any .js file
import { PUBLIC_APP_NAME } from '$env/static/public';
import { SECRET_API_KEY } from '$env/static/private'; // Server-only

console.log(PUBLIC_APP_NAME); // Available everywhere
console.log(SECRET_API_KEY); // Only on server
```

## Building for Production

### 1. Build the Application

```bash
npm run build
```

This creates a production-ready build in the `build` directory.

### 2. Preview the Build

```bash
npm run preview
```

This runs the production build locally for testing.

### 3. Deploy

SvelteKit can be deployed to various platforms:

- **Vercel**: Use `@sveltejs/adapter-vercel`
- **Netlify**: Use `@sveltejs/adapter-netlify`
- **Node.js**: Use `@sveltejs/adapter-node`
- **Static hosting**: Use `@sveltejs/adapter-static`

## Common Patterns

### Dynamic Imports

```svelte
<script>
	import { onMount } from 'svelte';

	let ChartComponent;

	onMount(async () => {
		const module = await import('$lib/Chart.svelte');
		ChartComponent = module.default;
	});
</script>

{#if ChartComponent}
	<ChartComponent />
{/if}
```

### Error Handling

```javascript
// src/routes/data/+page.js
import { error } from '@sveltejs/kit';

export async function load({ fetch }) {
	try {
		const response = await fetch('/api/data');

		if (!response.ok) {
			error(response.status, 'Failed to load data');
		}

		return {
			data: await response.json()
		};
	} catch (e) {
		error(500, 'Server error');
	}
}
```

### Protected Routes

```javascript
// src/routes/admin/+page.server.js
import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
	if (!locals.user || !locals.user.isAdmin) {
		redirect(303, '/login');
	}

	return {
		adminData: await loadAdminData()
	};
}
```

## Tips for Beginners

1. **Start Simple**: Begin with static pages before adding dynamic features
2. **Use TypeScript**: Enable TypeScript for better developer experience
3. **Leverage DevTools**: Use browser DevTools and SvelteKit DevTools
4. **Read Error Messages**: SvelteKit provides excellent error messages
5. **Join the Community**: The Svelte Discord and forums are very helpful

## Resources

- [Official SvelteKit Documentation](https://kit.svelte.dev)
- [Interactive SvelteKit Tutorial](https://learn.svelte.dev)
- [Svelte Discord Community](https://svelte.dev/chat)
- [SvelteKit Examples](https://github.com/sveltejs/kit/tree/master/sites)
