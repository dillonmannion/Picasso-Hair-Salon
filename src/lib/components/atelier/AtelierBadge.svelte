<script lang="ts">
	import { cn } from '$lib/utils';

	type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';
	type BadgeSize = 'sm' | 'md';
	type BadgeShape = 'pill' | 'square';

	interface BadgeProps {
		variant?: BadgeVariant;
		size?: BadgeSize;
		shape?: BadgeShape;
		closable?: boolean;
		onclose?: () => void;
		class?: string;
		children?: () => any;
	}

	let {
		variant = 'default',
		size = 'md',
		shape = 'pill',
		closable = false,
		onclose,
		class: className,
		children = () => {}
	}: BadgeProps = $props();

	const baseStyles =
		'atelier-badge inline-flex items-center font-medium transition-all duration-200';

	const variantStyles: Record<BadgeVariant, string> = {
		default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
		success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
		warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
		error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
		info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
	};

	const sizeStyles: Record<BadgeSize, string> = {
		sm: 'px-2 py-0.5 text-xs gap-1',
		md: 'px-2.5 py-1 text-sm gap-1.5'
	};

	const shapeStyles: Record<BadgeShape, string> = {
		pill: 'rounded-full',
		square: 'rounded-md'
	};

	const badgeClass = $derived(
		cn(baseStyles, variantStyles[variant], sizeStyles[size], shapeStyles[shape], className)
	);

	const closeButtonClass = $derived(
		cn(
			'ml-0.5 hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-1 rounded-full',
			size === 'sm' ? 'p-0.5' : 'p-1',
			variant === 'default' && 'focus:ring-gray-500',
			variant === 'success' && 'focus:ring-green-500',
			variant === 'warning' && 'focus:ring-yellow-500',
			variant === 'error' && 'focus:ring-red-500',
			variant === 'info' && 'focus:ring-blue-500'
		)
	);
</script>

<span class={badgeClass} role="status">
	{@render children()}
	{#if closable}
		<button type="button" onclick={onclose} class={closeButtonClass} aria-label="Remove badge">
			<svg
				class={size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3'}
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="3"
					d="M6 18L18 6M6 6l12 12"
				/>
			</svg>
		</button>
	{/if}
</span>

<style>
	.atelier-badge {
		/* Ensure badge doesn't grow beyond content */
		max-width: max-content;
	}

	.atelier-badge button {
		/* Smooth transitions for close button */
		transition: opacity 0.15s ease-in-out;
	}
</style>
