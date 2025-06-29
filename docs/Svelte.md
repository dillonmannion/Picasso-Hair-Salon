# Svelte Documentation

## Overview

**Svelte** is a radical new approach to building user interfaces. Unlike traditional frameworks that do most of their work in the browser, Svelte shifts that work into a compile step that happens when you build your app. Instead of using virtual DOM diffing, Svelte writes code that surgically updates the DOM when your application state changes.

**Current version in project**: 5.34.7

## Why Use Svelte?

- **No Virtual DOM**: Compiles your code to vanilla JavaScript at build time
- **Truly Reactive**: Updates are granular and efficient
- **Less Code**: Write less boilerplate with built-in state management
- **Small Bundle Size**: No framework runtime overhead
- **Built-in Animations**: First-class support for transitions and animations
- **Scoped Styling**: CSS is automatically scoped to components

## Installation & Setup

```bash
# Install in existing project
npm install -D svelte

# For SvelteKit projects, Svelte is included
npm create vite@latest my-app -- --template svelte
```

## Core Concepts

### 1. Svelte 5 Runes

Svelte 5 introduces **runes**, a powerful new reactivity system:

#### $state - Reactive State

```svelte
<script>
	// Simple state
	let count = $state(0);

	// Object state
	let user = $state({
		name: 'Alice',
		age: 30
	});

	// Array state
	let items = $state([1, 2, 3]);
</script>

<button onclick={() => count++}>
	Count: {count}
</button>

<input bind:value={user.name} />
```

#### $derived - Computed Values

```svelte
<script>
	let price = $state(100);
	let quantity = $state(2);

	// Automatically updates when dependencies change
	const total = $derived(price * quantity);
	const tax = $derived(total * 0.08);
	const grandTotal = $derived(total + tax);
</script>

<p>Total: ${grandTotal.toFixed(2)}</p>
```

#### $effect - Side Effects

```svelte
<script>
	let count = $state(0);
	let message = $state('');

	// Runs when dependencies change
	$effect(() => {
		console.log(`Count is now: ${count}`);

		// Cleanup function (optional)
		return () => {
			console.log('Cleaning up...');
		};
	});

	// Pre-effect for DOM measurements
	$effect.pre(() => {
		// Runs before DOM updates
	});
</script>
```

#### $props - Component Properties

```svelte
<script>
	// Destructure props with defaults
	let { name = 'Guest', age, onUpdate, ...rest } = $props();
</script>

<div {...rest}>
	Hello {name}, you are {age} years old
</div>
```

#### $bindable - Two-way Binding

```svelte
<!-- Child.svelte -->
<script>
  let { value = $bindable() } = $props();
</script>

<input bind:value />

<!-- Parent.svelte -->
<script>
  import Child from './Child.svelte';
  let text = $state('');
</script>

<Child bind:value={text} />
<p>You typed: {text}</p>
```

### 2. Component Structure

```svelte
<!-- MyComponent.svelte -->
<script module>
	// Module context - runs once when module loads
	let totalInstances = 0;
</script>

<script>
	// Instance context - runs for each component instance
	import { onMount } from 'svelte';

	let { title = 'Default Title' } = $props();
	let count = $state(0);

	totalInstances++;

	onMount(() => {
		console.log('Component mounted');
		return () => {
			console.log('Component destroyed');
		};
	});
</script>

<!-- Markup -->
<article>
	<h1>{title}</h1>
	<p>Instance #{totalInstances}</p>
	<button onclick={() => count++}>
		Clicked {count} times
	</button>
</article>

<!-- Scoped styles -->
<style>
	article {
		padding: 1rem;
		border: 1px solid #ccc;
	}

	h1 {
		color: #ff3e00;
	}
</style>
```

### 3. Template Syntax

#### Basic Markup

```svelte
<!-- Text interpolation -->
<p>{message}</p>
<p>{user.name}</p>

<!-- HTML rendering -->
{@html htmlContent}

<!-- Expressions -->
<p>{count * 2}</p>
<p>{items.join(', ')}</p>
```

#### Conditionals

```svelte
{#if loading}
	<p>Loading...</p>
{:else if error}
	<p>Error: {error.message}</p>
{:else}
	<p>Welcome {user.name}!</p>
{/if}
```

#### Loops

```svelte
<!-- Basic each -->
{#each items as item}
	<li>{item}</li>
{/each}

<!-- With index -->
{#each items as item, i}
	<li>{i + 1}: {item}</li>
{/each}

<!-- With key -->
{#each items as item (item.id)}
	<Item {item} />
{/each}

<!-- Destructuring -->
{#each users as { id, name, email }}
	<div>
		<h3>{name}</h3>
		<p>{email}</p>
	</div>
{/each}
```

