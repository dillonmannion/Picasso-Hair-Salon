<script lang="ts">
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	if (browser) {
		// Redirect to the first step only in the browser
		goto('/booking/service').catch((err) => {
			console.error('Failed to redirect to booking service:', err);
		});
	}
</script>

<div class="flex items-center justify-center p-8">
	<p class="text-gray-600">Redirecting to booking wizard...</p>
</div>
