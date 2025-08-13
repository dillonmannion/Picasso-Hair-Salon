<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		orientation = 'horizontal',
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLElement>> & {
		orientation?: 'horizontal' | 'vertical';
	} = $props();
</script>

<nav
	bind:this={ref}
	data-slot="luxe-nav"
	class={cn(
		'flex',
		orientation === 'horizontal' ? 'flex-row items-center gap-8' : 'flex-col gap-2',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</nav>