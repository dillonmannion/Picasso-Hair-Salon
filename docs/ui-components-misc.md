# Miscellaneous UI Component Libraries

This document covers additional UI component libraries used in the project.

## Mode Watcher

**Current version in project**: 0.4.1

### Overview

Mode Watcher is a Svelte library for managing dark/light mode preferences with automatic system detection and persistence.

### Installation

```bash
npm install mode-watcher
```

### Basic Usage

```svelte
<!-- +layout.svelte -->
<script>
	import { ModeWatcher } from 'mode-watcher';
</script>

<ModeWatcher />
<slot />
```

### Toggle Mode

```svelte
<script>
	import { toggleMode, setMode, mode } from 'mode-watcher';
</script>

<!-- Toggle between light/dark -->
<button onclick={toggleMode}>
	Current mode: {$mode}
</button>

<!-- Set specific mode -->
<button onclick={() => setMode('light')}>Light</button>
<button onclick={() => setMode('dark')}>Dark</button>
<button onclick={() => setMode('system')}>System</button>
```

### Custom Implementation

```svelte
<script>
	import { mode } from 'mode-watcher';
	import { Sun, Moon, Monitor } from '@lucide/svelte';
</script>

<div class="mode-selector">
	<button class:active={$mode === 'light'} onclick={() => setMode('light')}>
		<Sun size={20} />
	</button>
	<button class:active={$mode === 'dark'} onclick={() => setMode('dark')}>
		<Moon size={20} />
	</button>
	<button class:active={$mode === 'system'} onclick={() => setMode('system')}>
		<Monitor size={20} />
	</button>
</div>
```

## Svelte Sonner

**Current version in project**: 0.14.4

### Overview

Svelte Sonner is a toast notification library for Svelte, providing beautiful and customizable toast notifications.

### Installation

```bash
npm install svelte-sonner
```

### Setup

```svelte
<!-- +layout.svelte -->
<script>
	import { Toaster } from 'svelte-sonner';
</script>

<Toaster />
<slot />
```

### Basic Usage

```svelte
<script>
	import { toast } from 'svelte-sonner';
</script>

<!-- Simple toasts -->
<button onclick={() => toast('Event has been created')}> Default Toast </button>

<button onclick={() => toast.success('Successfully saved!')}> Success Toast </button>

<button onclick={() => toast.error('Something went wrong')}> Error Toast </button>

<button onclick={() => toast.info('New update available')}> Info Toast </button>

<button onclick={() => toast.warning('Low disk space')}> Warning Toast </button>
```

### Advanced Usage

```svelte
<script>
	import { toast } from 'svelte-sonner';

	// Promise toast
	async function saveData() {
		const promise = fetch('/api/save', { method: 'POST' });

		toast.promise(promise, {
			loading: 'Saving...',
			success: 'Data saved successfully!',
			error: 'Failed to save data'
		});
	}

	// Custom toast
	function showCustomToast() {
		toast.custom(
			(t) => `
      <div>
        <h3>Custom Toast ${t}</h3>
        <button onclick={() => toast.dismiss(t)}>Dismiss</button>
      </div>
    `
		);
	}

	// Toast with action
	function showActionToast() {
		toast('Event created', {
			action: {
				label: 'Undo',
				onClick: () => console.log('Undo')
			}
		});
	}
</script>
```

### Configuration

```svelte
<Toaster
	position="bottom-right"
	toastOptions={{
		duration: 4000,
		style: {
			background: '#363636',
			color: '#fff'
		}
	}}
/>
```

## Embla Carousel Svelte

**Current version in project**: 8.5.1

### Overview

Embla Carousel is a lightweight carousel library with fluid motion and great swipe precision.

### Installation

```bash
npm install embla-carousel-svelte
```

### Basic Usage

```svelte
<script>
	import emblaCarouselSvelte from 'embla-carousel-svelte';

	let emblaRef;
</script>

<div class="embla" use:emblaCarouselSvelte bind:this={emblaRef}>
	<div class="embla__container">
		<div class="embla__slide">Slide 1</div>
		<div class="embla__slide">Slide 2</div>
		<div class="embla__slide">Slide 3</div>
	</div>
</div>

<style>
	.embla {
		overflow: hidden;
	}
	.embla__container {
		display: flex;
	}
	.embla__slide {
		flex: 0 0 100%;
		min-width: 0;
	}
</style>
```

### With Options and Plugins

```svelte
<script>
	import emblaCarouselSvelte from 'embla-carousel-svelte';
	import Autoplay from 'embla-carousel-autoplay';

	const options = {
		loop: true,
		align: 'center',
		skipSnaps: false
	};

	const plugins = [Autoplay({ delay: 4000, stopOnInteraction: false })];

	let emblaApi;

	function onInit(event) {
		emblaApi = event.detail;
	}
</script>

<div class="embla" use:emblaCarouselSvelte={{ options, plugins }} on:emblaInit={onInit}>
	<div class="embla__container">
		{#each items as item}
			<div class="embla__slide">
				{item}
			</div>
		{/each}
	</div>
</div>

<!-- Navigation -->
<button onclick={() => emblaApi?.scrollPrev()}>Previous</button>
<button onclick={() => emblaApi?.scrollNext()}>Next</button>
```

