<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		polaroid = false,
		hover = false,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		polaroid?: boolean;
		hover?: boolean;
	} = $props();
</script>

<div
	bind:this={ref}
	data-slot="luxe-card"
	class={cn(
		'rounded-xl bg-luxe-cream-50 p-6 shadow-[0_12px_24px_rgba(94,28,28,0.08)] border border-luxe-cream-300 transition-all duration-300',
		polaroid && 'bg-white p-2 shadow-[0_10px_18px_rgba(0,0,0,0.08)] transform -rotate-1',
		hover && 'hover:shadow-[0_16px_32px_rgba(94,28,28,0.12)] hover:transform hover:scale-[1.02]',
		polaroid && hover && 'hover:rotate-0',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>