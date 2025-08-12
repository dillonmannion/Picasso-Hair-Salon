# Bits UI Documentation

## Overview

**Bits UI** is a headless component library for Svelte that provides unstyled, accessible UI primitives. It focuses on behavior, accessibility, and composition while giving developers complete control over styling and structure.

**Current version in project**: 1.1.3

## Why Use Bits UI?

- **Headless Architecture**: Complete control over styling and markup
- **Accessibility First**: Built with ARIA compliance and keyboard navigation
- **Composable**: Build complex UIs from simple primitives
- **TypeScript Support**: Full type safety with excellent DX
- **Svelte 5 Compatible**: Designed for modern Svelte with runes
- **Tree-Shakeable**: Only bundle what you use
- **Zero Dependencies**: Lightweight with no external runtime dependencies

## Installation & Setup

### 1. Install Dependencies

```bash
# Install bits-ui
npm install bits-ui

# Install date utilities (if using date components)
npm install @internationalized/date
```

### 2. Configure TypeScript

```json
// tsconfig.json
{
	"compilerOptions": {
		"moduleResolution": "bundler",
		"strict": true
	}
}
```

## Core Concepts

### 1. Component Structure

Bits UI components follow a consistent pattern with Root containers and sub-components:

```svelte
<script lang="ts">
	import { Dialog } from 'bits-ui';
</script>

<Dialog.Root>
	<Dialog.Trigger />
	<Dialog.Portal>
		<Dialog.Overlay />
		<Dialog.Content>
			<Dialog.Title />
			<Dialog.Description />
			<Dialog.Close />
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
```

### 2. State Management

#### Two-way Binding

```svelte
<script lang="ts">
	import { Dialog } from 'bits-ui';
	let open = $state(false);
</script>

<button onclick={() => (open = true)}>Open Dialog</button>

<Dialog.Root bind:open>
	<!-- Dialog content -->
</Dialog.Root>
```

#### Function Binding (Full Control)

```svelte
<script lang="ts">
	import { Select } from 'bits-ui';
	let myValue = $state('');

	function getValue() {
		return myValue;
	}

	function setValue(newValue: string) {
		myValue = newValue;
		// Custom logic here
	}
</script>

<Select.Root type="single" bind:value={getValue, setValue}>
	<!-- Select content -->
</Select.Root>
```

### 3. Styling

#### Class-based Styling

```svelte
<Accordion.Trigger class="px-4 py-2 hover:bg-gray-100">Click me</Accordion.Trigger>
```

#### Data Attributes

```css
/* Style based on component state */
[data-accordion-trigger][data-state='open'] {
	background-color: #f0f0f0;
	font-weight: bold;
}

[data-accordion-trigger][data-disabled] {
	opacity: 0.5;
	cursor: not-allowed;
}
```

### 4. Snippets and Composition

```svelte
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Dialog, type WithoutChild } from 'bits-ui';

	type Props = Dialog.RootProps & {
		buttonText: string;
		title: Snippet;
		description: Snippet;
		contentProps?: WithoutChild<Dialog.ContentProps>;
	};

	let {
		open = $bindable(false),
		children,
		buttonText,
		title,
		description,
		...restProps
	}: Props = $props();
</script>

<Dialog.Root bind:open {...restProps}>
	<Dialog.Trigger>{buttonText}</Dialog.Trigger>
	<Dialog.Portal>
		<Dialog.Content>
			<Dialog.Title>
				{@render title()}
			</Dialog.Title>
			<Dialog.Description>
				{@render description()}
			</Dialog.Description>
			{@render children?.()}
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
```

## API Reference

### Common Component Props

Most components share these common patterns:

- `open`/`value`: Component state
- `onOpenChange`/`onValueChange`: State change handlers
- `disabled`: Disable interactions
- `ref`: Element references
- `asChild`: Render as child element

### Global Configuration

```svelte
<script lang="ts">
	import { BitsConfig } from 'bits-ui';
</script>

<BitsConfig defaultPortalTo="#main-portal">
	<!-- Your app -->
</BitsConfig>
```

## Code Examples

### Accordion

```svelte
<script lang="ts">
	import { Accordion } from 'bits-ui';
</script>

<Accordion.Root type="single" value="item-1">
	<Accordion.Item value="item-1">
		<Accordion.Header>
			<Accordion.Trigger class="w-full p-4 text-left">First Item</Accordion.Trigger>
		</Accordion.Header>
		<Accordion.Content class="p-4">Content for the first item</Accordion.Content>
	</Accordion.Item>

	<Accordion.Item value="item-2">
		<Accordion.Header>
			<Accordion.Trigger class="w-full p-4 text-left">Second Item</Accordion.Trigger>
		</Accordion.Header>
		<Accordion.Content class="p-4">Content for the second item</Accordion.Content>
	</Accordion.Item>
</Accordion.Root>
```

