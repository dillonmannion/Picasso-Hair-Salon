<script lang="ts">
	import { ChevronUp } from 'lucide-svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface ScrollToTopProps extends HTMLButtonAttributes {
		threshold?: number;
		position?: 'bottom-right' | 'bottom-left';
		size?: 'small' | 'medium' | 'large';
		ariaLabel?: string;
		class?: string;
	}

	let {
		threshold = 300,
		position = 'bottom-right',
		size = 'medium',
		ariaLabel = 'Scroll to top',
		class: className = '',
		...restProps
	}: ScrollToTopProps = $props();

	let isVisible = $state(false);
	let button: HTMLButtonElement;

	const sizeClasses = {
		small: 'w-10 h-10',
		medium: 'w-12 h-12',
		large: 'w-14 h-14'
	};

	const iconSizes = {
		small: 20,
		medium: 24,
		large: 28
	};

	const positionClasses = {
		'bottom-right': 'right-4 sm:right-6 lg:right-8',
		'bottom-left': 'left-4 sm:left-6 lg:left-8'
	};

	function handleScroll() {
		isVisible = window.scrollY > threshold;
	}

	function scrollToTop() {
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
		// Return focus to the button after scrolling
		button?.focus();
	}

	$effect(() => {
		// Check initial scroll position
		handleScroll();

		// Add scroll listener with passive flag for better performance
		const scrollHandler = () => handleScroll();
		window.addEventListener('scroll', scrollHandler, { passive: true });

		return () => {
			window.removeEventListener('scroll', scrollHandler);
		};
	});
</script>

<button
	bind:this={button}
	onclick={scrollToTop}
	aria-label={ariaLabel}
	class="atelier-scroll-to-top bg-atelier-gold text-atelier-dark focus:ring-atelier-gold/30 fixed bottom-20 z-50
		rounded-full shadow-lg transition-all duration-300 hover:scale-110
		hover:shadow-xl focus:ring-4 focus:outline-none
		disabled:cursor-not-allowed disabled:opacity-50
		{sizeClasses[size]} {positionClasses[position]} {className}
		{isVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-16 opacity-0'}"
	disabled={!isVisible}
	{...restProps}
>
	<ChevronUp size={iconSizes[size]} class="mx-auto" />
</button>

<style>
	/* Progressive enhancement: Works without JS using CSS anchor */
	@supports (scroll-behavior: smooth) {
		:global(html) {
			scroll-behavior: smooth;
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.atelier-scroll-to-top {
			transition-duration: 0.01ms !important;
		}
		:global(html) {
			scroll-behavior: auto !important;
		}
	}

	/* Dark mode adjustments */
	:global(.dark) .atelier-scroll-to-top {
		@apply bg-atelier-cream text-atelier-dark;
	}

	/* Print styles - hide the button */
	@media print {
		.atelier-scroll-to-top {
			display: none !important;
		}
	}
</style>
