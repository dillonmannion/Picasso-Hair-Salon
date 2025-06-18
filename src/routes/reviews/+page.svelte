<script lang="ts">
	import { enhance } from '$app/forms';
	import * as Card from '$lib/components/ui/card';
	import * as Select from '$lib/components/ui/select';
	import { Button } from '$lib/components/ui/button';
	import { Progress } from '$lib/components/ui/progress';
	import { Badge } from '$lib/components/ui/badge';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { Separator } from '$lib/components/ui/separator';
	import { Star, PlusCircle, MessageCircle } from 'lucide-svelte';
	import ReviewCard from '$lib/components/custom/ReviewCard.svelte';
	import type { PageData } from './$types';

	let { data, form }: { data: PageData; form: any } = $props();

	// Review submission form state
	let showReviewForm = $state(false);
	let newReview = $state({
		serviceId: '',
		stylistId: '',
		rating: 0,
		comment: ''
	});

	// Generate star rating display for average
	function getStarArray(rating: number): Array<{ filled: boolean; half: boolean }> {
		return Array.from({ length: 5 }, (_, i) => {
			const starValue = i + 1;
			return {
				filled: rating >= starValue,
				half: rating >= starValue - 0.5 && rating < starValue
			};
		});
	}

	// Handle star rating selection in form
	function selectRating(rating: number) {
		newReview.rating = rating;
	}

	// Reset form
	function resetForm() {
		newReview = {
			serviceId: '',
			stylistId: '',
			rating: 0,
			comment: ''
		};
		showReviewForm = false;
	}

	// Get services and stylists from server data
	const { services, stylists } = data;
</script>

<svelte:head>
	<title>{data.meta?.title || 'Reviews - Picasso Hair Salon'}</title>
	<meta
		name="description"
		content={data.meta?.description ||
			'Read what our clients say about their experience at Picasso Hair Salon. Real reviews from real customers.'}
	/>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8 text-center">
		<h1 class="mb-4 text-4xl font-bold text-gray-900">Client Reviews</h1>
		<p class="mx-auto max-w-2xl text-lg text-gray-600">
			See what our valued clients have to say about their experience at Picasso Hair Salon.
		</p>
	</div>

	{#if form?.success}
		<div class="mb-6 rounded-lg bg-green-50 p-4 text-green-800">
			{form.message}
		</div>
	{/if}

	{#if form?.error}
		<div class="mb-6 rounded-lg bg-red-50 p-4 text-red-800">
			{form.error}
		</div>
	{/if}

	<div class="grid gap-8 lg:grid-cols-3">
		<!-- Reviews Overview -->
		<div class="lg:col-span-1">
			<Card.Root class="sticky top-8">
				<Card.Header>
					<Card.Title class="flex items-center gap-2">
						<MessageCircle class="h-5 w-5" />
						Reviews Overview
					</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-6">
					<!-- Average Rating -->
					<div class="text-center">
						<div class="text-primary mb-2 text-4xl font-bold">
							{data.averageRating}
						</div>
						<div class="mb-2 flex justify-center">
							{#each getStarArray(data.averageRating) as star}
								<Star
									class="h-5 w-5 {star.filled
										? 'fill-yellow-400 text-yellow-400'
										: star.half
											? 'fill-yellow-200 text-yellow-400'
											: 'text-gray-300'}"
								/>
							{/each}
						</div>
						<p class="text-sm text-gray-600">
							Based on {data.totalReviews} review{data.totalReviews !== 1 ? 's' : ''}
						</p>
					</div>

					<Separator />

					<!-- Rating Breakdown -->
					<div class="space-y-3">
						<h3 class="font-semibold text-gray-900">Rating Breakdown</h3>
						{#each [5, 4, 3, 2, 1] as rating}
							<div class="flex items-center gap-3">
								<div class="flex items-center gap-1">
									<span class="text-sm font-medium">{rating}</span>
									<Star class="h-3 w-3 fill-yellow-400 text-yellow-400" />
								</div>
								<div class="flex-1">
									<Progress
										value={data.ratingPercentages[rating as keyof typeof data.ratingPercentages]}
										class="h-2"
									/>
								</div>
								<span class="w-12 text-right text-xs text-gray-500">
									{data.ratingBreakdown[rating as keyof typeof data.ratingBreakdown]} ({Math.round(
										data.ratingPercentages[rating as keyof typeof data.ratingPercentages]
									)}%)
								</span>
							</div>
						{/each}
					</div>

					<Separator />

					<!-- Add Review Button -->
					<Button
						onclick={() => (showReviewForm = !showReviewForm)}
						class="w-full"
						variant={showReviewForm ? 'outline' : 'default'}
					>
						<PlusCircle class="mr-2 h-4 w-4" />
						{showReviewForm ? 'Cancel' : 'Write a Review'}
					</Button>

					<!-- Review Submission Form -->
					{#if showReviewForm}
						<div class="space-y-4">
							<Separator />
							<form method="POST" action="?/submitReview" use:enhance class="space-y-4">
								<div>
									<Label for="service">Service *</Label>
									<select
										name="serviceId"
										bind:value={newReview.serviceId}
										class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
										required
									>
										<option value="">Select service</option>
										{#each services as service}
											<option value={service.id}>{service.name}</option>
										{/each}
									</select>
								</div>

								<div>
									<Label for="stylist">Stylist *</Label>
									<select
										name="stylistId"
										bind:value={newReview.stylistId}
										class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
										required
									>
										<option value="">Select stylist</option>
										{#each stylists as stylist}
											<option value={stylist.id}>{stylist.name}</option>
										{/each}
									</select>
								</div>

								<div>
									<Label>Rating *</Label>
									<div class="mt-2 flex gap-1">
										{#each Array.from({ length: 5 }, (_, i) => i + 1) as rating}
											<button
												type="button"
												onclick={() => selectRating(rating)}
												class="rounded p-1 hover:bg-gray-100"
											>
												<Star
													class="h-6 w-6 {newReview.rating >= rating
														? 'fill-yellow-400 text-yellow-400'
														: 'text-gray-300'}"
												/>
											</button>
										{/each}
									</div>
									<input type="hidden" name="rating" bind:value={newReview.rating} />
								</div>

								<div>
									<Label for="comment">Comment</Label>
									<textarea
										name="comment"
										bind:value={newReview.comment}
										class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
										rows="3"
										placeholder="Share your experience..."
									></textarea>
								</div>

								<div class="flex gap-2">
									<Button type="submit" class="flex-1">Submit Review</Button>
									<Button type="button" variant="outline" onclick={resetForm}>Cancel</Button>
								</div>
							</form>
						</div>
					{/if}
				</Card.Content>
			</Card.Root>
		</div>

		<!-- Reviews List -->
		<div class="lg:col-span-2">
			<div class="mb-6 flex items-center justify-between">
				<h2 class="text-2xl font-bold text-gray-900">
					All Reviews ({data.totalReviews})
				</h2>
			</div>

			{#if data.reviews.length > 0}
				<div class="space-y-6">
					{#each data.reviews as review (review.id)}
						<ReviewCard {review} />
					{/each}
				</div>
			{:else}
				<Card.Root>
					<Card.Content class="py-12 text-center">
						<MessageCircle class="mx-auto mb-4 h-12 w-12 text-gray-400" />
						<h3 class="mb-2 text-lg font-semibold text-gray-900">No reviews yet</h3>
						<p class="text-gray-500">Be the first to share your experience!</p>
						<Button onclick={() => (showReviewForm = true)} class="mt-4">
							Write the First Review
						</Button>
					</Card.Content>
				</Card.Root>
			{/if}
		</div>
	</div>
</div>
