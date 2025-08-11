<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { SvelteDate } from 'svelte/reactivity';

	interface Props {
		selectedDate?: string | null;
		minDate?: Date;
		maxDate?: Date;
		disabledDates?: string[];
		onDateSelect?: (date: string) => void;
	}

	let {
		selectedDate = null,
		minDate = new Date(),
		maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
		disabledDates = [],
		onDateSelect
	}: Props = $props();

	let currentMonth = new SvelteDate(minDate);
	let weeks = $state<Date[][]>([]);

	$effect(() => {
		generateCalendar(currentMonth);
	});

	function generateCalendar(month: Date) {
		const year = month.getFullYear();
		const monthIndex = month.getMonth();
		const firstDay = new SvelteDate(year, monthIndex, 1);
		const lastDay = new SvelteDate(year, monthIndex + 1, 0);
		const startDate = new SvelteDate(firstDay);
		startDate.setDate(startDate.getDate() - firstDay.getDay());

		const newWeeks: Date[][] = [];
		let currentWeek: Date[] = [];

		while (startDate <= lastDay || currentWeek.length > 0) {
			currentWeek.push(new SvelteDate(startDate));

			if (currentWeek.length === 7) {
				newWeeks.push(currentWeek);
				currentWeek = [];
			}

			startDate.setDate(startDate.getDate() + 1);
		}

		weeks = newWeeks;
	}

	function formatDate(date: Date): string {
		return date.toISOString().split('T')[0] ?? '';
	}

	function isDateDisabled(date: Date): boolean {
		const dateStr = formatDate(date);
		return (
			date < minDate || date > maxDate || disabledDates.includes(dateStr) || date.getDay() === 0 // Disable Sundays
		);
	}

	function isDateInCurrentMonth(date: Date): boolean {
		return date.getMonth() === currentMonth.getMonth();
	}

	function selectDate(date: Date) {
		if (!isDateDisabled(date) && onDateSelect) {
			onDateSelect(formatDate(date));
		}
	}

	function previousMonth() {
		currentMonth = new SvelteDate(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
	}

	function nextMonth() {
		currentMonth = new SvelteDate(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
	}

	const monthNames = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];

	const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
</script>

<div class="w-full max-w-sm">
	<!-- Month Navigation -->
	<div class="mb-4 flex items-center justify-between">
		<button
			type="button"
			onclick={previousMonth}
			class="rounded p-2 hover:bg-gray-100"
			aria-label="Previous month"
		>
			<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"
				></path>
			</svg>
		</button>

		<h3 class="text-lg font-semibold">
			{monthNames[currentMonth.getMonth()]}
			{currentMonth.getFullYear()}
		</h3>

		<button
			type="button"
			onclick={nextMonth}
			class="rounded p-2 hover:bg-gray-100"
			aria-label="Next month"
		>
			<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"
				></path>
			</svg>
		</button>
	</div>

	<!-- Calendar Grid -->
	<div class="rounded-lg border">
		<!-- Day Headers -->
		<div class="grid grid-cols-7 border-b">
			{#each dayNames as day, i (i)}
				<div class="p-2 text-center text-xs font-medium text-gray-700">
					{day}
				</div>
			{/each}
		</div>

		<!-- Date Grid -->
		{#each weeks as week, weekIndex (weekIndex)}
			<div class="grid grid-cols-7">
				{#each week as date, dateIndex (dateIndex)}
					<button
						type="button"
						onclick={() => selectDate(date)}
						disabled={isDateDisabled(date)}
						class={cn(
							'relative p-2 text-sm transition-colors',
							isDateInCurrentMonth(date) ? 'text-gray-900' : 'text-gray-400',
							isDateDisabled(date) && 'cursor-not-allowed opacity-50',
							!isDateDisabled(date) && 'hover:bg-gray-100',
							selectedDate === formatDate(date) && 'bg-primary hover:bg-primary/90 text-white',
							formatDate(date) === formatDate(new Date()) && !selectedDate && 'font-bold'
						)}
					>
						{date.getDate()}
						{#if formatDate(date) === formatDate(new Date())}
							<div
								class="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-current"
							></div>
						{/if}
					</button>
				{/each}
			</div>
		{/each}
	</div>

	<!-- Selected Date Display -->
	{#if selectedDate}
		<div class="mt-4 rounded-lg bg-gray-50 p-3">
			<p class="text-sm text-gray-600">Selected date:</p>
			<p class="font-medium text-gray-900">
				{new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
					weekday: 'long',
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				})}
			</p>
		</div>
	{/if}
</div>