### Alert Dialog

```svelte
<script lang="ts">
	import { AlertDialog } from 'bits-ui';
	let deleteOpen = $state(false);
</script>

<AlertDialog.Root bind:open={deleteOpen}>
	<AlertDialog.Trigger class="text-red-600">Delete Account</AlertDialog.Trigger>
	<AlertDialog.Portal>
		<AlertDialog.Overlay class="fixed inset-0 bg-black/50" />
		<AlertDialog.Content class="fixed rounded-lg bg-white p-6">
			<AlertDialog.Title>Are you sure?</AlertDialog.Title>
			<AlertDialog.Description>
				This action cannot be undone. This will permanently delete your account.
			</AlertDialog.Description>
			<div class="mt-4 flex gap-4">
				<AlertDialog.Cancel class="btn-secondary">Cancel</AlertDialog.Cancel>
				<AlertDialog.Action class="btn-danger">Delete</AlertDialog.Action>
			</div>
		</AlertDialog.Content>
	</AlertDialog.Portal>
</AlertDialog.Root>
```

### Select/Combobox

```svelte
<script lang="ts">
	import { Select } from 'bits-ui';

	const items = [
		{ value: 'apple', label: 'Apple' },
		{ value: 'banana', label: 'Banana' },
		{ value: 'orange', label: 'Orange' }
	];

	let value = $state('apple');
</script>

<Select.Root type="single" bind:value {items}>
	<Select.Trigger class="w-[200px] rounded border p-2">
		{items.find((i) => i.value === value)?.label || 'Select a fruit'}
	</Select.Trigger>
	<Select.Portal>
		<Select.Content class="rounded border bg-white shadow-lg">
			<Select.Viewport>
				{#each items as item}
					<Select.Item value={item.value} class="p-2 hover:bg-gray-100">
						{item.label}
					</Select.Item>
				{/each}
			</Select.Viewport>
		</Select.Content>
	</Select.Portal>
</Select.Root>
```

### Date Picker

```svelte
<script lang="ts">
	import { DatePicker } from 'bits-ui';
	import { CalendarDate } from '@internationalized/date';

	let value = $state(new CalendarDate(2024, 1, 1));
</script>

<DatePicker.Root bind:value>
	<DatePicker.Label>Select Date</DatePicker.Label>
	<DatePicker.Input class="flex gap-1 rounded border p-2">
		{#snippet children({ segments })}
			{#each segments as { part, value }}
				<DatePicker.Segment {part} class="px-1">
					{value}
				</DatePicker.Segment>
			{/each}
			<DatePicker.Trigger class="ml-auto">📅</DatePicker.Trigger>
		{/snippet}
	</DatePicker.Input>
	<DatePicker.Content>
		<DatePicker.Calendar>
			{#snippet children({ months, weekdays })}
				<DatePicker.Header>
					<DatePicker.PrevButton>←</DatePicker.PrevButton>
					<DatePicker.Heading />
					<DatePicker.NextButton>→</DatePicker.NextButton>
				</DatePicker.Header>
				<!-- Calendar grid -->
			{/snippet}
		</DatePicker.Calendar>
	</DatePicker.Content>
</DatePicker.Root>
```

### Command Palette

```svelte
<script lang="ts">
	import { Command } from 'bits-ui';
	let open = $state(false);
	let value = $state('');
</script>

<!-- Trigger with Cmd+K -->
<svelte:window
	onkeydown={(e) => {
		if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			open = true;
		}
	}}
/>

{#if open}
	<div class="fixed inset-0 bg-black/50">
		<Command.Root bind:value class="mx-auto mt-20 w-[500px] rounded-lg bg-white">
			<Command.Input placeholder="Type a command..." class="w-full p-4" />
			<Command.List>
				<Command.Viewport>
					<Command.Empty>No results found.</Command.Empty>

					<Command.Group>
						<Command.GroupHeading>Suggestions</Command.GroupHeading>
						<Command.GroupItems>
							<Command.Item value="profile" onSelect={() => navigate('/profile')}>
								Go to Profile
							</Command.Item>
							<Command.Item value="settings" onSelect={() => navigate('/settings')}>
								Open Settings
							</Command.Item>
						</Command.GroupItems>
					</Command.Group>
				</Command.Viewport>
			</Command.List>
		</Command.Root>
	</div>
{/if}
```

