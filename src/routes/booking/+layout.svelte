<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import ProgressIndicator from '$lib/components/custom/ProgressIndicator.svelte';
	import type { LayoutData } from './$types';

	export let data: LayoutData;

	// Booking state from URL params
	$: bookingState = {
		serviceId: $page.url.searchParams.get('service'),
		stylistId: $page.url.searchParams.get('stylist'),
		date: $page.url.searchParams.get('date'),
		time: $page.url.searchParams.get('time')
	};

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
	$: {
		const currentPath = $page.url.pathname;
		if (
			currentPath.startsWith('/booking/') &&
			currentPath !== '/booking' &&
			!canAccessStep(currentPath)
		) {
			// Redirect to the appropriate step
			if (!bookingState.serviceId) {
				goto('/booking/service');
			} else if (!bookingState.stylistId) {
				goto(`/booking/stylist?service=${bookingState.serviceId}`);
			} else if (!bookingState.date || !bookingState.time) {
				goto(
					`/booking/schedule?service=${bookingState.serviceId}&stylist=${bookingState.stylistId}`
				);
			}
		}
	}
</script>

<div class="min-h-screen bg-gray-50">
	<div class="mx-auto max-w-4xl px-4 py-8">
		<!-- Header -->
		<div class="mb-8 text-center">
			<h1 class="text-3xl font-bold text-gray-900">Book Your Appointment</h1>
			<p class="mt-2 text-gray-600">Follow the steps below to schedule your visit</p>
		</div>

		<!-- Progress Indicator -->
		<ProgressIndicator />

		<!-- Content -->
		<div class="mt-8 rounded-lg bg-white p-6 shadow-md">
			<slot />
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
