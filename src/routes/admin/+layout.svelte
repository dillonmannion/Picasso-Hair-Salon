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

<div class="min-h-screen bg-gray-50">
	<!-- Admin Header -->
	<header class="border-b bg-white shadow-sm">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between py-4">
				<div class="flex items-center space-x-4">
					<a href="/" class="text-lg font-semibold text-gray-900"> ← Back to Site </a>
					<Separator orientation="vertical" class="h-6" />
					<h1 class="text-xl font-bold text-gray-900">Admin Panel</h1>
				</div>
				<div class="flex items-center space-x-4">
					<span class="text-sm text-gray-600">
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
				<Card>
					<CardHeader>
						<CardTitle>Navigation</CardTitle>
					</CardHeader>
					<CardContent class="space-y-2">
						{#each adminRoutes as route (route.href)}
							<a href={route.href}>
								<Button
									variant={page.url.pathname === route.href ? 'default' : 'ghost'}
									class="w-full justify-start"
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
