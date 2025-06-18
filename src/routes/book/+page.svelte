<script lang="ts">
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import * as Card from '$lib/components/ui/card';
	import * as Select from '$lib/components/ui/select';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import { Calendar } from '$lib/components/ui/calendar';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import { Input } from '$lib/components/ui/input';
	import { CalendarDays, Clock, User, CheckCircle } from 'lucide-svelte';
	import type { PageData } from './$types';
	import type { DateValue } from '@internationalized/date';
	import { DateFormatter, getLocalTimeZone, today } from '@internationalized/date';

	let { data, form }: { data: PageData; form: any } = $props();

	// Booking state
	let currentStep = $state(1);
	let selectedService = $state<string | null>($page.url.searchParams.get('service'));
	let selectedDate = $state<DateValue | undefined>(undefined);
	let selectedTime = $state<string | null>(null);
	let selectedStylist = $state<string | null>(null);
	let notes = $state('');

	// Form validation
	let isStep1Valid = $derived(!!selectedService);
	let isStep2Valid = $derived(!!selectedDate && !!selectedTime);
	let isStep3Valid = $derived(!!selectedStylist);

	// Available time slots (in a real app, this would be dynamic based on date and stylist availability)
	const timeSlots = [
		'09:00',
		'09:30',
		'10:00',
		'10:30',
		'11:00',
		'11:30',
		'12:00',
		'12:30',
		'13:00',
		'13:30',
		'14:00',
		'14:30',
		'15:00',
		'15:30',
		'16:00',
		'16:30',
		'17:00',
		'17:30'
	];

	// Get selected service details
	const selectedServiceDetails = $derived(() => {
		if (!selectedService) return null;
		return data.services.find((s) => s.id === selectedService);
	});

	// Get selected stylist details
	const selectedStylistDetails = $derived(() => {
		if (!selectedStylist) return null;
		return data.stylists.find((s) => s.id === selectedStylist);
	});

	// Format functions
	function formatPrice(price: string): string {
		const numPrice = parseFloat(price);
		return `$${numPrice.toFixed(2)}`;
	}

	function formatDuration(minutes: number): string {
		if (minutes < 60) {
			return `${minutes} min`;
		}
		const hours = Math.floor(minutes / 60);
		const remainingMinutes = minutes % 60;
		if (remainingMinutes === 0) {
			return `${hours}h`;
		}
		return `${hours}h ${remainingMinutes}m`;
	}

	function formatDate(date: DateValue): string {
		const df = new DateFormatter('en-US', {
			dateStyle: 'full'
		});
		return df.format(date.toDate(getLocalTimeZone()));
	}

	// Navigation functions
	function nextStep() {
		if (currentStep < 4) {
			currentStep++;
		}
	}

	function prevStep() {
		if (currentStep > 1) {
			currentStep--;
		}
	}

	// Step indicators
	const steps = [
		{ number: 1, title: 'Select Service', icon: CalendarDays },
		{ number: 2, title: 'Choose Date & Time', icon: Clock },
		{ number: 3, title: 'Select Stylist', icon: User },
		{ number: 4, title: 'Confirmation', icon: CheckCircle }
	];
</script>

