<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	bind:this={ref}
	data-slot="card"
	class={cn(
		'rounded-xl bg-luxe-cream-50 p-6 shadow-[0_12px_24px_rgba(94,28,28,0.08)] border border-luxe-cream-300 transition-all duration-300 hover:shadow-[0_16px_32px_rgba(94,28,28,0.12)]',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
