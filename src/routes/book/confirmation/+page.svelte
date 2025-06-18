<script lang="ts">
	import { page } from '$app/stores';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { CheckCircle, Calendar, Clock, User, Mail } from 'lucide-svelte';

	const appointmentId = $derived($page.url.searchParams.get('id'));
</script>

<svelte:head>
	<title>Booking Confirmed - Picasso Hair Salon</title>
	<meta
		name="description"
		content="Your appointment has been successfully booked at Picasso Hair Salon."
	/>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="mx-auto max-w-2xl text-center">
		<!-- Success Icon -->
		<div class="mb-6 flex justify-center">
			<div class="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
				<CheckCircle class="h-10 w-10 text-green-600" />
			</div>
		</div>

		<!-- Success Message -->
		<h1 class="mb-4 text-3xl font-bold text-gray-900">Booking Confirmed!</h1>
		<p class="mb-8 text-lg text-gray-600">
			Your appointment has been successfully booked. We've sent a confirmation email with all the
			details.
		</p>

		<!-- Confirmation Details -->
		<Card.Root class="mb-8 text-left">
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<Mail class="h-5 w-5" />
					Appointment Details
				</Card.Title>
				<Card.Description>
					{#if appointmentId}
						Booking Reference: #{appointmentId}
					{/if}
				</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="space-y-4">
					<div class="rounded-lg bg-gray-50 p-4">
						<h3 class="mb-3 font-semibold text-gray-900">What's Next?</h3>
						<ul class="space-y-2 text-sm text-gray-600">
							<li class="flex items-start gap-2">
								<Mail class="mt-0.5 h-4 w-4 flex-shrink-0" />
								<span
									>You'll receive a confirmation email shortly with your appointment details</span
								>
							</li>
							<li class="flex items-start gap-2">
								<Calendar class="mt-0.5 h-4 w-4 flex-shrink-0" />
								<span>We'll send you a reminder 24 hours before your appointment</span>
							</li>
							<li class="flex items-start gap-2">
								<Clock class="mt-0.5 h-4 w-4 flex-shrink-0" />
								<span>Please arrive 10 minutes early for your appointment</span>
							</li>
							<li class="flex items-start gap-2">
								<User class="mt-0.5 h-4 w-4 flex-shrink-0" />
								<span>Need to change or cancel? Contact us at least 24 hours in advance</span>
							</li>
						</ul>
					</div>

					<div class="rounded-lg border border-blue-200 bg-blue-50 p-4">
						<h4 class="mb-2 font-semibold text-blue-900">Important Information</h4>
						<p class="text-sm text-blue-800">
							If you need to cancel or reschedule your appointment, please contact us at least 24
							hours in advance to avoid any cancellation fees.
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Action Buttons -->
		<div class="flex flex-col gap-4 sm:flex-row sm:justify-center">
			<Button href="/" variant="outline" class="sm:w-auto">Back to Home</Button>
			<Button href="/services" class="sm:w-auto">View More Services</Button>
		</div>

		<!-- Contact Information -->
		<div class="mt-8 text-center">
			<p class="text-sm text-gray-500">
				Questions? Contact us at <a href="tel:+1234567890" class="text-primary hover:underline"
					>(123) 456-7890</a
				>
				or
				<a href="mailto:info@picassosalon.com" class="text-primary hover:underline"
					>info@picassosalon.com</a
				>
			</p>
		</div>
	</div>
</div>
