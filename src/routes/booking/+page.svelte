<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		// Redirect to the first step
		goto('/booking/service');
	});
</script>

<div class="flex items-center justify-center p-8">
	<p class="text-gray-600">Redirecting to booking wizard...</p>
</div>
