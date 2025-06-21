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
</script>

<svelte:head>
	<title>Manage Services - Admin Panel</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">Services</h1>
			<p class="text-gray-600">Manage salon services, pricing, and availability</p>
		</div>
		<Button>Add New Service</Button>
	</div>

	<!-- Services Grid -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each data.services as service (service.id)}
			<Card class="relative">
				{#if !service.is_active}
					<div class="absolute top-2 right-2">
						<span
							class="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800"
						>
							Inactive
						</span>
					</div>
				{:else}
					<div class="absolute top-2 right-2">
						<span
							class="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800"
						>
							Active
						</span>
					</div>
				{/if}

				<CardHeader>
					<CardTitle class="flex items-center justify-between">
						<span>{service.name}</span>
						<span class="text-lg font-bold text-green-600">
							${service.price.toFixed(2)}
						</span>
					</CardTitle>
					<CardDescription>{service.description}</CardDescription>
				</CardHeader>

				<CardContent>
					<div class="space-y-3">
						<div class="flex justify-between text-sm">
							<span class="text-gray-600">Duration:</span>
							<span class="font-medium">{service.duration} minutes</span>
						</div>

						<div class="flex justify-between text-sm">
							<span class="text-gray-600">Category:</span>
							<span class="font-medium">{service.category}</span>
						</div>

						<div class="flex space-x-2 pt-2">
							<Button variant="outline" size="sm" class="flex-1">Edit</Button>
							<Button
								variant={service.is_active ? 'destructive' : 'default'}
								size="sm"
								class="flex-1"
							>
								{service.is_active ? 'Deactivate' : 'Activate'}
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		{/each}
	</div>

	<!-- Services Table -->
	<Card>
		<CardHeader>
			<CardTitle>All Services</CardTitle>
			<CardDescription>Detailed view of all services with management options</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead>
						<tr class="border-b">
							<th class="px-4 py-3 text-left font-medium">Service</th>
							<th class="px-4 py-3 text-left font-medium">Category</th>
							<th class="px-4 py-3 text-left font-medium">Price</th>
							<th class="px-4 py-3 text-left font-medium">Duration</th>
							<th class="px-4 py-3 text-left font-medium">Status</th>
							<th class="px-4 py-3 text-left font-medium">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each data.services as service (service.id)}
							<tr class="border-b hover:bg-gray-50">
								<td class="px-4 py-3">
									<div>
										<p class="font-medium">{service.name}</p>
										<p class="text-sm text-gray-600">{service.description}</p>
									</div>
								</td>
								<td class="px-4 py-3">{service.category}</td>
								<td class="px-4 py-3 font-medium">${service.price.toFixed(2)}</td>
								<td class="px-4 py-3">{service.duration} min</td>
								<td class="px-4 py-3">
									<span
										class="inline-flex rounded-full px-2 py-1 text-xs font-medium {service.is_active
											? 'bg-green-100 text-green-800'
											: 'bg-red-100 text-red-800'}"
									>
										{service.is_active ? 'Active' : 'Inactive'}
									</span>
								</td>
								<td class="px-4 py-3">
									<div class="flex space-x-2">
										<Button variant="outline" size="sm">Edit</Button>
										<Button variant="outline" size="sm">Duplicate</Button>
										<Button variant="destructive" size="sm">Delete</Button>
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
