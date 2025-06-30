<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	interface CardProps extends HTMLAttributes<HTMLDivElement> {
		hoverable?: boolean;
		padding?: 'none' | 'sm' | 'md' | 'lg';
		class?: string;
	}

	let {
		hoverable = true,
		padding = 'md',
		class: className,
		children,
		onclick,
		...restProps
	}: CardProps = $props();

	const baseStyles =
		'atelier-card bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-300';

	const hoverStyles = hoverable ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer' : '';

	const paddingStyles = {
		none: '',
		sm: 'p-4',
		md: 'p-6',
		lg: 'p-8'
	};

	const cardClass = $derived(cn(baseStyles, hoverStyles, paddingStyles[padding], className));

	const interactive = $derived(hoverable || onclick);
</script>

<div
	class={cardClass}
	role={interactive ? 'button' : undefined}
	tabindex={interactive ? 0 : undefined}
	{onclick}
	onkeydown={(e) => {
		if (interactive && (e.key === 'Enter' || e.key === ' ')) {
			e.preventDefault();
			onclick?.(e);
		}
	}}
	{...restProps}
>
	{@render children?.()}
</div>

<style>
	.atelier-card {
		transform-style: preserve-3d;
		will-change: transform, box-shadow;
	}

	.atelier-card:focus-visible {
		outline: 2px solid var(--atelier-primary);
		outline-offset: 2px;
	}
</style>
