<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		NavigationMenuRoot,
		//NavigationMenuContent,
		NavigationMenuItem,
		NavigationMenuLink,
		NavigationMenuList
		//NavigationMenuTrigger
	} from '$lib/components/ui/navigation-menu';
	import UserNav from './UserNav.svelte';
	import type { SupabaseClient, User } from '@supabase/supabase-js';
	import { fly } from 'svelte/transition';

	let {
		user,
		supabase,
		adminStatus
	}: {
		user: User | null;
		supabase: SupabaseClient;
		adminStatus?: {
			isAdmin: boolean;
			email: string | null;
			canManageServices: boolean;
			canManageStylists: boolean;
			canManageAppointments: boolean;
			canManageGallery: boolean;
			canViewAllUsers: boolean;
		};
	} = $props();

	let isMenuOpen = $state(false);

	function toggleMenu() {
		isMenuOpen = !isMenuOpen;
	}

	function closeMenu() {
		isMenuOpen = false;
	}
</script>

<header
	class="border-border/40 bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur"
>
	<div class="flex h-14 w-full items-center px-4 md:px-6">
		<div class="mr-4 hidden md:flex">
			<a class="mr-6 flex items-center space-x-2" href="/">
				<svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5H9a2 2 0 00-2 2v12a4 4 0 004 4h6a2 2 0 002-2V7a2 2 0 00-2-2z"
					/>
				</svg>
				<span class="hidden font-bold sm:inline-block">Picasso Hair Salon</span>
			</a>
			<NavigationMenuRoot>
				<NavigationMenuList>
					<NavigationMenuItem>
						<NavigationMenuLink
							href="/"
							class="group bg-background hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50"
						>
							Home
						</NavigationMenuLink>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<NavigationMenuLink
							href="/services"
							class="group bg-background hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50"
						>
							Services
						</NavigationMenuLink>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<NavigationMenuLink
							href="/gallery"
							class="group bg-background hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50"
						>
							Gallery
						</NavigationMenuLink>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<NavigationMenuLink
							href="/about"
							class="group bg-background hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50"
						>
							About
						</NavigationMenuLink>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<NavigationMenuLink
							href="/contact"
							class="group bg-background hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50"
						>
							Contact
						</NavigationMenuLink>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<NavigationMenuLink
							href="/showcase"
							data-sveltekit-preload-data="off"
							data-sveltekit-preload-code="off"
							class="group bg-background hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50"
						>
							<span
								class="inline-block whitespace-nowrap bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text font-semibold text-transparent"
								>Style Preview</span
							>
						</NavigationMenuLink>
					</NavigationMenuItem>
				</NavigationMenuList>
			</NavigationMenuRoot>
		</div>

		<!-- Mobile menu button -->
		<Button
			variant="outline"
			size="icon"
			class="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
			onclick={toggleMenu}
		>
			<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
			</svg>
			<span class="sr-only">Toggle Menu</span>
		</Button>

		<!-- Mobile logo and right side navigation container -->
		<div class="flex flex-1 items-center justify-between">
			<div class="md:hidden">
				<a class="flex items-center space-x-2" href="/">
					<svg
						class="h-6 w-6"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5H9a2 2 0 00-2 2v12a4 4 0 004 4h6a2 2 0 002-2V7a2 2 0 00-2-2z"
						/>
					</svg>
					<span class="font-bold">Picasso</span>
				</a>
			</div>

			<!-- Right side navigation -->
			<nav class="ml-auto flex min-w-[140px] items-center justify-end space-x-2">
				{#if user}
					{#if adminStatus?.isAdmin}
						<a href="/admin">
							<Button variant="outline" size="sm">Admin Dashboard</Button>
						</a>
					{/if}
					<UserNav {user} {supabase} />
				{:else}
					<a href="/auth/login">
						<Button size="sm">Sign In with Google</Button>
					</a>
				{/if}
			</nav>
		</div>
	</div>
</header>

<!-- Mobile menu overlay -->
{#if isMenuOpen}
	<!-- Backdrop -->
	<button
		class="bg-background/80 fixed inset-0 z-40 backdrop-blur-sm md:hidden"
		onclick={closeMenu}
		transition:fly={{ duration: 200, opacity: 0 }}
		aria-label="Close menu"
	></button>

	<!-- Mobile menu panel -->
	<nav
		class="bg-background fixed inset-y-0 left-0 z-50 w-full max-w-xs border-r md:hidden"
		transition:fly={{ x: -300, duration: 300, opacity: 1 }}
	>
		<div class="flex h-14 items-center justify-between border-b px-4">
			<a class="flex items-center space-x-2" href="/" onclick={closeMenu}>
				<svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5H9a2 2 0 00-2 2v12a4 4 0 004 4h6a2 2 0 002-2V7a2 2 0 00-2-2z"
					/>
				</svg>
				<span class="font-bold">Picasso Hair Salon</span>
			</a>
			<Button variant="ghost" size="icon" onclick={closeMenu}>
				<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
				</svg>
				<span class="sr-only">Close Menu</span>
			</Button>
		</div>

		<div class="flex flex-col space-y-3 p-4">
			<!-- Navigation links -->
			<a
				href="/"
				class="hover:bg-accent hover:text-accent-foreground flex items-center rounded-md px-3 py-2 text-sm font-medium"
				onclick={closeMenu}
			>
				Home
			</a>
			<a
				href="/services"
				class="hover:bg-accent hover:text-accent-foreground flex items-center rounded-md px-3 py-2 text-sm font-medium"
				onclick={closeMenu}
			>
				Services
			</a>
			<a
				href="/gallery"
				class="hover:bg-accent hover:text-accent-foreground flex items-center rounded-md px-3 py-2 text-sm font-medium"
				onclick={closeMenu}
			>
				Gallery
			</a>
			<a
				href="/about"
				class="hover:bg-accent hover:text-accent-foreground flex items-center rounded-md px-3 py-2 text-sm font-medium"
				onclick={closeMenu}
			>
				About
			</a>
			<a
				href="/contact"
				class="hover:bg-accent hover:text-accent-foreground flex items-center rounded-md px-3 py-2 text-sm font-medium"
				onclick={closeMenu}
			>
				Contact
			</a>
			<a
				href="/showcase"
				data-sveltekit-preload-data="off"
				data-sveltekit-preload-code="off"
				class="hover:bg-accent hover:text-accent-foreground flex items-center rounded-md px-3 py-2 text-sm font-medium"
				onclick={closeMenu}
			>
				<span
					class="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text font-semibold text-transparent"
					>Style Preview</span
				>
			</a>

			<div class="my-4 border-t pt-4">
				{#if user}
					<div class="mb-3 flex items-center justify-between">
						<span class="text-muted-foreground text-sm">Signed in as</span>
					</div>
					<div class="flex items-center space-x-3">
						<UserNav {user} {supabase} />
						<span class="truncate text-sm font-medium">{user.email}</span>
					</div>
				{:else}
					<a href="/auth/login" onclick={closeMenu}>
						<Button size="sm" class="w-full">Sign In with Google</Button>
					</a>
				{/if}
			</div>
		</div>
	</nav>
{/if}
