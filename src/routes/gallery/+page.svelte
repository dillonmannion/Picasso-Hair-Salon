<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs';
	import { Badge } from '$lib/components/ui/badge';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Extract unique categories from images data
	const categories = $derived(() => {
		const uniqueCategories = [
			...new Set(
				data.images.map((image) => image.category).filter((cat): cat is string => Boolean(cat))
			)
		];
		return ['All', ...uniqueCategories.sort()];
	});

	// Currently selected tab
	let selectedCategory = $state('All');

	// Filter images based on selected category
	const filteredImages = $derived(() => {
		if (selectedCategory === 'All') {
			return data.images;
		}
		return data.images.filter((image) => image.category === selectedCategory);
	});
</script>

<svelte:head>
	<title>{data.meta?.title || 'Gallery - Picasso Hair Salon'}</title>
	<meta
		name="description"
		content={data.meta?.description ||
			'Browse our stunning hair transformation gallery showcasing cuts, colors, and styles by our expert stylists at Picasso Hair Salon.'}
	/>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8 text-center">
		<h1 class="mb-4 text-4xl font-bold text-gray-900">Hair Gallery</h1>
		<p class="mx-auto max-w-2xl text-lg text-gray-600">
			Discover stunning transformations and get inspired by our portfolio of beautiful hair
			creations
		</p>
	</div>

	<Tabs.Root bind:value={selectedCategory} class="w-full">
		<Tabs.List class="mb-8 flex flex-wrap justify-center gap-2">
			{#each categories() as category (category)}
				<Tabs.Trigger value={category} class="flex-shrink-0">
					{category}
				</Tabs.Trigger>
			{/each}
		</Tabs.List>

		{#each categories() as category (category)}
			<Tabs.Content value={category}>
				{#if filteredImages().length > 0}
					<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
						{#each filteredImages() as image (image.id)}
							<div
								class="group relative overflow-hidden rounded-lg bg-gray-100 shadow-md transition-transform hover:scale-105"
							>
								<div class="aspect-square">
									<img
										src={image.url}
										alt={image.title || 'Hair transformation'}
										class="h-full w-full object-cover"
										loading="lazy"
									/>
								</div>

								{#if image.is_featured}
									<Badge class="bg-primary text-primary-foreground absolute top-2 right-2">
										Featured
									</Badge>
								{/if}

								{#if image.title || image.description}
									<div
										class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white opacity-0 transition-opacity group-hover:opacity-100"
									>
										{#if image.title}
											<h3 class="font-semibold">{image.title}</h3>
										{/if}
										{#if image.description}
											<p class="mt-1 text-sm">{image.description}</p>
										{/if}
									</div>
								{/if}
							</div>
						{/each}
					</div>
				{:else}
					<div class="py-12 text-center">
						<p class="text-lg text-gray-500">No images found in this category.</p>
					</div>
				{/if}
			</Tabs.Content>
		{/each}
	</Tabs.Root>
</div>
