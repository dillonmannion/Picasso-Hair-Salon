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
	import {
		DropdownMenu,
		DropdownMenuTrigger,
		DropdownMenuContent,
		DropdownMenuItem
	} from '$lib/components/ui/dropdown-menu';
	import UserNav from './UserNav.svelte';
	import type { SupabaseClient, User } from '@supabase/supabase-js';
	import { setLocale, getLocale } from '$lib/paraglide/runtime';

	let { user, supabase }: { user: User | null; supabase: SupabaseClient } = $props();

	const languages = [
		{ code: 'en', name: 'English' },
		{ code: 'es', name: 'Español' },
		{ code: 'zh-cmn', name: '中文' }
	];

	function handleLocaleChange(newLocale: string) {
		if (newLocale === 'en' || newLocale === 'es' || newLocale === 'zh-cmn') {
			setLocale(newLocale);
		}
	}

	let currentLocale = $derived(getLocale());
</script>

<header
	class="border-border/40 bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur"
>
	<div class="container flex h-14 max-w-screen-2xl items-center">
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
				</NavigationMenuList>
			</NavigationMenuRoot>
		</div>

		<!-- Mobile menu button -->
		<Button
			variant="outline"
			size="icon"
			class="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
		>
			<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
			</svg>
			<span class="sr-only">Toggle Menu</span>
		</Button>

		<!-- Mobile logo -->
		<div class="flex flex-1 items-center justify-between space-x-2 md:justify-end">
			<div class="w-full flex-1 md:w-auto md:flex-none">
				<a class="flex items-center space-x-2 md:hidden" href="/">
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
			<nav class="flex items-center space-x-2">
				<!-- Language Switcher -->
				<DropdownMenu>
					<DropdownMenuTrigger>
						<Button variant="outline" size="sm" class="gap-2">
							<svg
								class="h-4 w-4"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<path
									d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.01-4.65 1.73-6.53"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
								<path
									d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
								<path d="M7.63 7.69l4.74 4.74" stroke-linecap="round" stroke-linejoin="round" />
								<path d="M9 18l3-3 3 3" stroke-linecap="round" stroke-linejoin="round" />
							</svg>
							{languages.find((lang) => lang.code === currentLocale)?.name || 'Language'}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						{#each languages as lang (lang.code)}
							<DropdownMenuItem onclick={() => handleLocaleChange(lang.code)}>
								{lang.name}
							</DropdownMenuItem>
						{/each}
					</DropdownMenuContent>
				</DropdownMenu>

				{#if user}
					<UserNav {user} {supabase} />
				{:else}
					<Button href="/auth/login" variant="ghost" size="sm">Sign In</Button>
					<Button href="/auth/register" size="sm">Sign Up</Button>
				{/if}
			</nav>
		</div>
	</div>
</header>
