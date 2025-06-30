<script lang="ts">
	import { onDestroy } from 'svelte';
	import { fly, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { cn } from '$lib/utils';
	import AtelierButton from '../AtelierButton.svelte';
	import { X, Menu } from 'lucide-svelte';

	interface SidebarProps {
		open?: boolean;
		position?: 'left' | 'right';
		variant?: 'overlay' | 'push';
		onclose?: () => void;
		title?: string;
		showCloseButton?: boolean;
		closeOnOutsideClick?: boolean;
		closeOnEscape?: boolean;
		width?: string;
		class?: string;
		children?: () => any;
		footer?: () => any;
		trigger?: () => any;
	}

	let {
		open = $bindable(false),
		position = 'left',
		variant = 'overlay',
		onclose,
		title,
		showCloseButton = true,
		closeOnOutsideClick = true,
		closeOnEscape = true,
		width = '20rem',
		class: className,
		children = () => {},
		footer = () => {},
		trigger
	}: SidebarProps = $props();

	let sidebarElement: HTMLElement;
	let previousActiveElement: HTMLElement | null = null;

	// Handle keyboard events
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && closeOnEscape && open) {
			event.preventDefault();
			closeSidebar();
		}
	}

	// Handle outside clicks
	function handleBackdropClick() {
		if (closeOnOutsideClick) {
			closeSidebar();
		}
	}

	function closeSidebar() {
		open = false;
		onclose?.();
		// Restore focus to previous element
		if (previousActiveElement) {
			previousActiveElement.focus();
		}
	}

	function openSidebar() {
		previousActiveElement = document.activeElement as HTMLElement;
		open = true;
	}

	// Focus management
	$effect(() => {
		if (open && sidebarElement) {
			// Focus first focusable element or sidebar itself
			const focusable = sidebarElement.querySelector<HTMLElement>(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			);
			if (focusable) {
				focusable.focus();
			} else {
				sidebarElement.focus();
			}
		}
	});

	// Lock body scroll when overlay variant is used
	$effect(() => {
		if (variant === 'overlay' && open) {
			document.body.style.overflow = 'hidden';
			return () => {
				document.body.style.overflow = '';
			};
		}
	});

	// Global keydown listener
	$effect(() => {
		if (open) {
			window.addEventListener('keydown', handleKeydown);
			return () => {
				window.removeEventListener('keydown', handleKeydown);
			};
		}
	});

	const sidebarClasses = $derived(
		cn(
			'atelier-sidebar',
			'fixed top-0 h-full bg-atelier-cream dark:bg-atelier-dark-card',
			'shadow-atelier-xl dark:shadow-atelier-dark',
			'z-[100] flex flex-col',
			'border-atelier-gold/20 dark:border-atelier-gold/10',
			position === 'left' ? 'left-0 border-r' : 'right-0 border-l',
			className
		)
	);

	const backdropClasses = cn(
		'atelier-sidebar-backdrop',
		'fixed inset-0 z-[99]',
		variant === 'overlay' && 'bg-black/40 backdrop-blur-sm'
	);

	const flyOptions = {
		x: position === 'left' ? -320 : 320,
		duration: 300,
		easing: cubicOut
	};
</script>

{#if trigger}
	{@render trigger({ onclick: openSidebar })}
{:else}
	<AtelierButton
		variant="outline"
		size="icon"
		onclick={openSidebar}
		class="atelier-sidebar-trigger"
		aria-label="Open sidebar"
	>
		<Menu class="h-5 w-5" />
	</AtelierButton>
{/if}

{#if open}
	<!-- Backdrop -->
	<div
		class={backdropClasses}
		onclick={handleBackdropClick}
		role="presentation"
		transition:fade={{ duration: 200 }}
	/>

	<!-- Sidebar -->
	<aside
		bind:this={sidebarElement}
		class={sidebarClasses}
		style:width
		role="dialog"
		aria-modal="true"
		aria-label={title || 'Sidebar'}
		tabindex="-1"
		transition:fly={flyOptions}
	>
		<!-- Header -->
		{#if title || showCloseButton}
			<div
				class="atelier-sidebar-header border-atelier-gold/20 dark:border-atelier-gold/10 flex items-center justify-between border-b px-6 py-4"
			>
				{#if title}
					<h2 class="font-display text-atelier-dark dark:text-atelier-cream text-lg font-medium">
						{title}
					</h2>
				{/if}
				{#if showCloseButton}
					<AtelierButton
						variant="ghost"
						size="icon"
						onclick={closeSidebar}
						class="-mr-2 ml-auto"
						aria-label="Close sidebar"
					>
						<X class="h-4 w-4" />
					</AtelierButton>
				{/if}
			</div>
		{/if}

		<!-- Content -->
		<div class="atelier-sidebar-content flex-1 overflow-y-auto px-6 py-6">
			{@render children()}
		</div>

		<!-- Footer -->
		{#if footer}
			<div
				class="atelier-sidebar-footer border-atelier-gold/20 dark:border-atelier-gold/10 border-t px-6 py-4"
			>
				{@render footer()}
			</div>
		{/if}
	</aside>
{/if}

<style>
	:global(.atelier-sidebar) {
		/* Ensure smooth transitions */
		will-change: transform;
	}

	:global(.atelier-sidebar-content) {
		/* Custom scrollbar styling */
		scrollbar-width: thin;
		scrollbar-color: var(--color-gold-500) transparent;
	}

	:global(.atelier-sidebar-content::-webkit-scrollbar) {
		width: 6px;
	}

	:global(.atelier-sidebar-content::-webkit-scrollbar-track) {
		background: transparent;
	}

	:global(.atelier-sidebar-content::-webkit-scrollbar-thumb) {
		background-color: var(--color-gold-500);
		border-radius: 3px;
		opacity: 0.5;
	}

	:global(.atelier-sidebar-content::-webkit-scrollbar-thumb:hover) {
		opacity: 0.7;
	}

	/* Push variant animations */
	:global(body.atelier-sidebar-push-left) {
		transform: translateX(var(--sidebar-width, 20rem));
		transition: transform 300ms cubic-bezier(0.23, 1, 0.32, 1);
	}

	:global(body.atelier-sidebar-push-right) {
		transform: translateX(calc(-1 * var(--sidebar-width, 20rem)));
		transition: transform 300ms cubic-bezier(0.23, 1, 0.32, 1);
	}
</style>
