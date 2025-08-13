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
		<h1 class="text-luxe-burgundy-700 font-['Cormorant_Garamond'] text-4xl font-light">
			Admin Dashboard
		</h1>
		<p class="text-luxe-black-600 text-lg">Overview of your salon management system</p>
	</div>

	<!-- Quick Stats -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
		<Card
			class="border-luxe-cream-400 bg-luxe-cream-50 overflow-hidden rounded-xl border shadow-[0_12px_24px_rgba(94,28,28,0.15)]"
		>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-luxe-black-600 text-sm font-medium tracking-wider uppercase"
					>Total Appointments</CardTitle
				>
				<span class="text-2xl">📅</span>
			</CardHeader>
			<CardContent>
				<div class="text-luxe-burgundy-700 font-['Cormorant_Garamond'] text-3xl font-semibold">
					24
				</div>
				<p class="text-luxe-black-500 text-xs">+12% from last month</p>
			</CardContent>
		</Card>

		<Card
			class="border-luxe-cream-400 bg-luxe-cream-50 overflow-hidden rounded-xl border shadow-[0_12px_24px_rgba(94,28,28,0.15)]"
		>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-luxe-black-600 text-sm font-medium tracking-wider uppercase"
					>Active Services</CardTitle
				>
				<span class="text-2xl">✂️</span>
			</CardHeader>
			<CardContent>
				<div class="text-luxe-burgundy-700 font-['Cormorant_Garamond'] text-3xl font-semibold">
					8
				</div>
				<p class="text-luxe-black-500 text-xs">2 added this week</p>
			</CardContent>
		</Card>

		<Card
			class="border-luxe-cream-400 bg-luxe-cream-50 overflow-hidden rounded-xl border shadow-[0_12px_24px_rgba(94,28,28,0.15)]"
		>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-luxe-black-600 text-sm font-medium tracking-wider uppercase"
					>Staff Members</CardTitle
				>
				<span class="text-2xl">👨‍💼</span>
			</CardHeader>
			<CardContent>
				<div class="text-luxe-burgundy-700 font-['Cormorant_Garamond'] text-3xl font-semibold">
					5
				</div>
				<p class="text-luxe-black-500 text-xs">All active</p>
			</CardContent>
		</Card>

		<Card
			class="border-luxe-cream-400 bg-luxe-cream-50 overflow-hidden rounded-xl border shadow-[0_12px_24px_rgba(94,28,28,0.15)]"
		>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-luxe-black-600 text-sm font-medium tracking-wider uppercase"
					>Gallery Images</CardTitle
				>
				<span class="text-2xl">🖼️</span>
			</CardHeader>
			<CardContent>
				<div class="text-luxe-burgundy-700 font-['Cormorant_Garamond'] text-3xl font-semibold">
					32
				</div>
				<p class="text-luxe-black-500 text-xs">+5 this week</p>
			</CardContent>
		</Card>
	</div>

	<!-- Recent Activity -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<Card
			class="border-luxe-cream-400 bg-luxe-cream-50 overflow-hidden rounded-xl border shadow-[0_12px_24px_rgba(94,28,28,0.15)]"
		>
			<CardHeader>
				<CardTitle class="text-luxe-burgundy-700 font-['Cormorant_Garamond'] text-2xl font-normal"
					>Recent Appointments</CardTitle
				>
				<CardDescription class="text-luxe-black-600">Latest bookings and updates</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="space-y-4">
					<div
						class="border-luxe-cream-300 bg-luxe-cream-100 flex items-center justify-between rounded-lg border p-3"
					>
						<div>
							<p class="text-luxe-black-800 font-medium">John Doe</p>
							<p class="text-luxe-black-600 text-sm">Haircut & Style</p>
						</div>
						<div class="text-right">
							<p class="text-luxe-black-700 text-sm font-medium">Today 2:00 PM</p>
							<span
								class="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800"
							>
								Confirmed
							</span>
						</div>
					</div>
					<div
						class="border-luxe-cream-300 bg-luxe-cream-100 flex items-center justify-between rounded-lg border p-3"
					>
						<div>
							<p class="text-luxe-black-800 font-medium">Jane Smith</p>
							<p class="text-luxe-black-600 text-sm">Hair Color</p>
						</div>
						<div class="text-right">
							<p class="text-luxe-black-700 text-sm font-medium">Tomorrow 10:00 AM</p>
							<span
								class="inline-flex rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800"
							>
								Pending
							</span>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>

		<Card
			class="border-luxe-cream-400 bg-luxe-cream-50 overflow-hidden rounded-xl border shadow-[0_12px_24px_rgba(94,28,28,0.15)]"
		>
			<CardHeader>
				<CardTitle class="text-luxe-burgundy-700 font-['Cormorant_Garamond'] text-2xl font-normal"
					>Quick Actions</CardTitle
				>
				<CardDescription class="text-luxe-black-600">Common administrative tasks</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="grid grid-cols-2 gap-4">
					<a
						href="/admin/appointments"
						class="border-luxe-cream-400 bg-luxe-cream-100 hover:bg-luxe-burgundy-50 rounded-lg border p-4 text-center transition-all hover:shadow-[0_4px_8px_rgba(94,28,28,0.12)]"
					>
						<div class="mb-2 text-2xl">📅</div>
						<p class="text-luxe-black-700 font-medium">Manage Appointments</p>
					</a>
					<a
						href="/admin/services"
						class="border-luxe-cream-400 bg-luxe-cream-100 hover:bg-luxe-burgundy-50 rounded-lg border p-4 text-center transition-all hover:shadow-[0_4px_8px_rgba(94,28,28,0.12)]"
					>
						<div class="mb-2 text-2xl">✂️</div>
						<p class="text-luxe-black-700 font-medium">Edit Services</p>
					</a>
					<a
						href="/admin/stylists"
						class="border-luxe-cream-400 bg-luxe-cream-100 hover:bg-luxe-burgundy-50 rounded-lg border p-4 text-center transition-all hover:shadow-[0_4px_8px_rgba(94,28,28,0.12)]"
					>
						<div class="mb-2 text-2xl">👨‍💼</div>
						<p class="text-luxe-black-700 font-medium">Manage Staff</p>
					</a>
					<a
						href="/admin/gallery"
						class="border-luxe-cream-400 bg-luxe-cream-100 hover:bg-luxe-burgundy-50 rounded-lg border p-4 text-center transition-all hover:shadow-[0_4px_8px_rgba(94,28,28,0.12)]"
					>
						<div class="mb-2 text-2xl">🖼️</div>
						<p class="text-luxe-black-700 font-medium">Update Gallery</p>
					</a>
				</div>
			</CardContent>
		</Card>
	</div>
</div>
