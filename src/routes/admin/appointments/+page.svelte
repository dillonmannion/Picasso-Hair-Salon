<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Track loading states
	let loadingStates = $state<Record<string, boolean>>({});

	// Define appointment statuses locally
	const APPOINTMENT_STATUS = {
		PENDING: 'pending',
		CONFIRMED: 'confirmed',
		CANCELLED: 'cancelled',
		COMPLETED: 'completed'
	} as const;

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

	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	function formatTime(timeStr: string) {
		const [hours, minutes] = timeStr.split(':');
		const hour = Number.parseInt(hours);
		const ampm = hour >= 12 ? 'PM' : 'AM';
		const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
		return `${displayHour}:${minutes} ${ampm}`;
	}

	function applyFilters() {
		const statusSelect = document.getElementById('status-filter') as HTMLSelectElement;
		const stylistSelect = document.getElementById('stylist-filter') as HTMLSelectElement;
		const startDateInput = document.getElementById('start-date') as HTMLInputElement;
		const endDateInput = document.getElementById('end-date') as HTMLInputElement;

		const params = new URLSearchParams();
		if (statusSelect.value && statusSelect.value !== 'all') {
			params.set('status', statusSelect.value);
		}
		if (stylistSelect.value && stylistSelect.value !== 'all') {
			params.set('stylist', stylistSelect.value);
		}
		if (startDateInput.value) {
			params.set('startDate', startDateInput.value);
		}
		if (endDateInput.value) {
			params.set('endDate', endDateInput.value);
		}

		goto(`?${params.toString()}`);
	}

	function clearFilters() {
		goto('/admin/appointments');
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

	<!-- Statistics Cards -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Total Appointments</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{data.stats.total}</div>
			</CardContent>
		</Card>
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Today</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{data.stats.todayCount}</div>
			</CardContent>
		</Card>
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">This Week</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{data.stats.weekCount}</div>
			</CardContent>
		</Card>
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Pending</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{data.stats.byStatus.pending}</div>
			</CardContent>
		</Card>
	</div>

	<!-- Filters -->
	<Card>
		<CardHeader>
			<CardTitle>Filters</CardTitle>
			<CardDescription>Filter appointments by status, stylist, or date range</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
				<div class="space-y-2">
					<Label for="status-filter">Status</Label>
					<select
						id="status-filter"
						class="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
						value={data.filters.status || 'all'}
						onchange={applyFilters}
					>
						<option value="all">All Statuses</option>
						{#each Object.values(APPOINTMENT_STATUS) as status}
							<option value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
						{/each}
					</select>
				</div>
				<div class="space-y-2">
					<Label for="stylist-filter">Stylist</Label>
					<select
						id="stylist-filter"
						class="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
						value={data.filters.stylistId || 'all'}
						onchange={applyFilters}
					>
						<option value="all">All Stylists</option>
						{#each data.stylists as stylist}
							<option value={stylist.id}>{stylist.name}</option>
						{/each}
					</select>
				</div>
				<div class="space-y-2">
					<Label for="start-date">Start Date</Label>
					<Input
						id="start-date"
						type="date"
						value={data.filters.startDate || ''}
						onchange={applyFilters}
					/>
				</div>
				<div class="space-y-2">
					<Label for="end-date">End Date</Label>
					<Input
						id="end-date"
						type="date"
						value={data.filters.endDate || ''}
						onchange={applyFilters}
					/>
				</div>
				<div class="flex items-end">
					<Button variant="outline" onclick={clearFilters}>Clear Filters</Button>
				</div>
			</div>
		</CardContent>
	</Card>

	<!-- Appointments Table -->
	<Card>
		<CardHeader>
			<CardTitle>All Appointments ({data.appointments.length})</CardTitle>
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
										<p class="font-medium">{appointment.user?.full_name || 'Unknown'}</p>
										<p class="text-sm text-gray-600">{appointment.user?.email || ''}</p>
									</div>
								</td>
								<td class="px-4 py-3">
									<p class="font-medium">{appointment.service?.name || 'Service'}</p>
									{#if appointment.notes}
										<p class="max-w-xs truncate text-sm text-gray-600" title={appointment.notes}>
											{appointment.notes}
										</p>
									{/if}
								</td>
								<td class="px-4 py-3">{appointment.stylist?.name || 'Stylist'}</td>
								<td class="px-4 py-3">
									<div>
										<p class="font-medium">{formatDate(appointment.appointment_date)}</p>
										<p class="text-sm text-gray-600">{formatTime(appointment.appointment_time)}</p>
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
								<td class="px-4 py-3">
									${appointment.total_price
										? Number.parseFloat(appointment.total_price).toFixed(2)
										: '0.00'}
								</td>
								<td class="px-4 py-3">
									<div class="flex space-x-2">
										<Button variant="outline" size="sm" href="/admin/appointments/{appointment.id}">
											View
										</Button>
										{#if appointment.status === 'pending'}
											<form
												method="POST"
												action="?/updateStatus"
												use:enhance={() => {
													loadingStates[appointment.id] = true;
													return async ({ update }) => {
														await update();
														loadingStates[appointment.id] = false;
													};
												}}
											>
												<input type="hidden" name="appointmentId" value={appointment.id} />
												<input type="hidden" name="status" value="confirmed" />
												<Button size="sm" type="submit" disabled={loadingStates[appointment.id]}>
													{loadingStates[appointment.id] ? 'Updating...' : 'Confirm'}
												</Button>
											</form>
										{/if}
										{#if appointment.status !== 'completed' && appointment.status !== 'cancelled'}
											<form
												method="POST"
												action="?/updateStatus"
												use:enhance={() => {
													loadingStates[`${appointment.id}-cancel`] = true;
													return async ({ update }) => {
														await update();
														loadingStates[`${appointment.id}-cancel`] = false;
													};
												}}
											>
												<input type="hidden" name="appointmentId" value={appointment.id} />
												<input type="hidden" name="status" value="cancelled" />
												<Button
													variant="destructive"
													size="sm"
													type="submit"
													disabled={loadingStates[`${appointment.id}-cancel`]}
												>
													{loadingStates[`${appointment.id}-cancel`] ? 'Cancelling...' : 'Cancel'}
												</Button>
											</form>
										{/if}
									</div>
								</td>
							</tr>
						{:else}
							<tr>
								<td colspan="7" class="px-4 py-8 text-center text-gray-500">
									No appointments found matching your filters.
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</CardContent>
	</Card>
</div>
