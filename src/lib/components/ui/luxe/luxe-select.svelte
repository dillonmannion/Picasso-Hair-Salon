<script lang="ts">
	import type { HTMLSelectAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		value = $bindable(),
		children,
		...restProps
	}: WithElementRef<HTMLSelectAttributes> = $props();
</script>

<div class="relative">
	<select
		bind:this={ref}
		bind:value
		data-slot="luxe-select"
		class={cn(
			'flex h-10 w-full appearance-none rounded-lg border border-luxe-cream-400 bg-luxe-cream-50 px-4 py-2 pr-10 text-sm text-luxe-black-800 ring-offset-luxe-cream-50',
			'transition-all duration-200',
			'focus:border-luxe-burgundy-700 focus:outline-none focus:ring-2 focus:ring-luxe-burgundy-700/20 focus:ring-offset-2',
			'hover:border-luxe-cream-500',
			'disabled:cursor-not-allowed disabled:opacity-50',
			'aria-invalid:border-luxe-burgundy-500 aria-invalid:ring-luxe-burgundy-500/20',
			className
		)}
		{...restProps}
	>
		{@render children?.()}
	</select>
	<div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
		<svg
			class="h-4 w-4 text-luxe-burgundy-700"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M19 9l-7 7-7-7"
			/>
		</svg>
	</div>
</div>