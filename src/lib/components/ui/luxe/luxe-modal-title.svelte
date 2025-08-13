<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLHeadingElement>> = $props();
</script>

<h2
	bind:this={ref}
	data-slot="luxe-modal-title"
	class={cn(
		'text-2xl font-light font-["Cormorant_Garamond",serif] text-luxe-black-800',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</h2>