## cmdk-sv

**Current version in project**: 0.0.20

### Overview

cmdk-sv is a Svelte port of cmdk, a command menu React component that can be used to build command palettes.

### Installation

```bash
npm install cmdk-sv
```

### Basic Usage

```svelte
<script>
	import { Command } from 'cmdk-sv';
	let open = $state(false);
	let value = $state('');
</script>

<button onclick={() => (open = true)}>Open Command Menu</button>

{#if open}
	<Command.Root bind:value>
		<Command.Input placeholder="Type a command..." />
		<Command.List>
			<Command.Empty>No results found.</Command.Empty>

			<Command.Group heading="Actions">
				<Command.Item onSelect={() => console.log('Create')}>Create New File</Command.Item>
				<Command.Item onSelect={() => console.log('Delete')}>Delete File</Command.Item>
			</Command.Group>

			<Command.Separator />

			<Command.Group heading="Navigation">
				<Command.Item onSelect={() => goto('/home')}>Go to Home</Command.Item>
				<Command.Item onSelect={() => goto('/settings')}>Go to Settings</Command.Item>
			</Command.Group>
		</Command.List>
	</Command.Root>
{/if}
```

### Advanced Command Palette

```svelte
<script>
	import { Command } from 'cmdk-sv';
	import { onMount } from 'svelte';

	let open = $state(false);
	let search = $state('');

	// Open with Cmd+K
	onMount(() => {
		function handleKeyDown(e) {
			if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				open = !open;
			}
		}

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	});

	const items = [
		{ id: 1, title: 'Home', icon: '🏠', action: () => goto('/') },
		{ id: 2, title: 'Profile', icon: '👤', action: () => goto('/profile') },
		{ id: 3, title: 'Settings', icon: '⚙️', action: () => goto('/settings') }
	];

	$: filteredItems = items.filter((item) =>
		item.title.toLowerCase().includes(search.toLowerCase())
	);
</script>

{#if open}
	<div class="command-overlay" onclick={() => (open = false)}>
		<Command.Root bind:value={search} class="command-menu" onclick={(e) => e.stopPropagation()}>
			<Command.Input placeholder="Search for commands..." class="command-input" />
			<Command.List class="command-list">
				{#if filteredItems.length === 0}
					<Command.Empty>No results found.</Command.Empty>
				{/if}

				{#each filteredItems as item}
					<Command.Item
						value={item.title}
						onSelect={() => {
							item.action();
							open = false;
						}}
						class="command-item"
					>
						<span>{item.icon}</span>
						<span>{item.title}</span>
					</Command.Item>
				{/each}
			</Command.List>
		</Command.Root>
	</div>
{/if}

<style>
	.command-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	:global(.command-menu) {
		background: white;
		border-radius: 8px;
		box-shadow: 0 10px 50px rgba(0, 0, 0, 0.1);
		width: 90%;
		max-width: 500px;
		max-height: 400px;
		overflow: hidden;
	}

	:global(.command-input) {
		width: 100%;
		padding: 16px;
		border: none;
		border-bottom: 1px solid #e5e5e5;
		font-size: 16px;
	}

	:global(.command-list) {
		overflow-y: auto;
		max-height: 300px;
		padding: 8px;
	}

	:global(.command-item) {
		padding: 12px;
		cursor: pointer;
		border-radius: 4px;
		display: flex;
		align-items: center;
		gap: 12px;
	}

	:global(.command-item:hover) {
		background: #f5f5f5;
	}
</style>
```

## Best Practices

### 1. Mode Watcher

- Initialize in root layout
- Use system preference as default
- Persist user preference
- Provide visual feedback for mode changes

### 2. Svelte Sonner

- Configure toaster globally
- Use appropriate toast types
- Keep messages concise
- Provide actions when relevant
- Handle promise states

### 3. Embla Carousel

- Optimize slide content
- Use lazy loading for images
- Provide navigation controls
- Consider touch gestures
- Test on mobile devices

### 4. cmdk-sv

- Implement keyboard shortcuts
- Provide search functionality
- Group related commands
- Show keyboard hints
- Handle empty states

## Quick Reference

### Mode Watcher

```svelte
import {(mode, toggleMode, setMode)} from 'mode-watcher';
```

### Svelte Sonner

```svelte
import { toast } from 'svelte-sonner';
toast('Message');
toast.success('Success');
toast.error('Error');
toast.promise(promise, {...});
```

### Embla Carousel

```svelte
import emblaCarouselSvelte from 'embla-carousel-svelte'; use:emblaCarouselSvelte={{
	options,
	plugins
}}
```

### cmdk-sv

```svelte
import {Command} from 'cmdk-sv';
<Command.Root>
	<Command.Input />
	<Command.List>
		<Command.Item />
	</Command.List>
</Command.Root>
```
