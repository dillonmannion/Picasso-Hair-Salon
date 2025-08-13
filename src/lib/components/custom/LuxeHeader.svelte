<script lang="ts">
	import UserNav from '$lib/components/custom/UserNav.svelte';
	import type { SupabaseClient, User } from '@supabase/supabase-js';

	interface Props {
		user?: User | null;
		supabase?: SupabaseClient;
		isHomepage?: boolean;
	}

	let { user = null, supabase, isHomepage = false }: Props = $props();

	let mobileMenuOpen = $state(false);

	const links = [
		{ href: '/', label: 'HOME' },
		{ href: isHomepage ? '#services' : '/services', label: 'SERVICES' },
		{ href: isHomepage ? '#gallery' : '/gallery', label: 'GALLERY' },
		{ href: '/booking/service', label: 'APPOINTMENT' },
		{ href: isHomepage ? '#contact' : '/contact', label: 'CONTACT' }
	];
</script>

<header
	class="showcase-header border-luxe-cream-400 bg-luxe-cream-100 sticky top-0 z-50 items-center border-b"
>
	<div class="container flex h-16 items-center justify-between">
		<a
			href="/"
			class="showcase-heading text-2xl tracking-wide"
			style="font-family: 'Cormorant Garamond', serif;"
		>
			PICASSO
		</a>

		<div class="flex items-center gap-6">
			<!-- Desktop Navigation -->
			<nav class="hidden items-center gap-2 md:flex">
				{#each links as link}
					<a
						class="showcase-header-link text-luxe-black-700 hover:text-luxe-burgundy-700 transition-colors"
						href={link.href}
					>
						{link.label}
					</a>
				{/each}
			</nav>

			<!-- User Navigation -->
			{#if user && supabase}
				<UserNav {user} {supabase} />
			{:else}
				<a
					href="/auth/login"
					class="showcase-btn bg-luxe-burgundy-700 text-luxe-cream-50 hover:bg-luxe-burgundy-600 rounded !px-3 !py-1.5 !text-xs"
				>
					Sign In
				</a>
			{/if}

			<!-- Mobile Menu Button -->
			<button
				class="p-2 md:hidden"
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
		</div>
	</div>

	<!-- Mobile Menu -->
	{#if mobileMenuOpen}
		<div class="border-luxe-cream-400 bg-luxe-cream-100 border-t md:hidden">
			<nav class="container flex flex-col py-2">
				{#each links as link}
					<a
						class="showcase-header-link text-luxe-black-700 hover:text-luxe-burgundy-700 py-2 transition-colors"
						href={link.href}
						onclick={() => (mobileMenuOpen = false)}
					>
						{link.label}
					</a>
				{/each}
				{#if !user}
					<a
						class="showcase-header-link text-luxe-burgundy-700 py-2 font-medium"
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
