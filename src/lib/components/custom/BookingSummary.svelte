<script lang="ts">
	import type { Database } from '$lib/types/database.types';

	type Service = Database['public']['Tables']['services']['Row'];
	type Stylist = Database['public']['Tables']['stylists']['Row'];

	export let service: Service | null = null;
	export let stylist: Stylist | null = null;
	export let date: string | null = null;
	export let time: string | null = null;
	export let isAnyStylist: boolean = false;

	function formatDate(dateStr: string): string {
		return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function formatTime(timeStr: string): string {
		const [hours, minutes] = timeStr.split(':');
		const hour = Number.parseInt(hours || '0');
		const ampm = hour >= 12 ? 'PM' : 'AM';
		const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
		return `${displayHour}:${minutes} ${ampm}`;
	}

	function formatPrice(price: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(price);
	}

	function formatDuration(minutes: number): string {
		if (minutes < 60) {
			return `${minutes} minutes`;
		}
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		if (mins === 0) {
			return `${hours} hour${hours > 1 ? 's' : ''}`;
		}
		return `${hours} hour ${mins} minutes`;
	}
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

		{#if stylist || isAnyStylist}
			<div class="flex justify-between">
				<dt class="text-sm font-medium text-gray-600">Stylist:</dt>
				<dd class="text-sm text-gray-900">
					{isAnyStylist ? 'Any Available Stylist' : stylist?.name || 'Not selected'}
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
