<script lang="ts">
	import { onMount } from 'svelte';

	interface OptimizedImageProps {
		src: string;
		alt: string;
		srcset?: string;
		sizes?: string;
		loading?: 'lazy' | 'eager';
		placeholder?: string;
		width?: number;
		height?: number;
		class?: string;
		style?: string;
	}

	let {
		src,
		alt,
		srcset,
		sizes,
		loading = 'lazy',
		placeholder,
		width,
		height,
		class: className = '',
		style = '',
		...restProps
	}: OptimizedImageProps = $props();

	let imageElement: HTMLImageElement;
	let isIntersecting = $state(false);
	let isLoaded = $state(false);
	let hasError = $state(false);

	// Use native lazy loading if supported, otherwise use IntersectionObserver
	const supportsNativeLazyLoading =
		typeof HTMLImageElement !== 'undefined' && 'loading' in HTMLImageElement.prototype;

	function handleLoad() {
		isLoaded = true;
		hasError = false;
	}

	function handleError() {
		hasError = true;
		isLoaded = true;
	}

	onMount(() => {
		// If native lazy loading is supported or loading is eager, no need for IntersectionObserver
		if (supportsNativeLazyLoading || loading === 'eager') {
			return;
		}

		// Fallback to IntersectionObserver for browsers without native lazy loading
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						isIntersecting = true;
						observer.unobserve(entry.target);
					}
				});
			},
			{
				// Start loading 50px before the image enters viewport
				rootMargin: '50px'
			}
		);

		if (imageElement) {
			observer.observe(imageElement);
		}

		return () => {
			if (imageElement) {
				observer.unobserve(imageElement);
			}
		};
	});

	// Determine if we should load the image
	$: shouldLoad = loading === 'eager' || supportsNativeLazyLoading || isIntersecting;

	// Build the style string
	$: computedStyle = [style, width ? `width: ${width}px` : '', height ? `height: ${height}px` : '']
		.filter(Boolean)
		.join('; ');
</script>

<div class="atelier-optimized-image relative overflow-hidden {className}" style={computedStyle}>
	<!-- Placeholder/blur-up effect -->
	{#if placeholder && !isLoaded}
		<img
			src={placeholder}
			alt=""
			aria-hidden="true"
			class="absolute inset-0 h-full w-full scale-110 object-cover blur-lg filter transition-opacity duration-300 {isLoaded
				? 'opacity-0'
				: 'opacity-100'}"
		/>
	{/if}

	<!-- Loading skeleton -->
	{#if !placeholder && !isLoaded && !hasError}
		<div
			class="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800"
			aria-hidden="true"
		></div>
	{/if}

	<!-- Error state -->
	{#if hasError}
		<div
			class="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
			role="img"
			aria-label={alt}
		>
			<svg
				width="48"
				height="48"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
				class="opacity-50"
			>
				<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
				<circle cx="8.5" cy="8.5" r="1.5"></circle>
				<polyline points="21 15 16 10 5 21"></polyline>
			</svg>
		</div>
	{/if}

	<!-- Main image -->
	<img
		bind:this={imageElement}
		src={shouldLoad ? src : undefined}
		{srcset}
		{sizes}
		{alt}
		{width}
		{height}
		loading={supportsNativeLazyLoading ? loading : undefined}
		onload={handleLoad}
		onerror={handleError}
		class="h-full w-full object-cover transition-opacity duration-300 {isLoaded && !hasError
			? 'opacity-100'
			: 'opacity-0'}"
		{...restProps}
	/>
</div>

<style>
	/* Ensure smooth transitions */
	.atelier-optimized-image img {
		will-change: opacity;
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.atelier-optimized-image img,
		.atelier-optimized-image div {
			transition-duration: 0.01ms !important;
		}
	}

	/* Print optimization */
	@media print {
		.atelier-optimized-image div[aria-hidden='true'] {
			display: none !important;
		}
	}
</style>