#### Await Blocks

```svelte
{#await promise}
	<p>Loading...</p>
{:then data}
	<p>The data is {data}</p>
{:catch error}
	<p>Error: {error.message}</p>
{/await}

<!-- Only success -->
{#await promise then data}
	<p>{data}</p>
{/await}
```

### 4. Event Handling

```svelte
<script>
	let count = $state(0);

	function handleClick(event) {
		console.log('Clicked!', event);
		count++;
	}

	function handleKeydown(event) {
		if (event.key === 'Enter') {
			// Handle enter key
		}
	}
</script>

<!-- Basic events -->
<button onclick={handleClick}>Click me</button>
<button onclick={() => count++}>Increment</button>

<!-- Event with modifiers -->
<form onsubmit|preventDefault={handleSubmit}>
	<input onkeydown|stopPropagation={handleKeydown} />
</form>

<!-- Multiple handlers -->
<div onmouseenter={() => (hover = true)} onmouseleave={() => (hover = false)}>Hover me</div>
```

### 5. Bindings

```svelte
<script>
	let name = $state('');
	let selected = $state('apple');
	let checked = $state(false);
	let group = $state([]);

	let inputElement;
</script>

<!-- Text input -->
<input bind:value={name} />

<!-- Numeric input -->
<input type="number" bind:value={age} />

<!-- Checkbox -->
<input type="checkbox" bind:checked />

<!-- Radio -->
<input type="radio" bind:group={selected} value="apple" />
<input type="radio" bind:group={selected} value="banana" />

<!-- Select -->
<select bind:value={selected}>
	<option value="apple">Apple</option>
	<option value="banana">Banana</option>
</select>

<!-- Element reference -->
<input bind:this={inputElement} />

<!-- Contenteditable -->
<div contenteditable bind:textContent={text} />
```

### 6. Slots and Snippets

#### Slots (Legacy)

```svelte
<!-- Card.svelte -->
<div class="card">
	<slot name="header" />
	<slot>Default content</slot>
	<slot name="footer" />
</div>

<!-- Usage -->
<Card>
	<h2 slot="header">Title</h2>
	<p>Body content</p>
	<footer slot="footer">Footer</footer>
</Card>
```

#### Snippets (Svelte 5)

```svelte
<!-- Card.svelte -->
<script>
	let { header, children, footer } = $props();
</script>

<div class="card">
	{@render header?.()}
	{@render children?.()}
	{@render footer?.()}
</div>

<!-- Usage -->
<Card>
	{#snippet header()}
		<h2>Title</h2>
	{/snippet}

	<p>Body content</p>

	{#snippet footer()}
		<footer>Footer content</footer>
	{/snippet}
</Card>
```

### 7. Lifecycle Hooks

```svelte
<script>
	import { onMount, onDestroy, tick } from 'svelte';

	onMount(() => {
		console.log('Component mounted');

		// Cleanup function
		return () => {
			console.log('Cleanup on unmount');
		};
	});

	onDestroy(() => {
		console.log('Component destroyed');
	});

	// Wait for DOM updates
	async function updateAndScroll() {
		items = [...items, newItem];
		await tick(); // Wait for DOM update
		scrollToBottom();
	}
</script>
```

## API Reference

### State Management

```javascript
// .svelte.js files for shared state
export const counter = $state({ count: 0 });

export function increment() {
	counter.count++;
}

// Using in components
import { counter, increment } from './store.svelte.js';
```

### Context API

```svelte
<!-- Parent.svelte -->
<script>
  import { setContext } from 'svelte';

  const state = $state({ user: null });
  setContext('app', state);
</script>

<!-- Child.svelte -->
<script>
  import { getContext } from 'svelte';

  const app = getContext('app');
</script>
```

### Component Exports

```svelte
<script>
	let count = $state(0);

	// Export functions for parent access
	export function reset() {
		count = 0;
	}

	export function getCount() {
		return count;
	}
</script>
```

## Code Examples

### Counter with History

```svelte
<script>
	let count = $state(0);
	let history = $state([]);

	const increment = () => {
		count++;
		history = [...history, count];
	};

	const undo = () => {
		if (history.length > 0) {
			history = history.slice(0, -1);
			count = history[history.length - 1] ?? 0;
		}
	};
</script>

<button onclick={increment}>+</button>
<button onclick={undo} disabled={history.length === 0}>Undo</button>
<p>Count: {count}</p>
<p>History: {history.join(', ')}</p>
```

