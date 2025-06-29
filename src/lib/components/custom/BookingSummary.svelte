<script lang="ts">
	import type { Database } from '$lib/types/database.types';
	import { formatDate, formatTime, formatPrice, formatDuration } from '$lib/utils/formatters';

	type Service = Database['public']['Tables']['services']['Row'];
	type Stylist = Database['public']['Tables']['stylists']['Row'];

	export let service: Service | null = null;
	export let stylist: Stylist | null = null;
	export let date: string | null = null;
	export let time: string | null = null;
	export let isAnyStylist: boolean = false;
</script>

<div class="rounded-lg border bg-gray-50 p-6">
	<h3 class="mb-4 text-lg font-semibold text-gray-900">Booking Summary</h3>

	<dl class="space-y-3">
		{#if service}
			<div class="flex justify-between">
				<dt class="text-sm font-medium text-gray-600">Service:</dt>
				<dd class="text-sm text-gray-900">{service.name}</dd>
			</div>

			<div class="flex justify-between">
				<dt class="text-sm font-medium text-gray-600">Duration:</dt>
				<dd class="text-sm text-gray-900">{formatDuration(service.duration)}</dd>
			</div>

			<div class="flex justify-between">
				<dt class="text-sm font-medium text-gray-600">Price:</dt>
				<dd class="text-sm font-semibold text-gray-900">{formatPrice(Number(service.price))}</dd>
			</div>
		{/if}

		{#if stylist ?? isAnyStylist}
			<div class="flex justify-between">
				<dt class="text-sm font-medium text-gray-600">Stylist:</dt>
				<dd class="text-sm text-gray-900">
					{isAnyStylist ? 'Any Available Stylist' : (stylist?.name ?? 'Not selected')}
				</dd>
			</div>
		{/if}

		{#if date && time}
			<div class="border-t pt-3">
				<div class="flex justify-between">
					<dt class="text-sm font-medium text-gray-600">Date:</dt>
					<dd class="text-sm text-gray-900">{formatDate(date)}</dd>
				</div>

				<div class="mt-2 flex justify-between">
					<dt class="text-sm font-medium text-gray-600">Time:</dt>
					<dd class="text-sm text-gray-900">{formatTime(time)}</dd>
				</div>
			</div>
		{/if}
	</dl>

	{#if service}
		<div class="mt-6 border-t pt-4">
			<div class="flex justify-between">
				<span class="text-base font-semibold text-gray-900">Total:</span>
				<span class="text-primary text-base font-semibold"
					>{formatPrice(Number(service.price))}</span
				>
			</div>
		</div>
	{/if}
</div>
