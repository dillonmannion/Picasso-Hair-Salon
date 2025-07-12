<script lang="ts">
	import { onMount } from 'svelte';
	
	let isVisible = $state(false);
	const SCROLL_THRESHOLD_PX = 300;
	
	let scrollTimeoutId: number | undefined;
	
	function updateVisibility() {
		isVisible = window.scrollY > SCROLL_THRESHOLD_PX;
	}
	
	function handleScroll() {
		if (scrollTimeoutId !== undefined) {
			clearTimeout(scrollTimeoutId);
		}
		
		scrollTimeoutId = window.setTimeout(updateVisibility, 10);
	}
	
	function scrollToTop() {
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
	}
	
	onMount(() => {
		window.addEventListener('scroll', handleScroll, { passive: true });
		updateVisibility();
		
		return () => {
			window.removeEventListener('scroll', handleScroll);
			if (scrollTimeoutId !== undefined) {
				clearTimeout(scrollTimeoutId);
			}
		};
	});
</script>

{#if isVisible}
	<button
		onclick={scrollToTop}
		aria-label="Scroll to top"
		class="fixed bottom-6 right-6 z-50 bg-primary text-white rounded-full shadow-lg hover:bg-primary-dark hover:shadow-xl transition-opacity duration-300 p-4"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-6 w-6"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M5 10l7-7m0 0l7 7m-7-7v18"
			/>
		</svg>
	</button>
{/if}