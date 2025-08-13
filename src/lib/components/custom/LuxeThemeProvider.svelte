<script lang="ts">
	import type { Snippet } from 'svelte';
	import { theme } from '$lib/stores/theme.svelte';

	interface Props {
		children?: Snippet;
		forceTheme?: 'light' | 'dark' | null;
		enableTransitions?: boolean;
		className?: string;
	}

	let { children, forceTheme = null, enableTransitions = true, className = '' }: Props = $props();

	// Determine which theme to use
	const activeTheme = $derived(forceTheme || theme.resolvedTheme);

	// Build the wrapper classes
	const wrapperClasses = $derived(() => {
		const baseClasses = 'luxe-theme-provider';
		const themeClass = activeTheme === 'dark' ? 'luxe-dark dark' : 'luxe-light light';
		const transitionClass = enableTransitions ? 'transition-colors duration-300' : '';

		return `${baseClasses} ${themeClass} ${transitionClass} ${className}`.trim();
	});
</script>

<div class={wrapperClasses()} data-theme={activeTheme} data-luxe-theme="true">
	{@render children?.()}
</div>

<style>
	:global(.luxe-theme-provider) {
		/* Ensure theme variables are scoped properly */
		color: var(--luxe-text-primary);
		background-color: var(--luxe-bg-primary);
	}

	:global(.luxe-theme-provider.luxe-light) {
		/* Light theme overrides if needed */
		--luxe-primary: #7d2525;
		--luxe-secondary: #f3ede2;
		--luxe-accent: #dcc8a8;
	}

	:global(.luxe-theme-provider.luxe-dark) {
		/* Dark theme overrides if needed */
		--luxe-primary: #e5a1a1;
		--luxe-secondary: #3f1212;
		--luxe-accent: #5e1c1c;
	}
</style>
