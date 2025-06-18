<script lang="ts">
	import { Toaster } from '$lib/components/ui/sonner';
	import { invalidate } from '$app/navigation';
	import Header from '$lib/components/custom/Header.svelte';
	import '../app.css';

	let { children, data } = $props();
	let { supabase, session, user } = $derived(data);

	$effect(() => {
		const { data } = supabase.auth.onAuthStateChange((event, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => data.subscription.unsubscribe();
	});
</script>

<div class="relative flex min-h-screen flex-col">
	<Header {user} {supabase} />
	<main class="flex-1">
		{@render children?.()}
	</main>
</div>

<Toaster />
