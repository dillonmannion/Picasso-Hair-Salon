<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Manage Gallery - Admin Panel</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">Gallery</h1>
			<p class="text-gray-600">Manage salon portfolio images and showcase work</p>
		</div>
		<Button>Upload New Image</Button>
	</div>

	<!-- Gallery Grid -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
		{#each data.galleryImages as image (image.id)}
			<Card class="overflow-hidden">
				<div class="relative">
					<img src={image.url} alt={image.title} class="h-48 w-full object-cover" />
					{#if image.is_featured}
						<div class="absolute top-2 left-2">
							<span
								class="inline-flex rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800"
							>
								⭐ Featured
							</span>
						</div>
					{/if}
					<div class="absolute top-2 right-2">
						<span
							class="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
						>
							{image.category}
						</span>
					</div>
				</div>

				<CardContent class="p-4">
					<div class="space-y-2">
						<h3 class="text-sm font-semibold">{image.title}</h3>
						<p class="text-xs text-gray-600">{image.description}</p>

						<div class="flex items-center justify-between text-xs text-gray-500">
							<span>By {image.stylist_name}</span>
							<span>{image.created_at}</span>
						</div>

						<div class="flex space-x-2 pt-2">
							<Button variant="outline" size="sm" class="flex-1">Edit</Button>
							<Button variant="destructive" size="sm" class="flex-1">Delete</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		{/each}
	</div>

	<!-- Featured Images Section -->
	<Card>
		<CardHeader>
			<CardTitle>Featured Images</CardTitle>
			<CardDescription>Images currently featured on the homepage and gallery</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
				{#each data.galleryImages.filter((img) => img.is_featured) as image (image.id)}
					<div class="group relative">
						<img src={image.url} alt={image.title} class="h-32 w-full rounded-lg object-cover" />
						<div
							class="bg-opacity-0 group-hover:bg-opacity-30 absolute inset-0 flex items-center justify-center rounded-lg bg-black transition-all duration-200"
						>
							<div class="opacity-0 transition-opacity duration-200 group-hover:opacity-100">
								<Button variant="secondary" size="sm">Remove from Featured</Button>
							</div>
						</div>
						<div class="mt-2">
							<p class="text-sm font-medium">{image.title}</p>
							<p class="text-xs text-gray-600">{image.category}</p>
						</div>
					</div>
				{/each}
			</div>
		</CardContent>
	</Card>

	<!-- Gallery Management Table -->
	<Card>
		<CardHeader>
			<CardTitle>All Gallery Images</CardTitle>
			<CardDescription>Complete list of gallery images with management options</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead>
						<tr class="border-b">
							<th class="px-4 py-3 text-left font-medium">Image</th>
							<th class="px-4 py-3 text-left font-medium">Title</th>
							<th class="px-4 py-3 text-left font-medium">Category</th>
							<th class="px-4 py-3 text-left font-medium">Stylist</th>
							<th class="px-4 py-3 text-left font-medium">Featured</th>
							<th class="px-4 py-3 text-left font-medium">Order</th>
							<th class="px-4 py-3 text-left font-medium">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each data.galleryImages as image (image.id)}
							<tr class="border-b hover:bg-gray-50">
								<td class="px-4 py-3">
									<img
										src={image.url}
										alt={image.title}
										class="h-16 w-16 rounded-lg object-cover"
									/>
								</td>
								<td class="px-4 py-3">
									<div>
										<p class="font-medium">{image.title}</p>
										<p class="text-sm text-gray-600">{image.description}</p>
									</div>
								</td>
								<td class="px-4 py-3">
									<span class="inline-flex rounded-md bg-blue-100 px-2 py-1 text-xs text-blue-800">
										{image.category}
									</span>
								</td>
								<td class="px-4 py-3">{image.stylist_name}</td>
								<td class="px-4 py-3">
									<span
										class="inline-flex rounded-full px-2 py-1 text-xs font-medium {image.is_featured
											? 'bg-yellow-100 text-yellow-800'
											: 'bg-gray-100 text-gray-800'}"
									>
										{image.is_featured ? '⭐ Featured' : 'Standard'}
									</span>
								</td>
								<td class="px-4 py-3">{image.display_order}</td>
								<td class="px-4 py-3">
									<div class="flex space-x-2">
										<Button variant="outline" size="sm">Edit</Button>
										<Button variant="outline" size="sm">
											{image.is_featured ? 'Unfeature' : 'Feature'}
										</Button>
										<Button variant="destructive" size="sm">Delete</Button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</CardContent>
	</Card>
</div>
