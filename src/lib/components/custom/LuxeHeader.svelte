<script lang="ts">
	import UserNav from '$lib/components/custom/UserNav.svelte';
	import type { SupabaseClient, User } from '@supabase/supabase-js';

	interface Props {
		user?: User | null;
		supabase?: SupabaseClient;
		adminStatus?: { isAdmin: boolean };
	}

	let { user = null, supabase, adminStatus }: Props = $props();

	let mobileMenuOpen = $state(false);

	const links = [
		{ href: '/', label: 'HOME' },
		{ href: '/#services', label: 'SERVICES' },
		{ href: '/#gallery', label: 'GALLERY' },
		{ href: '/booking/service', label: 'APPOINTMENT' },
		{ href: '/#contact', label: 'CONTACT' }
	];
</script>

<header class="showcase-header border-luxe-cream-400 bg-luxe-cream-100 sticky top-0 z-50 border-b">
	<div class="relative h-16">
		<!-- Left: Hamburger (below xl) -->
		<button
			class="absolute top-1/2 left-4 -translate-y-1/2 p-2 xl:hidden"
			onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
			aria-label="Toggle menu"
		>
			<svg
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				class="text-luxe-burgundy-700"
			>
				<path d="M3 6h18M3 12h18M3 18h18" />
			</svg>
		</button>

		<!-- Center: Title + Nav (xl and up) -->
		<div
			class="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center xl:flex"
		>
			<a
				href="/"
				class="showcase-heading mr-8 text-2xl tracking-wide"
				style="font-family: 'Cormorant Garamond', serif;"
			>
				PICASSO
			</a>
			<nav class="flex items-center justify-end gap-6">
				{#each links as link}
					<a
						class="showcase-header-link text-luxe-black-700 hover:text-luxe-burgundy-700 py-1 text-sm tracking-wide uppercase transition-colors"
						href={link.href}
					>
						{link.label}
					</a>
				{/each}
			</nav>
		</div>

		<!-- Center: Title only (below xl) -->
		<a
			href="/"
			class="showcase-heading absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl tracking-wide xl:hidden"
			style="font-family: 'Cormorant Garamond', serif;"
		>
			PICASSO
		</a>

		<!-- Right: User Profile/Sign In (all sizes) -->
		<div class="absolute top-1/2 right-4 -translate-y-1/2">
			{#if user && supabase}
				<UserNav {user} {supabase} {adminStatus} />
			{:else}
				<a
					href="/auth/login"
					class="showcase-btn bg-luxe-burgundy-700 text-luxe-cream-50 hover:bg-luxe-burgundy-600 rounded !px-3 !py-1.5 !text-xs"
				>
					Sign In
				</a>
			{/if}
		</div>
	</div>

	<!-- Mobile Menu Dropdown -->
	{#if mobileMenuOpen}
		<div class="border-luxe-cream-400 bg-luxe-cream-100 border-t xl:hidden">
			<nav class="container flex flex-col px-4 py-2">
				{#each links as link}
					<a
						class="showcase-header-link text-luxe-black-700 hover:text-luxe-burgundy-700 py-2 tracking-wide uppercase transition-colors"
						href={link.href}
						onclick={() => (mobileMenuOpen = false)}
					>
						{link.label}
					</a>
				{/each}
				{#if !user}
					<a
						class="showcase-header-link text-luxe-burgundy-700 py-2 font-medium tracking-wide uppercase"
						href="/auth/login"
						onclick={() => (mobileMenuOpen = false)}
					>
						SIGN IN
					</a>
				{/if}
			</nav>
		</div>
	{/if}
</header>
