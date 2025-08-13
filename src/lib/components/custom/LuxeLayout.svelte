<script lang="ts">
	import type { Snippet } from 'svelte';
	import { theme } from '$lib/stores/theme.svelte';

	interface Props {
		children?: Snippet;
		variant?: 'default' | 'full' | 'contained' | 'hero' | 'card';
		background?:
			| 'primary'
			| 'secondary'
			| 'cream'
			| 'pattern-dots'
			| 'pattern-lines'
			| 'pattern-grid'
			| 'gradient';
		padding?: boolean;
		className?: string;
	}

	let {
		children,
		variant = 'default',
		background = 'primary',
		padding = true,
		className = ''
	}: Props = $props();

	const resolvedTheme = $derived(theme.resolvedTheme);

	// Build background classes based on prop
	const backgroundClasses = $derived(() => {
		switch (background) {
			case 'secondary':
				return 'bg-luxe-cream-200';
			case 'cream':
				return 'bg-luxe-cream-100';
			case 'pattern-dots':
				return 'bg-luxe-cream-50 luxe-pattern-dots';
			case 'pattern-lines':
				return 'bg-luxe-cream-50 luxe-pattern-lines';
			case 'pattern-grid':
				return 'bg-luxe-cream-50 luxe-pattern-grid';
			case 'gradient':
				return 'luxe-gradient-cream';
			default:
				return 'bg-background';
		}
	});

	// Build layout classes based on variant
	const layoutClasses = $derived(() => {
		const baseClasses = 'relative w-full';
		const paddingClasses = padding ? 'py-8 md:py-12 lg:py-16' : '';

		switch (variant) {
			case 'full':
				return `${baseClasses} ${paddingClasses}`;
			case 'contained':
				return `${baseClasses} ${paddingClasses} max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`;
			case 'hero':
				return `${baseClasses} min-h-[60vh] md:min-h-[70vh] flex items-center justify-center ${paddingClasses} px-4 sm:px-6 lg:px-8`;
			case 'card':
				return `${baseClasses} ${paddingClasses} max-w-5xl mx-auto px-4 sm:px-6 lg:px-8`;
			default:
				return `${baseClasses} ${paddingClasses} px-4 sm:px-6 lg:px-8`;
		}
	});
</script>

<section
	class="{backgroundClasses()} {layoutClasses()} {className} transition-colors duration-300"
	data-theme={resolvedTheme}
>
	{#if variant === 'hero'}
		<div class="relative z-10 w-full max-w-5xl">
			{@render children?.()}
		</div>
	{:else}
		{@render children?.()}
	{/if}
</section>

<style>
	/* Additional scoped styles for patterns if needed */
	:global(.luxe-pattern-dots) {
		background-image: radial-gradient(circle, rgba(220, 200, 168, 0.3) 1px, transparent 1px);
		background-size: 20px 20px;
		background-position:
			0 0,
			10px 10px;
	}

	:global(.luxe-pattern-lines) {
		background-image: repeating-linear-gradient(
			45deg,
			transparent,
			transparent 10px,
			rgba(220, 200, 168, 0.15) 10px,
			rgba(220, 200, 168, 0.15) 11px
		);
	}

	:global(.luxe-pattern-grid) {
		background-image:
			linear-gradient(rgba(220, 200, 168, 0.15) 1px, transparent 1px),
			linear-gradient(90deg, rgba(220, 200, 168, 0.15) 1px, transparent 1px);
		background-size: 20px 20px;
	}

	:global(.luxe-gradient-cream) {
		background: linear-gradient(135deg, #fdfcfa 0%, #f3ede2 50%, #e8dcc9 100%);
	}
</style>
