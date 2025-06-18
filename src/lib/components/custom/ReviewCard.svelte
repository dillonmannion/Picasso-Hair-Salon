<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Star } from 'lucide-svelte';

	interface Review {
		id: string;
		rating: number;
		comment: string | null;
		created_at: string;
		users: { full_name: string } | null;
		services: { name: string } | null;
		stylists: { name: string } | null;
	}

	let { review }: { review: Review } = $props();

	// Format date for display
	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	// Generate star rating display
	function getStarArray(rating: number): Array<{ filled: boolean }> {
		return Array.from({ length: 5 }, (_, i) => ({
			filled: i < rating
		}));
	}
</script>

<Card.Root class="h-full">
	<Card.Header>
		<div class="flex items-start justify-between">
			<div class="flex-1">
				<div class="mb-2 flex items-center gap-2">
					{#each getStarArray(review.rating) as star}
						<Star
							class="h-4 w-4 {star.filled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}"
						/>
					{/each}
					<span class="text-sm font-medium text-gray-600">
						{review.rating}/5
					</span>
				</div>

				<div class="flex items-center gap-2 text-sm text-gray-500">
					{#if review.users?.full_name}
						<span class="font-medium">{review.users.full_name}</span>
						<span>•</span>
					{/if}
					<span>{formatDate(review.created_at)}</span>
				</div>
			</div>
		</div>
	</Card.Header>

	{#if review.comment}
		<Card.Content>
			<p class="leading-relaxed text-gray-700">
				"{review.comment}"
			</p>
		</Card.Content>
	{/if}

	<Card.Footer class="pt-0">
		<div class="flex flex-wrap gap-2">
			{#if review.services?.name}
				<Badge variant="secondary" class="text-xs">
					Service: {review.services.name}
				</Badge>
			{/if}
			{#if review.stylists?.name}
				<Badge variant="outline" class="text-xs">
					Stylist: {review.stylists.name}
				</Badge>
			{/if}
		</div>
	</Card.Footer>
</Card.Root>
