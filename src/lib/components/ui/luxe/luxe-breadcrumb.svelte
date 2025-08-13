<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		separator = '/',
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLElement>> & {
		separator?: string;
	} = $props();
</script>

<nav
	bind:this={ref}
	data-slot="luxe-breadcrumb"
	aria-label="Breadcrumb"
	class={cn('flex items-center gap-2 text-sm', className)}
	{...restProps}
>
	{@render children?.()}
</nav>

<style>
	:global([data-slot="luxe-breadcrumb"] > *:not(:last-child)::after) {
		content: '/';
		margin-left: 0.5rem;
		color: var(--luxe-text-muted);
	}
</style>