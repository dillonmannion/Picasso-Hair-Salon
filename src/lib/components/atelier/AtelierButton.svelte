<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
	type ButtonSize = 'sm' | 'md' | 'lg';

	interface ButtonProps extends HTMLButtonAttributes {
		variant?: ButtonVariant;
		size?: ButtonSize;
		loading?: boolean;
		class?: string;
		href?: string;
	}

	let {
		variant = 'primary',
		size = 'md',
		loading = false,
		disabled = false,
		class: className,
		href,
		children,
		onclick,
		...restProps
	}: ButtonProps = $props();

	const baseStyles =
		'atelier-button inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

	const variantStyles: Record<ButtonVariant, string> = {
		primary:
			'bg-atelier-primary text-white hover:bg-atelier-primary/90 focus:ring-atelier-primary/50',
		secondary:
			'bg-atelier-secondary text-atelier-primary hover:bg-atelier-secondary/80 focus:ring-atelier-secondary/50',
		outline:
			'border-2 border-atelier-primary text-atelier-primary hover:bg-atelier-primary/10 focus:ring-atelier-primary/50',
		ghost: 'text-atelier-primary hover:bg-atelier-primary/10 focus:ring-atelier-primary/50',
		destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/50'
	};

	const sizeStyles: Record<ButtonSize, string> = {
		sm: 'px-3 py-1.5 text-sm rounded-md',
		md: 'px-4 py-2 text-base rounded-lg',
		lg: 'px-6 py-3 text-lg rounded-lg'
	};

	const buttonClass = $derived(
		cn(baseStyles, variantStyles[variant], sizeStyles[size], loading && 'cursor-wait', className)
	);

	const isDisabled = $derived(disabled ?? loading);
</script>

{#if href}
	<a {href} class={buttonClass} aria-busy={loading}>
		{#if loading}
			<svg
				class="mr-2 -ml-1 h-4 w-4 animate-spin"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
				></circle>
				<path
					class="opacity-75"
					fill="currentColor"
					d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
				></path>
			</svg>
		{/if}
		{@render children?.()}
	</a>
{:else}
	<button class={buttonClass} disabled={isDisabled} {onclick} {...restProps} aria-busy={loading}>
		{#if loading}
			<svg
				class="mr-2 -ml-1 h-4 w-4 animate-spin"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
				></circle>
				<path
					class="opacity-75"
					fill="currentColor"
					d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
				></path>
			</svg>
		{/if}
		{@render children?.()}
	</button>
{/if}

<style>
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.animate-spin {
		animation: spin 1s linear infinite;
	}
</style>
