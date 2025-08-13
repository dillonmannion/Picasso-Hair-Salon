<script lang="ts">
	import { invalidate } from '$app/navigation';
	import LuxeHeader from '$lib/components/custom/LuxeHeader.svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	import type { Snippet } from 'svelte';
	import '../app.css';
	import type { LayoutData } from './$types';

	let { children, data }: { children: Snippet; data: LayoutData } = $props();
	let { supabase, user, adminStatus } = $derived(data);

	// Initialize theme on mount (theme store handles this automatically)
	// The theme store will apply the correct theme class to the document

	$effect(() => {
		const { data: authData } = supabase.auth.onAuthStateChange(async (event) => {
			/**
			 * Handle auth state changes by invalidating all auth-related data.
			 * This triggers a fresh server-side session validation via safeGetSession.
			 */

			// Handle different auth events
			if (event === 'TOKEN_REFRESHED') {
				// Session was refreshed successfully
				console.log('Session refreshed successfully');
			} else if (event === 'SIGNED_OUT') {
				// User signed out
				console.log('User signed out');
				// Only invalidate on sign out to update UI
				void invalidate('supabase:auth');
			} else if (event === 'SIGNED_IN') {
				// User signed in
				console.log('User signed in');
				// Only invalidate on sign in to update UI
				void invalidate('supabase:auth');
			}
		});

		// Set up automatic session refresh
		// Check session status every 30 seconds
		const refreshInterval = setInterval(async () => {
			const {
				data: { session }
			} = await supabase.auth.getSession();

			if (session) {
				// Check if token needs refresh (refresh if expires in less than 60 seconds)
				const expiresAt = session.expires_at;
				const now = Math.floor(Date.now() / 1000);
				const timeUntilExpiry = expiresAt ? expiresAt - now : 0;

				if (timeUntilExpiry < 60 && timeUntilExpiry > 0) {
					console.log('Refreshing session proactively...');
					const { data, error } = await supabase.auth.refreshSession();
					if (error) {
						console.error('Failed to refresh session:', error);
						// Only invalidate if refresh failed and we need to sign out
						void invalidate('supabase:auth');
					} else if (data.session) {
						console.log('Session refreshed proactively');
						// Don't invalidate on successful refresh - no UI change needed
					}
				}
			}
		}, 30000); // Check every 30 seconds

		return () => {
			authData.subscription.unsubscribe();
			clearInterval(refreshInterval);
		};
	});
</script>

<div
	class="bg-background text-foreground relative flex min-h-screen flex-col transition-colors duration-300"
>
	<LuxeHeader {user} {supabase} {adminStatus} />
	<main class="flex-1">
		{@render children?.()}
	</main>
</div>

<Toaster />
