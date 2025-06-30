<script lang="ts">
	import { onMount } from 'svelte';
	import { resolvedAtelierTheme, type AtelierTheme } from '$lib/stores/atelierTheme';
	import type { Snippet } from 'svelte';

	/**
	 * Props for AtelierThemeProvider
	 * @prop {Snippet} children - Child components to render
	 * @prop {AtelierTheme} defaultTheme - Initial theme preference
	 * @prop {boolean} enableTransitions - Enable smooth theme transitions
	 */
	interface Props {
		children: Snippet;
		defaultTheme?: AtelierTheme;
		enableTransitions?: boolean;
	}

	let {
		children,
		defaultTheme: _defaultTheme = 'system',
		enableTransitions = true
	}: Props = $props();

	let mounted = $state(false);
	let currentTheme = $derived($resolvedAtelierTheme);

	// Prevent FOUC (Flash of Unstyled Content)
	onMount(() => {
		mounted = true;

		// Apply theme immediately on mount
		const root = document.documentElement;
		root.classList.add('atelier-theme-loaded');

		return () => {
			root.classList.remove('atelier-theme-loaded');
		};
	});
</script>

<div
	class="atelier-theme-provider"
	class:atelier-theme-transitions={enableTransitions && mounted}
	data-theme={currentTheme}
>
	{@render children()}
</div>

<style>
	:global(.atelier-theme-provider) {
		min-height: 100vh;
		background-color: var(--atelier-background);
		color: var(--atelier-foreground);
		font-family: var(--atelier-font-sans);
	}

	:global(.atelier-theme-transitions *) {
		transition-property: background-color, border-color, color, fill, stroke;
		transition-duration: var(--atelier-transition-base);
		transition-timing-function: ease-in-out;
	}

	:global(.atelier-theme-loaded) {
		color-scheme: light dark;
	}

	/* Prevent theme transition on page load */
	:global(html:not(.atelier-theme-loaded) *) {
		transition: none !important;
	}

	/* Theme-specific global styles */
	:global([data-theme='light']) {
		--atelier-current-theme: light;
	}

	:global([data-theme='dark']) {
		--atelier-current-theme: dark;
	}
</style>
