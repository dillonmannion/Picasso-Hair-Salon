<script lang="ts">
	let open = false;
	const links = [
		{ href: '/', label: 'HOME' },
		{ href: '/team', label: 'TEAM' },
		{ href: '/appointment', label: 'APPOINTMENT' },
		{ href: '/contact', label: 'CONTACT' },
		{ href: '/careers', label: 'CAREERS' }
	];
</script>

<header class="border-paper-100 sticky top-0 z-50 border-b bg-white/85 backdrop-blur">
	<div class="container flex h-16 items-center justify-between">
		<a href="/" class="font-display text-xl tracking-wide">ATELIER</a>
		<nav class="hidden items-center gap-6 md:flex">
			{#each links as l}
				<a class="nav-link" href={l.href}>{l.label}</a>
			{/each}
		</nav>
		<button class="p-2 md:hidden" on:click={() => (open = !open)} aria-label="Toggle menu">
			<svg width="20" height="20" viewBox="0 0 24 24"
				><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" /></svg
			>
		</button>
	</div>

	{#if open}
		<div class="border-paper-100 border-t md:hidden">
			<nav class="container flex flex-col py-2">
				{#each links as l}
					<a class="nav-link py-2" href={l.href} on:click={() => (open = false)}>{l.label}</a>
				{/each}
			</nav>
		</div>
	{/if}
</header>
