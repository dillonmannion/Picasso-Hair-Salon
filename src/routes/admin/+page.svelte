<script lang="ts">
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import type { PageData } from './$types';

	let { data: _data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Admin Dashboard - Picasso Hair Salon</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold">Admin Dashboard</h1>
		<p class="text-gray-600">Overview of your salon management system</p>
	</div>

	<!-- Quick Stats -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Total Appointments</CardTitle>
				<span class="text-2xl">📅</span>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">24</div>
				<p class="text-muted-foreground text-xs">+12% from last month</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Active Services</CardTitle>
				<span class="text-2xl">✂️</span>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">8</div>
				<p class="text-muted-foreground text-xs">2 added this week</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Staff Members</CardTitle>
				<span class="text-2xl">👨‍💼</span>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">5</div>
				<p class="text-muted-foreground text-xs">All active</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Gallery Images</CardTitle>
				<span class="text-2xl">🖼️</span>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">32</div>
				<p class="text-muted-foreground text-xs">+5 this week</p>
			</CardContent>
		</Card>
	</div>

	<!-- Recent Activity -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<Card>
			<CardHeader>
				<CardTitle>Recent Appointments</CardTitle>
				<CardDescription>Latest bookings and updates</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="space-y-4">
					<div class="flex items-center justify-between rounded-lg border p-3">
						<div>
							<p class="font-medium">John Doe</p>
							<p class="text-sm text-gray-600">Haircut & Style</p>
						</div>
						<div class="text-right">
							<p class="text-sm font-medium">Today 2:00 PM</p>
							<span
								class="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800"
							>
								Confirmed
							</span>
						</div>
					</div>
					<div class="flex items-center justify-between rounded-lg border p-3">
						<div>
							<p class="font-medium">Jane Smith</p>
							<p class="text-sm text-gray-600">Hair Color</p>
						</div>
						<div class="text-right">
							<p class="text-sm font-medium">Tomorrow 10:00 AM</p>
							<span
								class="inline-flex rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800"
							>
								Pending
							</span>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Quick Actions</CardTitle>
				<CardDescription>Common administrative tasks</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="grid grid-cols-2 gap-4">
					<a href="/admin/appointments" class="rounded-lg border p-4 text-center hover:bg-gray-50">
						<div class="mb-2 text-2xl">📅</div>
						<p class="font-medium">Manage Appointments</p>
					</a>
					<a href="/admin/services" class="rounded-lg border p-4 text-center hover:bg-gray-50">
						<div class="mb-2 text-2xl">✂️</div>
						<p class="font-medium">Edit Services</p>
					</a>
					<a href="/admin/stylists" class="rounded-lg border p-4 text-center hover:bg-gray-50">
						<div class="mb-2 text-2xl">👨‍💼</div>
						<p class="font-medium">Manage Staff</p>
					</a>
					<a href="/admin/gallery" class="rounded-lg border p-4 text-center hover:bg-gray-50">
						<div class="mb-2 text-2xl">🖼️</div>
						<p class="font-medium">Update Gallery</p>
					</a>
				</div>
			</CardContent>
		</Card>
	</div>
</div>
