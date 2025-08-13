<script lang="ts">
	import type { HTMLInputAttributes, HTMLInputTypeAttribute } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/utils.js';

	type InputType = Exclude<HTMLInputTypeAttribute, 'file'>;

	type Props = WithElementRef<
		Omit<HTMLInputAttributes, 'type'> &
			({ type: 'file'; files?: FileList } | { type?: InputType; files?: undefined })
	>;

	let {
		ref = $bindable(null),
		value = $bindable(),
		type,
		files = $bindable(),
		class: className,
		...restProps
	}: Props = $props();
</script>

{#if type === 'file'}
	<input
		bind:this={ref}
		data-slot="input"
		class={cn(
			'flex h-10 w-full rounded-lg border border-luxe-cream-400 bg-luxe-cream-50 px-4 py-2 text-sm text-luxe-black-800 ring-offset-luxe-cream-50 placeholder:text-luxe-black-400',
			'transition-all duration-200',
			'focus:border-luxe-burgundy-700 focus:outline-none focus:ring-2 focus:ring-luxe-burgundy-700/20 focus:ring-offset-2',
			'hover:border-luxe-cream-500',
			'disabled:cursor-not-allowed disabled:opacity-50',
			'aria-invalid:border-luxe-burgundy-500 aria-invalid:ring-luxe-burgundy-500/20',
			'file:border-0 file:bg-transparent file:text-sm file:font-medium',
			className
		)}
		type="file"
		bind:files
		bind:value
		{...restProps}
	/>
{:else}
	<input
		bind:this={ref}
		data-slot="input"
		class={cn(
			'flex h-10 w-full rounded-lg border border-luxe-cream-400 bg-luxe-cream-50 px-4 py-2 text-sm text-luxe-black-800 ring-offset-luxe-cream-50 placeholder:text-luxe-black-400',
			'transition-all duration-200',
			'focus:border-luxe-burgundy-700 focus:outline-none focus:ring-2 focus:ring-luxe-burgundy-700/20 focus:ring-offset-2',
			'hover:border-luxe-cream-500',
			'disabled:cursor-not-allowed disabled:opacity-50',
			'aria-invalid:border-luxe-burgundy-500 aria-invalid:ring-luxe-burgundy-500/20',
			className
		)}
		{type}
		bind:value
		{...restProps}
	/>
{/if}
