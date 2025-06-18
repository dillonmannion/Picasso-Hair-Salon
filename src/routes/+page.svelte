<script lang="ts">
	import { Button } from '$lib/components/ui/button';

	let { data } = $props();
	let { user } = data;
</script>

<div class="flex flex-col">
	<!-- Hero Section -->
	<section class="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
		<div class="container px-4 py-24 mx-auto lg:py-32">
			<div class="max-w-4xl mx-auto text-center">
				<h1 class="mb-6 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
					Picasso Hair Salon
				</h1>
				<p class="mb-8 text-xl text-muted-foreground sm:text-2xl lg:text-3xl">
					Artistry in every strand.
				</p>
				<p class="mb-12 text-lg text-muted-foreground max-w-2xl mx-auto">
					Experience the perfect blend of creativity and precision at Picasso Hair Salon. 
					Our master stylists transform your vision into reality with unparalleled skill and artistry.
				</p>
				<div class="flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-6">
					{#if user}
						<Button href="/services" size="lg" class="text-lg px-8 py-6">
							Book Appointment
						</Button>
						<Button href="/gallery" variant="outline" size="lg" class="text-lg px-8 py-6">
							View Gallery
						</Button>
					{:else}
						<Button href="/auth/register" size="lg" class="text-lg px-8 py-6">
							Get Started
						</Button>
						<Button href="/services" variant="outline" size="lg" class="text-lg px-8 py-6">
							Our Services
						</Button>
					{/if}
				</div>
			</div>
		</div>
		
		<!-- Decorative elements -->
		<div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
			<div class="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
			<div class="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"></div>
		</div>
	</section>

	<!-- Features Section -->
	<section class="py-24 bg-muted/30">
		<div class="container px-4 mx-auto">
			<div class="max-w-2xl mx-auto text-center mb-16">
				<h2 class="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
					Why Choose Picasso?
				</h2>
				<p class="text-lg text-muted-foreground">
					We combine artistic vision with technical excellence to deliver exceptional results.
				</p>
			</div>
			
			<div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
				<div class="text-center">
					<div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
						<svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.847a4.5 4.5 0 003.09 3.09L15.75 12l-2.847.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
						</svg>
					</div>
					<h3 class="text-xl font-semibold mb-2">Expert Stylists</h3>
					<p class="text-muted-foreground">
						Our team consists of highly trained professionals with years of experience in the latest techniques and trends.
					</p>
				</div>
				
				<div class="text-center">
					<div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
						<svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
						</svg>
					</div>
					<h3 class="text-xl font-semibold mb-2">Personalized Care</h3>
					<p class="text-muted-foreground">
						We take the time to understand your unique style and preferences to create a look that's perfectly you.
					</p>
				</div>
				
				<div class="text-center">
					<div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
						<svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
						</svg>
					</div>
					<h3 class="text-xl font-semibold mb-2">Premium Products</h3>
					<p class="text-muted-foreground">
						We use only the finest professional-grade products to ensure the health and beauty of your hair.
					</p>
				</div>
			</div>
		</div>
	</section>
</div>
