<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import EmbeddedCheckout from '$lib/components/checkout/EmbeddedCheckout.svelte';

	$: appointmentId = $page.url.searchParams.get('appointment_id');

	function handleComplete() {
		// Redirect to success page after payment completion
		goto('/booking/success');
	}

	// Redirect if no appointment ID
	$: if (!appointmentId) {
		goto('/booking');
	}
</script>

<div class="container mx-auto max-w-4xl px-4 py-8">
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900">Complete Your Payment</h1>
		<p class="mt-2 text-gray-600">Please enter your payment details to confirm your appointment.</p>
	</div>

	{#if appointmentId}
		<div class="rounded-lg border bg-white p-6 shadow-sm">
			<EmbeddedCheckout {appointmentId} onComplete={handleComplete} />
		</div>

		<div class="mt-4 text-center">
			<a
				href="/booking/cancel?appointment_id={appointmentId}"
				class="text-sm text-gray-600 hover:text-gray-800"
			>
				Cancel booking
			</a>
		</div>
	{/if}
</div>
