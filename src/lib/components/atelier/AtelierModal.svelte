<script lang="ts">
	import { onDestroy } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import { cn } from '$lib/utils';
	import { atelierModal } from '$lib/stores/atelierModal';

	interface ModalProps {
		open?: boolean;
		onclose?: () => void;
		title?: string;
		description?: string;
		showCloseButton?: boolean;
		closeOnOutsideClick?: boolean;
		closeOnEscape?: boolean;
		class?: string;
		children?: () => any;
		actions?: () => any;
	}

	let {
		open = $bindable(false),
		onclose,
		title,
		description,
		showCloseButton = true,
		closeOnOutsideClick = true,
		closeOnEscape = true,
		class: className,
		children = () => {},
		actions = () => {}
	}: ModalProps = $props();

	let modalElement = $state<HTMLDivElement>();
	let previousActiveElement: HTMLElement | null = null;
	let storeState = $state({ isOpen: false });

	// Sync with store
	atelierModal.subscribe((state) => {
		storeState = state;
	});

	const isOpen = $derived(open !== undefined ? open : storeState.isOpen);

	function handleClose() {
		open = false;
		onclose?.();
		atelierModal.close();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (closeOnEscape && event.key === 'Escape') {
			handleClose();
		}

		// Focus trap
		if (event.key === 'Tab' && modalElement) {
			const focusableElements = modalElement.querySelectorAll<HTMLElement>(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			);
			const firstElement = focusableElements[0];
			const lastElement = focusableElements.at(-1);

			if (event.shiftKey && document.activeElement === firstElement) {
				event.preventDefault();
				lastElement?.focus();
			} else if (!event.shiftKey && document.activeElement === lastElement) {
				event.preventDefault();
				firstElement?.focus();
			}
		}
	}

	function handleOutsideClick(event: MouseEvent) {
		if (closeOnOutsideClick && event.target === event.currentTarget) {
			handleClose();
		}
	}

	// Focus management
	$effect(() => {
		if (isOpen) {
			previousActiveElement = document.activeElement as HTMLElement;
			// Focus first focusable element in modal
			setTimeout(() => {
				const firstFocusable = modalElement?.querySelector<HTMLElement>(
					'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
				);
				firstFocusable?.focus();
			}, 100);

			// Prevent body scroll
			document.body.style.overflow = 'hidden';
		} else {
			// Restore body scroll
			document.body.style.overflow = '';
			// Restore focus
			previousActiveElement?.focus();
		}
	});

	onDestroy(() => {
		document.body.style.overflow = '';
	});

	const backdropClass = 'fixed inset-0 bg-black/50 z-50';
	const modalClass = cn(
		'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
		'w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-xl',
		'max-h-[90vh] overflow-y-auto',
		className
	);
</script>

{#if isOpen}
	<div
		class={backdropClass}
		transition:fade={{ duration: 200 }}
		onclick={handleOutsideClick}
		onkeydown={handleKeydown}
		role="dialog"
		aria-modal="true"
		aria-labelledby={title ? 'modal-title' : undefined}
		aria-describedby={description ? 'modal-description' : undefined}
	>
		<div
			bind:this={modalElement}
			class={modalClass}
			transition:scale={{ duration: 200, start: 0.95 }}
			onclick={(e) => e.stopPropagation()}
		>
			{#if title || showCloseButton}
				<div
					class="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700"
				>
					{#if title}
						<h2 id="modal-title" class="text-xl font-semibold text-gray-900 dark:text-white">
							{title}
						</h2>
					{/if}
					{#if showCloseButton}
						<button
							onclick={handleClose}
							class="ml-auto rounded-lg p-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
							aria-label="Close modal"
						>
							<svg
								class="h-5 w-5 text-gray-500 dark:text-gray-400"
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
			{/if}

			<div class="p-6">
				{#if description}
					<p id="modal-description" class="mb-4 text-gray-600 dark:text-gray-400">
						{description}
					</p>
				{/if}
				{@render children()}
			</div>

			{#if actions}
				<div
					class="flex items-center justify-end gap-3 border-t border-gray-200 p-6 dark:border-gray-700"
				>
					{@render actions()}
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	/* Ensure smooth animations */
	:global(.modal-enter) {
		animation: modalEnter 0.2s ease-out;
	}

	:global(.modal-leave) {
		animation: modalLeave 0.2s ease-in;
	}

	@keyframes modalEnter {
		from {
			opacity: 0;
			transform: translate(-50%, -48%) scale(0.95);
		}
		to {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1);
		}
	}

	@keyframes modalLeave {
		from {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1);
		}
		to {
			opacity: 0;
			transform: translate(-50%, -48%) scale(0.95);
		}
	}
</style>