### Tooltip

```svelte
<script lang="ts">
	import { Tooltip } from 'bits-ui';
</script>

<!-- Wrap app with provider -->
<Tooltip.Provider>
	<Tooltip.Root>
		<Tooltip.Trigger class="underline">Hover me</Tooltip.Trigger>
		<Tooltip.Portal>
			<Tooltip.Content class="rounded bg-gray-900 px-2 py-1 text-sm text-white">
				Helpful information
				<Tooltip.Arrow class="fill-gray-900" />
			</Tooltip.Content>
		</Tooltip.Portal>
	</Tooltip.Root>
</Tooltip.Provider>
```

### Custom Reusable Components

```svelte
<!-- Button.svelte -->
<script lang="ts">
	import { Button as ButtonPrimitive } from 'bits-ui';
	import type { Button } from 'bits-ui';
	import { cn } from '$lib/utils';

	type Props = Button.Props & {
		variant?: 'default' | 'destructive' | 'outline';
		size?: 'sm' | 'md' | 'lg';
	};

	let { variant = 'default', size = 'md', class: className, ...restProps }: Props = $props();

	const variants = {
		default: 'bg-blue-600 text-white hover:bg-blue-700',
		destructive: 'bg-red-600 text-white hover:bg-red-700',
		outline: 'border border-gray-300 hover:bg-gray-100'
	};

	const sizes = {
		sm: 'px-3 py-1 text-sm',
		md: 'px-4 py-2',
		lg: 'px-6 py-3 text-lg'
	};
</script>

<ButtonPrimitive.Root
	class={cn('rounded font-medium transition-colors', variants[variant], sizes[size], className)}
	{...restProps}
>
	<slot />
</ButtonPrimitive.Root>
```

## Best Practices

### 1. Accessibility

- Always provide labels for form components
- Use semantic HTML elements
- Ensure keyboard navigation works properly
- Test with screen readers
- Provide appropriate ARIA attributes

### 2. State Management

- Use two-way binding for simple cases
- Use function binding for complex state logic
- Keep state close to where it's used
- Consider using stores for shared state

### 3. Styling

- Use data attributes for state-based styling
- Keep styles modular and reusable
- Consider creating wrapper components for consistent styling
- Use CSS variables for theming

### 4. Performance

- Components are tree-shakeable by default
- Only import what you need
- Use portals for overlays to avoid z-index issues
- Lazy load heavy components

### 5. TypeScript

- Leverage the built-in type definitions
- Use proper type imports
- Create typed wrapper components

## Troubleshooting

### Common Issues

1. **Types not working**
   - Ensure `moduleResolution: "bundler"` in tsconfig
   - Import types from `bits-ui` directly
   - Check TypeScript version compatibility

2. **Styling not applied**
   - Verify class names are correct
   - Check if using correct data attributes
   - Ensure CSS is properly imported

3. **State not updating**
   - Use `$state()` for reactive state
   - Check binding syntax is correct
   - Verify event handlers are attached

4. **Portal rendering issues**
   - Ensure portal target exists in DOM
   - Use `BitsConfig` for global portal configuration
   - Check z-index conflicts

### Debugging Tips

```svelte
<script lang="ts">
	// Log state changes
	$effect(() => {
		console.log('Dialog open:', open);
	});

	// Track component lifecycle
	onMount(() => {
		console.log('Component mounted');
	});
</script>
```

## Quick Reference

### Component List

- **Overlays**: Dialog, AlertDialog, Sheet, Popover, Tooltip
- **Navigation**: Tabs, NavigationMenu, Breadcrumb
- **Forms**: Select, Combobox, Checkbox, Radio, Switch, Slider
- **Dates**: Calendar, DatePicker, DateRangePicker
- **Feedback**: Progress, Toast, Alert
- **Layout**: Accordion, Collapsible, ScrollArea
- **Data**: Table, Command

### Common Patterns

```svelte
<!-- Two-way binding -->
<Component.Root bind:value={myValue} />

<!-- Event handling -->
<Component.Root onValueChange={(value) => handleChange(value)} />

<!-- Conditional rendering -->
{#if open}
	<Component.Portal>
		<!-- content -->
	</Component.Portal>
{/if}

<!-- Custom styling -->
<Component.Root class="custom-class" data-custom="true" />
```

### Utility Functions

```javascript
import { mergeProps } from 'bits-ui';

// Merge multiple prop objects
const merged = mergeProps(defaultProps, userProps);
```
