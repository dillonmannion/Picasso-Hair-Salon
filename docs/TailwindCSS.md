# TailwindCSS Documentation

## Overview

**TailwindCSS** is a utility-first CSS framework that provides low-level utility classes to build custom designs directly in your markup. Rather than opinionated pre-designed components, Tailwind provides building blocks to create unique designs without leaving your HTML.

**Current version in project**: 4.1.10

## Why Use TailwindCSS?

- **Utility-First**: Build complex components from a constrained set of primitive utilities
- **Responsive Design**: Mobile-first responsive design system built-in
- **Component-Friendly**: Extract component classes with @apply when needed
- **Customizable**: Fully customizable design system
- **Performance**: Automatically removes unused CSS in production
- **Dark Mode**: First-class dark mode support
- **Modern Features**: CSS Grid, Flexbox, transforms, gradients, and more

## Installation & Setup

```bash
# Install TailwindCSS
npm install -D tailwindcss
npm install -D @tailwindcss/vite

# Initialize configuration (v3 style)
npx tailwindcss init
```

For TailwindCSS v4:

```bash
npm install -D tailwindcss@next @tailwindcss/vite@next
```

## Core Concepts

### 1. Configuration

#### TailwindCSS v4 (CSS-based configuration)

```css
/* app.css */
@import 'tailwindcss';

@theme {
	/* Colors */
	--color-primary: oklch(0.84 0.18 117.33);
	--color-secondary: oklch(0.53 0.12 118.34);

	/* Typography */
	--font-display: 'Satoshi', 'sans-serif';
	--font-body: 'Inter', 'sans-serif';

	/* Spacing */
	--spacing-xs: 0.5rem;
	--spacing-sm: 1rem;
	--spacing-md: 1.5rem;
	--spacing-lg: 2rem;
	--spacing-xl: 3rem;

	/* Breakpoints */
	--breakpoint-xs: 30rem;
	--breakpoint-3xl: 120rem;

	/* Animations */
	--animate-wiggle: wiggle 1s ease-in-out infinite;

	@keyframes wiggle {
		0%,
		100% {
			transform: rotate(-3deg);
		}
		50% {
			transform: rotate(3deg);
		}
	}
}
```

#### TailwindCSS v3 (JS configuration)

```javascript
// tailwind.config.js
module.exports = {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,svelte}'],
	theme: {
		extend: {
			colors: {
				primary: '#0f172a',
				secondary: '#64748b'
			},
			fontFamily: {
				display: ['Satoshi', 'sans-serif'],
				body: ['Inter', 'sans-serif']
			}
		}
	},
	plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')]
};
```

### 2. Utility Classes

#### Layout

```html
<!-- Container -->
<div class="container mx-auto px-4">
	<!-- Flexbox -->
	<div class="flex items-center justify-between gap-4">
		<div class="flex-1">Flexible</div>
		<div class="flex-shrink-0">Fixed</div>
	</div>

	<!-- Grid -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		<div>Item 1</div>
		<div>Item 2</div>
		<div>Item 3</div>
	</div>

	<!-- Position -->
	<div class="relative">
		<div class="absolute top-0 right-0">Badge</div>
		<div class="sticky top-0">Sticky header</div>
	</div>
</div>
```

#### Typography

```html
<!-- Font Size -->
<h1 class="text-5xl font-bold">Heading</h1>
<p class="text-base">Body text</p>
<small class="text-sm">Small text</small>

<!-- Font Weight & Style -->
<p class="font-light italic">Light italic text</p>
<p class="font-semibold">Semibold text</p>
<p class="font-bold uppercase">Bold uppercase</p>

<!-- Line Height & Letter Spacing -->
<p class="leading-relaxed tracking-wide">Relaxed line height with wide letter spacing</p>

<!-- Text Alignment & Decoration -->
<p class="text-center underline">Centered underlined text</p>
<p class="text-right line-through">Right-aligned strikethrough</p>
```

#### Colors & Backgrounds

```html
<!-- Background Colors -->
<div class="bg-white dark:bg-gray-900">
	<!-- Text Colors -->
	<h1 class="text-gray-900 dark:text-white">Title</h1>
	<p class="text-gray-600 dark:text-gray-400">Description</p>

	<!-- Border Colors -->
	<div class="border border-gray-200 dark:border-gray-700">Content with border</div>
</div>

<!-- Gradients -->
<div class="bg-gradient-to-r from-purple-500 to-pink-500">Gradient background</div>

<!-- Opacity -->
<div class="bg-black/50">50% opacity black background</div>
```

### 3. Responsive Design

```html
<!-- Mobile First Approach -->
<div
	class="/* All screens */ /* 640px and up */ /* 768px and up */ /* 1024px and up */ /* 1280px and up */ /* 1536px and up */ w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 2xl:w-1/6"
>
	Responsive width
</div>

<!-- Hide/Show Elements -->
<div class="block md:hidden">Mobile only</div>
<div class="hidden md:block">Desktop only</div>

<!-- Responsive Typography -->
<h1 class="text-2xl md:text-4xl lg:text-6xl">Responsive heading</h1>
```

