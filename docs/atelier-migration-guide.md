# Atelier Design System Migration Guide

This guide will help you migrate from the existing Picasso Hair Salon components to the new Atelier by Tiffany design system.

## Overview

The Atelier design system introduces a luxury aesthetic while maintaining full compatibility with your existing application. All new components are prefixed with "Atelier" to avoid conflicts.

## Migration Strategy

### Option 1: Gradual Migration (Recommended)

Replace components one at a time as you work on different parts of the application.

### Option 2: Feature-Based Migration

Migrate entire features or pages to use Atelier components.

### Option 3: Full Migration

Use the automated migration script to update all components at once.

## Component Mapping

### UI Components

| Old Component | New Component    | Notes                        |
| ------------- | ---------------- | ---------------------------- |
| `Button`      | `AtelierButton`  | Same props, enhanced styling |
| `Card`        | `AtelierCard`    | Added glass morphism effects |
| `Modal`       | `AtelierModal`   | Improved animations          |
| `Badge`       | `AtelierBadge`   | Luxury color variants        |
| `Tooltip`     | `AtelierTooltip` | Smoother animations          |

### Form Components

| Old Component | New Component     | Key Changes                              |
| ------------- | ----------------- | ---------------------------------------- |
| `Input`       | `AtelierInput`    | Built-in validation, better error states |
| `Select`      | `AtelierSelect`   | Custom styling, consistent with theme    |
| `Textarea`    | `AtelierTextarea` | Auto-resize feature                      |

### Layout Components

| Old Component | New Component      | Enhancements                          |
| ------------- | ------------------ | ------------------------------------- |
| `Header`      | `AtelierHeader`    | Transparent effects, smooth scrolling |
| `Sidebar`     | `AtelierSidebar`   | Slide animations                      |
| `Tabs`        | `AtelierTabs`      | Animated indicators                   |
| `Accordion`   | `AtelierAccordion` | Smooth expand/collapse                |

## Step-by-Step Migration

### 1. Install Dependencies

The Atelier system uses the same dependencies as your existing setup. No additional packages needed!

### 2. Import Theme Provider

Add the theme provider to your root layout:

```svelte
<!-- src/routes/+layout.svelte -->
<script>
	import AtelierThemeProvider from '$lib/components/atelier/AtelierThemeProvider.svelte';
	import AtelierPageTransition from '$lib/components/atelier/utils/AtelierPageTransition.svelte';
	import AtelierNotification from '$lib/components/atelier/feedback/AtelierNotification.svelte';
</script>

<AtelierThemeProvider>
	<AtelierPageTransition />
	<AtelierNotification />
	<!-- Your existing layout content -->
	<slot />
</AtelierThemeProvider>
```

### 3. Update Component Imports

#### Before:

```javascript
import Button from '$lib/components/ui/button/button.svelte';
import Card from '$lib/components/ui/card/card.svelte';
```

#### After:

```javascript
import AtelierButton from '$lib/components/atelier/AtelierButton.svelte';
import AtelierCard from '$lib/components/atelier/AtelierCard.svelte';
```

### 4. Update Component Usage

#### Buttons

```svelte
<!-- Before -->
<Button variant="default" on:click={handleClick}>Click me</Button>

<!-- After -->
<AtelierButton variant="primary" onclick={handleClick}>Click me</AtelierButton>
```

#### Cards

```svelte
<!-- Before -->
<Card>
	<CardHeader>
		<CardTitle>Title</CardTitle>
	</CardHeader>
	<CardContent>Content</CardContent>
</Card>

<!-- After -->
<AtelierCard hoverable glassmorphism>
	<h3 slot="header">Title</h3>
	Content
</AtelierCard>
```

#### Forms

```svelte
<!-- Before -->
<Input type="email" bind:value={email} placeholder="Enter email" />

<!-- After -->
<AtelierInput
	type="email"
	bind:value={email}
	placeholder="Enter email"
	label="Email Address"
	rules={[validators.required(), validators.email()]}
/>
```

### 5. Update Styles

The Atelier system uses CSS custom properties. Add to your app.css:

```css
@import '$lib/styles/atelier.css';
```

## Validation System

The new form components include built-in validation:

```javascript
import { validators } from '$lib/components/atelier/utils/validation';

const emailRules = [
	validators.required('Email is required'),
	validators.email('Invalid email format')
];

const passwordRules = [
	validators.required(),
	validators.minLength(8),
	validators.pattern(/[A-Z]/, 'Must contain uppercase letter')
];
```

## Loading States

Use the new async wrapper for consistent loading states:

```svelte
<script>
	import AtelierAsyncWrapper from '$lib/components/atelier/utils/AtelierAsyncWrapper.svelte';
</script>

<AtelierAsyncWrapper loading={isLoading} {error} empty={data.length === 0}>
	<!-- Your content -->
</AtelierAsyncWrapper>
```

## Notifications

Replace toast/alert systems with Atelier notifications:

```javascript
import { notifications } from '$lib/stores/atelierNotifications';

// Show notifications
notifications.success('Operation completed!');
notifications.error('Something went wrong', 'Please try again');
notifications.info('New update available');
```

## Page Transitions

Page transitions are automatically enabled when you add `AtelierPageTransition` to your layout. For custom transitions:

```javascript
import { atelierTransitions } from '$lib/components/atelier/utils/transitions';

// Use in components
transition: atelierTransitions.fadeScale;
transition: atelierTransitions.luxuryFade;
```

## Dark Mode

Dark mode is automatically supported. Toggle with:

```javascript
import { toggleTheme } from '$lib/stores/atelierTheme';

toggleTheme();
```

## Breaking Changes

1. **Event Handlers**: Svelte 5 syntax required

   - `on:click` → `onclick`
   - `on:input` → `oninput`

2. **Props**: Some prop names changed for clarity

   - `class` → Still works, but specify exact classes
   - `disabled` → Same
   - `variant` → Different values (see component docs)

3. **Slots**: Named slots syntax updated
   - `slot="header"` → Still supported
   - New snippet-based approach available

## Troubleshooting

### Styling Conflicts

If you see style conflicts, ensure Atelier CSS is imported after your base styles.

### TypeScript Errors

All components include TypeScript definitions. Update imports:

```typescript
import type { AtelierButtonProps } from '$lib/components/atelier/AtelierButton.svelte';
```

### Performance Issues

- Enable CSS containment for large lists
- Use skeleton loaders during data fetching
- Implement virtual scrolling for long lists

## Automated Migration

Run the migration script to automatically update imports:

```bash
npm run migrate:atelier
```

This will:

1. Update component imports
2. Fix event handler syntax
3. Add theme provider to layout
4. Update CSS imports

## Support

For issues or questions:

1. Check the demo at `/atelier-demo`
2. Review component source code
3. Test in isolation before full migration

## Next Steps

1. Start with a single page or component
2. Test thoroughly
3. Gather user feedback
4. Complete migration gradually

Remember: Both old and new components can coexist, so migrate at your own pace!
