<script lang="ts">
	import { Toaster } from '$lib/components/ui/sonner';
	import { invalidate } from '$app/navigation';
	import Header from '$lib/components/custom/Header.svelte';
	import '../app.css';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';

	let { children, data }: { children: Snippet; data: LayoutData } = $props();
	let { supabase, user, adminStatus } = $derived(data);

	$effect(() => {
		const { data: authData } = supabase.auth.onAuthStateChange(() => {
			/**
			 * Handle auth state changes by invalidating all auth-related data.
			 * This triggers a fresh server-side session validation via safeGetSession.
			 * We invalidate on any auth change to ensure secure server-side validation.
			 */
			void invalidate('supabase:auth');
		});

		return () => authData.subscription.unsubscribe();
	});
</script>

<div class="relative flex min-h-screen flex-col">
	<Header {user} {supabase} {adminStatus} />
	<main class="flex-1">
		{@render children?.()}
	</main>
</div>

<Toaster />
