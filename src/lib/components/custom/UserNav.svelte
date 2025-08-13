<script lang="ts">
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuGroup,
		DropdownMenuItem,
		DropdownMenuLabel,
		DropdownMenuSeparator,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu';
	import { goto, invalidate } from '$app/navigation';
	import { getUserDisplayName, getUserInitials, getUserAvatarUrl } from '$lib/utils/user';
	import type { SupabaseClient, User } from '@supabase/supabase-js';

	let {
		user,
		supabase,
		adminStatus
	}: {
		user: User | null;
		supabase: SupabaseClient;
		adminStatus?: { isAdmin: boolean };
	} = $props();

	// Get user data with fallbacks
	const displayName = $derived(getUserDisplayName(user));
	const initials = $derived(getUserInitials(user));
	const avatarUrl = $derived(getUserAvatarUrl(user));

	async function handleSignOut() {
		try {
			const { error } = await supabase.auth.signOut();
			if (error) {
				console.error('Error signing out:', error);
				// You could show a toast notification here
			} else {
				// Invalidate auth data to trigger server-side session check
				await invalidate('supabase:auth');
				await goto('/', { replaceState: true });
				// Force a page refresh to ensure clean state
				window.location.reload();
			}
		} catch (err) {
			console.error('Unexpected error during sign out:', err);
		}
	}
</script>

<div class="flex items-center space-x-2">
	{#if adminStatus?.isAdmin}
		<Button variant="outline" size="sm" onclick={() => goto('/admin')}>
			Admin Dashboard
		</Button>
	{/if}

	<DropdownMenu>
		<DropdownMenuTrigger>
			{#snippet child({ props })}
				<Button variant="ghost" class="relative h-8 w-8 rounded-full" {...props}>
					<Avatar class="h-8 w-8">
						<AvatarImage src={avatarUrl || ''} alt={displayName} />
						<AvatarFallback>{initials}</AvatarFallback>
					</Avatar>
				</Button>
			{/snippet}
		</DropdownMenuTrigger>
	<DropdownMenuContent class="w-56" align="end">
		<DropdownMenuLabel class="font-normal">
			<div class="flex flex-col space-y-1">
				<p class="text-sm leading-none font-medium">{displayName}</p>
				<p class="text-muted-foreground text-xs leading-none">
					{user?.email ?? 'No email'}
				</p>
			</div>
		</DropdownMenuLabel>
		<DropdownMenuSeparator />
		<DropdownMenuGroup>
			<DropdownMenuItem onclick={() => goto('/profile')}>
				<svg
					class="mr-2 h-4 w-4"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
					/>
				</svg>
				Profile
			</DropdownMenuItem>
			<DropdownMenuItem onclick={() => goto('/appointments')}>
				<svg
					class="mr-2 h-4 w-4"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
					/>
				</svg>
				My Appointments
			</DropdownMenuItem>
			<DropdownMenuItem onclick={() => goto('/settings')}>
				<svg
					class="mr-2 h-4 w-4"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
					/>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
					/>
				</svg>
				Settings
			</DropdownMenuItem>
		</DropdownMenuGroup>
		<DropdownMenuSeparator />
		<DropdownMenuItem onclick={handleSignOut}>
			<svg
				class="mr-2 h-4 w-4"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
				/>
			</svg>
			Log out
		</DropdownMenuItem>
	</DropdownMenuContent>
</DropdownMenu>
</div>
