<script lang="ts">
	import AtelierSkeleton from '../feedback/AtelierSkeleton.svelte';
	import { cn } from '$lib/utils';

	interface LoadingStatesProps {
		type?: 'card' | 'list' | 'table' | 'form' | 'profile';
		count?: number;
		class?: string;
	}

	let { type = 'card', count = 1, class: className }: LoadingStatesProps = $props();
</script>

<div class={cn('atelier-loading-states', className)}>
	{#if type === 'card'}
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each Array(count) as _, i (i)}
				<div class="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
					<AtelierSkeleton variant="rectangular" height="160px" />
					<div class="mt-4 space-y-2">
						<AtelierSkeleton variant="text" width="75%" />
						<AtelierSkeleton variant="text" width="100%" />
						<AtelierSkeleton variant="text" width="60%" />
					</div>
				</div>
			{/each}
		</div>
	{:else if type === 'list'}
		<div class="space-y-4">
			{#each Array(count) as _, i (i)}
				<div
					class="flex items-center gap-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700"
				>
					<AtelierSkeleton variant="circular" />
					<div class="flex-1 space-y-2">
						<AtelierSkeleton variant="text" width="40%" />
						<AtelierSkeleton variant="text" width="60%" />
					</div>
				</div>
			{/each}
		</div>
	{:else if type === 'table'}
		<div class="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
			<div class="bg-gray-50 p-4 dark:bg-gray-800">
				<AtelierSkeleton variant="text" width="200px" />
			</div>
			<div class="divide-y divide-gray-200 dark:divide-gray-700">
				{#each Array(count) as _, i (i)}
					<div class="flex items-center gap-4 p-4">
						<AtelierSkeleton variant="text" width="20%" />
						<AtelierSkeleton variant="text" width="30%" />
						<AtelierSkeleton variant="text" width="25%" />
						<AtelierSkeleton variant="text" width="15%" />
					</div>
				{/each}
			</div>
		</div>
	{:else if type === 'form'}
		<div class="space-y-6">
			{#each Array(count) as _, i (i)}
				<div class="space-y-2">
					<AtelierSkeleton variant="text" width="100px" height="12px" />
					<AtelierSkeleton variant="rectangular" height="40px" />
				</div>
			{/each}
			<AtelierSkeleton variant="rectangular" width="120px" height="40px" />
		</div>
	{:else if type === 'profile'}
		<div class="flex items-start gap-6">
			<AtelierSkeleton variant="circular" width="80px" height="80px" />
			<div class="flex-1 space-y-3">
				<AtelierSkeleton variant="text" width="200px" height="24px" />
				<AtelierSkeleton variant="text" width="300px" />
				<div class="mt-4 flex gap-4">
					<AtelierSkeleton variant="rectangular" width="100px" height="32px" />
					<AtelierSkeleton variant="rectangular" width="100px" height="32px" />
				</div>
			</div>
		</div>
	{/if}
</div>
