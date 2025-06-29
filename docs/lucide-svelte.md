# Lucide Svelte Documentation

## Overview

**Lucide Svelte** is a beautiful & consistent icon toolkit made by the community. It provides Svelte components for the Lucide icon library, which is an open-source fork of Feather Icons with a modern, clean design system.

**Current version in project**: 0.468.0

## Why Use Lucide Svelte?

- **Tree-Shakeable**: Only bundle the icons you use
- **Customizable**: Full control over size, color, and stroke
- **Accessible**: Built with accessibility in mind
- **Consistent Design**: All icons follow the same design principles
- **TypeScript Support**: Full type safety
- **Active Community**: Regularly updated with new icons
- **Small Bundle Size**: Minimal overhead per icon

## Installation & Setup

### 1. Install Package

```bash
# Install with npm
npm install @lucide/svelte

# Install with pnpm
pnpm add @lucide/svelte

# Install with yarn
yarn add @lucide/svelte

# Install with bun
bun add @lucide/svelte
```

## Core Concepts

### 1. Basic Usage

Import and use icons as Svelte components:

```svelte
<script>
	import { Camera, Heart, Settings } from '@lucide/svelte';
</script>

<Camera />
<Heart />
<Settings />
```

### 2. Icon Props

All icons accept standard props for customization:

```svelte
<script>
	import { Camera } from '@lucide/svelte';
</script>

<!-- Size prop (default: 24) -->
<Camera size={32} />

<!-- Color prop (default: currentColor) -->
<Camera color="#ff3e98" />

<!-- Stroke width (default: 2) -->
<Camera strokeWidth={1.5} />

<!-- Combining props -->
<Camera size={48} color="blue" strokeWidth={3} />
```

### 3. SVG Attributes

Pass any valid SVG attribute as props:

```svelte
<script>
	import { Phone } from '@lucide/svelte';
</script>

<!-- Fill instead of stroke -->
<Phone fill="#333" />

<!-- Custom class -->
<Phone class="my-icon" />

<!-- SVG attributes -->
<Phone stroke-linecap="round" stroke-linejoin="round" opacity={0.8} />
```

### 4. Alternative Import Methods

For better build performance:

```svelte
<script>
	// Direct import from icons directory
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
</script>

<CircleAlert color="#ff3e98" />
```

## API Reference

### Icon Component Props

| Prop                  | Type               | Default        | Description                  |
| --------------------- | ------------------ | -------------- | ---------------------------- |
| `size`                | `number \| string` | `24`           | Icon size (width and height) |
| `color`               | `string`           | `currentColor` | Icon color                   |
| `strokeWidth`         | `number \| string` | `2`            | Stroke width                 |
| `absoluteStrokeWidth` | `boolean`          | `false`        | Use absolute stroke width    |
| `class`               | `string`           | `undefined`    | CSS class name               |
| `...$$restProps`      | `object`           | -              | All other SVG attributes     |

### Icon Naming

Icons are available in multiple formats:

- Default: `House`
- Suffixed: `HouseIcon`
- Prefixed: `LucideHouse`

```svelte
<script>
	// All these imports are the same icon
	import { House, HouseIcon, LucideHouse } from '@lucide/svelte';
</script>
```

## Code Examples

### Icon Button

```svelte
<script>
	import { Menu, X } from '@lucide/svelte';

	let isOpen = $state(false);
</script>

<button
	onclick={() => (isOpen = !isOpen)}
	class="icon-button"
	aria-label={isOpen ? 'Close menu' : 'Open menu'}
>
	{#if isOpen}
		<X size={24} />
	{:else}
		<Menu size={24} />
	{/if}
</button>

<style>
	.icon-button {
		padding: 0.5rem;
		background: none;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.icon-button:hover {
		background: #f0f0f0;
		border-radius: 4px;
	}
</style>
```

### Dynamic Icons

```svelte
<script lang="ts">
	import { Home, Library, Cog, type Icon as IconType } from '@lucide/svelte';

	type MenuItem = {
		name: string;
		href: string;
		icon: typeof IconType;
	};

	const menuItems: MenuItem[] = [
		{ name: 'Home', href: '/', icon: Home },
		{ name: 'Blog', href: '/blog', icon: Library },
		{ name: 'Settings', href: '/settings', icon: Cog }
	];
</script>

<nav>
	{#each menuItems as item}
		{@const Icon = item.icon}
		<a href={item.href} class="menu-item">
			<Icon size={20} />
			<span>{item.name}</span>
		</a>
	{/each}
</nav>

<style>
	.menu-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		text-decoration: none;
		color: inherit;
	}

	.menu-item:hover {
		background: #f5f5f5;
	}
</style>
```

### Animated Icons

```svelte
<script>
	import { Heart, ShoppingCart } from '@lucide/svelte';

	let isLiked = $state(false);
	let cartItems = $state(0);
</script>

<!-- Animated heart -->
<button onclick={() => (isLiked = !isLiked)} class="like-button" class:liked={isLiked}>
	<Heart size={24} fill={isLiked ? 'red' : 'none'} color={isLiked ? 'red' : 'currentColor'} />
</button>

<!-- Cart with badge -->
<button class="cart-button">
	<ShoppingCart size={24} />
	{#if cartItems > 0}
		<span class="badge">{cartItems}</span>
	{/if}
</button>

<style>
	.like-button {
		background: none;
		border: none;
		cursor: pointer;
		transition: transform 0.2s;
	}

	.like-button:active {
		transform: scale(1.2);
	}

	.cart-button {
		position: relative;
		background: none;
		border: none;
		cursor: pointer;
	}

	.badge {
		position: absolute;
		top: -5px;
		right: -5px;
		background: red;
		color: white;
		border-radius: 50%;
		width: 20px;
		height: 20px;
		font-size: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
```

