<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/utils.js';
	import { fade, scale } from 'svelte/transition';

	let {
		ref = $bindable(null),
		class: className,
		children,
		open = $bindable(false),
		onClose,
		size = 'default',
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		open?: boolean;
		onClose?: () => void;
		size?: 'sm' | 'default' | 'lg' | 'xl' | 'full';
	} = $props();

	const sizeClasses = {
		sm: 'max-w-md',
		default: 'max-w-lg',
		lg: 'max-w-2xl',
		xl: 'max-w-4xl',
		full: 'max-w-[90vw]'
	};

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget && onClose) {
			onClose();
		}
	}

	function handleEscape(e: KeyboardEvent) {
		if (e.key === 'Escape' && onClose) {
			onClose();
		}
	}
</script>

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4"
		onclick={handleBackdropClick}
		onkeydown={handleEscape}
		role="button"
		tabindex="-1"
		transition:fade={{ duration: 200 }}
	>
		<!-- Backdrop -->
		<div
			class="absolute inset-0 bg-black/50 backdrop-blur-sm"
			aria-hidden="true"
		/>
		
		<!-- Modal -->
		<div
			bind:this={ref}
			data-slot="luxe-modal"
			class={cn(
				'relative w-full rounded-xl bg-luxe-cream-50 p-6 shadow-[0_20px_40px_rgba(94,28,28,0.2)] border border-luxe-cream-300',
				'max-h-[85vh] overflow-y-auto',
				sizeClasses[size],
				className
			)}
			transition:scale={{ duration: 200, start: 0.95 }}
			{...restProps}
		>
			{@render children?.()}
		</div>
	</div>
{/if}