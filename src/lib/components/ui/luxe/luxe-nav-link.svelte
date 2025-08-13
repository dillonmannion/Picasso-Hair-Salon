<script lang="ts">
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/utils.js';
	import { page } from '$app/stores';

	let {
		ref = $bindable(null),
		class: className,
		href,
		children,
		active = false,
		...restProps
	}: WithElementRef<HTMLAnchorAttributes> & {
		active?: boolean;
	} = $props();

	// Automatically detect active state based on current page
	const isActive = $derived(active || (href && $page.url.pathname === href));
</script>

<a
	bind:this={ref}
	{href}
	data-slot="luxe-nav-link"
	class={cn(
		'relative text-sm font-medium transition-all duration-200',
		'text-luxe-black-700 hover:text-luxe-burgundy-700',
		'after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-luxe-burgundy-700 after:transition-all after:duration-300',
		'hover:after:w-full',
		isActive && [
			'text-luxe-burgundy-700',
			'after:w-full'
		],
		className
	)}
	aria-current={isActive ? 'page' : undefined}
	{...restProps}
>
	{@render children?.()}
</a>