<svelte:head>
	<title>Book Appointment - Picasso Hair Salon</title>
	<meta
		name="description"
		content="Book your appointment at Picasso Hair Salon. Choose your service, date, time, and preferred stylist."
	/>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8 text-center">
		<h1 class="mb-4 text-4xl font-bold text-gray-900">Book Your Appointment</h1>
		<p class="mx-auto max-w-2xl text-lg text-gray-600">
			Schedule your visit with our professional stylists in just a few simple steps.
		</p>
	</div>

	<!-- Progress Indicator -->
	<div class="mb-8">
		<div class="flex items-center justify-center space-x-4">
			{#each steps as step, index}
				<div class="flex items-center">
					<div class="flex flex-col items-center">
						<div
							class="flex h-10 w-10 items-center justify-center rounded-full {currentStep >=
							step.number
								? 'bg-primary text-primary-foreground'
								: 'bg-gray-200 text-gray-500'}"
						>
							{#if currentStep > step.number}
								<CheckCircle class="h-5 w-5" />
							{:else}
								{@const IconComponent = step.icon}
								<IconComponent class="h-5 w-5" />
							{/if}
						</div>
						<span
							class="mt-2 text-xs font-medium {currentStep >= step.number
								? 'text-primary'
								: 'text-gray-500'}">{step.title}</span
						>
					</div>
					{#if index < steps.length - 1}
						<Separator
							class="mx-4 h-px w-16 {currentStep > step.number ? 'bg-primary' : 'bg-gray-200'}"
						/>
					{/if}
				</div>
			{/each}
		</div>
	</div>

	{#if form?.error}
		<div class="mb-6 rounded-lg bg-red-50 p-4 text-red-800">
			{form.error}
		</div>
	{/if}

	<!-- Step Content -->
	<div class="mx-auto max-w-2xl">
		{#if currentStep === 1}
			<!-- Step 1: Service Selection -->
			<Card.Root>
				<Card.Header>
					<Card.Title>Select a Service</Card.Title>
					<Card.Description>Choose the service you'd like to book.</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-4">
					{#each data.services as service (service.id)}
						<div
							class="cursor-pointer rounded-lg border p-4 transition-colors hover:bg-gray-50 {selectedService ===
							service.id
								? 'border-primary bg-primary/5'
								: 'border-gray-200'}"
							role="button"
							tabindex="0"
							onclick={() => (selectedService = service.id)}
							onkeydown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									selectedService = service.id;
								}
							}}
							aria-label="Select {service.name} service"
						>
							<div class="flex items-start justify-between">
								<div class="flex-1">
									<div class="mb-1 flex items-center gap-2">
										<h3 class="font-semibold">{service.name}</h3>
										<Badge variant="secondary">{service.category}</Badge>
									</div>
									{#if service.description}
										<p class="mb-2 text-sm text-gray-600">{service.description}</p>
									{/if}
									<div class="flex items-center gap-4 text-sm">
										<span class="text-primary font-semibold">{formatPrice(service.price)}</span>
										<span class="text-gray-500">{formatDuration(service.duration)}</span>
									</div>
								</div>
								<div class="ml-4">
									<RadioGroup.Item value={service.id} />
								</div>
							</div>
						</div>
					{/each}
				</Card.Content>
				<Card.Footer>
					<Button onclick={nextStep} disabled={!isStep1Valid} class="w-full">
						Continue to Date & Time
					</Button>
				</Card.Footer>
			</Card.Root>
		{:else if currentStep === 2}
			<!-- Step 2: Date & Time Selection -->
			<Card.Root>
				<Card.Header>
					<Card.Title>Choose Date & Time</Card.Title>
					<Card.Description>Select your preferred appointment date and time.</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-6">
					<!-- Date Selection -->
					<div>
						<Label class="text-base font-medium">Select Date</Label>
						<div class="mt-2 flex justify-center">
							<Calendar
								bind:value={selectedDate}
								minValue={today(getLocalTimeZone())}
								class="rounded-md border"
								type="single"
							/>
						</div>
					</div>

					<!-- Time Selection -->
					{#if selectedDate}
						<div>
							<Label class="text-base font-medium">Select Time</Label>
							<div class="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
								{#each timeSlots as time}
									<Button
										variant={selectedTime === time ? 'default' : 'outline'}
										size="sm"
										onclick={() => (selectedTime = time)}
									>
										{time}
									</Button>
								{/each}
							</div>
						</div>
					{/if}
				</Card.Content>
				<Card.Footer class="flex gap-2">
					<Button variant="outline" onclick={prevStep} class="flex-1">Back</Button>
					<Button onclick={nextStep} disabled={!isStep2Valid} class="flex-1">
						Continue to Stylist
					</Button>
				</Card.Footer>
			</Card.Root>
		{:else if currentStep === 3}
			<!-- Step 3: Stylist Selection -->
			<Card.Root>
				<Card.Header>
					<Card.Title>Select Stylist</Card.Title>
					<Card.Description>Choose your preferred stylist for this appointment.</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-4">
					{#each data.stylists as stylist (stylist.id)}
						<div
							class="cursor-pointer rounded-lg border p-4 transition-colors hover:bg-gray-50 {selectedStylist ===
							stylist.id
								? 'border-primary bg-primary/5'
								: 'border-gray-200'}"
							role="button"
							tabindex="0"
							onclick={() => (selectedStylist = stylist.id)}
							onkeydown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									selectedStylist = stylist.id;
								}
							}}
							aria-label="Select {stylist.name} as stylist"
						>
							<div class="flex items-start justify-between">
								<div class="flex-1">
									<div class="mb-1 flex items-center gap-2">
										<h3 class="font-semibold">{stylist.name}</h3>
									</div>
									{#if stylist.bio}
										<p class="mb-2 text-sm text-gray-600">{stylist.bio}</p>
									{/if}
									{#if stylist.specialties && stylist.specialties.length > 0}
										<div class="flex flex-wrap gap-1">
											{#each stylist.specialties as specialty}
												<Badge variant="outline" class="text-xs">{specialty}</Badge>
											{/each}
										</div>
									{/if}
								</div>
								<div class="ml-4">
									<RadioGroup.Item value={stylist.id} />
								</div>
							</div>
						</div>
					{/each}

					<!-- Optional Notes -->
					<div class="mt-6">
						<Label for="notes" class="text-base font-medium">Additional Notes (Optional)</Label>
						<Input
							id="notes"
							bind:value={notes}
							placeholder="Any special requests or notes for your stylist..."
							class="mt-2"
						/>
					</div>
				</Card.Content>
				<Card.Footer class="flex gap-2">
					<Button variant="outline" onclick={prevStep} class="flex-1">Back</Button>
					<Button onclick={nextStep} disabled={!isStep3Valid} class="flex-1">Review Booking</Button>
				</Card.Footer>
			</Card.Root>
		{:else if currentStep === 4}
			<!-- Step 4: Confirmation -->
			<Card.Root>
				<Card.Header>
					<Card.Title>Confirm Your Booking</Card.Title>
					<Card.Description
						>Please review your appointment details before confirming.</Card.Description
					>
				</Card.Header>
				<Card.Content class="space-y-6">
					<!-- Booking Summary -->
					{#if selectedServiceDetails && selectedStylistDetails && selectedDate && selectedTime}
						<div class="space-y-4">
							<div class="rounded-lg bg-gray-50 p-4">
								<h3 class="mb-3 font-semibold">Appointment Summary</h3>

								<div class="space-y-3">
									<div class="flex justify-between">
										<span class="text-gray-600">Service:</span>
										<span class="font-medium">{selectedServiceDetails()?.name || ''}</span>
									</div>

									<div class="flex justify-between">
										<span class="text-gray-600">Date:</span>
										<span class="font-medium">{formatDate(selectedDate)}</span>
									</div>

									<div class="flex justify-between">
										<span class="text-gray-600">Time:</span>
										<span class="font-medium">{selectedTime}</span>
									</div>

									<div class="flex justify-between">
										<span class="text-gray-600">Stylist:</span>
										<span class="font-medium">{selectedStylistDetails()?.name || ''}</span>
									</div>

									<div class="flex justify-between">
										<span class="text-gray-600">Duration:</span>
										<span class="font-medium"
											>{formatDuration(selectedServiceDetails()?.duration || '')}</span
										>
									</div>

									{#if notes}
										<div class="flex justify-between">
											<span class="text-gray-600">Notes:</span>
											<span class="font-medium">{notes}</span>
										</div>
									{/if}

									<Separator />

									<div class="flex justify-between">
										<span class="font-semibold">Total:</span>
										<span class="text-primary text-xl font-bold"
											>{formatPrice(selectedServiceDetails()?.price || '0')}</span
										>
									</div>
								</div>
							</div>
						</div>
					{/if}
				</Card.Content>
				<Card.Footer class="flex gap-2">
					<Button variant="outline" onclick={prevStep} class="flex-1">Back</Button>
					<form method="POST" action="?/book" use:enhance class="flex-1">
						<input type="hidden" name="serviceId" value={selectedService} />
						<input type="hidden" name="stylistId" value={selectedStylist} />
						<input type="hidden" name="appointmentDate" value={selectedDate?.toString()} />
						<input type="hidden" name="appointmentTime" value={selectedTime} />
						<input type="hidden" name="notes" value={notes} />
						<Button type="submit" class="w-full">Confirm Booking</Button>
					</form>
				</Card.Footer>
			</Card.Root>
		{/if}
	</div>
</div>
