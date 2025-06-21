<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import { getUserDisplayName } from '$lib/utils/user';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let isUpdatingProfile = $state(false);
	let isUpdatingEmail = $state(false);
	let isUpdatingPassword = $state(false);
</script>

<svelte:head>
	<title>Account Settings - Picasso Hair Salon</title>
</svelte:head>

<div class="container mx-auto py-8">
	<div class="mx-auto max-w-2xl space-y-6">
		<div class="space-y-2">
			<h1 class="text-3xl font-bold">Account Settings</h1>
			<p class="text-muted-foreground">Manage your account preferences and security settings.</p>
		</div>

		{#if form?.success}
			<div class="rounded-lg border border-green-200 bg-green-50 p-4">
				<p class="text-sm text-green-600">{form.message}</p>
			</div>
		{/if}

		{#if form?.error}
			<div class="rounded-lg border border-red-200 bg-red-50 p-4">
				<p class="text-sm text-red-600">{form.error}</p>
			</div>
		{/if}

		{#if data.user}
			<!-- Profile Information -->
			<Card>
				<CardHeader>
					<CardTitle>Profile Information</CardTitle>
					<CardDescription>Update your personal information and display name.</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						method="POST"
						action="?/updateProfile"
						use:enhance={() => {
							isUpdatingProfile = true;
							return async ({ update }) => {
								await update();
								isUpdatingProfile = false;
							};
						}}
						class="space-y-4"
					>
						<div class="space-y-2">
							<Label for="displayName">Display Name</Label>
							<Input
								id="displayName"
								name="displayName"
								type="text"
								value={form?.displayName ?? getUserDisplayName(data.user)}
								placeholder="Enter your display name"
								required
							/>
						</div>
						<Button type="submit" disabled={isUpdatingProfile}>
							{isUpdatingProfile ? 'Updating...' : 'Update Profile'}
						</Button>
					</form>
				</CardContent>
			</Card>

			<Separator />

			<!-- Email Settings -->
			<Card>
				<CardHeader>
					<CardTitle>Email Address</CardTitle>
					<CardDescription>
						Change your email address. You'll need to verify the new email address.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						method="POST"
						action="?/updateEmail"
						use:enhance={() => {
							isUpdatingEmail = true;
							return async ({ update }) => {
								await update();
								isUpdatingEmail = false;
							};
						}}
						class="space-y-4"
					>
						<div class="space-y-2">
							<Label for="currentEmail">Current Email</Label>
							<Input
								id="currentEmail"
								type="email"
								value={data.user.email}
								disabled
								class="bg-gray-50"
							/>
						</div>
						<div class="space-y-2">
							<Label for="email">New Email Address</Label>
							<Input
								id="email"
								name="email"
								type="email"
								value={form?.email ?? ''}
								placeholder="Enter new email address"
								required
							/>
						</div>
						<Button type="submit" disabled={isUpdatingEmail}>
							{isUpdatingEmail ? 'Updating...' : 'Update Email'}
						</Button>
					</form>
				</CardContent>
			</Card>

			<Separator />

			<!-- Password Settings -->
			<Card>
				<CardHeader>
					<CardTitle>Password</CardTitle>
					<CardDescription>Change your account password.</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						method="POST"
						action="?/updatePassword"
						use:enhance={() => {
							isUpdatingPassword = true;
							return async ({ update }) => {
								await update();
								isUpdatingPassword = false;
							};
						}}
						class="space-y-4"
					>
						<div class="space-y-2">
							<Label for="newPassword">New Password</Label>
							<Input
								id="newPassword"
								name="newPassword"
								type="password"
								placeholder="Enter new password"
								required
							/>
						</div>
						<div class="space-y-2">
							<Label for="confirmPassword">Confirm New Password</Label>
							<Input
								id="confirmPassword"
								name="confirmPassword"
								type="password"
								placeholder="Confirm new password"
								required
							/>
						</div>
						<Button type="submit" disabled={isUpdatingPassword}>
							{isUpdatingPassword ? 'Updating...' : 'Update Password'}
						</Button>
					</form>
				</CardContent>
			</Card>

			<Separator />

			<!-- Account Information -->
			<Card>
				<CardHeader>
					<CardTitle>Account Information</CardTitle>
					<CardDescription>View your account details and status.</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div class="space-y-2">
							<h3 class="font-medium">Account Status</h3>
							<div class="space-y-1 text-sm">
								<div class="flex justify-between">
									<span class="text-muted-foreground">Email verified:</span>
									<span class={data.user.email_confirmed_at ? 'text-green-600' : 'text-yellow-600'}>
										{data.user.email_confirmed_at ? 'Yes' : 'No'}
									</span>
								</div>
								<div class="flex justify-between">
									<span class="text-muted-foreground">Account created:</span>
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
							<h3 class="font-medium">Authentication</h3>
							<div class="space-y-1 text-sm">
								<div class="flex justify-between">
									<span class="text-muted-foreground">Provider:</span>
									<span class="capitalize">
										{data.user.app_metadata?.provider ?? 'email'}
									</span>
								</div>
								{#if data.user.phone}
									<div class="flex justify-between">
										<span class="text-muted-foreground">Phone:</span>
										<span>{data.user.phone}</span>
									</div>
								{/if}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			<!-- Quick Actions -->
			<Card>
				<CardHeader>
					<CardTitle>Quick Actions</CardTitle>
					<CardDescription>Access other parts of your account.</CardDescription>
				</CardHeader>
				<CardContent class="space-y-2">
					<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
						<Button variant="outline" class="w-full">
							<a href="/profile">View Profile</a>
						</Button>
						<Button variant="outline" class="w-full">
							<a href="/appointments">My Appointments</a>
						</Button>
					</div>
				</CardContent>
			</Card>
		{:else}
			<Card>
				<CardContent class="py-8 text-center">
					<p class="text-muted-foreground mb-4">Please sign in to access your account settings.</p>
					<Button>
						<a href="/auth/login">Sign In</a>
					</Button>
				</CardContent>
			</Card>
		{/if}
	</div>
</div>
