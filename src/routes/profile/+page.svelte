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

<div class="from-luxe-cream-50 container mx-auto min-h-screen bg-gradient-to-b to-white py-8">
	<div class="mx-auto max-w-2xl space-y-6">
		<div class="space-y-3 text-center">
			<h1 class="text-luxe-burgundy-700 font-['Cormorant_Garamond'] text-4xl font-light">
				Your Profile
			</h1>
			<p class="text-luxe-black-600 text-lg">Manage your account information and preferences</p>
		</div>

		{#if data.user}
			<Card
				class="border-luxe-cream-400 bg-luxe-cream-50 overflow-hidden rounded-xl border shadow-[0_12px_24px_rgba(94,28,28,0.15)]"
			>
				<CardHeader>
					<div class="flex items-center space-x-4">
						<Avatar class="h-16 w-16">
							<AvatarImage src={getUserAvatarUrl(data.user)} alt={getUserDisplayName(data.user)} />
							<AvatarFallback class="text-lg">{getUserInitials(data.user)}</AvatarFallback>
						</Avatar>
						<div class="space-y-1">
							<CardTitle
								class="text-luxe-burgundy-700 font-['Cormorant_Garamond'] text-2xl font-normal"
							>
								{getUserDisplayName(data.user)}
							</CardTitle>
							<CardDescription class="text-luxe-black-600">{data.user.email}</CardDescription>
							<div class="flex items-center space-x-2">
								<span
									class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {data
										.user.email_confirmed_at
										? 'bg-luxe-cream-200 text-luxe-burgundy-700'
										: 'bg-luxe-burgundy-100 text-luxe-burgundy-800'}"
								>
									{data.user.email_confirmed_at ? 'Verified' : 'Unverified'}
								</span>
								{#if data.user.app_metadata?.provider}
									<span
										class="border-luxe-cream-400 text-luxe-black-700 inline-flex items-center rounded-full border bg-white px-2.5 py-0.5 text-xs font-medium"
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
						<div class="bg-luxe-cream-100 space-y-2 rounded-lg p-4">
							<h3 class="text-luxe-burgundy-700 font-['Cormorant_Garamond'] text-lg font-medium">
								Account Information
							</h3>
							<div class="space-y-1 text-sm">
								<div class="flex justify-between">
									<span class="text-luxe-black-500">Email:</span>
									<span>{data.user.email}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-luxe-black-500">Member since:</span>
									<span>{new Date(data.user.created_at).toLocaleDateString()}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-luxe-black-500">Last sign in:</span>
									<span>
										{data.user.last_sign_in_at
											? new Date(data.user.last_sign_in_at).toLocaleDateString()
											: 'Never'}
									</span>
								</div>
							</div>
						</div>

						<div class="bg-luxe-cream-100 space-y-2 rounded-lg p-4">
							<h3 class="text-luxe-burgundy-700 font-['Cormorant_Garamond'] text-lg font-medium">
								Profile Status
							</h3>
							<div class="space-y-1 text-sm">
								<div class="flex justify-between">
									<span class="text-luxe-black-500">Email verified:</span>
									<span class={data.user.email_confirmed_at ? 'text-green-700' : 'text-amber-600'}>
										{data.user.email_confirmed_at ? 'Yes' : 'No'}
									</span>
								</div>
								<div class="flex justify-between">
									<span class="text-luxe-black-500">Phone verified:</span>
									<span
										class={data.user.phone_confirmed_at ? 'text-green-700' : 'text-luxe-black-400'}
									>
										{data.user.phone_confirmed_at ? 'Yes' : 'No'}
									</span>
								</div>
							</div>
						</div>
					</div>

					<div class="flex flex-col gap-2 pt-4 sm:flex-row">
						<Button
							class="bg-luxe-burgundy-700 text-luxe-cream-50 hover:bg-luxe-burgundy-600 flex-1 shadow-[0_2px_4px_rgba(94,28,28,0.08)]"
						>
							Edit Profile
						</Button>
						<Button
							variant="outline"
							class="border-luxe-burgundy-700 text-luxe-burgundy-700 hover:bg-luxe-burgundy-50 flex-1"
						>
							<a href="/settings">Account Settings</a>
						</Button>
					</div>
				</CardContent>
			</Card>

			<Card
				class="border-luxe-cream-400 bg-luxe-cream-50 overflow-hidden rounded-xl border shadow-[0_12px_24px_rgba(94,28,28,0.15)]"
			>
				<CardHeader>
					<CardTitle class="text-luxe-burgundy-700 font-['Cormorant_Garamond'] text-2xl font-normal"
						>Quick Actions</CardTitle
					>
					<CardDescription class="text-luxe-black-600"
						>Manage your appointments and services</CardDescription
					>
				</CardHeader>
				<CardContent class="space-y-2">
					<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
						<Button
							variant="outline"
							class="border-luxe-burgundy-700 text-luxe-burgundy-700 hover:bg-luxe-burgundy-50 w-full"
						>
							<a href="/appointments">View Appointments</a>
						</Button>
						<Button
							variant="outline"
							class="border-luxe-burgundy-700 text-luxe-burgundy-700 hover:bg-luxe-burgundy-50 w-full"
						>
							Book New Appointment
						</Button>
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
