<script lang="ts">
	let open = $state(false);

	const links = [
		{ href: '/', label: 'HOME' },
		{ href: '/showcase#services', label: 'SERVICES' },
		{ href: '/showcase#gallery', label: 'GALLERY' },
		{ href: '/booking/service', label: 'APPOINTMENT' },
		{ href: '/contact', label: 'CONTACT' }
	];
</script>

<header class="border-atelier-paper-100 sticky top-0 z-50 border-b bg-white/85 backdrop-blur">
	<div class="container flex h-16 items-center justify-between">
		<a
			href="/showcase"
			class="text-xl tracking-wide"
			style="font-family: 'Cormorant Garamond', serif;">PICASSO</a
		>
		<nav class="hidden items-center gap-6 md:flex">
			{#each links as l}
				<a class="atelier-nav-link" href={l.href}>{l.label}</a>
			{/each}
		</nav>
		<button class="p-2 md:hidden" onclick={() => (open = !open)} aria-label="Toggle menu">
			<svg
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<path d="M3 6h18M3 12h18M3 18h18" />
			</svg>
		</button>
	</div>

	{#if open}
		<div class="border-atelier-paper-100 border-t md:hidden">
			<nav class="container flex flex-col py-2">
				{#each links as l}
					<a class="atelier-nav-link py-2" href={l.href} onclick={() => (open = false)}>
						{l.label}
					</a>
				{/each}
			</nav>
		</div>
	{/if}
</header>
