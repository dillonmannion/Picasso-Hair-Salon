<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import BookingSummary from '$lib/components/custom/BookingSummary.svelte';
	import type { PageData } from './$types';
	import { cn } from '$lib/utils/cn';

	export let data: PageData;

	const serviceId = $page.url.searchParams.get('service');
	const stylistId = $page.url.searchParams.get('stylist');

	let notes = '';
	let agreedToTerms = false;
	let isSubmitting = false;

	function goBack() {
		const params = new URLSearchParams({
			service: serviceId!,
			stylist: stylistId!,
			date: data.date,
			time: data.time
		});
		goto(`/booking/schedule?${params.toString()}`);
	}
</script>

<div class="space-y-6">
	<div>
		<h2 class="text-2xl font-semibold text-gray-900">Confirm Your Booking</h2>
		<p class="mt-1 text-gray-600">Review your appointment details before confirming</p>
	</div>

	<form
		method="POST"
		action="?/create"
		use:enhance={() => {
			isSubmitting = true;
			return async ({ result, update }) => {
				isSubmitting = false;
				if (result.type === 'redirect') {
					// Let SvelteKit handle the redirect
					update();
				} else if (result.type === 'failure') {
					// Handle error
					alert(result.data?.error || 'Failed to create appointment');
				}
			};
		}}
	>
		<input type="hidden" name="serviceId" value={data.service.id} />
		<input type="hidden" name="stylistId" value={stylistId} />
		<input type="hidden" name="date" value={data.date} />
		<input type="hidden" name="time" value={data.time} />
		<input type="hidden" name="isAnyStylist" value={data.isAnyStylist} />
		{#if data.isAnyStylist}
			<input
				type="hidden"
				name="availableStylists"
				value={JSON.stringify(data.availableStylists)}
			/>
		{/if}

		<div class="grid gap-6 lg:grid-cols-3">
			<!-- Left Column: Additional Information -->
			<div class="space-y-6 lg:col-span-2">
				<!-- Appointment Details Card -->
				<div class="rounded-lg border bg-white p-6">
					<h3 class="mb-4 text-lg font-semibold text-gray-900">Appointment Details</h3>

					<dl class="space-y-3">
						<div class="sm:grid sm:grid-cols-3 sm:gap-4">
							<dt class="text-sm font-medium text-gray-600">Service:</dt>
							<dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{data.service.name}</dd>
						</div>

						<div class="sm:grid sm:grid-cols-3 sm:gap-4">
							<dt class="text-sm font-medium text-gray-600">Stylist:</dt>
							<dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
								{data.isAnyStylist ? 'Will be assigned upon arrival' : data.stylist?.name}
							</dd>
						</div>

						<div class="sm:grid sm:grid-cols-3 sm:gap-4">
							<dt class="text-sm font-medium text-gray-600">Date:</dt>
							<dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
								{new Date(data.date + 'T00:00:00').toLocaleDateString('en-US', {
									weekday: 'long',
									year: 'numeric',
									month: 'long',
									day: 'numeric'
								})}
							</dd>
						</div>

						<div class="sm:grid sm:grid-cols-3 sm:gap-4">
							<dt class="text-sm font-medium text-gray-600">Time:</dt>
							<dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
								{(() => {
									const [hours, minutes] = data.time.split(':');
									const hour = Number.parseInt(hours || '0');
									const ampm = hour >= 12 ? 'PM' : 'AM';
									const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
									return `${displayHour}:${minutes} ${ampm}`;
								})()}
							</dd>
						</div>
					</dl>
				</div>

				<!-- Special Requests -->
				<div class="rounded-lg border bg-white p-6">
					<label for="notes" class="block text-lg font-semibold text-gray-900">
						Special Requests or Notes
					</label>
					<p class="mt-1 text-sm text-gray-600">
						Let us know if you have any special requests or important information
					</p>
					<textarea
						id="notes"
						name="notes"
						bind:value={notes}
						rows="4"
						class="focus:border-primary focus:ring-primary mt-3 block w-full rounded-lg border-gray-300 shadow-sm"
						placeholder="e.g., Allergies, specific styling preferences, parking questions..."
					></textarea>
				</div>

				<!-- Terms and Conditions -->
				<div class="rounded-lg border bg-yellow-50 p-6">
					<h3 class="mb-3 text-lg font-semibold text-gray-900">Cancellation Policy</h3>
					<ul class="space-y-2 text-sm text-gray-700">
						<li>• Appointments can be cancelled up to 24 hours in advance</li>
						<li>• Late cancellations may incur a fee</li>
						<li>• No-shows will be charged the full service amount</li>
						<li>• Please arrive 5 minutes early for your appointment</li>
					</ul>

					<label class="mt-4 flex items-start">
						<input
							type="checkbox"
							bind:checked={agreedToTerms}
							class="text-primary focus:ring-primary mt-1 h-4 w-4 rounded border-gray-300"
						/>
						<span class="ml-2 text-sm text-gray-700">
							I understand and agree to the cancellation policy
						</span>
					</label>
				</div>
			</div>

			<!-- Right Column: Summary -->
			<div class="lg:col-span-1">
				<div class="sticky top-6">
					<BookingSummary
						service={data.service}
						stylist={data.stylist}
						isAnyStylist={data.isAnyStylist}
						date={data.date}
						time={data.time}
					/>
				</div>
			</div>
		</div>

		<!-- Navigation Buttons -->
		<div class="mt-8 flex justify-between border-t pt-6">
			<button
				type="button"
				onclick={goBack}
				disabled={isSubmitting}
				class="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-50"
			>
				Back
			</button>

			<button
				type="submit"
				disabled={!agreedToTerms || isSubmitting}
				class={cn(
					'rounded-lg px-6 py-3 font-medium transition-all',
					agreedToTerms && !isSubmitting
						? 'bg-primary hover:bg-primary/90 text-white'
						: 'cursor-not-allowed bg-gray-200 text-gray-400'
				)}
			>
				{isSubmitting ? 'Creating Appointment...' : 'Confirm Booking'}
			</button>
		</div>
	</form>
</div>
