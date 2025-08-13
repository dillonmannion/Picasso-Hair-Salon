<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	const adminRoutes = [
		{ href: '/admin', label: 'Dashboard', icon: '📊' },
		{ href: '/admin/appointments', label: 'Appointments', icon: '📅' },
		{ href: '/admin/services', label: 'Services', icon: '✂️' },
		{ href: '/admin/stylists', label: 'Stylists', icon: '👨‍💼' },
		{ href: '/admin/gallery', label: 'Gallery', icon: '🖼️' }
	];
</script>

<svelte:head>
	<title>Admin Panel - Picasso Hair Salon</title>
</svelte:head>

<div class="from-luxe-cream-50 min-h-screen bg-gradient-to-b to-white">
	<!-- Admin Header -->
	<header class="border-luxe-cream-400 bg-luxe-cream-100 border-b shadow-sm">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between py-4">
				<div class="flex items-center space-x-4">
					<a
						href="/"
						class="text-luxe-burgundy-700 hover:text-luxe-burgundy-600 text-lg font-semibold transition-colors"
					>
						← Back to Site
					</a>
					<Separator orientation="vertical" class="bg-luxe-cream-400 h-6" />
					<h1 class="text-luxe-burgundy-700 font-['Cormorant_Garamond'] text-2xl font-normal">
						Admin Dashboard
					</h1>
				</div>
				<div class="flex items-center space-x-4">
					<span class="text-luxe-black-600 text-sm">
						Welcome, {data.user?.email}
					</span>
				</div>
			</div>
		</div>
	</header>

	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<div class="flex space-x-8">
			<!-- Sidebar Navigation -->
			<aside class="w-64 flex-shrink-0">
				<Card
					class="border-luxe-cream-400 bg-luxe-cream-50 overflow-hidden rounded-xl border shadow-[0_12px_24px_rgba(94,28,28,0.15)]"
				>
					<CardHeader class="border-luxe-cream-300 bg-luxe-cream-100 border-b">
						<CardTitle
							class="text-luxe-burgundy-700 font-['Cormorant_Garamond'] text-xl font-normal"
						>
							Navigation
						</CardTitle>
					</CardHeader>
					<CardContent class="space-y-2 p-4">
						{#each adminRoutes as route (route.href)}
							<a href={route.href}>
								<Button
									variant={page.url.pathname === route.href ? 'default' : 'ghost'}
									class="w-full justify-start {page.url.pathname === route.href
										? 'bg-luxe-burgundy-700 text-luxe-cream-50 hover:bg-luxe-burgundy-600'
										: 'text-luxe-black-700 hover:bg-luxe-cream-200 hover:text-luxe-burgundy-700'}"
								>
									<span class="mr-2">{route.icon}</span>
									{route.label}
								</Button>
							</a>
						{/each}
					</CardContent>
				</Card>
			</aside>

			<!-- Main Content -->
			<main class="flex-1">
				{@render children?.()}
			</main>
		</div>
	</div>
</div>
