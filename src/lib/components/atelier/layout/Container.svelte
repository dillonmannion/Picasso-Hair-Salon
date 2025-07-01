<!--
  @component Container
  Atelier Design System Container component for consistent max-width and padding.
  
  @example
  ```svelte
  <Container size="default">
    <h1>Content goes here</h1>
  </Container>
  ```
  
  @props {('full'|'default'|'narrow')} [size='default'] - Container width variant
  @props {boolean} [noPadding=false] - Remove horizontal padding
  @props {string} [class] - Additional CSS classes
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		size?: 'full' | 'default' | 'narrow';
		noPadding?: boolean;
		class?: string;
		children?: Snippet;
	}

	let { size = 'default', noPadding = false, class: className = '', children }: Props = $props();

	const sizeClasses = {
		full: 'max-w-[1600px]',
		default: 'max-w-7xl',
		narrow: 'max-w-4xl'
	};

	const containerClass = $derived(
		`atelier-container mx-auto ${sizeClasses[size]} ${
			noPadding ? '' : 'px-atelier-sm md:px-atelier-md lg:px-atelier-lg'
		} ${className}`
	);
</script>

<div class={containerClass}>
	{@render children?.()}
</div>

<style>
	.atelier-container {
		width: 100%;
		position: relative;
	}
</style>
