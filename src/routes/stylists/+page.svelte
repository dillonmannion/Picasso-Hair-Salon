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
	<title>Our Stylists - Picasso Hair Salon</title>
	<meta
		name="description"
		content="Meet our talented team of professional hair stylists, each with their own specialties and expertise."
	/>
</svelte:head>

<div class="space-y-8">
	<!-- Hero Section -->
	<div class="space-y-4 text-center">
		<h1 class="text-4xl font-bold">Our Talented Stylists</h1>
		<p class="mx-auto max-w-2xl text-xl text-gray-600">
			Meet our team of passionate professionals who are dedicated to bringing your hair vision to
			life. Each stylist brings unique expertise and creativity to help you achieve your perfect
			look.
		</p>
	</div>

	<!-- Stylists Grid -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each data.stylists as stylist (stylist.id)}
			<Card class="transition-shadow duration-300 hover:shadow-lg">
				<CardHeader class="pb-4 text-center">
					{#if stylist.avatar_url}
						<div class="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full">
							<img src={stylist.avatar_url} alt={stylist.name} class="h-full w-full object-cover" />
						</div>
					{:else}
						<div
							class="bg-primary/10 mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full"
						>
							<span class="text-primary text-2xl font-bold">
								{stylist.name.charAt(0)}
							</span>
						</div>
					{/if}
					<CardTitle class="text-xl">{stylist.name}</CardTitle>
					{#if stylist.bio}
						<CardDescription class="text-base">{stylist.bio}</CardDescription>
					{/if}
				</CardHeader>

				<CardContent>
					<div class="space-y-4">
						{#if stylist.specialties && stylist.specialties.length > 0}
							<div>
								<h4 class="mb-2 text-sm font-medium text-gray-600">Specialties</h4>
								<div class="flex flex-wrap gap-2">
									{#each stylist.specialties as specialty (specialty)}
										<span
											class="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium"
										>
											{specialty}
										</span>
									{/each}
								</div>
							</div>
						{/if}

						<Button class="w-full" size="lg">Book with {stylist.name}</Button>
					</div>
				</CardContent>
			</Card>
		{/each}
	</div>

	<!-- No Stylists Message -->
	{#if data.stylists.length === 0}
		<div class="py-12 text-center">
			<h3 class="text-xl font-medium text-gray-900">No stylists available</h3>
			<p class="mt-2 text-gray-600">Please check back later or contact us for more information.</p>
		</div>
	{/if}

	<!-- Call to Action -->
	<div class="from-primary/10 to-primary/5 space-y-4 rounded-lg bg-gradient-to-r p-8 text-center">
		<h2 class="text-2xl font-bold">Ready to Book?</h2>
		<p class="mx-auto max-w-xl text-gray-600">
			Choose your preferred stylist and schedule an appointment today. Each of our professionals is
			ready to help you achieve your hair goals.
		</p>
		<div class="flex flex-col justify-center gap-4 sm:flex-row">
			<Button size="lg">Book Online</Button>
			<Button variant="outline" size="lg">Call Us: (555) 123-4567</Button>
		</div>
	</div>
</div>
