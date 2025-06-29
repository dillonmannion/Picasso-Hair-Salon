<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import { cn } from '$lib/utils/cn';

	export let data: PageData;

	let selectedStylistId: string | null = null;
	const serviceId = $page.url.searchParams.get('service');

	function formatRating(rating: number): string {
		return rating.toFixed(1);
	}

	function selectStylist(stylistId: string | null) {
		selectedStylistId = stylistId;
	}

	function goBack() {
		void goto('/booking/service');
	}

	function continueToNextStep() {
		if (!selectedStylistId || !serviceId) return;
		void goto(`/booking/schedule?service=${serviceId}&stylist=${selectedStylistId}`);
	}
</script>

<div class="space-y-6">
	<div>
		<h2 class="text-2xl font-semibold text-gray-900">Select a Stylist</h2>
		<p class="mt-1 text-gray-600">Choose your preferred stylist for {data.service.name}</p>
	</div>

	<div class="space-y-4">
		<!-- Any Stylist Option -->
		<button
			type="button"
			onclick={() => selectStylist('any')}
			class={cn(
				'w-full rounded-lg border-2 p-4 text-left transition-all hover:shadow-md',
				selectedStylistId === 'any'
					? 'border-primary bg-primary/5'
					: 'border-gray-200 hover:border-gray-300'
			)}
		>
			<div class="flex items-center justify-between">
				<div>
					<h4 class="font-semibold text-gray-900">Any Available Stylist</h4>
					<p class="mt-1 text-sm text-gray-600">Let us match you with the next available stylist</p>
				</div>
				{#if selectedStylistId === 'any'}
					<svg class="text-primary h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
							clip-rule="evenodd"
						/>
					</svg>
				{/if}
			</div>
		</button>

		<!-- Individual Stylists -->
		{#each data.stylists as stylist (stylist.id)}
			<button
				type="button"
				onclick={() => selectStylist(stylist.id)}
				class={cn(
					'w-full rounded-lg border-2 p-4 text-left transition-all hover:shadow-md',
					selectedStylistId === stylist.id
						? 'border-primary bg-primary/5'
						: 'border-gray-200 hover:border-gray-300'
				)}
			>
				<div class="flex items-start space-x-4">
					{#if stylist.avatar_url}
						<img
							src={stylist.avatar_url}
							alt={stylist.name}
							class="h-16 w-16 rounded-full object-cover"
						/>
					{:else}
						<div class="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
							<span class="text-xl font-semibold text-gray-600">
								{stylist.name.charAt(0).toUpperCase()}
							</span>
						</div>
					{/if}

					<div class="flex-1">
						<div class="flex items-start justify-between">
							<div>
								<h4 class="font-semibold text-gray-900">{stylist.name}</h4>

								{#if stylist.bio}
									<p class="mt-1 text-sm text-gray-600">{stylist.bio}</p>
								{/if}

								{#if stylist.specialties && stylist.specialties.length > 0}
									<div class="mt-2 flex flex-wrap gap-2">
										{#each stylist.specialties as specialty, i (i)}
											<span
												class="bg-primary/10 text-primary inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
											>
												{specialty}
											</span>
										{/each}
									</div>
								{/if}

								{#if stylist.reviewCount > 0}
									<div class="mt-2 flex items-center space-x-1">
										<div class="flex">
											{#each Array(5) as _, i (i)}
												<svg
													class="h-4 w-4 {i < Math.round(stylist.averageRating)
														? 'text-yellow-400'
														: 'text-gray-300'}"
													fill="currentColor"
													viewBox="0 0 20 20"
												>
													<path
														d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
													/>
												</svg>
											{/each}
										</div>
										<span class="text-sm text-gray-600">
											{formatRating(stylist.averageRating)} ({stylist.reviewCount} reviews)
										</span>
									</div>
								{/if}
							</div>

							{#if selectedStylistId === stylist.id}
								<svg class="text-primary h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
									<path
										fill-rule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
										clip-rule="evenodd"
									/>
								</svg>
							{/if}
						</div>
					</div>
				</div>
			</button>
		{/each}
	</div>

	<div class="flex justify-between pt-4">
		<button
			type="button"
			onclick={goBack}
			class="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-all hover:bg-gray-50"
		>
			Back
		</button>

		<button
			type="button"
			onclick={continueToNextStep}
			disabled={!selectedStylistId}
			class={cn(
				'rounded-lg px-6 py-3 font-medium transition-all',
				selectedStylistId
					? 'bg-primary hover:bg-primary/90 text-white'
					: 'cursor-not-allowed bg-gray-200 text-gray-400'
			)}
		>
			Continue to Schedule
		</button>
	</div>
</div>
