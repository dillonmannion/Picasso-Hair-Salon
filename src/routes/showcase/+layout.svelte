<script lang="ts">
	import './showcase.css';
	import './showcase-layout.css';
	import './showcase-theme.css';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<svelte:head>
	<!-- Google Fonts for showcase -->
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Inter:wght@400;500;600&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<!-- The showcase page handles theming internally -->
<div class="min-h-screen">
	<main>
		{@render children()}
	</main>
</div>