### 4. Dark Mode

```html
<!-- Automatic dark mode based on system preference -->
<div class="bg-white dark:bg-gray-900">
	<h1 class="text-gray-900 dark:text-white">Dark mode title</h1>
	<p class="text-gray-600 dark:text-gray-400">Dark mode text</p>
</div>

<!-- Manual dark mode with class -->
<html class="dark">
	<body>
		<div class="bg-white dark:bg-black">Content</div>
	</body>
</html>
```

JavaScript for manual dark mode:

```javascript
// Toggle dark mode
document.documentElement.classList.toggle(
	'dark',
	localStorage.theme === 'dark' ||
		(!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
);

// Save preference
localStorage.theme = 'dark';
localStorage.theme = 'light';
localStorage.removeItem('theme');
```

### 5. States & Variants

```html
<!-- Hover States -->
<button
	class="bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none active:bg-blue-700"
>
	Interactive Button
</button>

<!-- Group Hover -->
<div class="group">
	<h3 class="group-hover:text-blue-500">Title</h3>
	<p class="group-hover:underline">Description</p>
</div>

<!-- Peer States -->
<input type="checkbox" class="peer" />
<label class="peer-checked:text-blue-500"> Checkbox label </label>

<!-- Disabled States -->
<button class="disabled:cursor-not-allowed disabled:opacity-50" disabled>Disabled Button</button>
```

### 6. Custom Utilities

#### Using @apply

```css
@layer components {
	.btn {
		@apply rounded px-4 py-2 font-semibold;
	}

	.btn-primary {
		@apply btn bg-blue-500 text-white hover:bg-blue-600;
	}

	.btn-secondary {
		@apply btn bg-gray-200 text-gray-800 hover:bg-gray-300;
	}
}
```

#### TailwindCSS v4 Custom Utilities

```css
@utility content-auto {
	content-visibility: auto;
}

@utility tab-* {
	tab-size: --value(--tab-size- *);
}

@theme {
	--tab-size-2: 2;
	--tab-size-4: 4;
	--tab-size-8: 8;
}
```

## API Reference

### Spacing

```html
<!-- Padding -->
<div class="p-4">All sides</div>
<div class="px-4 py-2">Horizontal/Vertical</div>
<div class="pt-2 pr-4 pb-2 pl-4">Individual sides</div>

<!-- Margin -->
<div class="m-4">All sides</div>
<div class="mx-auto">Center horizontally</div>
<div class="-mt-4">Negative margin</div>

<!-- Space Between -->
<div class="space-x-4">
	<span>Item 1</span>
	<span>Item 2</span>
	<span>Item 3</span>
</div>
```

### Sizing

```html
<!-- Width -->
<div class="w-full">Full width</div>
<div class="w-1/2">Half width</div>
<div class="w-64">16rem width</div>
<div class="max-w-md">Max width medium</div>
<div class="min-w-0">Min width 0</div>

<!-- Height -->
<div class="h-screen">Full viewport height</div>
<div class="h-64">16rem height</div>
<div class="min-h-screen">Min viewport height</div>
```

### Flexbox & Grid

```html
<!-- Flexbox -->
<div class="flex flex-col md:flex-row">
	<div class="flex-1">Flex item</div>
	<div class="flex-none">Fixed size</div>
</div>

<!-- Grid -->
<div class="grid grid-cols-12 gap-4">
	<div class="col-span-8">Main content</div>
	<div class="col-span-4">Sidebar</div>
</div>
```

### Effects

```html
<!-- Shadows -->
<div class="shadow-sm">Small shadow</div>
<div class="shadow-lg">Large shadow</div>
<div class="drop-shadow-xl">Drop shadow</div>

<!-- Opacity -->
<div class="opacity-50">50% opacity</div>

<!-- Blur -->
<div class="blur-sm">Slight blur</div>
<div class="backdrop-blur-md">Backdrop blur</div>

<!-- Transforms -->
<div class="translate-x-4 scale-110 rotate-45">Transformed element</div>
```

## Code Examples

### Card Component

```html
<div class="max-w-sm overflow-hidden rounded-lg bg-white shadow-lg dark:bg-gray-800">
	<img class="h-48 w-full object-cover" src="/img/card.jpg" alt="Card image" />
	<div class="px-6 py-4">
		<h3 class="mb-2 text-xl font-bold text-gray-900 dark:text-white">Card Title</h3>
		<p class="text-gray-700 dark:text-gray-300">
			Card description goes here. This is a responsive card component.
		</p>
	</div>
	<div class="px-6 pt-4 pb-6">
		<button class="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700">
			Action
		</button>
	</div>
</div>
```

### Responsive Navigation

