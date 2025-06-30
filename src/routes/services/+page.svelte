<script lang="ts">
	import Container from '$lib/components/atelier/layout/Container.svelte';
	import Typography from '$lib/components/atelier/typography/Typography.svelte';
	import ServiceGrid from '$lib/components/atelier/content/ServiceGrid.svelte';
	import AtelierButton from '$lib/components/atelier/AtelierButton.svelte';
	import AtelierSkeleton from '$lib/components/atelier/feedback/AtelierSkeleton.svelte';
	import AtelierNotification from '$lib/components/atelier/feedback/AtelierNotification.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Transform services data for ServiceGrid component
	const services = $derived(
		data.services.map((service) => ({
			id: service.id,
			title: service.name,
			description: service.description || '',
			price: service.price ? `$${service.price}` : undefined,
			duration: service.duration ? `${service.duration} min` : undefined,
			image: service.image_url || undefined,
			link: `/appointments?service=${service.id}`
		}))
	);

	// Loading state simulation (in real app, this would come from data loading)
	let isLoading = $state(false);
	let error = $state<string | null>(null);
</script>

<svelte:head>
	<title>Our Services - Picasso Hair Salon</title>
	<meta
		name="description"
		content="Discover our professional hair salon services including cuts, styling, coloring, and more."
	/>
</svelte:head>

<!-- Hero Section -->
<section class="atelier-hero-simple bg-gradient-to-b from-atelier-muted to-atelier-bg mb-atelier-xl">
	<Container>
		<div class="py-atelier-2xl text-center">
			<Typography variant="display" as="h1" align="center" gradient class="mb-atelier-sm">
				Our Services
			</Typography>
			<Typography variant="body" align="center" class="max-w-2xl mx-auto">
				Experience luxury hair care with our expert stylists
			</Typography>
		</div>
	</Container>
</section>

<!-- Services Content -->
<Container>
	<div class="space-y-atelier-2xl">
		<!-- Introduction -->
		<div class="text-center max-w-3xl mx-auto">
			<Typography variant="heading" as="h2" align="center" class="mb-atelier-md">
				Artistry Meets Excellence
			</Typography>
			<Typography variant="body" align="center">
				From precision cuts to vibrant colors, our skilled artisans bring your vision to life. Each
				service is tailored to enhance your natural beauty and reflect your unique style.
			</Typography>
		</div>

		<!-- Services Grid -->
		{#if error}
			<AtelierNotification type="error" title="Error loading services">
				{error}
			</AtelierNotification>
		{:else if isLoading}
			<!-- Loading skeleton -->
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-atelier-lg">
				{#each Array(6) as _, i}
					<AtelierSkeleton class="h-[300px] rounded-xl" />
				{/each}
			</div>
		{:else if services.length === 0}
			<div class="text-center py-atelier-2xl">
				<Typography variant="heading" as="h3" align="center" class="mb-atelier-sm">
					No Services Available
				</Typography>
				<Typography variant="body" align="center">
					Please check back later for our service offerings.
				</Typography>
			</div>
		{:else}
			<ServiceGrid {services} columns={3} staggerDelay={100} animateOnScroll={true} gap="lg" />
		{/if}

		<!-- Call to Action -->
		<div
			class="atelier-cta bg-gradient-to-r from-atelier-champagne/20 to-atelier-gold/10 rounded-2xl p-atelier-xl text-center"
		>
			<Typography variant="heading" as="h2" align="center" class="mb-atelier-sm">
				Ready to Transform Your Look?
			</Typography>
			<Typography variant="body" align="center" class="mb-atelier-lg max-w-2xl mx-auto">
				Schedule your appointment today and let our experienced stylists create the perfect style
				for you.
			</Typography>
			<div class="flex flex-col sm:flex-row gap-atelier-sm justify-center">
				<AtelierButton size="large" href="/appointments">Book Your Appointment</AtelierButton>
				<AtelierButton variant="outline" size="large">
					Call Us: (555) 123-4567
				</AtelierButton>
			</div>
		</div>
	</div>
</Container>

<style>
	.atelier-cta {
		position: relative;
		overflow: hidden;
	}

	.atelier-cta::before {
		content: '';
		position: absolute;
		top: -50%;
		right: -50%;
		width: 200%;
		height: 200%;
		background: radial-gradient(
			circle,
			var(--atelier-elegant-gold) 0%,
			transparent 70%
		);
		opacity: 0.05;
		animation: atelier-glow 20s ease-in-out infinite;
	}
</style>