### Todo List

```svelte
<script>
	let todos = $state([]);
	let newTodo = $state('');

	function addTodo() {
		if (newTodo.trim()) {
			todos = [
				...todos,
				{
					id: Date.now(),
					text: newTodo,
					done: false
				}
			];
			newTodo = '';
		}
	}

	function toggleTodo(id) {
		todos = todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo));
	}

	function removeTodo(id) {
		todos = todos.filter((todo) => todo.id !== id);
	}

	const remaining = $derived(todos.filter((todo) => !todo.done).length);
</script>

<form onsubmit|preventDefault={addTodo}>
	<input bind:value={newTodo} placeholder="Add todo" />
	<button>Add</button>
</form>

<ul>
	{#each todos as todo (todo.id)}
		<li>
			<input type="checkbox" checked={todo.done} onchange={() => toggleTodo(todo.id)} />
			<span class:done={todo.done}>{todo.text}</span>
			<button onclick={() => removeTodo(todo.id)}>×</button>
		</li>
	{/each}
</ul>

<p>{remaining} remaining</p>

<style>
	.done {
		text-decoration: line-through;
		opacity: 0.5;
	}
</style>
```

### Debounced Search

```svelte
<script>
	let query = $state('');
	let results = $state([]);
	let loading = $state(false);

	let timeout;

	$effect(() => {
		// Clear previous timeout
		clearTimeout(timeout);

		if (query.trim()) {
			loading = true;

			// Debounce search
			timeout = setTimeout(async () => {
				try {
					const response = await fetch(`/api/search?q=${query}`);
					results = await response.json();
				} catch (error) {
					console.error('Search failed:', error);
				} finally {
					loading = false;
				}
			}, 300);
		} else {
			results = [];
			loading = false;
		}

		// Cleanup
		return () => clearTimeout(timeout);
	});
</script>

<input bind:value={query} placeholder="Search..." />

{#if loading}
	<p>Searching...</p>
{:else if results.length > 0}
	<ul>
		{#each results as result}
			<li>{result.title}</li>
		{/each}
	</ul>
{:else if query}
	<p>No results found</p>
{/if}
```

## Best Practices

### 1. State Management

- Use `$state` for local component state
- Use `.svelte.js` files for shared state
- Keep state minimal and derived values computed
- Avoid deeply nested state mutations

### 2. Performance

- Use `{#key}` blocks to force re-creation when needed
- Leverage `$derived` for computed values
- Be mindful of effect dependencies
- Use CSS for animations when possible

### 3. Component Design

- Keep components focused and single-purpose
- Use props for configuration, events for communication
- Prefer composition over inheritance
- Document component APIs with TypeScript

### 4. Styling

- Leverage scoped styles for component encapsulation
- Use CSS custom properties for theming
- Keep global styles minimal
- Consider CSS-in-JS for dynamic styles

## Troubleshooting

### Common Issues

1. **State not updating**

   - Ensure you're using `$state` for reactive data
   - Array/object mutations need reassignment
   - Check that effects have correct dependencies

2. **Props undefined**

   - Destructure from `$props()` not `$props`
   - Provide default values for optional props
   - Check parent component prop passing

3. **Memory leaks**

   - Clean up intervals/timeouts in effects
   - Unsubscribe from external stores
   - Remove event listeners on destroy

4. **TypeScript errors**
   - Add `lang="ts"` to script tags
   - Define prop interfaces explicitly
   - Use proper event handler types

## Migration from Svelte 4

Key changes in Svelte 5:

- Replace `let` with `let x = $state()`
- Replace `$:` with `$derived` or `$effect`
- Replace `export let` with `$props()`
- Use snippets instead of slots
- Update event forwarding syntax

## Quick Reference

### Runes

- `$state()` - Reactive state
- `$derived()` - Computed values
- `$effect()` - Side effects
- `$props()` - Component props
- `$bindable()` - Two-way bindable prop
- `$inspect()` - Debug reactive values

### Imports

```javascript
import { onMount, onDestroy, tick } from 'svelte';
import { setContext, getContext } from 'svelte';
import { mount, unmount, hydrate } from 'svelte';
```

### Special Elements

- `<svelte:self>` - Recursive component
- `<svelte:component>` - Dynamic component
- `<svelte:element>` - Dynamic element
- `<svelte:window>` - Window events/bindings
- `<svelte:document>` - Document events/bindings
- `<svelte:body>` - Body events/bindings
- `<svelte:head>` - Head content
- `<svelte:options>` - Compiler options
