<script lang="ts">
	import AtelierHero from '$lib/components/showcase/AtelierHero.svelte';
	import AtelierSectionHeader from '$lib/components/showcase/AtelierSectionHeader.svelte';
	import AtelierServices from '$lib/components/showcase/AtelierServices.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	// Transform services data for Atelier format
	const atelierServices = $derived(
		data.services?.slice(0, 8).map((service) => ({
			title: service.name,
			body: service.description || 'Experience our professional service',
			img: service.image_url || `/images/svc-placeholder.jpg`
		})) || []
	);

	// Sample gallery images
	const galleryImages = [
		{ src: '/images/gallery-1.jpg', alt: 'Stunning transformation' },
		{ src: '/images/gallery-2.jpg', alt: 'Creative coloring' },
		{ src: '/images/gallery-3.jpg', alt: 'Elegant styling' },
		{ src: '/images/gallery-4.jpg', alt: 'Modern cut' },
		{ src: '/images/gallery-5.jpg', alt: 'Bridal beauty' },
		{ src: '/images/gallery-6.jpg', alt: 'Bold new look' }
	];
</script>

<svelte:head>
	<title>Picasso Hair Salon</title>
	<meta
		name="description"
		content="Experience luxury hair styling at Picasso Hair Salon. Expert stylists, premium services, and personalized care in an elegant setting."
	/>
	<!-- Preload fonts for better performance -->
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Inter:wght@400;500;600&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<!-- Main wrapper with luxe theme -->
<div class="showcase-wrapper min-h-screen" data-theme="luxe">
	<AtelierHero
		leftImg="/images/hero-salon.jpg"
		polaroid="/images/interior-showcase.jpg"
		scissors="/images/scissors.png"
		comb="/images/comb.png"
		theme="luxe"
	/>

	<!-- About Section -->
	<div class="container py-16">
		<div class="grid items-start gap-10 md:grid-cols-2">
			<div>
				<h2 class="showcase-heading text-[42px]" style="font-family: 'Cormorant Garamond', serif;">
					Excellence <span class="-mt-2 block text-[26px]">in Every Detail</span>
				</h2>
				<p class="showcase-text mt-4 max-w-prose">
					At Picasso Hair Salon, we believe that great hair is an art form. Our master stylists
					combine technical expertise with creative vision to deliver transformative results that
					enhance your natural beauty.
				</p>
				<p class="showcase-text mt-4 max-w-prose">
					Whether you're looking for a subtle refresh or a complete makeover, our team is dedicated
					to crafting the perfect look that reflects your unique style and personality.
				</p>
				<div class="mt-6">
					<div class="showcase-kicker">Follow Us</div>
					<div class="mt-2 flex gap-3">
						<a class="showcase-nav-link" href="https://instagram.com" aria-label="Instagram"
							>Instagram</a
						>
						<a class="showcase-nav-link" href="https://facebook.com" aria-label="Facebook"
							>Facebook</a
						>
						<a class="showcase-nav-link" href="https://tiktok.com" aria-label="TikTok">TikTok</a>
					</div>
					<a href="/booking/service" class="showcase-btn mt-6">Book Your Visit</a>
				</div>
			</div>
			<div class="justify-self-end">
				<div class="showcase-polaroid w-[300px] rotate-[-2deg]">
					<img src="/images/interior-2.jpg" alt="Salon interior" />
				</div>
			</div>
		</div>
	</div>

	<!-- Services Section -->
	<div id="services">
		<AtelierServices items={atelierServices}>
			{#snippet header()}
				<AtelierSectionHeader kicker="OUR EXPERTISE" title="PREMIUM SERVICES" />
			{/snippet}
		</AtelierServices>
	</div>

	<!-- Gallery Section -->
	<section id="gallery" class="container py-16">
		<AtelierSectionHeader kicker="PORTFOLIO" title="OUR WORK" />
		<div class="mt-12 grid gap-8 md:grid-cols-3">
			{#each galleryImages as image, i (image.src)}
				<div
					class="showcase-polaroid {i % 2 === 0 ? 'rotate-1' : '-rotate-1'}"
					style="animation-delay: {i * 100}ms"
				>
					<img src={image.src} alt={image.alt} class="aspect-square object-cover" />
				</div>
			{/each}
		</div>
	</section>

	<!-- Testimonials Section -->
	<section class="showcase-accent-bg py-16">
		<div class="container">
			<AtelierSectionHeader kicker="TESTIMONIALS" title="CLIENT STORIES" />
			<div class="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-2">
				<blockquote class="text-center">
					<p class="showcase-text text-lg italic">
						"The team at Picasso transformed my hair beyond my expectations. Their attention to
						detail and creative expertise is unmatched!"
					</p>
					<footer class="mt-4">
						<div class="showcase-kicker">Sarah M.</div>
					</footer>
				</blockquote>
				<blockquote class="text-center">
					<p class="showcase-text text-lg italic">
						"I've been coming here for years. The stylists truly understand what works for each
						client and deliver consistently amazing results."
					</p>
					<footer class="mt-4">
						<div class="showcase-kicker">Michael L.</div>
					</footer>
				</blockquote>
			</div>
		</div>
	</section>

	<!-- Contact Section -->
	<section id="contact" class="container py-16">
		<AtelierSectionHeader kicker="GET IN TOUCH" title="VISIT US" />
		<div class="mx-auto mt-12 max-w-2xl text-center">
			<div class="showcase-text mb-8">
				<p class="mb-4">
					<strong>Address:</strong><br />
					123 Style Boulevard<br />
					Fashion District, NY 10001
				</p>
				<p class="mb-4">
					<strong>Hours:</strong><br />
					Monday - Friday: 9:00 AM - 8:00 PM<br />
					Saturday: 9:00 AM - 6:00 PM<br />
					Sunday: 10:00 AM - 5:00 PM
				</p>
				<p>
					<strong>Phone:</strong> (555) 123-4567<br />
					<strong>Email:</strong> info@picassohairsalon.com
				</p>
			</div>
		</div>
	</section>

	<!-- CTA Section -->
	<section class="container py-20 text-center">
		<h2 class="showcase-heading text-[48px]" style="font-family: 'Cormorant Garamond', serif;">
			Ready to Transform Your Look?
		</h2>
		<p class="showcase-text mx-auto mt-4 max-w-2xl text-lg">
			Book your appointment today and let our expert stylists create the perfect style for you.
		</p>
		<div class="mt-8 flex justify-center gap-4">
			<a href="/booking/service" class="showcase-btn">Book Appointment</a>
			<a href="/services" class="showcase-btn-outline">View All Services</a>
		</div>
	</section>
</div>

<style>
	@import '$lib/styles/showcase.css';
	@import '$lib/styles/showcase-layout.css';
	@import '$lib/styles/showcase-theme.css';

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.showcase-polaroid {
		animation: fadeIn 0.6s ease-out forwards;
	}

	/* Hide main site header when showcase is active */
	:global(body:has(.showcase-wrapper)) :global(header:not(.showcase-header)) {
		display: none !important;
	}
</style>
