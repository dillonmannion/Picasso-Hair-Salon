<script lang="ts">
	import * as Alert from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import { AlertTriangle, RefreshCw } from 'lucide-svelte';

	interface Props {
		error?: Error | null;
		retry?: () => void;
		title?: string;
		description?: string;
		showRetry?: boolean;
		className?: string;
	}

	let {
		error = null,
		retry,
		title = 'Something went wrong',
		description,
		showRetry = true,
		className = ''
	}: Props = $props();

	// Default description based on error
	const errorDescription = $derived(
		description ||
			error?.message ||
			'An unexpected error occurred. Please try again or contact support if the problem persists.'
	);

	function handleRetry() {
		if (retry) {
			retry();
		} else {
			// Default retry behavior - reload the page
			window.location.reload();
		}
	}
</script>

<div class={`error-boundary ${className}`}>
	<Alert.Root variant="destructive">
		<AlertTriangle class="h-4 w-4" />
		<Alert.Title>{title}</Alert.Title>
		<Alert.Description class="mt-2">
			<p class="mb-4">{errorDescription}</p>

			{#if error && error.stack}
				<details class="mt-4">
					<summary class="cursor-pointer text-sm font-medium">Technical Details</summary>
					<pre class="bg-muted mt-2 overflow-auto rounded p-2 text-xs">
						{error.stack}
					</pre>
				</details>
			{/if}

			{#if showRetry}
				<div class="mt-4 flex gap-2">
					<Button onclick={handleRetry} variant="outline" size="sm">
						<RefreshCw class="mr-2 h-4 w-4" />
						Try Again
					</Button>

					<Button onclick={() => (window.location.href = '/')} variant="ghost" size="sm">
						Go Home
					</Button>
				</div>
			{/if}
		</Alert.Description>
	</Alert.Root>
</div>

<style>
	.error-boundary {
		margin: 1rem 0;
	}

	pre {
		font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
		font-size: 0.75rem;
		line-height: 1.4;
		max-height: 200px;
		overflow-y: auto;
	}
</style>
