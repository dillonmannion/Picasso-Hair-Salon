<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { notifications } from '$lib/stores/atelierNotifications';
	import { cn } from '$lib/utils';
	import AtelierButton from '../AtelierButton.svelte';

	const typeStyles = {
		success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
		error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
		warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
		info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
	};

	const iconPaths = {
		success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
		error: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
		warning:
			'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
		info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
	};

	const iconColors = {
		success: 'text-green-600 dark:text-green-400',
		error: 'text-red-600 dark:text-red-400',
		warning: 'text-amber-600 dark:text-amber-400',
		info: 'text-blue-600 dark:text-blue-400'
	};
</script>

<div class="fixed top-4 right-4 z-50 max-w-md space-y-2">
	{#each $notifications as notification (notification.id)}
		<div
			animate:flip={{ duration: 300 }}
			in:fly={{ x: 300, duration: 300 }}
			out:fade={{ duration: 200 }}
			class={cn(
				'atelier-notification',
				'rounded-lg border p-4 shadow-lg backdrop-blur-sm',
				'bg-white/90 dark:bg-gray-900/90',
				typeStyles[notification.type]
			)}
			role="alert"
		>
			<div class="flex items-start gap-3">
				<svg
					class={cn('mt-0.5 h-5 w-5 flex-shrink-0', iconColors[notification.type])}
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d={iconPaths[notification.type]}
					/>
				</svg>

				<div class="min-w-0 flex-1">
					<h3 class="font-medium text-gray-900 dark:text-gray-100">
						{notification.title}
					</h3>
					{#if notification.message}
						<p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
							{notification.message}
						</p>
					{/if}
					{#if notification.actions && notification.actions.length > 0}
						<div class="mt-3 flex gap-2">
							{#each notification.actions as action (action.label)}
								<AtelierButton size="sm" variant="outline" onclick={action.action}>
									{action.label}
								</AtelierButton>
							{/each}
						</div>
					{/if}
				</div>

				<button
					onclick={() => notifications.remove(notification.id)}
					class="ml-2 flex-shrink-0 text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
					aria-label="Close notification"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>
		</div>
	{/each}
</div>

<style>
	@media (max-width: 640px) {
		.fixed {
			left: 1rem;
			right: 1rem;
			max-width: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.atelier-notification) {
			animation: none !important;
			transition: none !important;
		}
	}
</style>
