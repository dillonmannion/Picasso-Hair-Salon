<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	const appointmentId = $page.url.searchParams.get('id');
	const sessionId = $page.url.searchParams.get('session_id');

	// let appointment: any = null; // Unused variable
	let loading = true;

	onMount(() => {
		if (!appointmentId && !sessionId) {
			// If no appointment ID or session ID, redirect to booking start
			void goto('/booking');
			return;
		}

		// In a real app, you'd fetch the appointment details here
		// For now, we'll just show a success message
		loading = false;
	});

	function viewAppointments() {
		void goto('/appointments');
	}

	function bookAnother() {
		void goto('/booking/service');
	}

	function addToCalendar() {
		// TODO: Implement calendar integration
		alert('Calendar integration coming soon!');
	}
</script>

<div class="space-y-6">
	{#if loading}
		<div class="flex items-center justify-center p-8">
			<p class="text-gray-600">Loading appointment details...</p>
		</div>
	{:else}
		<!-- Success Icon -->
		<div class="flex justify-center">
			<div class="flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
				<svg class="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M5 13l4 4L19 7"
					/>
				</svg>
			</div>
		</div>

		<!-- Success Message -->
		<div class="text-center">
			<h2 class="text-3xl font-bold text-gray-900">
				{sessionId ? 'Payment Successful!' : 'Booking Confirmed!'}
			</h2>
			<p class="mt-2 text-lg text-gray-600">
				{sessionId
					? 'Your payment has been processed and your appointment is confirmed.'
					: 'Your appointment has been successfully scheduled.'}
			</p>
		</div>

		<!-- Appointment Details Card -->
		<div class="rounded-lg border bg-gray-50 p-6">
			<h3 class="mb-4 text-lg font-semibold text-gray-900">Appointment Details</h3>
			{#if appointmentId}
				<p class="text-sm text-gray-600">
					Appointment ID: <span class="font-medium text-gray-900">{appointmentId}</span>
				</p>
			{/if}
			{#if sessionId}
				<p class="text-sm text-gray-600">
					Payment Reference: <span class="font-medium text-gray-900">{sessionId}</span>
				</p>
			{/if}
			<p class="mt-2 text-sm text-gray-600">
				You will receive a confirmation email shortly with all the details.
			</p>
		</div>

		<!-- What's Next Section -->
		<div class="rounded-lg bg-blue-50 p-6">
			<h3 class="mb-3 text-lg font-semibold text-gray-900">What's Next?</h3>
			<ul class="space-y-2 text-sm text-gray-700">
				<li class="flex items-start">
					<svg class="mt-0.5 mr-2 h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
							clip-rule="evenodd"
						/>
					</svg>
					Check your email for confirmation details
				</li>
				<li class="flex items-start">
					<svg class="mt-0.5 mr-2 h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
							clip-rule="evenodd"
						/>
					</svg>
					Arrive 5 minutes early for your appointment
				</li>
				<li class="flex items-start">
					<svg class="mt-0.5 mr-2 h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
							clip-rule="evenodd"
						/>
					</svg>
					Need to change? You can reschedule up to 24 hours in advance
				</li>
			</ul>
		</div>

		<!-- Action Buttons -->
		<div class="flex flex-col gap-3 sm:flex-row sm:justify-center">
			<button
				type="button"
				onclick={viewAppointments}
				class="bg-primary hover:bg-primary/90 rounded-lg px-6 py-3 font-medium text-white transition-all"
			>
				View My Appointments
			</button>

			<button
				type="button"
				onclick={addToCalendar}
				class="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-all hover:bg-gray-50"
			>
				Add to Calendar
			</button>

			<button
				type="button"
				onclick={bookAnother}
				class="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-all hover:bg-gray-50"
			>
				Book Another Service
			</button>
		</div>
	{/if}
</div>
