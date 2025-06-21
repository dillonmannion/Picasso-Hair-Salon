<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import CalendarPicker from '$lib/components/custom/CalendarPicker.svelte';
	import TimeSlotGrid from '$lib/components/custom/TimeSlotGrid.svelte';
	import BookingSummary from '$lib/components/custom/BookingSummary.svelte';
	import type { PageData } from './$types';
	import { cn } from '$lib/utils/cn';

	export let data: PageData;

	let selectedDate: string | null = $page.url.searchParams.get('date');
	let selectedTime: string | null = $page.url.searchParams.get('time');

	const serviceId = $page.url.searchParams.get('service');
	const stylistId = $page.url.searchParams.get('stylist');

	// Update URL when date changes
	$: if (selectedDate) {
		const url = new URL($page.url);
		url.searchParams.set('date', selectedDate);
		goto(url.toString(), { replaceState: true, noScroll: true });
	}

	// Update URL when time changes
	$: if (selectedTime) {
		const url = new URL($page.url);
		url.searchParams.set('time', selectedTime);
		goto(url.toString(), { replaceState: true, noScroll: true });
	}

	function goBack() {
		goto(`/booking/stylist?service=${serviceId}`);
	}

	function continueToNextStep() {
		if (!selectedDate || !selectedTime || !serviceId || !stylistId) return;

		const params = new URLSearchParams({
			service: serviceId,
			stylist: stylistId,
			date: selectedDate,
			time: selectedTime
		});

		goto(`/booking/confirm?${params.toString()}`);
	}

	// Generate disabled dates (Sundays and dates with no availability)
	const today = new Date();
	const disabledDates: string[] = [];

	// Add all Sundays in the next 30 days to disabled dates
	for (let i = 0; i < 30; i++) {
		const date = new Date(today);
		date.setDate(today.getDate() + i);
		if (date.getDay() === 0) {
			// Sunday
			disabledDates.push(date.toISOString().split('T')[0] || '');
		}
	}
</script>

<div class="grid gap-6 lg:grid-cols-3">
	<!-- Left Column: Calendar and Time Slots -->
	<div class="space-y-6 lg:col-span-2">
		<div>
			<h2 class="text-2xl font-semibold text-gray-900">Select Date & Time</h2>
			<p class="mt-1 text-gray-600">Choose your preferred appointment date and time</p>
		</div>

		<!-- Date Selection -->
		<div>
			<h3 class="mb-4 text-lg font-medium text-gray-900">Select a Date</h3>
			<CalendarPicker
				bind:selectedDate
				minDate={today}
				maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
				{disabledDates}
			/>
		</div>

		<!-- Time Selection -->
		{#if selectedDate}
			<div>
				<h3 class="mb-4 text-lg font-medium text-gray-900">Select a Time</h3>
				{#if data.timeSlots.length > 0}
					<TimeSlotGrid slots={data.timeSlots} bind:selectedTime columns={4} />
				{:else}
					<div class="rounded-lg bg-yellow-50 p-4">
						<p class="text-yellow-800">
							Loading available time slots for {new Date(
								selectedDate + 'T00:00:00'
							).toLocaleDateString()}...
						</p>
					</div>
				{/if}
			</div>
		{:else}
			<div class="rounded-lg bg-gray-50 p-6 text-center">
				<svg
					class="mx-auto h-12 w-12 text-gray-400"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
					/>
				</svg>
				<p class="mt-2 text-gray-600">Please select a date to view available time slots</p>
			</div>
		{/if}
	</div>

	<!-- Right Column: Booking Summary -->
	<div class="lg:col-span-1">
		<div class="sticky top-6">
			<BookingSummary
				service={data.service}
				stylist={data.stylist}
				isAnyStylist={data.isAnyStylist}
				date={selectedDate}
				time={selectedTime}
			/>
		</div>
	</div>
</div>

<!-- Navigation Buttons -->
<div class="mt-8 flex justify-between border-t pt-6">
	<button
		type="button"
		onclick={goBack}
		class="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-all hover:bg-gray-50"
	>
		Back
	</button>

	<button
		type="button"
		onclick={continueToNextStep}
		disabled={!selectedDate || !selectedTime}
		class={cn(
			'rounded-lg px-6 py-3 font-medium transition-all',
			selectedDate && selectedTime
				? 'bg-primary hover:bg-primary/90 text-white'
				: 'cursor-not-allowed bg-gray-200 text-gray-400'
		)}
	>
		Continue to Confirmation
	</button>
</div>