```html
<nav class="bg-gray-800">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="flex h-16 items-center justify-between">
			<!-- Logo -->
			<div class="flex-shrink-0">
				<span class="text-xl font-bold text-white">Logo</span>
			</div>

			<!-- Desktop menu -->
			<div class="hidden md:block">
				<div class="ml-10 flex items-baseline space-x-4">
					<a
						href="#"
						class="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:text-white"
					>
						Home
					</a>
					<a
						href="#"
						class="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:text-white"
					>
						About
					</a>
					<a
						href="#"
						class="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:text-white"
					>
						Services
					</a>
				</div>
			</div>

			<!-- Mobile menu button -->
			<div class="md:hidden">
				<button class="text-gray-400 hover:text-white">
					<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16M4 18h16"
						/>
					</svg>
				</button>
			</div>
		</div>
	</div>
</nav>
```

### Form Styling

```html
<form class="mx-auto max-w-md">
	<div class="mb-4">
		<label class="mb-2 block text-sm font-bold text-gray-700" for="email"> Email </label>
		<input
			class="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
			id="email"
			type="email"
			placeholder="Email"
		/>
	</div>

	<div class="mb-6">
		<label class="mb-2 block text-sm font-bold text-gray-700" for="password"> Password </label>
		<input
			class="focus:shadow-outline mb-3 w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
			id="password"
			type="password"
			placeholder="******************"
		/>
	</div>

	<div class="flex items-center justify-between">
		<button
			class="focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
			type="button"
		>
			Sign In
		</button>
		<a
			class="inline-block align-baseline text-sm font-bold text-blue-500 hover:text-blue-800"
			href="#"
		>
			Forgot Password?
		</a>
	</div>
</form>
```

### Alert Component

```html
<!-- Success Alert -->
<div class="border-l-4 border-green-500 bg-green-100 p-4 text-green-700" role="alert">
	<p class="font-bold">Success!</p>
	<p>Your changes have been saved.</p>
</div>

<!-- Error Alert -->
<div class="border-l-4 border-red-500 bg-red-100 p-4 text-red-700" role="alert">
	<p class="font-bold">Error!</p>
	<p>Something went wrong. Please try again.</p>
</div>

<!-- Warning Alert -->
<div class="border-l-4 border-yellow-500 bg-yellow-100 p-4 text-yellow-700" role="alert">
	<p class="font-bold">Warning!</p>
	<p>Please review your input before submitting.</p>
</div>
```

## Best Practices

### 1. Mobile-First Design

- Start with mobile styles and add larger breakpoints
- Use responsive utilities consistently
- Test on actual devices

### 2. Component Extraction

- Extract repeated utility patterns into components
- Use @apply sparingly and strategically
- Prefer composition over complex @apply rules

### 3. Performance

- Use PurgeCSS/JIT mode to remove unused styles
- Avoid dynamic class names that can't be purged
- Group related utilities for better readability

### 4. Consistency

- Establish design tokens early
- Use consistent spacing scale
- Create utility combinations for common patterns

### 5. Dark Mode

- Design with dark mode in mind from the start
- Test color contrast in both modes
- Consider using CSS custom properties for theme switching

## Troubleshooting

### Common Issues

1. **Classes not applying**

   - Ensure files are included in content configuration
   - Check for typos in class names
   - Verify TailwindCSS is properly imported

2. **Styles not updating**

   - Clear browser cache
   - Restart dev server
   - Check for CSS specificity conflicts

3. **PurgeCSS removing needed styles**

   - Add files to content array
   - Use safelist for dynamic classes
   - Avoid string concatenation for class names

4. **Dark mode not working**
   - Check darkMode configuration
   - Ensure proper class/media setup
   - Verify dark variant usage

### Debugging Tips

```javascript
// Check if TailwindCSS is loaded
console.log(getComputedStyle(document.documentElement).getPropertyValue('--tw-shadow'));

// Debug responsive breakpoints
window.addEventListener('resize', () => {
	console.log('Width:', window.innerWidth);
});
```

## Quick Reference

### Common Utilities

```css
/* Layout */
.container
.flex, .grid
.hidden, .block
.relative, .absolute, .fixed

/* Spacing */
.p-{size}, .m-{size}
.px-{size}, .py-{size}
.space-x-{size}, .space-y-{size}

/* Typography */
.text-{size}
.font-{weight}
.text-{color}
.uppercase, .lowercase, .capitalize

/* Colors */
.bg-{color}-{shade}
.text-{color}-{shade}
.border-{color}-{shade}

/* Effects */
.shadow-{size}
.opacity-{value}
.transition-{property}
.transform, .rotate-{deg}, .scale-{size}

/* Responsive */
sm:, md:, lg:, xl:, 2xl:

/* States */
hover:, focus:, active:
disabled:, group-hover:
dark:
```

### Breakpoints

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Custom Breakpoints (v4)

```css
@theme {
	--breakpoint-xs: 475px;
	--breakpoint-3xl: 1920px;
}
```
