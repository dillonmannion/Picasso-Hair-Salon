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
	<div class="flex w-64 flex-col bg-white shadow-lg">
		<!-- Logo/Brand -->
		<div class="border-b p-6">
			<h1 class="text-xl font-bold text-gray-900">Picasso Admin</h1>
			<p class="text-sm text-gray-500">Hair Salon Management</p>
		</div>

		<!-- User Info -->
		<div class="border-b p-4">
			<div class="flex items-center gap-3">
				<div class="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
					<span class="text-primary text-sm font-medium">
						{data.user.email?.charAt(0).toUpperCase() || 'U'}
					</span>
				</div>
				<div class="min-w-0 flex-1">
					<p class="truncate text-sm font-medium text-gray-900">
						{data.user.email || 'User'}
					</p>
					<Badge variant="secondary" class="text-xs">
						{data.user.role}
					</Badge>
				</div>
			</div>
		</div>

		<!-- Navigation -->
		<nav class="flex-1 space-y-1 p-4">
			{#each navItems as item}
				{@const IconComponent = item.icon}
				<a
					href={item.href}
					class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors {isActive(
						item.href
					)
						? 'bg-primary text-primary-foreground'
						: 'text-gray-700 hover:bg-gray-100'}"
				>
					<IconComponent class="h-4 w-4" />
					{item.label}
				</a>
			{/each}
		</nav>

		<!-- Footer Actions -->
		<div class="space-y-2 border-t p-4">
			<Button href="/" variant="outline" size="sm" class="w-full justify-start">
				<Home class="mr-2 h-4 w-4" />
				Back to Website
			</Button>
			<Button
				onclick={handleLogout}
				variant="ghost"
				size="sm"
				class="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
			>
				<LogOut class="mr-2 h-4 w-4" />
				Logout
			</Button>
		</div>
	</div>

	<!-- Main Content -->
	<div class="flex flex-1 flex-col overflow-hidden">
		<!-- Header -->
		<header class="border-b bg-white px-6 py-4 shadow-sm">
			<div class="flex items-center justify-between">
				<div>
					<h2 class="text-2xl font-semibold text-gray-900">
						{navItems.find((item) => isActive(item.href))?.label || 'Admin Dashboard'}
					</h2>
					<p class="text-sm text-gray-500">Manage your salon operations</p>
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
