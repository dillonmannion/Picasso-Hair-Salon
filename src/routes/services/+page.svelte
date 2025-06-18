<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Extract unique categories from services data
	const categories = $derived(() => {
		const uniqueCategories = [...new Set(data.services.map((service) => service.category))];
		return ['All', ...uniqueCategories.sort()];
	});

	// Currently selected tab
	let selectedCategory = $state('All');

	// Filter services based on selected category
	const filteredServices = $derived(() => {
		if (selectedCategory === 'All') {
			return data.services;
		}
		return data.services.filter((service) => service.category === selectedCategory);
	});

	// Format price for display
	function formatPrice(price: string): string {
		const numPrice = parseFloat(price);
		return `$${numPrice.toFixed(2)}`;
	}

	// Format duration for display
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

	// Handle book now button click
	function handleBookNow(serviceId: string) {
		// Navigate to booking page with pre-selected service
		window.location.href = `/book?service=${serviceId}`;
	}
</script>

<svelte:head>
	<title>Services - Picasso Hair Salon</title>
	<meta
		name="description"
		content="Explore our comprehensive range of professional hair services at Picasso Hair Salon. From cuts and color to styling and treatments."
	/>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8 text-center">
		<h1 class="mb-4 text-4xl font-bold text-gray-900">Our Services</h1>
		<p class="mx-auto max-w-2xl text-lg text-gray-600">
			Discover our comprehensive range of professional hair services designed to enhance your
			natural beauty and style.
		</p>
	</div>

	<Tabs.Root bind:value={selectedCategory} class="w-full">
		<Tabs.List
			class="mb-8 grid w-full grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:flex lg:flex-wrap lg:justify-center"
		>
			{#each categories() as category (category)}
				<Tabs.Trigger value={category} class="flex-shrink-0">
					{category}
				</Tabs.Trigger>
			{/each}
		</Tabs.List>

		{#each categories() as category (category)}
			<Tabs.Content value={category}>
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{#each filteredServices() as service (service.id)}
						<Card.Root class="flex h-full flex-col">
							{#if service.image_url}
								<div class="aspect-video overflow-hidden rounded-t-lg">
									<img
										src={service.image_url}
										alt={service.name}
										class="h-full w-full object-cover"
										loading="lazy"
									/>
								</div>
							{/if}

							<Card.Header class="flex-grow">
								<div class="mb-2 flex items-start justify-between">
									<Card.Title class="text-xl font-semibold">
										{service.name}
									</Card.Title>
									<Badge variant="secondary" class="ml-2 flex-shrink-0">
										{service.category}
									</Badge>
								</div>

								{#if service.description}
									<Card.Description class="text-gray-600">
										{service.description}
									</Card.Description>
								{/if}
							</Card.Header>

							<Card.Content class="pt-0">
								<div class="mb-4 flex items-center justify-between">
									<div class="text-primary text-2xl font-bold">
										{formatPrice(service.price)}
									</div>
									<div class="text-sm text-gray-500">
										{formatDuration(service.duration)}
									</div>
								</div>
							</Card.Content>

							<Card.Footer class="pt-0">
								<Button class="w-full" onclick={() => handleBookNow(service.id)}>Book Now</Button>
							</Card.Footer>
						</Card.Root>
					{/each}
				</div>

				{#if filteredServices().length === 0}
					<div class="py-12 text-center">
						<p class="text-lg text-gray-500">No services found in this category.</p>
					</div>
				{/if}
			</Tabs.Content>
		{/each}
	</Tabs.Root>
</div>
