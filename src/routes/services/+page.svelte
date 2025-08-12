<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import ServiceCard from '$lib/components/custom/ServiceCard.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Our Services - Picasso Hair Salon</title>
	<meta
		name="description"
		content="Discover our professional hair salon services including cuts, styling, coloring, and more."
	/>
</svelte:head>

<div class="space-y-8">
	<!-- Hero Section -->
	<div class="space-y-4 text-center">
		<h1 class="text-4xl font-bold">Our Services</h1>
		<p class="mx-auto max-w-2xl text-xl text-gray-600">
			Experience professional hair care with our expert stylists. From precision cuts to vibrant
			colors, we'll help you look and feel your best.
		</p>
	</div>

	<!-- Services Grid -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each data.services as service (service.id)}
			<ServiceCard {service} />
		{/each}
	</div>

	<!-- Call to Action -->
	<div class="from-primary/10 to-primary/5 space-y-4 rounded-lg bg-gradient-to-r p-8 text-center">
		<h2 class="text-2xl font-bold">Ready to Book?</h2>
		<p class="mx-auto max-w-xl text-gray-600">
			Schedule your appointment today and let our experienced stylists transform your look.
		</p>
		<div class="flex flex-col justify-center gap-4 sm:flex-row">
			<Button size="lg" href="/appointments">Book Online</Button>
			<Button variant="outline" size="lg">Call Us: (555) 123-4567</Button>
		</div>
	</div>
</div>
