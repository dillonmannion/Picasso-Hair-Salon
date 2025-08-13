<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import ProgressIndicator from '$lib/components/custom/ProgressIndicator.svelte';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	// Booking state from URL params
	const bookingState = $derived({
		serviceId: $page.url.searchParams.get('service'),
		stylistId: $page.url.searchParams.get('stylist'),
		date: $page.url.searchParams.get('date'),
		time: $page.url.searchParams.get('time')
	});

	// Navigation validation
	function canAccessStep(stepPath: string): boolean {
		switch (stepPath) {
			case '/booking/service':
				return true;
			case '/booking/stylist':
				return !!bookingState.serviceId;
			case '/booking/schedule':
				return !!bookingState.serviceId && !!bookingState.stylistId;
			case '/booking/confirm':
				return (
					!!bookingState.serviceId &&
					!!bookingState.stylistId &&
					!!bookingState.date &&
					!!bookingState.time
				);
			case '/booking/success':
				// Only accessible after successful booking
				return false;
			default:
				return false;
		}
	}

	// Prevent invalid navigation
	$effect(() => {
		const currentPath = $page.url.pathname;
		if (
			currentPath.startsWith('/booking/') &&
			currentPath !== '/booking' &&
			!canAccessStep(currentPath)
		) {
			// Redirect to the appropriate step
			if (!bookingState.serviceId) {
				void goto('/booking/service');
			} else if (!bookingState.stylistId) {
				void goto(`/booking/stylist?service=${bookingState.serviceId}`);
			} else if (!bookingState.date || !bookingState.time) {
				void goto(
					`/booking/schedule?service=${bookingState.serviceId}&stylist=${bookingState.stylistId}`
				);
			}
		}
	});
</script>

<div class="from-luxe-cream-50 min-h-screen bg-gradient-to-b to-white">
	<div class="mx-auto max-w-4xl px-4 py-8">
		<!-- Header -->
		<div class="mb-8 text-center">
			<h1
				class="text-luxe-burgundy-700 font-['Cormorant_Garamond'] text-4xl font-light md:text-5xl"
			>
				Book Your Appointment
			</h1>
			<p class="text-luxe-black-600 mt-3 text-lg">
				Follow the steps below to schedule your luxurious experience
			</p>
		</div>

		<!-- Progress Indicator -->
		<ProgressIndicator />

		<!-- Content -->
		<div
			class="border-luxe-cream-400 bg-luxe-cream-50 mt-8 rounded-xl border p-8 shadow-[0_12px_24px_rgba(94,28,28,0.15)]"
		>
			{@render children()}
		</div>

		<!-- Debug info in development -->
		{#if import.meta.env.DEV}
			<div class="mt-4 rounded bg-gray-100 p-4 text-xs">
				<p class="font-semibold">Debug - Booking State:</p>
				<pre class="mt-1 text-gray-600">{JSON.stringify(bookingState, null, 2)}</pre>
			</div>
		{/if}
	</div>
</div>
