<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function getStatusColor(status: string) {
		switch (status) {
			case 'confirmed':
				return 'bg-green-100 text-green-800';
			case 'pending':
				return 'bg-yellow-100 text-yellow-800';
			case 'completed':
				return 'bg-blue-100 text-blue-800';
			case 'cancelled':
				return 'bg-red-100 text-red-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	}
</script>

<svelte:head>
	<title>Manage Appointments - Admin Panel</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">Appointments</h1>
			<p class="text-gray-600">Manage customer appointments and bookings</p>
		</div>
		<Button>Add New Appointment</Button>
	</div>

	<!-- Appointments Table -->
	<Card>
		<CardHeader>
			<CardTitle>All Appointments</CardTitle>
			<CardDescription>View and manage customer appointments across all stylists</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead>
						<tr class="border-b">
							<th class="px-4 py-3 text-left font-medium">Customer</th>
							<th class="px-4 py-3 text-left font-medium">Service</th>
							<th class="px-4 py-3 text-left font-medium">Stylist</th>
							<th class="px-4 py-3 text-left font-medium">Date & Time</th>
							<th class="px-4 py-3 text-left font-medium">Status</th>
							<th class="px-4 py-3 text-left font-medium">Price</th>
							<th class="px-4 py-3 text-left font-medium">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each data.appointments as appointment (appointment.id)}
							<tr class="border-b hover:bg-gray-50">
								<td class="px-4 py-3">
									<div>
										<p class="font-medium">{appointment.customerName}</p>
										<p class="text-sm text-gray-600">{appointment.customerEmail}</p>
									</div>
								</td>
								<td class="px-4 py-3">
									<p class="font-medium">{appointment.service}</p>
									{#if appointment.notes}
										<p class="text-sm text-gray-600">{appointment.notes}</p>
									{/if}
								</td>
								<td class="px-4 py-3">{appointment.stylist}</td>
								<td class="px-4 py-3">
									<div>
										<p class="font-medium">{appointment.date}</p>
										<p class="text-sm text-gray-600">{appointment.time}</p>
									</div>
								</td>
								<td class="px-4 py-3">
									<span
										class="inline-flex rounded-full px-2 py-1 text-xs font-medium {getStatusColor(
											appointment.status
										)}"
									>
										{appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
									</span>
								</td>
								<td class="px-4 py-3">${appointment.price.toFixed(2)}</td>
								<td class="px-4 py-3">
									<div class="flex space-x-2">
										<Button variant="outline" size="sm">Edit</Button>
										{#if appointment.status === 'pending'}
											<Button size="sm">Confirm</Button>
										{/if}
										{#if appointment.status !== 'completed'}
											<Button variant="destructive" size="sm">Cancel</Button>
										{/if}
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</CardContent>
	</Card>
</div>
