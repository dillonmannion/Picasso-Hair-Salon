<!--
  This file demonstrates proper usage patterns for LoadingStates and ErrorBoundary components
  in various Svelte 5 + SvelteKit scenarios. Use these patterns as reference.
-->

<script lang="ts">
	import { onMount } from 'svelte';
	import LoadingStates from '$lib/components/custom/LoadingStates.svelte';
	import ErrorBoundary from '$lib/components/custom/ErrorBoundary.svelte';

	// Example 1: Simple loading state for client-side data fetching
	let isLoading = $state(false);
	let error = $state<Error | null>(null);
	let data = $state<any[]>([]);

	async function fetchData() {
		isLoading = true;
		error = null;

		try {
			const response = await fetch('/api/some-data');
			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}
			data = await response.json();
		} catch (err) {
			error = err instanceof Error ? err : new Error('Unknown error occurred');
		} finally {
			isLoading = false;
		}
	}

	// Example 2: Promise-based loading with SvelteKit's await blocks
	let dataPromise = $state<Promise<any> | null>(null);

	function refreshData() {
		dataPromise = fetch('/api/refresh-data').then((r) => r.json());
	}

	onMount(() => {
		fetchData();
	});
</script>

<div class="space-y-8 p-6">
	<h1 class="text-2xl font-bold">Loading States & Error Boundary Examples</h1>

	<!-- Example 1: Basic loading/error pattern -->
	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Pattern 1: Basic Loading States</h2>

		{#if error}
			<ErrorBoundary {error} retry={fetchData} title="Failed to load data" />
		{:else if isLoading}
			<LoadingStates type="card" count={3} />
		{:else}
			<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
				{#each data as item (item.id)}
					<div class="rounded-lg border p-4">
						<h3 class="font-medium">{item.title}</h3>
						<p class="text-sm text-gray-600">{item.description}</p>
					</div>
				{/each}
			</div>
		{/if}
	</section>

	<!-- Example 2: Promise-based with SvelteKit await blocks -->
	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Pattern 2: Promise-based Loading</h2>

		<button onclick={refreshData} class="bg-primary text-primary-foreground rounded-md px-4 py-2">
			Refresh Data
		</button>

		{#if dataPromise}
			{#await dataPromise}
				<LoadingStates type="list" count={5} />
			{:then result}
				<div class="space-y-2">
					{#each result as item (item.id)}
						<div class="flex items-center space-x-4 rounded border p-3">
							<div class="h-8 w-8 rounded-full bg-gray-200"></div>
							<div>
								<h3 class="font-medium">{item.name}</h3>
								<p class="text-sm text-gray-600">{item.status}</p>
							</div>
						</div>
					{/each}
				</div>
			{:catch promiseError}
				<ErrorBoundary error={promiseError} retry={refreshData} title="Data refresh failed" />
			{/await}
		{/if}
	</section>

	<!-- Example 3: Gallery loading pattern -->
	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Pattern 3: Gallery Loading</h2>

		<LoadingStates type="gallery" count={8} />

		<p class="text-sm text-gray-600">
			This shows how gallery loading states would look while images are being fetched.
		</p>
	</section>

	<!-- Example 4: Table loading pattern -->
	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Pattern 4: Table/Admin Loading</h2>

		<LoadingStates type="table" count={6} />

		<p class="text-sm text-gray-600">
			This pattern is useful for admin dashboards with tabular data.
		</p>
	</section>

	<!-- Example 5: Custom error handling -->
	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Pattern 5: Custom Error Handling</h2>

		<ErrorBoundary
			error={new Error('Network connection failed')}
			title="Connection Error"
			description="Unable to connect to the server. Please check your internet connection."
			showRetry={true}
			retry={() => window.location.reload()}
		/>
	</section>

	<!-- Example 6: Custom loading with slot -->
	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Pattern 6: Custom Loading Content</h2>

		<LoadingStates type="custom">
			<div class="flex items-center justify-center p-8">
				<div class="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
				<span class="ml-3 text-gray-600">Loading custom content...</span>
			</div>
		</LoadingStates>
	</section>
</div>

<!-- Custom styles removed to avoid empty CSS rules -->
