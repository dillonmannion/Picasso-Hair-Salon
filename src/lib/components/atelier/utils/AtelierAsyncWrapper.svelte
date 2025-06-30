<script lang="ts">
	import { cn } from '$lib/utils';
	import AtelierLoader from '../feedback/AtelierLoader.svelte';
	
	interface AsyncWrapperProps {
		loading?: boolean;
		error?: Error | null;
		empty?: boolean;
		emptyMessage?: string;
		errorMessage?: string;
		loaderVariant?: 'spinner' | 'dots' | 'pulse' | 'shimmer';
		loaderSize?: 'sm' | 'md' | 'lg';
		class?: string;
		children?: any;
		minHeight?: string;
		retry?: () => void;
	}

	let {
		loading = false,
		error = null,
		empty = false,
		emptyMessage = 'No data available',
		errorMessage = 'Something went wrong',
		loaderVariant = 'spinner',
		loaderSize = 'md',
		class: className,
		children,
		minHeight = '200px',
		retry
	}: AsyncWrapperProps = $props();

	const containerClass = $derived(
		cn(
			'atelier-async-wrapper relative',
			loading && 'flex items-center justify-center',
			className
		)
	);
</script>

<div 
	class={containerClass}
	style={loading || error || empty ? `min-height: ${minHeight}` : undefined}
>
	{#if loading}
		<div class="flex flex-col items-center gap-4">
			<AtelierLoader variant={loaderVariant} size={loaderSize} />
			<p class="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
		</div>
	{:else if error}
		<div class="flex flex-col items-center justify-center gap-4 text-center p-8">
			<svg
				class="w-12 h-12 text-red-500 dark:text-red-400"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>
			<div>
				<h3 class="font-medium text-gray-900 dark:text-gray-100">
					{errorMessage}
				</h3>
				{#if error.message}
					<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
						{error.message}
					</p>
				{/if}
			</div>
			{#if retry}
				<button
					onclick={retry}
					class="px-4 py-2 text-sm font-medium text-white bg-atelier-primary hover:bg-atelier-primary/90 rounded-lg transition-colors"
				>
					Try Again
				</button>
			{/if}
		</div>
	{:else if empty}
		<div class="flex flex-col items-center justify-center gap-4 text-center p-8">
			<svg
				class="w-12 h-12 text-gray-400 dark:text-gray-600"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
				/>
			</svg>
			<p class="text-gray-500 dark:text-gray-400">
				{emptyMessage}
			</p>
		</div>
	{:else}
		{@render children?.()}
	{/if}
</div>