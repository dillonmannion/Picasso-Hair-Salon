<script lang="ts">
	import { onMount } from 'svelte';
	import { setupPageTransitions, addViewTransitionNames } from './transitions';
	import { navigating } from '$app/stores';
	import { fade } from 'svelte/transition';
	import AtelierLoader from '../feedback/AtelierLoader.svelte';

	let isTransitioning = $state(false);

	$effect(() => {
		isTransitioning = !!$navigating;
	});

	onMount(() => {
		setupPageTransitions();
		addViewTransitionNames();
	});
</script>

{#if isTransitioning}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
		transition:fade={{ duration: 150 }}
	>
		<AtelierLoader size="lg" variant="pulse" />
	</div>
{/if}

<style>
	:global(.atelier-page-entering) {
		animation: atelier-page-enter 350ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
	}

	:global(.atelier-page-leaving) {
		animation: atelier-page-leave 350ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
	}

	@keyframes atelier-page-enter {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes atelier-page-leave {
		from {
			opacity: 1;
			transform: translateY(0);
		}
		to {
			opacity: 0;
			transform: translateY(-20px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.atelier-page-entering),
		:global(.atelier-page-leaving) {
			animation: none !important;
		}
	}
</style>