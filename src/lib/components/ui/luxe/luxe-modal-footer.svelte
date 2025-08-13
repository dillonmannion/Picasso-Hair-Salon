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
	data-slot="luxe-modal-footer"
	class={cn(
		'flex items-center justify-end gap-3 pt-4 border-t border-luxe-cream-300',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>