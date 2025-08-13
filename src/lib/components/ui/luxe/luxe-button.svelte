<script lang="ts" module>
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import { type VariantProps, tv } from 'tailwind-variants';

	export const luxeButtonVariants = tv({
		base: "focus-visible:ring-luxe-burgundy-700/50 aria-invalid:ring-luxe-burgundy-600/20 aria-invalid:border-luxe-burgundy-600 inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-luxe-cream-50 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 shadow-sm hover:shadow-md",
		variants: {
			variant: {
				primary: 'bg-luxe-burgundy-700 text-luxe-cream-50 hover:bg-luxe-burgundy-800 active:bg-luxe-burgundy-900',
				secondary: 'bg-luxe-cream-200 text-luxe-burgundy-700 hover:bg-luxe-cream-300 active:bg-luxe-cream-400 border border-luxe-cream-400',
				outline: 'border-2 border-luxe-burgundy-700 bg-transparent text-luxe-burgundy-700 hover:bg-luxe-burgundy-700 hover:text-luxe-cream-50 active:bg-luxe-burgundy-800',
				ghost: 'bg-transparent text-luxe-burgundy-700 hover:bg-luxe-cream-100 active:bg-luxe-cream-200 shadow-none hover:shadow-none',
				destructive: 'bg-luxe-burgundy-500 text-white hover:bg-luxe-burgundy-600 active:bg-luxe-burgundy-700',
				link: 'text-luxe-burgundy-700 underline-offset-4 hover:underline hover:text-luxe-burgundy-800 shadow-none hover:shadow-none'
			},
			size: {
				default: 'h-10 px-6 py-2.5 has-[>svg]:px-5',
				sm: 'h-8 gap-1.5 rounded-md px-4 text-xs has-[>svg]:px-3',
				lg: 'h-12 rounded-lg px-8 text-base has-[>svg]:px-6',
				xl: 'h-14 rounded-lg px-10 text-lg has-[>svg]:px-8',
				icon: 'size-10 p-0'
			}
		},
		defaultVariants: {
			variant: 'primary',
			size: 'default'
		}
	});

	export type LuxeButtonVariant = VariantProps<typeof luxeButtonVariants>['variant'];
	export type LuxeButtonSize = VariantProps<typeof luxeButtonVariants>['size'];

	export type LuxeButtonProps = WithElementRef<HTMLButtonAttributes> &
		WithElementRef<HTMLAnchorAttributes> & {
			variant?: LuxeButtonVariant;
			size?: LuxeButtonSize;
		};
</script>

<script lang="ts">
	import { goto } from '$app/navigation';
	
	let {
		class: className,
		variant = 'primary',
		size = 'default',
		ref = $bindable(null),
		href = undefined,
		type = 'button',
		disabled,
		children,
		onclick,
		...restProps
	}: LuxeButtonProps = $props();

	// Handle navigation for button elements with href
	async function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		// If there's a custom onclick handler, call it first
		if (onclick && typeof onclick === 'function') {
			(onclick as (e: MouseEvent) => void)(event);
		}
		
		// If the button has an href and isn't disabled, navigate
		if (href && !disabled && !event.defaultPrevented && event.currentTarget instanceof HTMLButtonElement) {
			event.preventDefault();
			await goto(href);
		}
	}
</script>

{#if href && !onclick}
	<a
		bind:this={ref}
		data-slot="luxe-button"
		class={cn(luxeButtonVariants({ variant, size }), className)}
		href={disabled ? undefined : href}
		aria-disabled={disabled}
		role={disabled ? 'link' : undefined}
		tabindex={disabled ? -1 : undefined}
		{...restProps}
	>
		{@render children?.()}
	</a>
{:else}
	<button
		bind:this={ref}
		data-slot="luxe-button"
		class={cn(luxeButtonVariants({ variant, size }), className)}
		{type}
		{disabled}
		onclick={handleClick}
		{...restProps}
	>
		{@render children?.()}
	</button>
{/if}