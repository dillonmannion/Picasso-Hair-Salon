<script lang="ts">
	import AtelierThemeProvider from '$lib/components/atelier/AtelierThemeProvider.svelte';
	import { atelierTheme, toggleAtelierTheme, type AtelierTheme } from '$lib/stores/atelierTheme';
	import { atelierModal } from '$lib/stores/atelierModal';
	import AtelierButton from '$lib/components/atelier/AtelierButton.svelte';
	import AtelierCard from '$lib/components/atelier/AtelierCard.svelte';
	import AtelierModal from '$lib/components/atelier/AtelierModal.svelte';
	import AtelierTooltip from '$lib/components/atelier/AtelierTooltip.svelte';
	import AtelierBadge from '$lib/components/atelier/AtelierBadge.svelte';
	import AtelierHeader from '$lib/components/atelier/navigation/AtelierHeader.svelte';
	import HeroSection from '$lib/components/atelier/content/HeroSection.svelte';
	import ServiceGrid from '$lib/components/atelier/content/ServiceGrid.svelte';
	import MasonryGallery from '$lib/components/atelier/content/MasonryGallery.svelte';
	import TextHoverHighlight from '$lib/components/atelier/interactive/TextHoverHighlight.svelte';
	import ImageOverlay from '$lib/components/atelier/interactive/ImageOverlay.svelte';

	// Phase 4 imports
	import ScrollToTop from '$lib/components/atelier/utility/ScrollToTop.svelte';
	import OptimizedImage from '$lib/components/atelier/utility/OptimizedImage.svelte';
	import AtelierInput from '$lib/components/atelier/form/AtelierInput.svelte';
	import AtelierSelect from '$lib/components/atelier/form/AtelierSelect.svelte';
	import AtelierTextarea from '$lib/components/atelier/form/AtelierTextarea.svelte';

	import '$lib/styles/atelier.css';

	let currentTheme = $state<AtelierTheme>('system');
	let showModal = $state(false);
	let removableBadges = $state(['Luxury', 'Premium', 'Exclusive', 'Limited']);

	// Phase 4 demo state
	let formData = $state({
		firstName: '',
		email: '',
		service: '',
		message: ''
	});

	const serviceOptions = [
		{ value: 'cut', label: 'Precision Cut & Style' },
		{ value: 'color', label: 'Color Transformation' },
		{ value: 'balayage', label: 'Balayage Highlights' },
		{ value: 'treatment', label: 'Hair Treatment' },
		{ value: 'consultation', label: 'Style Consultation' }
	];

	// Phase 3 demo data
	const menuItems = [
		{ label: 'Home', href: '#' },
		{ label: 'Services', href: '#services' },
		{ label: 'Gallery', href: '#gallery' },
		{ label: 'About', href: '#about' }
	];

	const services = [
		{
			id: '1',
			title: 'Precision Cut & Style',
			description: 'Expert haircut tailored to your face shape and lifestyle.',
			price: '$85',
			duration: '60 min',
			icon: '✂️'
		},
		{
			id: '2',
			title: 'Color Transformation',
			description: 'Full color service including consultation and treatment.',
			price: '$150+',
			duration: '3 hours',
			icon: '🎨'
		},
		{
			id: '3',
			title: 'Balayage Highlights',
			description: 'Hand-painted highlights for a natural, sun-kissed look.',
			price: '$200+',
			duration: '3.5 hours',
			icon: '✨'
		}
	];

	const galleryImages = [
		{
			id: '1',
			src: 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=400',
			alt: 'Blonde balayage',
			width: 400,
			height: 500
		},
		{
			id: '2',
			src: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400',
			alt: 'Elegant updo',
			width: 400,
			height: 600
		},
		{
			id: '3',
			src: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400',
			alt: 'Vibrant color',
			width: 400,
			height: 400
		},
		{
			id: '4',
			src: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
			alt: 'Professional cut',
			width: 400,
			height: 450
		}
	];

	$effect(() => {
		currentTheme = $atelierTheme;
	});

	function removeBadge(index: number) {
		removableBadges = removableBadges.filter((_, i) => i !== index);
	}
</script>

