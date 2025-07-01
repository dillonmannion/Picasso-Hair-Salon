<script lang="ts">
	import { cn } from '$lib/utils';

	type LoaderSize = 'sm' | 'md' | 'lg';
	type LoaderVariant = 'spinner' | 'dots' | 'pulse' | 'shimmer';

	interface LoaderProps {
		size?: LoaderSize;
		variant?: LoaderVariant;
		class?: string;
		label?: string;
	}

	let {
		size = 'md',
		variant = 'spinner',
		class: className,
		label = 'Loading...'
	}: LoaderProps = $props();

	const sizeClasses: Record<LoaderSize, string> = {
		sm: 'w-4 h-4',
		md: 'w-8 h-8',
		lg: 'w-12 h-12'
	};

	const dotSizeClasses: Record<LoaderSize, string> = {
		sm: 'w-1 h-1',
		md: 'w-2 h-2',
		lg: 'w-3 h-3'
	};

	const loaderClass = $derived(cn('atelier-loader', className));
</script>

<div class={loaderClass} role="status" aria-label={label}>
	{#if variant === 'spinner'}
		<svg
			class={cn('text-atelier-primary animate-spin', sizeClasses[size])}
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
		>
			<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
			></circle>
			<path
				class="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			></path>
		</svg>
	{:else if variant === 'dots'}
		<div class="flex items-center gap-1">
			{#each [0, 1, 2] as i}
				<div
					class={cn('bg-atelier-primary animate-bounce rounded-full', dotSizeClasses[size])}
					style="animation-delay: {i * 150}ms"
				></div>
			{/each}
		</div>
	{:else if variant === 'pulse'}
		<div class="relative inline-flex">
			<div
				class={cn(
					'bg-atelier-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
					sizeClasses[size]
				)}
			></div>
			<div
				class={cn('bg-atelier-primary relative inline-flex rounded-full', sizeClasses[size])}
			></div>
		</div>
	{:else if variant === 'shimmer'}
		<div class={cn('bg-atelier-muted relative overflow-hidden rounded-lg', sizeClasses[size])}>
			<div
				class="via-atelier-primary/20 animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent to-transparent"
			></div>
		</div>
	{/if}
	<span class="sr-only">{label}</span>
</div>

<style>
	@keyframes shimmer {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(100%);
		}
	}

	.animate-shimmer {
		animation: shimmer 1.5s infinite;
	}

	:global(.dark) .atelier-loader {
		--atelier-primary: var(--atelier-champagne);
	}

	@media (prefers-reduced-motion: reduce) {
		.animate-spin,
		.animate-bounce,
		.animate-ping,
		.animate-shimmer {
			animation: none;
		}
	}
</style>
