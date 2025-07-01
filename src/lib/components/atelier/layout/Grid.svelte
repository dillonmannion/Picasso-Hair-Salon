<!--
  @component Grid
  Atelier Design System Grid component for responsive layouts.
  
  @example
  ```svelte
  <Grid cols={3} gap="md">
    <div>Item 1</div>
    <div>Item 2</div>
    <div>Item 3</div>
  </Grid>
  ```
  
  @props {(1|2|3|4)} [cols=1] - Number of columns
  @props {('sm'|'md'|'lg')} [gap='md'] - Gap between grid items
  @props {boolean} [responsive=true] - Enable responsive breakpoints
  @props {string} [class] - Additional CSS classes
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		cols?: 1 | 2 | 3 | 4;
		gap?: 'sm' | 'md' | 'lg';
		responsive?: boolean;
		class?: string;
		children?: Snippet;
	}

	let {
		cols = 1,
		gap = 'md',
		responsive = true,
		class: className = '',
		children
	}: Props = $props();

	const gapClasses = {
		sm: 'gap-atelier-xs md:gap-atelier-sm',
		md: 'gap-atelier-sm md:gap-atelier-md',
		lg: 'gap-atelier-md md:gap-atelier-lg'
	};

	const getColClasses = () => {
		if (!responsive) {
			return `grid-cols-${cols}`;
		}

		switch (cols) {
			case 1:
				return 'grid-cols-1';
			case 2:
				return 'grid-cols-1 md:grid-cols-2';
			case 3:
				return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
			case 4:
				return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
			default:
				return 'grid-cols-1';
		}
	};

	const gridClass = $derived(
		`atelier-grid grid ${getColClasses()} ${gapClasses[gap]} ${className}`
	);
</script>

<div class={gridClass}>
	{@render children?.()}
</div>

<style>
	.atelier-grid {
		width: 100%;
	}
</style>