<AtelierThemeProvider>
	{#snippet children()}
		<div class="bg-atelier-bg text-atelier-fg min-h-screen">
			<!-- Phase 3: Navigation Header -->
			<AtelierHeader
				logo="Atelier by Tiffany"
				{menuItems}
				sticky={true}
				hideOnScroll={true}
				blurOnScroll={true}
			/>

			<div class="px-atelier-md py-atelier-xl container mx-auto" style="padding-top: 100px;">
				<header class="mb-atelier-2xl">
					<h1
						class="font-atelier-display mb-atelier-sm atelier-animate-fade-in text-5xl font-light"
					>
						Atelier by Tiffany
					</h1>
					<p class="font-atelier-sans text-atelier-muted atelier-animate-slide-up text-xl">
						Luxury Design System for Picasso Hair Salon
					</p>
				</header>

				<section class="mb-atelier-xl">
					<h2 class="font-atelier-serif mb-atelier-md text-3xl">Theme System</h2>

					<div
						class="bg-atelier-white dark:bg-atelier-black p-atelier-lg shadow-atelier-md atelier-animate-scale-in rounded-lg"
					>
						<div class="mb-atelier-md flex items-center justify-between">
							<h3 class="font-atelier-sans text-lg font-medium">Current Theme: {currentTheme}</h3>
							<button
								onclick={toggleAtelierTheme}
								class="px-atelier-md py-atelier-sm bg-atelier-primary text-atelier-black hover:bg-atelier-primary-hover atelier-transition-base font-atelier-sans rounded-md font-medium"
							>
								Toggle Theme
							</button>
						</div>

						<div class="gap-atelier-sm grid grid-cols-2 md:grid-cols-4">
							<div class="p-atelier-sm text-center">
								<div class="bg-atelier-gold mb-2 h-20 w-full rounded-md"></div>
								<p class="font-atelier-sans text-sm">Elegant Gold</p>
							</div>
							<div class="p-atelier-sm text-center">
								<div class="bg-atelier-rose mb-2 h-20 w-full rounded-md"></div>
								<p class="font-atelier-sans text-sm">Soft Rose</p>
							</div>
							<div class="p-atelier-sm text-center">
								<div class="bg-atelier-burgundy mb-2 h-20 w-full rounded-md"></div>
								<p class="font-atelier-sans text-sm">Deep Burgundy</p>
							</div>
							<div class="p-atelier-sm text-center">
								<div class="bg-atelier-champagne mb-2 h-20 w-full rounded-md"></div>
								<p class="font-atelier-sans text-sm">Champagne</p>
							</div>
						</div>
					</div>
				</section>

				<section class="mb-atelier-xl">
					<h2 class="font-atelier-serif mb-atelier-md text-3xl">Typography</h2>

					<div class="space-y-atelier-md">
						<div
							class="bg-atelier-white dark:bg-atelier-black p-atelier-lg shadow-atelier-md rounded-lg"
						>
							<h3 class="font-atelier-display mb-atelier-sm text-4xl">Display Font</h3>
							<p class="font-atelier-display text-atelier-muted text-lg">
								Cormorant Garamond - Elegant and sophisticated
							</p>
						</div>

						<div
							class="bg-atelier-white dark:bg-atelier-black p-atelier-lg shadow-atelier-md rounded-lg"
						>
							<h3 class="font-atelier-serif mb-atelier-sm text-2xl">Serif Font</h3>
							<p class="font-atelier-serif text-atelier-muted text-lg">
								Playfair Display - Classic and refined
							</p>
						</div>

						<div
							class="bg-atelier-white dark:bg-atelier-black p-atelier-lg shadow-atelier-md rounded-lg"
						>
							<h3 class="font-atelier-sans mb-atelier-sm text-xl font-medium">Sans Serif Font</h3>
							<p class="font-atelier-sans text-atelier-muted">
								Montserrat - Modern and clean for body text
							</p>
						</div>
					</div>
				</section>

				<section class="mb-atelier-xl">
					<h2 class="font-atelier-serif mb-atelier-md text-3xl">Animations</h2>

					<div class="gap-atelier-md grid grid-cols-1 md:grid-cols-3">
						<div
							class="bg-atelier-white dark:bg-atelier-black p-atelier-lg shadow-atelier-md atelier-animate-fade-in rounded-lg"
						>
							<h3 class="font-atelier-sans mb-atelier-sm text-lg font-medium">Fade In</h3>
							<p class="text-atelier-muted">Smooth entrance animation</p>
						</div>

						<div
							class="bg-atelier-white dark:bg-atelier-black p-atelier-lg shadow-atelier-md atelier-animate-scale-in rounded-lg"
							style="animation-delay: 100ms"
						>
							<h3 class="font-atelier-sans mb-atelier-sm text-lg font-medium">Scale In</h3>
							<p class="text-atelier-muted">Elegant scaling effect</p>
						</div>

						<div
							class="bg-atelier-white dark:bg-atelier-black p-atelier-lg shadow-atelier-md atelier-animate-slide-up rounded-lg"
							style="animation-delay: 200ms"
						>
							<h3 class="font-atelier-sans mb-atelier-sm text-lg font-medium">Slide Up</h3>
							<p class="text-atelier-muted">Graceful upward motion</p>
						</div>
					</div>

					<div
						class="mt-atelier-md from-atelier-gold to-atelier-champagne p-atelier-lg text-atelier-black rounded-lg bg-gradient-to-r"
					>
						<div class="atelier-animate-shimmer h-full">
							<h3 class="font-atelier-sans text-lg font-medium">Shimmer Effect</h3>
							<p>Luxury highlight animation</p>
						</div>
					</div>
				</section>

				<section class="mb-atelier-xl">
					<h2 class="font-atelier-serif mb-atelier-md text-3xl">Core Components</h2>

					<!-- Buttons Section -->
					<div class="mb-atelier-lg">
						<h3 class="font-atelier-sans mb-atelier-sm text-xl font-medium">Buttons</h3>
						<div
							class="bg-atelier-white dark:bg-atelier-black p-atelier-lg shadow-atelier-md rounded-lg"
						>
							<div class="mb-atelier-md">
								<h4 class="font-atelier-sans mb-atelier-sm text-atelier-muted text-sm font-medium">
									Variants
								</h4>
								<div class="gap-atelier-sm flex flex-wrap">
									<AtelierButton variant="primary">Primary</AtelierButton>
									<AtelierButton variant="secondary">Secondary</AtelierButton>
									<AtelierButton variant="outline">Outline</AtelierButton>
									<AtelierButton variant="ghost">Ghost</AtelierButton>
									<AtelierButton variant="destructive">Destructive</AtelierButton>
								</div>
							</div>
							<div class="mb-atelier-md">
								<h4 class="font-atelier-sans mb-atelier-sm text-atelier-muted text-sm font-medium">
									Sizes
								</h4>
								<div class="gap-atelier-sm flex flex-wrap items-center">
									<AtelierButton size="sm">Small</AtelierButton>
									<AtelierButton size="md">Medium</AtelierButton>
									<AtelierButton size="lg">Large</AtelierButton>
								</div>
							</div>
							<div>
								<h4 class="font-atelier-sans mb-atelier-sm text-atelier-muted text-sm font-medium">
									States
								</h4>
								<div class="gap-atelier-sm flex flex-wrap">
									<AtelierButton disabled>Disabled</AtelierButton>
									<AtelierButton loading>Loading</AtelierButton>
								</div>
							</div>
						</div>
					</div>

					<!-- Cards Section -->
					<div class="mb-atelier-lg">
						<h3 class="font-atelier-sans mb-atelier-sm text-xl font-medium">Cards</h3>
						<div class="gap-atelier-md grid grid-cols-1 md:grid-cols-3">
							<AtelierCard>
								{#snippet children()}
									<h4 class="font-atelier-serif mb-2 text-xl">Hoverable Card</h4>
									<p class="text-atelier-muted">
										This card lifts on hover with a smooth transition effect.
									</p>
								{/snippet}
							</AtelierCard>
							<AtelierCard hoverable={false}>
								{#snippet children()}
									<h4 class="font-atelier-serif mb-2 text-xl">Static Card</h4>
									<p class="text-atelier-muted">This card doesn't have hover effects.</p>
								{/snippet}
							</AtelierCard>
							<AtelierCard onclick={() => alert('Card clicked!')}>
								{#snippet children()}
									<h4 class="font-atelier-serif mb-2 text-xl">Clickable Card</h4>
									<p class="text-atelier-muted">Click this card to see an action.</p>
								{/snippet}
							</AtelierCard>
						</div>
					</div>

					<!-- Modal Section -->
					<div class="mb-atelier-lg">
						<h3 class="font-atelier-sans mb-atelier-sm text-xl font-medium">Modal</h3>
						<div
							class="bg-atelier-white dark:bg-atelier-black p-atelier-lg shadow-atelier-md rounded-lg"
						>
							<AtelierButton onclick={() => (showModal = true)}>Open Modal</AtelierButton>
							<AtelierButton variant="secondary" onclick={() => atelierModal.open()}>
								Open via Store
							</AtelierButton>
						</div>
					</div>

					<!-- Tooltips Section -->
					<div class="mb-atelier-lg">
						<h3 class="font-atelier-sans mb-atelier-sm text-xl font-medium">Tooltips</h3>
						<div
							class="bg-atelier-white dark:bg-atelier-black p-atelier-lg shadow-atelier-md rounded-lg"
						>
							<div class="gap-atelier-lg flex flex-wrap">
								<AtelierTooltip content="Top tooltip" position="top">
									{#snippet children()}
										<AtelierButton variant="outline">Hover Top</AtelierButton>
									{/snippet}
								</AtelierTooltip>
								<AtelierTooltip content="Bottom tooltip" position="bottom">
									{#snippet children()}
										<AtelierButton variant="outline">Hover Bottom</AtelierButton>
									{/snippet}
								</AtelierTooltip>
								<AtelierTooltip content="Left tooltip" position="left">
									{#snippet children()}
										<AtelierButton variant="outline">Hover Left</AtelierButton>
									{/snippet}
								</AtelierTooltip>
								<AtelierTooltip content="Right tooltip" position="right">
									{#snippet children()}
										<AtelierButton variant="outline">Hover Right</AtelierButton>
									{/snippet}
								</AtelierTooltip>
							</div>
						</div>
					</div>

					<!-- Badges Section -->
					<div class="mb-atelier-lg">
						<h3 class="font-atelier-sans mb-atelier-sm text-xl font-medium">Badges</h3>
						<div
							class="bg-atelier-white dark:bg-atelier-black p-atelier-lg shadow-atelier-md rounded-lg"
						>
							<div class="mb-atelier-md">
								<h4 class="font-atelier-sans mb-atelier-sm text-atelier-muted text-sm font-medium">
									Variants
								</h4>
								<div class="gap-atelier-sm flex flex-wrap">
									<AtelierBadge>Default</AtelierBadge>
									<AtelierBadge variant="success">Success</AtelierBadge>
									<AtelierBadge variant="warning">Warning</AtelierBadge>
									<AtelierBadge variant="error">Error</AtelierBadge>
									<AtelierBadge variant="info">Info</AtelierBadge>
								</div>
							</div>
							<div class="mb-atelier-md">
								<h4 class="font-atelier-sans mb-atelier-sm text-atelier-muted text-sm font-medium">
									Sizes & Shapes
								</h4>
								<div class="gap-atelier-sm flex flex-wrap items-center">
									<AtelierBadge size="sm">Small</AtelierBadge>
									<AtelierBadge size="md">Medium</AtelierBadge>
									<AtelierBadge shape="square">Square</AtelierBadge>
								</div>
							</div>
							<div>
								<h4 class="font-atelier-sans mb-atelier-sm text-atelier-muted text-sm font-medium">
									Closable
								</h4>
								<div class="gap-atelier-sm flex flex-wrap">
									{#each removableBadges as badge, i}
										<AtelierBadge variant="info" closable onclose={() => removeBadge(i)}>
											{badge}
										</AtelierBadge>
									{/each}
								</div>
							</div>
						</div>
					</div>
				</section>

				<!-- Phase 3: Complex Components -->
				<section class="mb-atelier-xl">
					<h2 class="font-atelier-serif mb-atelier-md text-3xl">Phase 3 - Complex Components</h2>

					<!-- Hero Section -->
					<div class="mb-atelier-2xl -mx-atelier-md">
						<h3 class="font-atelier-sans mb-atelier-sm px-atelier-md text-xl font-medium">
							Hero Section
						</h3>
						<HeroSection
							backgroundImage="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1920&h=1080&fit=crop"
							title="Welcome to Atelier"
							subtitle="Experience luxury hair styling at its finest"
							height="medium"
							parallaxSpeed={0.5}
							overlay="gradient"
							cta={{ text: 'Book Now', href: '#', variant: 'primary' }}
							ctaSecondary={{ text: 'Learn More', href: '#', variant: 'outline' }}
						/>
					</div>

					<!-- Service Grid -->
					<div class="mb-atelier-xl">
						<h3 class="font-atelier-sans mb-atelier-sm text-xl font-medium">Service Grid</h3>
						<ServiceGrid
							{services}
							columns={3}
							staggerDelay={100}
							animateOnScroll={true}
							gap="md"
						/>
					</div>

					<!-- Masonry Gallery -->
					<div class="mb-atelier-xl">
						<h3 class="font-atelier-sans mb-atelier-sm text-xl font-medium">Masonry Gallery</h3>
						<MasonryGallery
							images={galleryImages}
							columns={{ mobile: 1, tablet: 2, desktop: 2 }}
							gap={16}
							lightboxEnabled={true}
							animateOnScroll={true}
						/>
					</div>

					<!-- Text Hover Effects -->
					<div class="mb-atelier-xl">
						<h3 class="font-atelier-sans mb-atelier-sm text-xl font-medium">
							Text Hover Highlights
						</h3>
						<div
							class="bg-atelier-white dark:bg-atelier-black p-atelier-lg shadow-atelier-md rounded-lg"
						>
							<div class="space-y-atelier-md">
								<p class="font-atelier-serif text-lg">
									Experience the <TextHoverHighlight
										text="underline effect"
										animationStyle="underline"
									/>
									for subtle emphasis in your content.
								</p>
								<p class="font-atelier-serif text-lg">
									Try the <TextHoverHighlight
										text="background effect"
										animationStyle="background"
										highlightColor="var(--atelier-gold)"
									/>
									for bold statements that stand out.
								</p>
								<p class="font-atelier-serif text-lg">
									See the <TextHoverHighlight
										text="glow effect"
										animationStyle="glow"
										highlightColor="var(--atelier-rose)"
									/>
									for magical touches in your design.
								</p>
								<p class="font-atelier-serif text-lg">
									Watch the <TextHoverHighlight
										text="gradient effect"
										animationStyle="gradient"
										highlightColor="var(--atelier-burgundy)"
									/>
									for smooth color transitions.
								</p>
							</div>
						</div>
					</div>

					<!-- Image Overlays -->
					<div class="mb-atelier-xl">
						<h3 class="font-atelier-sans mb-atelier-sm text-xl font-medium">
							Image Overlay Effects
						</h3>
						<div class="gap-atelier-md grid grid-cols-1 md:grid-cols-2">
							<ImageOverlay
								src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=300&fit=crop"
								alt="Fade overlay example"
								overlayContent="Fade Effect"
								overlayStyle="fade"
							/>
							<ImageOverlay
								src="https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&h=300&fit=crop"
								alt="Slide overlay example"
								overlayContent="Slide Effect"
								overlayStyle="slide"
							/>
							<ImageOverlay
								src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop"
								alt="Zoom overlay example"
								overlayContent="Zoom Effect"
								overlayStyle="zoom"
							/>
							<ImageOverlay
								src="https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=400&h=300&fit=crop"
								alt="Blur overlay example"
								overlayContent="Blur Effect"
								overlayStyle="blur"
							/>
						</div>
					</div>
				</section>

				<!-- Phase 4: Utilities & Forms -->
				<section class="mb-atelier-xl">
					<h2 class="font-atelier-serif mb-atelier-md text-3xl">Phase 4 - Utilities & Forms</h2>

					<!-- Optimized Image -->
					<div class="mb-atelier-xl">
						<h3 class="font-atelier-sans mb-atelier-sm text-xl font-medium">Optimized Image</h3>
						<div class="gap-atelier-md grid grid-cols-1 md:grid-cols-3">
							<div>
								<h4 class="text-atelier-muted mb-2 text-sm">Basic Image</h4>
								<OptimizedImage
									src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=400&h=300&fit=crop"
									alt="Basic salon image"
									class="rounded-lg"
								/>
							</div>
							<div>
								<h4 class="text-atelier-muted mb-2 text-sm">With Placeholder</h4>
								<OptimizedImage
									src="https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&h=300&fit=crop"
									alt="Salon with blur placeholder"
									placeholder="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
									class="rounded-lg"
								/>
							</div>
							<div>
								<h4 class="text-atelier-muted mb-2 text-sm">Eager Loading</h4>
								<OptimizedImage
									src="https://images.unsplash.com/photo-1560869713-7d0a29430803?w=400&h=300&fit=crop"
									alt="Eagerly loaded image"
									loading="eager"
									class="rounded-lg"
								/>
							</div>
						</div>
					</div>

					<!-- Form Components -->
					<div class="mb-atelier-xl">
						<h3 class="font-atelier-sans mb-atelier-sm text-xl font-medium">Form Components</h3>
						<div
							class="bg-atelier-white dark:bg-atelier-black p-atelier-lg shadow-atelier-md rounded-lg"
						>
							<form class="space-y-6" onsubmit={(e) => e.preventDefault()}>
								<div class="grid gap-6 md:grid-cols-2">
									<!-- Input Examples -->
									<div>
										<h4 class="text-atelier-muted mb-4 text-sm font-medium">Text Inputs</h4>
										<div class="space-y-4">
											<AtelierInput
												bind:value={formData.firstName}
												label="First Name"
												placeholder="Enter your first name"
												required
											/>
											<AtelierInput
												bind:value={formData.email}
												type="email"
												label="Email Address"
												placeholder="your@email.com"
												error={formData.email && !formData.email.includes('@')
													? 'Please enter a valid email'
													: ''}
											/>
											<AtelierInput value="Success State" label="Validated Input" success={true} />
											<AtelierInput value="Disabled" label="Disabled Input" disabled />
										</div>
									</div>

									<!-- Select Example -->
									<div>
										<h4 class="text-atelier-muted mb-4 text-sm font-medium">Select Dropdown</h4>
										<div class="space-y-4">
											<AtelierSelect
												bind:value={formData.service}
												options={serviceOptions}
												label="Choose Service"
												placeholder="Select a service"
												required
											/>
											<AtelierSelect
												options={serviceOptions}
												label="Searchable Select"
												searchable={true}
												placeholder="Search services..."
											/>
											<AtelierSelect
												options={serviceOptions}
												label="Multiple Selection"
												multiple={true}
												placeholder="Select multiple services"
											/>
											<AtelierSelect
												options={[
													{ value: 'morning', label: 'Morning (9AM - 12PM)' },
													{ value: 'afternoon', label: 'Afternoon (12PM - 5PM)' },
													{ value: 'evening', label: 'Evening (5PM - 8PM)', disabled: true }
												]}
												label="Time Slot"
												error="Please select an available time"
											/>
										</div>
									</div>
								</div>

								<!-- Textarea Example -->
								<div>
									<h4 class="text-atelier-muted mb-4 text-sm font-medium">Textarea</h4>
									<div class="space-y-4">
										<AtelierTextarea
											bind:value={formData.message}
											label="Special Requests"
											placeholder="Tell us about your styling preferences..."
											rows={4}
											maxLength={200}
										/>
										<AtelierTextarea
											value="This textarea has auto-resize disabled and more rows"
											label="Fixed Size"
											autoResize={false}
											rows={6}
										/>
									</div>
								</div>

								<!-- Form Actions -->
								<div class="flex gap-4 pt-4">
									<AtelierButton type="submit" variant="primary">Submit Form</AtelierButton>
									<AtelierButton
										type="button"
										variant="outline"
										onclick={() => {
											formData.firstName = '';
											formData.email = '';
											formData.service = '';
											formData.message = '';
										}}
									>
										Reset
									</AtelierButton>
								</div>
							</form>
						</div>
					</div>
				</section>

				<footer class="text-atelier-muted pt-atelier-xl border-atelier-border border-t text-center">
					<p class="font-atelier-sans">Phase 1 Complete - Theme Foundation Ready</p>
					<p class="mt-2 text-sm">✅ Phase 2 Complete - Core Components Ready</p>
					<p class="mt-2 text-sm">✅ Phase 3 Complete - Complex Components Ready</p>
					<p class="mt-2 text-sm">✅ Phase 4 Complete - Utilities & Forms Ready</p>
				</footer>
			</div>

			<!-- ScrollToTop Component -->
			<ScrollToTop position="bottom-right" size="medium" />
		</div>

		<!-- Modal Component -->
		<AtelierModal
			open={showModal}
			onclose={() => (showModal = false)}
			title="Atelier Modal"
			description="Experience our elegant modal component with smooth animations."
		>
			{#snippet children()}
				<div class="space-y-4">
					<p class="font-atelier-sans">
						This modal demonstrates focus management, keyboard navigation, and beautiful
						transitions.
					</p>
					<div class="bg-atelier-gold/10 rounded-lg p-4">
						<p class="font-atelier-serif text-lg">Press ESC to close</p>
					</div>
				</div>
			{/snippet}
			{#snippet actions()}
				<AtelierButton variant="ghost" onclick={() => (showModal = false)}>Cancel</AtelierButton>
				<AtelierButton onclick={() => (showModal = false)}>Confirm</AtelierButton>
			{/snippet}
		</AtelierModal>
	{/snippet}
</AtelierThemeProvider>
