<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Track loading states for each appointment
	let loadingStates = $state<Record<string, { cancel: boolean; reschedule: boolean }>>({});

	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleDateString('en-US', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function formatTime(timeStr: string) {
		// Convert 24-hour time to 12-hour format with AM/PM
		const [hours, minutes] = timeStr.split(':');
		const hour = parseInt(hours);
		const ampm = hour >= 12 ? 'PM' : 'AM';
		const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
		return `${displayHour}:${minutes} ${ampm}`;
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'confirmed':
				return 'text-green-600 bg-green-50 border-green-200';
			case 'pending':
				return 'text-yellow-600 bg-yellow-50 border-yellow-200';
			case 'cancelled':
				return 'text-red-600 bg-red-50 border-red-200';
			case 'completed':
				return 'text-blue-600 bg-blue-50 border-blue-200';
			default:
				return 'text-gray-600 bg-gray-50 border-gray-200';
		}
	}

	function canCancelAppointment(appointment: typeof data.appointments[0]): boolean {
		if (appointment.status === 'cancelled' || appointment.status === 'completed') {
			return false;
		}
		// Check 24-hour rule
		const appointmentDateTime = new Date(
			`${appointment.appointment_date}T${appointment.appointment_time}`
		);
		const now = new Date();
		const hoursUntilAppointment =
			(appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
		return hoursUntilAppointment >= 24;
	}

	function setLoading(appointmentId: string, action: 'cancel' | 'reschedule', value: boolean) {
		if (!loadingStates[appointmentId]) {
			loadingStates[appointmentId] = { cancel: false, reschedule: false };
		}
		loadingStates[appointmentId][action] = value;
	}
</script>

<svelte:head>
	<title>My Appointments - Picasso Hair Salon</title>
</svelte:head>

<div class="container mx-auto py-8">
	<div class="mx-auto max-w-4xl space-y-6">
		<div class="flex items-center justify-between">
			<div class="space-y-2">
				<h1 class="text-3xl font-bold">My Appointments</h1>
				<p class="text-muted-foreground">Manage your upcoming and past appointments.</p>
			</div>
			<Button href="/booking">Book New Appointment</Button>
		</div>

		{#if form?.message}
			<div
				class={form.success
					? 'rounded border border-green-200 bg-green-50 px-4 py-3 text-green-800'
					: 'rounded border border-red-200 bg-red-50 px-4 py-3 text-red-800'}
			>
				{form.message}
			</div>
		{/if}

		{#if data.user && data.appointments.length > 0}
			<div class="grid gap-4">
				{#each data.appointments as appointment (appointment.id)}
					<Card>
						<CardHeader>
							<div class="flex items-start justify-between">
								<div class="space-y-1">
									<CardTitle class="text-lg">{appointment.service?.name || 'Service'}</CardTitle>
									<CardDescription>
										with {appointment.stylist?.name || 'Stylist'}
									</CardDescription>
								</div>
								<span
									class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize {getStatusColor(
										appointment.status
									)}"
								>
									{appointment.status}
								</span>
							</div>
						</CardHeader>
						<CardContent>
							<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
								<div class="space-y-1">
									<p class="text-muted-foreground text-sm font-medium">Date</p>
									<p class="text-sm">{formatDate(appointment.appointment_date)}</p>
								</div>
								<div class="space-y-1">
									<p class="text-muted-foreground text-sm font-medium">Time</p>
									<p class="text-sm">{formatTime(appointment.appointment_time)}</p>
								</div>
								<div class="space-y-1">
									<p class="text-muted-foreground text-sm font-medium">Duration</p>
									<p class="text-sm">{appointment.service?.duration || 0} minutes</p>
								</div>
							</div>
							{#if appointment.notes}
								<div class="mt-3 space-y-1">
									<p class="text-muted-foreground text-sm font-medium">Notes</p>
									<p class="text-sm">{appointment.notes}</p>
								</div>
							{/if}
							<Separator class="my-4" />
							<div class="flex flex-col gap-2 sm:flex-row">
								{#if appointment.status !== 'cancelled' && appointment.status !== 'completed'}
									<form
										method="POST"
										action="?/reschedule"
										use:enhance={() => {
											setLoading(appointment.id, 'reschedule', true);
											return async ({ update }) => {
												await update();
												setLoading(appointment.id, 'reschedule', false);
											};
										}}
									>
										<input type="hidden" name="appointmentId" value={appointment.id} />
										<Button
											variant="outline"
											size="sm"
											type="submit"
											disabled={loadingStates[appointment.id]?.reschedule ||
												!canCancelAppointment(appointment)}
										>
											{loadingStates[appointment.id]?.reschedule ? 'Loading...' : 'Reschedule'}
										</Button>
									</form>
									<form
										method="POST"
										action="?/cancel"
										use:enhance={() => {
											setLoading(appointment.id, 'cancel', true);
											return async ({ update }) => {
												await update();
												setLoading(appointment.id, 'cancel', false);
											};
										}}
									>
										<input type="hidden" name="appointmentId" value={appointment.id} />
										<Button
											variant="outline"
											size="sm"
											type="submit"
											disabled={loadingStates[appointment.id]?.cancel ||
												!canCancelAppointment(appointment)}
										>
											{loadingStates[appointment.id]?.cancel ? 'Cancelling...' : 'Cancel'}
										</Button>
									</form>
								{/if}
								<Button variant="outline" size="sm" href="/appointments/{appointment.id}">
									View Details
								</Button>
							</div>
							{#if !canCancelAppointment(appointment) && appointment.status !== 'cancelled' && appointment.status !== 'completed'}
								<p class="text-muted-foreground mt-2 text-xs">
									Appointments must be cancelled or rescheduled at least 24 hours in advance
								</p>
							{/if}
						</CardContent>
					</Card>
				{/each}
			</div>
		{:else if data.user}
			<Card>
				<CardContent class="py-12 text-center">
					<div class="space-y-4">
						<div class="text-muted-foreground">
							<svg
								class="mx-auto h-12 w-12 text-gray-400"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v1a3 3 0 00.879 2.121M8 16l2.5 2.5M16 7V3a2 2 0 00-2-2h-4a2 2 0 00-2 2v4m6 4v1a3 3 0 01-.879 2.121M16 16l-2.5 2.5"
								/>
							</svg>
						</div>
						<div class="space-y-2">
							<h3 class="text-lg font-medium">No appointments yet</h3>
							<p class="text-muted-foreground">
								You haven't booked any appointments yet. Book your first appointment to get started!
							</p>
						</div>
						<Button href="/booking">Book Your First Appointment</Button>
					</div>
				</CardContent>
			</Card>
		{:else}
			<Card>
				<CardContent class="py-8 text-center">
					<p class="text-muted-foreground mb-4">Please sign in to view your appointments.</p>
					<Button>
						<a href="/auth/login">Sign In</a>
					</Button>
				</CardContent>
			</Card>
		{/if}

		{#if data.user}
			<Card>
				<CardHeader>
					<CardTitle>Quick Actions</CardTitle>
					<CardDescription>Manage your appointments and account.</CardDescription>
				</CardHeader>
				<CardContent class="space-y-2">
					<div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
						<Button variant="outline" class="w-full" href="/booking">Book New Appointment</Button>
						<Button variant="outline" class="w-full" href="/profile">View Profile</Button>
						<Button variant="outline" class="w-full" href="/settings">Account Settings</Button>
					</div>
				</CardContent>
			</Card>
		{/if}
	</div>
</div>
