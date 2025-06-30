<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		src: string;
		alt: string;
		overlayContent: string | Snippet;
		overlayStyle?: 'fade' | 'slide' | 'zoom' | 'blur';
		overlayPosition?: 'center' | 'bottom' | 'top';
		aspectRatio?: string;
		loading?: 'eager' | 'lazy';
		class?: string;
	}

	let {
		src,
		alt,
		overlayContent,
		overlayStyle = 'fade',
		overlayPosition = 'center',
		aspectRatio = '16/9',
		loading = 'lazy',
		class: className = ''
	}: Props = $props();

	let isHovered = $state(false);
	let imageLoaded = $state(false);

	const overlayStyleClasses = {
		fade: 'atelier-image-overlay--fade',
		slide: 'atelier-image-overlay--slide',
		zoom: 'atelier-image-overlay--zoom',
		blur: 'atelier-image-overlay--blur'
	};

	const overlayPositionClasses = {
		center: 'atelier-image-overlay__content--center',
		bottom: 'atelier-image-overlay__content--bottom',
		top: 'atelier-image-overlay__content--top'
	};

	function handleImageLoad() {
		imageLoaded = true;
	}

	function handleMouseEnter() {
		isHovered = true;
	}

	function handleMouseLeave() {
		isHovered = false;
	}

	function handleFocus() {
		isHovered = true;
	}

	function handleBlur() {
		isHovered = false;
	}
</script>

<figure
	class="atelier-image-overlay {overlayStyleClasses[overlayStyle]} {className}"
	class:atelier-image-overlay--hovered={isHovered}
	class:atelier-image-overlay--loaded={imageLoaded}
	style:aspect-ratio={aspectRatio}
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
	onfocus={handleFocus}
	onblur={handleBlur}
	tabindex="0"
	role="img"
	aria-label={alt}
>
	<div class="atelier-image-overlay__image-wrapper">
		<img {src} {alt} {loading} class="atelier-image-overlay__image" onload={handleImageLoad} />
	</div>

	<div class="atelier-image-overlay__overlay" aria-hidden={!isHovered}>
		<div class="atelier-image-overlay__content {overlayPositionClasses[overlayPosition]}">
			{#if typeof overlayContent === 'string'}
				<p class="atelier-image-overlay__text">{overlayContent}</p>
			{:else}
				{@render overlayContent()}
			{/if}
		</div>
	</div>
</figure>

<style>
	.atelier-image-overlay {
		position: relative;
		display: block;
		margin: 0;
		overflow: hidden;
		border-radius: var(--atelier-radius-md, 8px);
		background: var(--atelier-bg-muted, #f5f5f5);
		cursor: pointer;
		isolation: isolate;

		@media (prefers-color-scheme: dark) {
			background: var(--atelier-bg-muted-dark, #2a2a2a);
		}

		&:focus {
			outline: 2px solid var(--atelier-focus-ring, #3b82f6);
			outline-offset: 2px;
		}

		&:focus:not(:focus-visible) {
			outline: none;
		}
	}

	.atelier-image-overlay__image-wrapper {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	.atelier-image-overlay__image {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
		opacity: 0;

		.atelier-image-overlay--loaded & {
			opacity: 1;
		}

		@media (prefers-reduced-motion: reduce) {
			transition: opacity 0.3s ease;
		}
	}

	.atelier-image-overlay__overlay {
		position: absolute;
		inset: 0;
		display: flex;
		background: rgba(0, 0, 0, 0.6);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		pointer-events: none;

		@media (prefers-reduced-motion: reduce) {
			transition: opacity 0.3s ease;
		}
	}

	.atelier-image-overlay__content {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		padding: 1.5rem;
		color: white;
		text-align: center;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

		@media (prefers-reduced-motion: reduce) {
			transition: opacity 0.3s ease;
		}
	}

	.atelier-image-overlay__content--center {
		align-items: center;
	}

	.atelier-image-overlay__content--bottom {
		align-items: flex-end;
	}

	.atelier-image-overlay__content--top {
		align-items: flex-start;
	}

	.atelier-image-overlay__text {
		font-size: 1.125rem;
		font-weight: 500;
		line-height: 1.5;
		margin: 0;
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
	}

	/* Fade style */
	.atelier-image-overlay--fade {
		.atelier-image-overlay__overlay {
			opacity: 0;
		}

		&.atelier-image-overlay--hovered .atelier-image-overlay__overlay {
			opacity: 1;
		}
	}

	/* Slide style */
	.atelier-image-overlay--slide {
		.atelier-image-overlay__overlay {
			opacity: 0;
			transform: translateY(100%);
		}

		&.atelier-image-overlay--hovered .atelier-image-overlay__overlay {
			opacity: 1;
			transform: translateY(0);
		}

		.atelier-image-overlay__content--top & .atelier-image-overlay__overlay {
			transform: translateY(-100%);
		}

		&.atelier-image-overlay--hovered
			.atelier-image-overlay__content--top
			.atelier-image-overlay__overlay {
			transform: translateY(0);
		}
	}

	/* Zoom style */
	.atelier-image-overlay--zoom {
		.atelier-image-overlay__overlay {
			opacity: 0;
		}

		.atelier-image-overlay__content {
			transform: scale(0.8);
			opacity: 0;
		}

		&.atelier-image-overlay--hovered {
			.atelier-image-overlay__overlay {
				opacity: 1;
			}

			.atelier-image-overlay__content {
				transform: scale(1);
				opacity: 1;
			}

			.atelier-image-overlay__image {
				transform: scale(1.1);
			}
		}
	}

	/* Blur style */
	.atelier-image-overlay--blur {
		.atelier-image-overlay__overlay {
			opacity: 0;
			backdrop-filter: blur(0px);
			-webkit-backdrop-filter: blur(0px);
			background: rgba(0, 0, 0, 0.2);
		}

		.atelier-image-overlay__content {
			opacity: 0;
			transform: translateY(10px);
		}

		&.atelier-image-overlay--hovered {
			.atelier-image-overlay__overlay {
				opacity: 1;
				backdrop-filter: blur(8px);
				-webkit-backdrop-filter: blur(8px);
				background: rgba(0, 0, 0, 0.3);
			}

			.atelier-image-overlay__content {
				opacity: 1;
				transform: translateY(0);
			}
		}
	}

	/* Loading skeleton */
	.atelier-image-overlay::before {
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
		animation: atelier-overlay-skeleton 1.5s linear infinite;
		opacity: 1;
		transition: opacity 0.3s ease;
		z-index: -1;

		.atelier-image-overlay--loaded & {
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

	@keyframes atelier-overlay-skeleton {
		0% {
			background-position: -200% 0;
		}
		100% {
			background-position: 200% 0;
		}
	}
</style>
