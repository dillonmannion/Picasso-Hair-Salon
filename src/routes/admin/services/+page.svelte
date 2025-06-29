<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import ServiceCard from '$lib/components/custom/ServiceCard.svelte';
	import type { PageData } from './$types';
	import type { Database } from '$lib/types/database.types';

	type Service = Database['public']['Tables']['services']['Row'];

	let { data }: { data: PageData } = $props();

	function handleEdit(service: Service) {
		// TODO: Implement edit functionality
		console.log('Edit service:', service);
	}

	function handleDelete(service: Service) {
		// TODO: Implement delete functionality
		console.log('Delete service:', service);
	}
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
			<ServiceCard {service} isAdmin={true} onEdit={handleEdit} onDelete={handleDelete} />
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
								<td class="px-4 py-3 font-medium">${service.price}</td>
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
