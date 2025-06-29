<script lang="ts">
	import { cn } from '$lib/utils/cn';

	export let slots: Array<{ time: string; available: boolean }> = [];
	export let selectedTime: string | null = null;
	export let columns: number = 4;

	function formatTime(time: string): string {
		const [hours, minutes] = time.split(':');
		const hour = Number.parseInt(hours ?? '0');
		const ampm = hour >= 12 ? 'PM' : 'AM';
		const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
		return `${displayHour}:${minutes} ${ampm}`;
	}

	function selectTime(time: string, available: boolean) {
		if (available) {
			selectedTime = time;
		}
	}

	// Group slots by period (morning, afternoon, evening)
	$: groupedSlots = slots.reduce(
		(acc, slot) => {
			const hour = Number.parseInt(slot.time.split(':')[0] ?? '0');
			const period = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';

			if (!acc[period]) {
				acc[period] = [];
			}
			acc[period].push(slot);
			return acc;
		},
		{} as Record<string, typeof slots>
	);
</script>

<div class="space-y-6">
	{#if slots.length === 0}
		<div class="rounded-lg bg-yellow-50 p-4">
			<p class="text-yellow-800">No time slots available for the selected date.</p>
		</div>
	{:else}
		{#each Object.entries(groupedSlots) as [period, periodSlots] (period)}
			<div>
				<h4 class="mb-3 text-sm font-medium text-gray-700">{period}</h4>
				<div class="grid grid-cols-{columns} gap-2">
					{#each periodSlots as slot (slot.time)}
						<button
							type="button"
							onclick={() => selectTime(slot.time, slot.available)}
							disabled={!slot.available}
							class={cn(
								'rounded-lg border px-3 py-2 text-sm font-medium transition-all',
								slot.available
									? selectedTime === slot.time
										? 'border-primary bg-primary text-white'
										: 'hover:border-primary hover:text-primary border-gray-300'
									: 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400 line-through'
							)}
						>
							{formatTime(slot.time)}
						</button>
					{/each}
				</div>
			</div>
		{/each}
	{/if}

	{#if selectedTime}
		<div class="rounded-lg bg-gray-50 p-3">
			<p class="text-sm text-gray-600">Selected time:</p>
			<p class="font-medium text-gray-900">{formatTime(selectedTime)}</p>
		</div>
	{/if}
</div>

<style>
	/* Add dynamic grid column classes that Tailwind might not detect */
	.grid-cols-3 {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}
	.grid-cols-4 {
		grid-template-columns: repeat(4, minmax(0, 1fr));
	}
	.grid-cols-5 {
		grid-template-columns: repeat(5, minmax(0, 1fr));
	}
	.grid-cols-6 {
		grid-template-columns: repeat(6, minmax(0, 1fr));
	}
</style>
