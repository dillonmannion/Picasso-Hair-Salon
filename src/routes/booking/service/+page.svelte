<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import { cn } from '$lib/utils/cn';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let selectedServiceId = $state<string | null>(null);

	function formatPrice(price: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(price);
	}

	function formatDuration(minutes: number): string {
		if (minutes < 60) {
			return `${minutes} min`;
		}
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		if (mins === 0) {
			return `${hours} hour${hours > 1 ? 's' : ''}`;
		}
		return `${hours}h ${mins}min`;
	}

	function selectService(serviceId: string) {
		selectedServiceId = serviceId;
	}

	function continueToNextStep() {
		if (!selectedServiceId) return;
		void goto(`/booking/stylist?service=${selectedServiceId}`);
	}
</script>

<div class="space-y-6">
	<div>
		<h2 class="text-2xl font-semibold text-gray-900">Select a Service</h2>
		<p class="mt-1 text-gray-600">Choose the service you'd like to book</p>
	</div>

	{#if !data.groupedServices || Object.keys(data.groupedServices).length === 0}
		<div class="rounded-lg bg-yellow-50 p-4">
			<p class="text-yellow-800">No services available at the moment. Please check back later.</p>
		</div>
	{:else}
		<div class="space-y-8">
			{#each Object.entries(data.groupedServices || {}) as [category, services] (category)}
				<div>
					<h3 class="mb-4 text-lg font-medium text-gray-900">{category}</h3>
					<div class="grid gap-4 sm:grid-cols-2">
						{#each services as service (service.id)}
							<button
								type="button"
								onclick={() => selectService(service.id)}
								class={cn(
									'relative rounded-lg border-2 p-4 text-left transition-all hover:shadow-md',
									selectedServiceId === service.id
										? 'border-primary bg-primary/5'
										: 'border-gray-200 hover:border-gray-300'
								)}
							>
								{#if selectedServiceId === service.id}
									<div class="absolute top-2 right-2">
										<svg class="text-primary h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
											<path
												fill-rule="evenodd"
												d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
												clip-rule="evenodd"
											/>
										</svg>
									</div>
								{/if}

								{#if service.image_url}
									<img
										src={service.image_url}
										alt={service.name}
										class="mb-3 h-32 w-full rounded object-cover"
									/>
								{/if}

								<h4 class="font-semibold text-gray-900">{service.name}</h4>

								{#if service.description}
									<p class="mt-1 text-sm text-gray-600">{service.description}</p>
								{/if}

								<div class="mt-3 flex items-center justify-between">
									<span class="text-primary text-lg font-semibold">
										{formatPrice(Number(service.price))}
									</span>
									<span class="text-sm text-gray-500">
										{formatDuration(service.duration)}
									</span>
								</div>
							</button>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<div class="flex justify-end pt-4">
		<button
			type="button"
			onclick={continueToNextStep}
			disabled={!selectedServiceId}
			class={cn(
				'rounded-lg px-6 py-3 font-medium transition-all',
				selectedServiceId
					? 'bg-primary hover:bg-primary/90 text-white'
					: 'cursor-not-allowed bg-gray-200 text-gray-400'
			)}
		>
			Continue to Stylist Selection
		</button>
	</div>
</div>
