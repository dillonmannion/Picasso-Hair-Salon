<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		checked = $bindable(false),
		...restProps
	}: WithElementRef<Omit<HTMLInputAttributes, 'type'>> = $props();
</script>

<div class="relative inline-flex items-center">
	<input
		bind:this={ref}
		bind:checked
		type="checkbox"
		data-slot="luxe-checkbox"
		class={cn(
			'peer h-5 w-5 shrink-0 rounded-md border border-luxe-cream-400 bg-luxe-cream-50',
			'transition-all duration-200 cursor-pointer',
			'focus:outline-none focus:ring-2 focus:ring-luxe-burgundy-700/20 focus:ring-offset-2 focus:ring-offset-luxe-cream-50',
			'hover:border-luxe-burgundy-700',
			'checked:bg-luxe-burgundy-700 checked:border-luxe-burgundy-700',
			'disabled:cursor-not-allowed disabled:opacity-50',
			'aria-invalid:border-luxe-burgundy-500',
			className
		)}
		{...restProps}
	/>
	<svg
		class="pointer-events-none absolute left-0 h-5 w-5 text-luxe-cream-50 opacity-0 transition-opacity peer-checked:opacity-100"
		fill="none"
		stroke="currentColor"
		viewBox="0 0 24 24"
		stroke-width="3"
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			d="M5 13l4 4L19 7"
		/>
	</svg>
</div>