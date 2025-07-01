<script lang="ts">
	import { onMount } from 'svelte';

	interface GalleryImage {
		id: string | number;
		src: string;
		alt: string;
		width?: number;
		height?: number;
		caption?: string;
		category?: string;
	}

	interface ColumnConfig {
		mobile: number;
		tablet: number;
		desktop: number;
	}

	interface Props {
		images: GalleryImage[];
		columns?: ColumnConfig;
		gap?: number;
		lightboxEnabled?: boolean;
		animateOnScroll?: boolean;
		class?: string;
	}

	let {
		images,
		columns = { mobile: 1, tablet: 2, desktop: 3 },
		gap = 16,
		lightboxEnabled = false,
		animateOnScroll = true,
		class: className = ''
	}: Props = $props();

	let galleryElement: HTMLElement;
	let columnCount = $state(columns.desktop);
	let imageColumns = $state<GalleryImage[][]>([]);
	let loadedImages = $state<Set<string | number>>(new Set());
	let visibleImages = $state<Set<string | number>>(new Set());

	function updateColumns() {
		const width = window.innerWidth;
		if (width < 640) {
			columnCount = columns.mobile;
		} else if (width < 1024) {
			columnCount = columns.tablet;
		} else {
			columnCount = columns.desktop;
		}
		distributeImages();
	}

	function distributeImages() {
		const cols: GalleryImage[][] = Array.from({ length: columnCount }, () => []);
		const columnHeights: number[] = new Array(columnCount).fill(0);

		images.forEach((image) => {
			// Find shortest column
			const shortestColumn = columnHeights.indexOf(Math.min(...columnHeights));
			cols[shortestColumn]?.push(image);

			// Estimate height based on aspect ratio if provided
			if (image.width && image.height) {
				columnHeights[shortestColumn] += image.height / image.width;
			} else {
				columnHeights[shortestColumn] += 1; // Default aspect ratio
			}
		});

		imageColumns = cols;
	}

	function handleImageLoad(imageId: string | number) {
		loadedImages.add(imageId);
		loadedImages = loadedImages; // Trigger reactivity
	}

	function handleImageClick(image: GalleryImage, event: MouseEvent) {
		if (lightboxEnabled) {
			event.preventDefault();
			// Dispatch custom event for lightbox integration
			galleryElement.dispatchEvent(
				new CustomEvent('atelier:gallery:open', {
					detail: { image, images },
					bubbles: true
				})
			);
		}
	}

	function handleKeyDown(event: KeyboardEvent, image: GalleryImage) {
		if (lightboxEnabled && (event.key === 'Enter' || event.key === ' ')) {
			event.preventDefault();
			handleImageClick(image, new MouseEvent('click'));
		}
	}

	function handleGalleryClick(event: MouseEvent, image: GalleryImage) {
		if (lightboxEnabled) {
			handleImageClick(image, event);
		}
	}

	function handleGalleryKeyDown(event: KeyboardEvent, image: GalleryImage) {
		if (lightboxEnabled) {
			handleKeyDown(event, image);
		}
	}

	onMount(() => {
		updateColumns();

		const handleResize = () => {
			updateColumns();
		};

		window.addEventListener('resize', handleResize);

		if (animateOnScroll) {
			const observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							const id = entry.target.getAttribute('data-image-id');
							if (id) {
								visibleImages.add(id.includes('-') ? id : Number(id));
							}
						}
					});
				},
				{
					threshold: 0.1,
					rootMargin: '50px'
				}
			);

			const imageElements = galleryElement.querySelectorAll('.atelier-gallery__item');
			imageElements.forEach((el) => observer.observe(el));

			return () => {
				window.removeEventListener('resize', handleResize);
				observer.disconnect();
			};
		} else {
			// Show all images immediately
			images.forEach((img) => visibleImages.add(img.id));

			return () => {
				window.removeEventListener('resize', handleResize);
			};
		}
	});

	$effect(() => {
		if (images) {
			distributeImages();
		}
	});
</script>

<div
	bind:this={galleryElement}
	class="atelier-gallery {className}"
	style:--atelier-gallery-gap="{gap}px"
	role="region"
	aria-label="Image gallery"
