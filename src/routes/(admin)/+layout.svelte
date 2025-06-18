<script lang="ts">
	import { page } from '$app/stores';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import { Badge } from '$lib/components/ui/badge';
	import { 
		LayoutDashboard, 
		Calendar, 
		Users, 
		Scissors, 
		MessageSquare,
		Settings,
		LogOut,
		Home
	} from 'lucide-svelte';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: any } = $props();

	// Navigation items
	const navItems = [
		{ href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
		{ href: '/admin/appointments', label: 'Appointments', icon: Calendar },
		{ href: '/admin/services', label: 'Services', icon: Scissors },
		{ href: '/admin/stylists', label: 'Stylists', icon: Users },
		{ href: '/admin/reviews', label: 'Reviews', icon: MessageSquare },
		{ href: '/admin/settings', label: 'Settings', icon: Settings }
	];

	// Check if current route is active
	function isActive(href: string): boolean {
		return $page.url.pathname === href || $page.url.pathname.startsWith(href + '/');
	}

	// Handle logout
	function handleLogout() {
		// TODO: Implement proper logout functionality
		console.log('Logout clicked');
		window.location.href = '/auth/login';
	}
</script>

<svelte:head>
	<title>Admin Dashboard - Picasso Hair Salon</title>
</svelte:head>

<div class="flex h-screen bg-gray-100">
	<!-- Sidebar -->
	<div class="w-64 bg-white shadow-lg flex flex-col">
		<!-- Logo/Brand -->
		<div class="p-6 border-b">
			<h1 class="text-xl font-bold text-gray-900">Picasso Admin</h1>
			<p class="text-sm text-gray-500">Hair Salon Management</p>
		</div>

		<!-- User Info -->
		<div class="p-4 border-b">
			<div class="flex items-center gap-3">
				<div class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
					<span class="text-sm font-medium text-primary">
						{data.user.email.charAt(0).toUpperCase()}
					</span>
				</div>
				<div class="flex-1 min-w-0">
					<p class="text-sm font-medium text-gray-900 truncate">
						{data.user.email}
					</p>
					<Badge variant="secondary" class="text-xs">
						{data.user.role}
					</Badge>
				</div>
			</div>
		</div>

		<!-- Navigation -->
		<nav class="flex-1 p-4 space-y-1">
			{#each navItems as item}
				<a
					href={item.href}
					class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors {
						isActive(item.href)
							? 'bg-primary text-primary-foreground'
							: 'text-gray-700 hover:bg-gray-100'
					}"
				>
					<svelte:component this={item.icon} class="h-4 w-4" />
					{item.label}
				</a>
			{/each}
		</nav>

		<!-- Footer Actions -->
		<div class="p-4 border-t space-y-2">
			<Button href="/" variant="outline" size="sm" class="w-full justify-start">
				<Home class="mr-2 h-4 w-4" />
				Back to Website
			</Button>
			<Button onclick={handleLogout} variant="ghost" size="sm" class="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
				<LogOut class="mr-2 h-4 w-4" />
				Logout
			</Button>
		</div>
	</div>

	<!-- Main Content -->
	<div class="flex-1 flex flex-col overflow-hidden">
		<!-- Header -->
		<header class="bg-white shadow-sm border-b px-6 py-4">
			<div class="flex items-center justify-between">
				<div>
					<h2 class="text-2xl font-semibold text-gray-900">
						{navItems.find(item => isActive(item.href))?.label || 'Admin Dashboard'}
					</h2>
					<p class="text-sm text-gray-500">
						Manage your salon operations
					</p>
				</div>
				<div class="flex items-center gap-4">
					<Badge variant="outline" class="text-xs">
						Last updated: {new Date().toLocaleDateString()}
					</Badge>
				</div>
			</div>
		</header>

		<!-- Page Content -->
		<main class="flex-1 overflow-auto p-6">
			{@render children()}
		</main>
	</div>
</div>