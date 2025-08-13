<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		onClose,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		onClose?: () => void;
	} = $props();
</script>

<div
	bind:this={ref}
	data-slot="luxe-modal-header"
	class={cn(
		'flex items-center justify-between pb-4 border-b border-luxe-cream-300',
		className
	)}
	{...restProps}
>
	<div class="flex-1">
		{@render children?.()}
	</div>
	{#if onClose}
		<button
			type="button"
			onclick={onClose}
			class="ml-4 rounded-lg p-1.5 text-luxe-black-500 transition-colors hover:bg-luxe-cream-200 hover:text-luxe-burgundy-700"
			aria-label="Close modal"
		>
			<svg
				class="h-5 w-5"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M6 18L18 6M6 6l12 12"
				/>
			</svg>
		</button>
	{/if}
</div>