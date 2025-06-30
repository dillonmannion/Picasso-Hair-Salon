<script lang="ts">
	import { onMount } from 'svelte';
	import AtelierButton from '../AtelierButton.svelte';

	interface CTAConfig {
		text: string;
		href: string;
		variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
		size?: 'sm' | 'md' | 'lg';
	}

	interface Props {
		backgroundImage: string;
		title: string;
		subtitle?: string;
		height?: 'full' | 'large' | 'medium';
		parallaxSpeed?: number;
		overlay?: 'light' | 'dark' | 'gradient' | 'none';
		cta?: CTAConfig;
		ctaSecondary?: CTAConfig;
		class?: string;
		loading?: 'eager' | 'lazy';
		alt?: string;
	}

	let {
		backgroundImage,
		title,
		subtitle,
		height = 'full',
		parallaxSpeed = 0.5,
		overlay = 'gradient',
		cta,
		ctaSecondary,
		class: className = '',
		loading = 'eager',
		alt = 'Hero background'
	}: Props = $props();

	let heroElement: HTMLElement;
	let imageElement: HTMLElement;
	let scrollY = $state(0);
	let isVisible = $state(false);
	let imageLoaded = $state(false);
	let rafId: number;

	const heightClasses = {
		full: 'min-h-screen',
		large: 'min-h-[80vh]',
		medium: 'min-h-[60vh]'
	};

	const overlayClasses = {
		light: 'atelier-hero__overlay--light',
		dark: 'atelier-hero__overlay--dark',
		gradient: 'atelier-hero__overlay--gradient',
		none: ''
	};

	function handleScroll() {
		if (!isVisible || rafId) return;

		rafId = requestAnimationFrame(() => {
			const rect = heroElement.getBoundingClientRect();
			const windowHeight = window.innerHeight;

			if (rect.bottom > 0 && rect.top < windowHeight) {
				scrollY = window.scrollY;
			}

			rafId = 0;
		});
	}

	function handleImageLoad() {
		imageLoaded = true;
	}

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					isVisible = entry.isIntersecting;
				});
			},
			{ threshold: 0, rootMargin: '50px' }
		);

		if (heroElement) {
			observer.observe(heroElement);
		}

		window.addEventListener('scroll', handleScroll, { passive: true });

		// Preload image for eager loading
		if (loading === 'eager') {
			const img = new Image();
			img.src = backgroundImage;
			img.onload = handleImageLoad;
		}

		return () => {
			observer.disconnect();
			window.removeEventListener('scroll', handleScroll);
			if (rafId) cancelAnimationFrame(rafId);
		};
	});

	const parallaxOffset = $derived(scrollY * parallaxSpeed);
	const transform = $derived(`translate3d(0, ${parallaxOffset}px, 0)`);
</script>

<section
	bind:this={heroElement}
	class="atelier-hero {heightClasses[height]} {className}"
	role="banner"
	aria-label="Hero section"
>
	<div
		bind:this={imageElement}
		class="atelier-hero__image-container"
		class:atelier-hero__image-container--loaded={imageLoaded}
	>
		{#if loading === 'lazy' && isVisible}
			<img
				src={backgroundImage}
				{alt}
				class="atelier-hero__image"
				style:transform
				onload={handleImageLoad}
				loading="lazy"
			/>
		{:else if loading === 'eager'}
			<img
				src={backgroundImage}
				{alt}
				class="atelier-hero__image"
				style:transform
				onload={handleImageLoad}
			/>
		{/if}

		{#if overlay !== 'none'}
			<div class="atelier-hero__overlay {overlayClasses[overlay]}"></div>
		{/if}
	</div>

	<div class="atelier-hero__content">
		<div class="atelier-hero__content-inner">
			<h1 class="atelier-hero__title">
				{title}
			</h1>

			{#if subtitle}
				<p class="atelier-hero__subtitle">
					{subtitle}
				</p>
			{/if}

			{#if cta || ctaSecondary}
				<div class="atelier-hero__actions">
					{#if cta}
						<AtelierButton
							href={cta.href}
							variant={cta.variant || 'primary'}
							size={cta.size || 'lg'}
						>
							{cta.text}
						</AtelierButton>
					{/if}

					{#if ctaSecondary}
						<AtelierButton
							href={ctaSecondary.href}
							variant={ctaSecondary.variant || 'outline'}
							size={ctaSecondary.size || 'lg'}
						>
							{ctaSecondary.text}
						</AtelierButton>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</section>

<style>
	.atelier-hero {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		width: 100%;
	}

	.atelier-hero__image-container {
		position: absolute;
		inset: 0;
		opacity: 0;
		transition: opacity 1s ease-out;
	}

	.atelier-hero__image-container--loaded {
		opacity: 1;
	}

	.atelier-hero__image {
		position: absolute;
		inset: -10%;
		width: 120%;
		height: 120%;
		object-fit: cover;
		will-change: transform;

		@media (prefers-reduced-motion: reduce) {
			transform: none !important;
		}
	}

	.atelier-hero__overlay {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.atelier-hero__overlay--light {
		background: rgba(255, 255, 255, 0.3);
	}

	.atelier-hero__overlay--dark {
		background: rgba(0, 0, 0, 0.4);
	}

	.atelier-hero__overlay--gradient {
		background: linear-gradient(
			to bottom,
			rgba(0, 0, 0, 0.1) 0%,
			rgba(0, 0, 0, 0.3) 50%,
			rgba(0, 0, 0, 0.5) 100%
		);

		@media (prefers-color-scheme: dark) {
			background: linear-gradient(
				to bottom,
				rgba(0, 0, 0, 0.3) 0%,
				rgba(0, 0, 0, 0.5) 50%,
				rgba(0, 0, 0, 0.7) 100%
			);
		}
	}

	.atelier-hero__content {
		position: relative;
		z-index: 1;
		width: 100%;
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
		text-align: center;

		@media (min-width: 768px) {
			padding: 3rem;
		}
	}

	.atelier-hero__content-inner {
		animation: atelier-hero-fade-up 1s ease-out 0.3s both;

		@media (prefers-reduced-motion: reduce) {
			animation: none;
			opacity: 1;
		}
	}

	.atelier-hero__title {
		font-size: clamp(2.5rem, 8vw, 5rem);
		font-weight: 300;
		font-family: var(--atelier-font-display, var(--atelier-font-primary, system-ui));
		letter-spacing: -0.03em;
		line-height: 1.1;
		margin: 0 0 1.5rem;
		color: white;
		text-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
	}

	.atelier-hero__subtitle {
		font-size: clamp(1.125rem, 3vw, 1.5rem);
		font-weight: 400;
		line-height: 1.5;
		margin: 0 0 2.5rem;
		color: rgba(255, 255, 255, 0.9);
		text-shadow: 0 1px 10px rgba(0, 0, 0, 0.2);
		max-width: 700px;
		margin-left: auto;
		margin-right: auto;
	}

	.atelier-hero__actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;

		@media (max-width: 640px) {
			flex-direction: column;
			align-items: center;

			:global(.atelier-button) {
				width: 100%;
				max-width: 300px;
			}
		}
	}

	@keyframes atelier-hero-fade-up {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (prefers-color-scheme: dark) {
		.atelier-hero__title {
			color: white;
		}

		.atelier-hero__subtitle {
			color: rgba(255, 255, 255, 0.85);
		}
	}
</style>
