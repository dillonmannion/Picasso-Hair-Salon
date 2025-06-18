<script lang="ts">
	import { Toaster } from '$lib/components/ui/sonner';
	import { invalidate } from '$app/navigation';
	import { page } from '$app/state';
	import { inject } from '@vercel/analytics';
	import Header from '$lib/components/custom/Header.svelte';
	import '../app.css';

	let { children, data } = $props();
	let { supabase, session, user } = $derived(data);

	// Default meta values
	const defaultTitle = 'Picasso Hair Salon - Expert Hair Services & Styling';
	const defaultDescription =
		'Transform your look at Picasso Hair Salon. Expert stylists offering premium hair cuts, coloring, styling, and treatments. Book your appointment today!';

	$effect(() => {
		const { data } = supabase.auth.onAuthStateChange((event, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		// Inject Vercel Analytics
		inject();

		return () => data.subscription.unsubscribe();
	});
</script>

<svelte:head>
	<title>{page.data?.meta?.title || defaultTitle}</title>
	<meta name="description" content={page.data?.meta?.description || defaultDescription} />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<meta charset="utf-8" />
	<!-- Open Graph tags for social media -->
	<meta property="og:title" content={page.data?.meta?.title || defaultTitle} />
	<meta property="og:description" content={page.data?.meta?.description || defaultDescription} />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Picasso Hair Salon" />
	<!-- Twitter Card tags -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={page.data?.meta?.title || defaultTitle} />
	<meta name="twitter:description" content={page.data?.meta?.description || defaultDescription} />
</svelte:head>

<div class="relative flex min-h-screen flex-col">
	<Header {user} {supabase} />
	<main class="flex-1">
		{@render children?.()}
	</main>
</div>

<Toaster />
