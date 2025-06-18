<script lang="ts">
	import { Skeleton } from '$lib/components/ui/skeleton';
	import * as Card from '$lib/components/ui/card';

	interface Props {
		type?: 'card' | 'table' | 'list' | 'gallery' | 'custom';
		count?: number;
		className?: string;
		children?: import('svelte').Snippet;
	}

	let { type = 'card', count = 3, className = '', children }: Props = $props();
</script>

<div class={`loading-states ${className}`}>
	{#if type === 'card'}
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each Array(count), i (i)}
				<Card.Root>
					<Card.Header>
						<Skeleton class="h-6 w-3/4" />
						<Skeleton class="h-4 w-1/2" />
					</Card.Header>
					<Card.Content class="space-y-3">
						<Skeleton class="h-4 w-full" />
						<Skeleton class="h-4 w-5/6" />
						<Skeleton class="h-4 w-2/3" />
					</Card.Content>
					<Card.Footer>
						<Skeleton class="h-10 w-full" />
					</Card.Footer>
				</Card.Root>
			{/each}
		</div>
	{:else if type === 'table'}
		<div class="space-y-4">
			<!-- Table Header -->
			<div class="flex space-x-4">
				<Skeleton class="h-4 w-1/4" />
				<Skeleton class="h-4 w-1/4" />
				<Skeleton class="h-4 w-1/4" />
				<Skeleton class="h-4 w-1/4" />
			</div>
			<!-- Table Rows -->
			{#each Array(count), i (i)}
				<div class="flex space-x-4">
					<Skeleton class="h-4 w-1/4" />
					<Skeleton class="h-4 w-1/4" />
					<Skeleton class="h-4 w-1/4" />
					<Skeleton class="h-4 w-1/4" />
				</div>
			{/each}
		</div>
	{:else if type === 'list'}
		<div class="space-y-4">
			{#each Array(count), i (i)}
				<div class="flex items-center space-x-4">
					<Skeleton class="h-12 w-12 rounded-full" />
					<div class="flex-1 space-y-2">
						<Skeleton class="h-4 w-3/4" />
						<Skeleton class="h-3 w-1/2" />
					</div>
				</div>
			{/each}
		</div>
	{:else if type === 'gallery'}
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
			{#each Array(count), i (i)}
				<div class="space-y-2">
					<Skeleton class="aspect-square w-full rounded-lg" />
					<Skeleton class="h-4 w-3/4" />
					<Skeleton class="h-3 w-1/2" />
				</div>
			{/each}
		</div>
	{:else if type === 'custom'}
		<!-- Allow for custom skeleton content via children snippet -->
		{#if children}
			{@render children()}
		{:else}
			<div class="space-y-4">
				{#each Array(count), i (i)}
					<Skeleton class="h-4 w-full" />
				{/each}
			</div>
		{/if}
	{/if}
</div>

<style>
	.loading-states {
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}
</style>
