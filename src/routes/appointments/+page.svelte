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
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleDateString('en-US', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'confirmed':
				return 'text-green-600 bg-green-50 border-green-200';
			case 'pending':
				return 'text-yellow-600 bg-yellow-50 border-yellow-200';
			case 'cancelled':
				return 'text-red-600 bg-red-50 border-red-200';
			default:
				return 'text-gray-600 bg-gray-50 border-gray-200';
		}
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

		{#if data.user && data.appointments.length > 0}
			<div class="grid gap-4">
				{#each data.appointments as appointment (appointment.id)}
					<Card>
						<CardHeader>
							<div class="flex items-start justify-between">
								<div class="space-y-1">
									<CardTitle class="text-lg">{appointment.service}</CardTitle>
									<CardDescription>
										with {appointment.stylist}
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
									<p class="text-sm">{formatDate(appointment.date)}</p>
								</div>
								<div class="space-y-1">
									<p class="text-muted-foreground text-sm font-medium">Time</p>
									<p class="text-sm">{appointment.time}</p>
								</div>
								<div class="space-y-1">
									<p class="text-muted-foreground text-sm font-medium">Service</p>
									<p class="text-sm">{appointment.service}</p>
								</div>
							</div>
							<Separator class="my-4" />
							<div class="flex flex-col gap-2 sm:flex-row">
								<Button
									variant="outline"
									size="sm"
									onclick={() => {
										// TODO: Implement reschedule functionality
										console.log('Reschedule appointment:', appointment.id);
									}}
								>
									Reschedule
								</Button>
								<Button
									variant="outline"
									size="sm"
									onclick={() => {
										// TODO: Implement cancel functionality
										console.log('Cancel appointment:', appointment.id);
									}}
								>
									Cancel
								</Button>
								<Button
									variant="outline"
									size="sm"
									onclick={() => {
										// TODO: Implement view details functionality
										console.log('View details:', appointment.id);
									}}
								>
									View Details
								</Button>
							</div>
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
