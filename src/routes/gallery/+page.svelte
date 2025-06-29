<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<title>Gallery - Picasso Hair Salon</title>
	<meta name="description" content="View our gallery of stunning hair transformations and styles" />
</svelte:head>

<div class="container mx-auto px-4 py-8 md:py-16">
	<div class="mx-auto max-w-7xl">
		<div class="mb-12 text-center">
			<h1 class="mb-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Our Work</h1>
			<p class="mx-auto max-w-2xl text-lg text-gray-600">
				Browse through our gallery to see the amazing transformations and styles created by our
				talented stylists.
			</p>
		</div>

		{#if data.galleryImages.length === 0}
			<div class="rounded-lg bg-gray-50 p-12 text-center">
				<p class="text-gray-500">No gallery images available at the moment.</p>
			</div>
		{:else}
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each data.galleryImages as image (image.id)}
					<div class="group relative overflow-hidden rounded-lg bg-gray-100">
						<img
							src={image.url}
							alt={image.title || 'Gallery image'}
							class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
						/>
						{#if image.title || image.description}
							<div
								class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
							>
								<div class="absolute right-0 bottom-0 left-0 p-4 text-white">
									{#if image.title}
										<h3 class="text-lg font-semibold">{image.title}</h3>
									{/if}
									{#if image.description}
										<p class="text-sm">{image.description}</p>
									{/if}
								</div>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