>
	<div class="atelier-gallery__container">
		{#each imageColumns as column, columnIndex (columnIndex)}
			<div class="atelier-gallery__column" data-column={columnIndex}>
				{#each column as image (image.id)}
					<figure
						class="atelier-gallery__item"
						class:atelier-gallery__item--visible={!animateOnScroll || visibleImages.has(image.id)}
						class:atelier-gallery__item--loaded={loadedImages.has(image.id)}
						class:atelier-gallery__item--clickable={lightboxEnabled}
						data-image-id={image.id}
						data-lightbox={lightboxEnabled ? 'gallery' : undefined}
						data-src={lightboxEnabled ? image.src : undefined}
						data-alt={lightboxEnabled ? image.alt : undefined}
						role={lightboxEnabled ? 'button' : undefined}
						tabindex={lightboxEnabled ? 0 : undefined}
						onclick={(e) => handleGalleryClick(e, image)}
						onkeydown={(e) => handleGalleryKeyDown(e, image)}
					>
						<div class="atelier-gallery__image-wrapper">
							<img
								src={image.src}
								alt={image.alt}
								width={image.width}
								height={image.height}
								class="atelier-gallery__image"
								loading="lazy"
								onload={() => handleImageLoad(image.id)}
							/>
							<div class="atelier-gallery__overlay">
								{#if lightboxEnabled}
									<span class="atelier-gallery__zoom-icon" aria-hidden="true">
										<svg
											width="24"
											height="24"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
										>
											<circle cx="11" cy="11" r="8" />
											<path d="m21 21-4.35-4.35" />
											<path d="M11 8v6M8 11h6" />
										</svg>
									</span>
								{/if}
							</div>
						</div>
						{#if image.caption}
							<figcaption class="atelier-gallery__caption">
								{image.caption}
							</figcaption>
						{/if}
					</figure>
				{/each}
			</div>
		{/each}
	</div>
</div>

<style>
	.atelier-gallery {
		width: 100%;
		padding: var(--atelier-gallery-gap);
	}

	.atelier-gallery__container {
		display: grid;
		grid-template-columns: repeat(var(--columns, 3), 1fr);
		gap: var(--atelier-gallery-gap);
		align-items: start;

		@media (max-width: 639px) {
			--columns: 1;
		}

		@media (min-width: 640px) and (max-width: 1023px) {
			--columns: 2;
		}

		@media (min-width: 1024px) {
			--columns: 3;
		}
	}

	.atelier-gallery__column {
		display: flex;
		flex-direction: column;
		gap: var(--atelier-gallery-gap);
	}

	.atelier-gallery__item {
		position: relative;
		margin: 0;
		opacity: 0;
		transform: translateY(20px);
		transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);

		@media (prefers-reduced-motion: reduce) {
			transition: none;
			opacity: 1;
			transform: none;
		}
	}

	.atelier-gallery__item--visible {
		opacity: 1;
		transform: translateY(0);
	}

	.atelier-gallery__item--clickable {
		cursor: zoom-in;

		&:focus {
			outline: 2px solid var(--atelier-focus-ring, #3b82f6);
			outline-offset: 2px;
			border-radius: var(--atelier-radius-md, 8px);
		}
	}

	.atelier-gallery__image-wrapper {
		position: relative;
		overflow: hidden;
		border-radius: var(--atelier-radius-md, 8px);
		background: var(--atelier-bg-muted, #f5f5f5);

		@media (prefers-color-scheme: dark) {
			background: var(--atelier-bg-muted-dark, #2a2a2a);
		}
	}

	.atelier-gallery__image {
		display: block;
		width: 100%;
		height: auto;
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		opacity: 0;

		.atelier-gallery__item--loaded & {
			opacity: 1;
		}

		.atelier-gallery__item--clickable:hover & {
			transform: scale(1.05);
		}
	}

	.atelier-gallery__overlay {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0);
		transition: background 0.3s ease;
		pointer-events: none;

		.atelier-gallery__item--clickable:hover & {
			background: rgba(0, 0, 0, 0.4);
		}
	}

	.atelier-gallery__zoom-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		background: rgba(255, 255, 255, 0.9);
		border-radius: 50%;
		color: var(--atelier-text-primary, #1a1a1a);
		opacity: 0;
		transform: scale(0.8);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

		.atelier-gallery__item--clickable:hover & {
			opacity: 1;
			transform: scale(1);
		}

		@media (prefers-color-scheme: dark) {
			background: rgba(0, 0, 0, 0.8);
			color: var(--atelier-text-primary-dark, #f5f5f5);
		}
	}

	.atelier-gallery__caption {
		margin-top: 0.75rem;
		font-size: 0.875rem;
		line-height: 1.5;
		color: var(--atelier-text-secondary, #666);
		text-align: center;

		@media (prefers-color-scheme: dark) {
			color: var(--atelier-text-secondary-dark, #a0a0a0);
		}
	}

	/* Loading skeleton */
	.atelier-gallery__image-wrapper::before {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(
			90deg,
			var(--atelier-bg-muted, #f5f5f5) 25%,
			var(--atelier-bg-muted-light, #fafafa) 50%,
			var(--atelier-bg-muted, #f5f5f5) 75%
		);
		background-size: 200% 100%;
		animation: atelier-gallery-skeleton 1.5s linear infinite;
		opacity: 1;
		transition: opacity 0.3s ease;

		.atelier-gallery__item--loaded & {
			opacity: 0;
			animation: none;
		}

		@media (prefers-color-scheme: dark) {
			background: linear-gradient(
				90deg,
				var(--atelier-bg-muted-dark, #2a2a2a) 25%,
				var(--atelier-bg-muted-dark-light, #333) 50%,
				var(--atelier-bg-muted-dark, #2a2a2a) 75%
			);
		}
	}

	@keyframes atelier-gallery-skeleton {
		0% {
			background-position: -200% 0;
		}
		100% {
			background-position: 200% 0;
		}
	}
</style>
