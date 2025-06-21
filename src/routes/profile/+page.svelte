<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import { getUserDisplayName, getUserInitials, getUserAvatarUrl } from '$lib/utils/user';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Profile - Picasso Hair Salon</title>
</svelte:head>

<div class="container mx-auto py-8">
	<div class="mx-auto max-w-2xl space-y-6">
		<div class="space-y-2">
			<h1 class="text-3xl font-bold">Profile</h1>
			<p class="text-muted-foreground">Manage your account information and preferences.</p>
		</div>

		{#if data.user}
			<Card>
				<CardHeader>
					<div class="flex items-center space-x-4">
						<Avatar class="h-16 w-16">
							<AvatarImage src={getUserAvatarUrl(data.user)} alt={getUserDisplayName(data.user)} />
							<AvatarFallback class="text-lg">{getUserInitials(data.user)}</AvatarFallback>
						</Avatar>
						<div class="space-y-1">
							<CardTitle>{getUserDisplayName(data.user)}</CardTitle>
							<CardDescription>{data.user.email}</CardDescription>
							<div class="flex items-center space-x-2">
								<span
									class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800"
								>
									{data.user.email_confirmed_at ? 'Verified' : 'Unverified'}
								</span>
								{#if data.user.app_metadata?.provider}
									<span
										class="inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs font-medium text-gray-700"
									>
										{data.user.app_metadata.provider}
									</span>
								{/if}
							</div>
						</div>
					</div>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div class="space-y-2">
							<h3 class="font-medium">Account Information</h3>
							<div class="space-y-1 text-sm">
								<div class="flex justify-between">
									<span class="text-muted-foreground">Email:</span>
									<span>{data.user.email}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-muted-foreground">Member since:</span>
									<span>{new Date(data.user.created_at).toLocaleDateString()}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-muted-foreground">Last sign in:</span>
									<span>
										{data.user.last_sign_in_at
											? new Date(data.user.last_sign_in_at).toLocaleDateString()
											: 'Never'}
									</span>
								</div>
							</div>
						</div>

						<div class="space-y-2">
							<h3 class="font-medium">Profile Status</h3>
							<div class="space-y-1 text-sm">
								<div class="flex justify-between">
									<span class="text-muted-foreground">Email verified:</span>
									<span class={data.user.email_confirmed_at ? 'text-green-600' : 'text-yellow-600'}>
										{data.user.email_confirmed_at ? 'Yes' : 'No'}
									</span>
								</div>
								<div class="flex justify-between">
									<span class="text-muted-foreground">Phone verified:</span>
									<span class={data.user.phone_confirmed_at ? 'text-green-600' : 'text-gray-500'}>
										{data.user.phone_confirmed_at ? 'Yes' : 'No'}
									</span>
								</div>
							</div>
						</div>
					</div>

					<div class="flex flex-col gap-2 pt-4 sm:flex-row">
						<Button class="flex-1">Edit Profile</Button>
						<Button variant="outline" class="flex-1">
							<a href="/settings">Account Settings</a>
						</Button>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Quick Actions</CardTitle>
					<CardDescription>Manage your appointments and services.</CardDescription>
				</CardHeader>
				<CardContent class="space-y-2">
					<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
						<Button variant="outline" class="w-full">
							<a href="/appointments">View Appointments</a>
						</Button>
						<Button variant="outline" class="w-full">Book New Appointment</Button>
					</div>
				</CardContent>
			</Card>
		{:else}
			<Card>
				<CardContent class="py-8 text-center">
					<p class="text-muted-foreground mb-4">Unable to load profile information.</p>
					<Button>
						<a href="/auth/login">Sign In</a>
					</Button>
				</CardContent>
			</Card>
		{/if}
	</div>
</div>
