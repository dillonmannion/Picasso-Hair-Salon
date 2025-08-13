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

<div class="from-luxe-cream-50 space-y-12 bg-gradient-to-b to-white">
	<!-- Hero Section -->
	<div class="space-y-6 text-center">
		<h1 class="text-luxe-burgundy-700 font-['Cormorant_Garamond'] text-5xl font-light md:text-6xl">
			Our Services
		</h1>
		<p class="text-luxe-black-700 mx-auto max-w-2xl text-lg leading-relaxed">
			Indulge in our curated collection of hair care services. Our expert stylists blend artistry
			with technique to create your perfect look.
		</p>
	</div>

	<!-- Services Grid with Cream Background -->
	<div class="bg-luxe-cream-100 rounded-xl p-8 shadow-[0_12px_24px_rgba(94,28,28,0.15)]">
		<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
			{#each data.services as service (service.id)}
				<ServiceCard {service} />
			{/each}
		</div>
	</div>

	<!-- Call to Action -->
	<div
		class="from-luxe-burgundy-50 to-luxe-cream-100 rounded-xl bg-gradient-to-r p-10 text-center shadow-[0_12px_24px_rgba(94,28,28,0.15)]"
	>
		<h2 class="text-luxe-burgundy-700 mb-4 font-['Cormorant_Garamond'] text-3xl font-normal">
			Ready to Experience Luxury?
		</h2>
		<p class="text-luxe-black-700 mx-auto mb-8 max-w-xl">
			Book your appointment today and let our skilled artisans transform your vision into reality.
		</p>
		<div class="flex flex-col justify-center gap-4 sm:flex-row">
			<Button
				size="lg"
				href="/appointments"
				class="bg-luxe-burgundy-700 text-luxe-cream-50 hover:bg-luxe-burgundy-600 shadow-[0_2px_4px_rgba(94,28,28,0.08)]"
			>
				Book Your Appointment
			</Button>
			<Button
				variant="outline"
				size="lg"
				class="border-luxe-burgundy-700 text-luxe-burgundy-700 hover:bg-luxe-burgundy-50 border-2"
			>
				Call Us: (555) 123-4567
			</Button>
		</div>
	</div>
</div>