### Loading States

```svelte
<script>
	import { Loader2, Check, X } from '@lucide/svelte';

	let state = $state('idle'); // 'idle' | 'loading' | 'success' | 'error'

	async function handleSubmit() {
		state = 'loading';
		try {
			await someAsyncOperation();
			state = 'success';
		} catch {
			state = 'error';
		}
	}
</script>

<button onclick={handleSubmit} disabled={state === 'loading'}>
	{#if state === 'loading'}
		<Loader2 size={20} class="spinning" />
		<span>Processing...</span>
	{:else if state === 'success'}
		<Check size={20} color="green" />
		<span>Success!</span>
	{:else if state === 'error'}
		<X size={20} color="red" />
		<span>Error</span>
	{:else}
		<span>Submit</span>
	{/if}
</button>

<style>
	button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	:global(.spinning) {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>
```

### Generic Icon Component

```svelte
<!-- LucideIcon.svelte -->
<script>
	import * as icons from '@lucide/svelte';

	let { name, ...props } = $props();

	const Icon = icons[name];
</script>

{#if Icon}
	<Icon {...props} />
{:else}
	<span>Icon "{name}" not found</span>
{/if}
```

Usage:

```svelte
<script>
	import LucideIcon from './LucideIcon.svelte';
</script>

<LucideIcon name="Menu" size={32} color="blue" />
```

### Using with Lucide Lab

For experimental icons:

```svelte
<script>
	import { Icon } from '@lucide/svelte';
	import { pear, sausage } from '@lucide/lab';
</script>

<Icon iconNode={pear} />
<Icon iconNode={sausage} color="red" />
```

## Best Practices

### 1. Accessibility

- Always provide accessible labels for icon buttons
- Use `aria-label` or visually hidden text
- Hide decorative icons from screen readers with `aria-hidden="true"`

```svelte
<!-- Icon button with aria-label -->
<button aria-label="Close dialog">
	<X />
</button>

<!-- Icon with visible text -->
<button>
	<Plus />
	<span>Add item</span>
</button>

<!-- Decorative icon -->
<div>
	<Star aria-hidden="true" />
	<span>Featured</span>
</div>
```

### 2. Performance

- Import only the icons you need
- Use direct imports for better tree-shaking
- Consider lazy loading for large icon sets

### 3. Styling

- Use CSS classes for consistent styling
- Leverage CSS custom properties for theming
- Consider using currentColor for adaptable icons

```css
/* Global icon styles */
:global(.icon) {
	transition: color 0.2s;
}

:global(.icon-primary) {
	color: var(--primary-color);
}

:global(.icon-clickable) {
	cursor: pointer;
}

:global(.icon-clickable:hover) {
	color: var(--primary-hover);
}
```

### 4. TypeScript

- Use proper type imports for dynamic icons
- Leverage the built-in types for better DX

```typescript
import type { Icon as IconType } from '@lucide/svelte';
import { Home, Settings } from '@lucide/svelte';

type IconName = 'home' | 'settings';
type IconMap = Record<IconName, typeof IconType>;

const icons: IconMap = {
	home: Home,
	settings: Settings
};
```

## Troubleshooting

### Common Issues

1. **Icon not rendering**

   - Check import name matches icon name
   - Verify package is installed correctly
   - Ensure using correct casing (PascalCase)

2. **TypeScript errors**

   - Update to latest version of @lucide/svelte
   - Check tsconfig moduleResolution settings
   - Use type imports for icon types

3. **Build performance issues**

   - Use direct imports from icons directory
   - Avoid importing entire library
   - Check bundler configuration

4. **Styling not applied**
   - Remember icons use stroke, not fill by default
   - Check CSS specificity
   - Use !important if needed for overrides

### Debugging Tips

```svelte
<script>
	import { Camera } from '@lucide/svelte';

	// Log available props
	console.log('Icon props:', Camera.$$prop_def);
</script>

<!-- Add debug class -->
<Camera class="debug-icon" />

<style>
	:global(.debug-icon) {
		border: 1px solid red;
		background: rgba(255, 0, 0, 0.1);
	}
</style>
```

## Quick Reference

### Common Icons

```svelte
import {// Navigation
(Menu,
X,
ChevronLeft,
ChevronRight,
ChevronUp,
ChevronDown,
ArrowLeft,
ArrowRight,
Home,
Settings,
Search,
// Actions
Plus,
Minus,
Edit,
Trash,
Save,
Download,
Upload,
Copy,
Share,
Filter,
Sort,
// Status
Check,
X,
AlertCircle,
Info,
HelpCircle,
Loader,
LoaderCircle,
Loader2,
// Media
Play,
Pause,
Volume,
VolumeOff,
Camera,
Image,
// Communication
Mail,
Phone,
MessageSquare,
Send,
// User
User,
Users,
UserPlus,
LogIn,
LogOut} from '@lucide/svelte';
```

### Size Guidelines

- Small buttons: `size={16}`
- Default buttons: `size={20}` or `size={24}`
- Large buttons: `size={32}`
- Hero icons: `size={48}` or larger

### Color Usage

- `currentColor`: Inherits from parent (default)
- Brand colors: Use your theme colors
- Status colors: Green for success, red for error, yellow for warning
- Accessibility: Ensure sufficient contrast
