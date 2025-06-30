<script lang="ts">
	import { cn } from '$lib/utils';

	type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'card';

	interface SkeletonProps {
		variant?: SkeletonVariant;
		width?: string;
		height?: string;
		count?: number;
		class?: string;
		animate?: boolean;
	}

	let {
		variant = 'text',
		width,
		height,
		count = 1,
		class: className,
		animate = true
	}: SkeletonProps = $props();

	const baseStyles = 'bg-gray-200 dark:bg-gray-700';
	
	const animationStyles = animate ? 'animate-pulse' : '';

	const variantStyles = {
		text: 'h-4 rounded',
		circular: 'rounded-full',
		rectangular: 'rounded-lg',
		card: 'rounded-lg'
	};

	const getSize = () => {
		switch (variant) {
			case 'circular':
				return {
					width: width || '48px',
					height: height || '48px'
				};
			case 'card':
				return {
					width: width || '100%',
					height: height || '200px'
				};
			case 'rectangular':
				return {
					width: width || '100%',
					height: height || '120px'
				};
			default: // text
				return {
					width: width || '100%',
					height: height || '16px'
				};
		}
	};

	const size = $derived(getSize());

	const skeletonClass = $derived(
		cn(
			baseStyles,
			animationStyles,
			variantStyles[variant],
			className
		)
	);
</script>

{#if count > 1}
	<div class="space-y-3">
		{#each Array(count) as _, i}
			<div
				class={skeletonClass}
				style="width: {size.width}; height: {size.height};"
				aria-hidden="true"
			/>
		{/each}
	</div>
{:else}
	<div
		class={skeletonClass}
		style="width: {size.width}; height: {size.height};"
		aria-hidden="true"
	/>
{/if}

<style>
	@media (prefers-reduced-motion: reduce) {
		:global(.animate-pulse) {
			animation: none !important;
		}
	}
</style>