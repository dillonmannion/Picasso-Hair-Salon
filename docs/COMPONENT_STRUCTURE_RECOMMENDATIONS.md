# Component Structure Recommendations

## Current State Analysis

### Statistics
- **Total Components**: 56
- **UI Components**: 47 (84%)
- **Custom Components**: 8 (14%)
- **Checkout Components**: 1 (2%)

### Current Structure
```
src/lib/components/
├── ui/           # 47 atomic UI components
├── custom/       # 8 business-specific components
└── checkout/     # 1 payment component
```

## Recommendations

### 1. Keep Current Structure (Recommended)

The current structure follows SvelteKit conventions and provides clear separation:
- `ui/` for reusable primitives
- `custom/` for business logic
- `checkout/` for payment features

**Pros:**
- Already established and working
- Clear separation of concerns
- Follows SvelteKit `$lib` patterns
- Team is familiar with structure

**Cons:**
- Large number of files in `ui/` directory
- Could benefit from sub-categorization

### 2. Alternative: Feature-Based Structure

If reorganization is desired in the future:

```
src/lib/components/
├── common/           # Shared UI components
│   ├── forms/       # Form-related components
│   ├── layout/      # Layout components
│   └── feedback/    # Alerts, toasts, modals
├── features/        # Feature-specific components
│   ├── booking/     # Booking flow components
│   ├── admin/       # Admin dashboard components
│   └── checkout/    # Payment components
└── primitives/      # Base UI primitives
    ├── button/
    ├── card/
    └── input/
```

### 3. Component Migration Priority

If adopting the alternative structure, migrate in this order:

1. **Phase 1**: Create new directories without moving files
2. **Phase 2**: Move rarely-used components first
3. **Phase 3**: Move feature-specific components
4. **Phase 4**: Move core UI components last

## Component Best Practices

### 1. File Naming Convention
```
ComponentName.svelte       # Main component
ComponentName.test.ts      # Component tests
ComponentName.stories.ts   # Storybook stories (if used)
```

### 2. Component Template (Svelte 5)
```svelte
<script lang="ts">
	import type { Snippet } from 'svelte';
	
	interface Props {
		required: string;
		optional?: number;
		children?: Snippet;
	}
	
	let { required, optional = 0, children }: Props = $props();
	
	let internalState = $state(0);
	const computed = $derived(internalState * 2);
	
	$effect(() => {
		// Side effects here
	});
</script>

<div class="component-class">
	{#if children}
		{@render children()}
	{/if}
</div>
```

### 3. Component Categories

#### UI Components (Primitives)
- Button, Input, Select, Checkbox, Radio
- Card, Modal, Dropdown, Tabs, Accordion
- Should be completely agnostic to business logic
- Accept all customization via props

#### Custom Components (Business)
- ServiceCard, StylistCard, BookingSummary
- Contain business logic and data fetching
- Use UI components for presentation
- Handle specific business requirements

#### Feature Components (Pages)
- Complete page sections or flows
- Compose multiple UI and Custom components
- Handle routing and navigation
- Manage local state for the feature

## Optimization Opportunities

### 1. Component Consolidation
Consider merging similar components:
- Multiple button variants → Single Button with variants
- Similar card layouts → Single Card with slots
- Form field wrappers → Single FormField component

### 2. Lazy Loading
Implement lazy loading for large components:
```javascript
const HeavyComponent = await import('$lib/components/HeavyComponent.svelte');
```

### 3. Component Library Documentation
Consider adding a component showcase:
- `/dev/components` route with all components
- Props documentation
- Usage examples
- Visual regression testing

## Migration Checklist

If proceeding with restructuring:

- [ ] Create new directory structure
- [ ] Update import aliases in `vite.config.ts`
- [ ] Create migration script for imports
- [ ] Update component imports gradually
- [ ] Test each migration batch
- [ ] Update documentation
- [ ] Clean up old directories

## Recommendation Summary

**Keep the current structure** for now. It's working well and follows SvelteKit conventions. Focus on:

1. Completing Svelte 5 migration in existing components
2. Adding proper TypeScript types
3. Implementing consistent patterns
4. Consider sub-folders within `ui/` if it grows beyond 60 components

The current structure is maintainable and doesn't require immediate change. Restructuring can be considered in a future phase if the team finds the current structure limiting.