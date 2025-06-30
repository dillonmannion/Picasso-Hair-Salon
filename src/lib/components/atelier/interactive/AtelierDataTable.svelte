<script lang="ts" generics="T extends Record<string, any>">
	import { cn } from '$lib/utils';
	import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-svelte';
	import AtelierButton from '../AtelierButton.svelte';

	interface Column<T> {
		key: keyof T;
		header: string;
		sortable?: boolean;
		width?: string;
		align?: 'left' | 'center' | 'right';
		cell?: (value: T[keyof T], row: T) => any;
	}

	interface DataTableProps<T> {
		data: T[];
		columns: Column<T>[];
		striped?: boolean;
		hoverable?: boolean;
		compact?: boolean;
		sortable?: boolean;
		class?: string;
		emptyMessage?: string;
		onrowclick?: (row: T, index: number) => void;
		getrowkey?: (row: T, index: number) => string | number;
	}

	let {
		data = [],
		columns = [],
		striped = true,
		hoverable = true,
		compact = false,
		sortable = true,
		class: className,
		emptyMessage = 'No data available',
		onrowclick,
		getrowkey = (row, index) => index
	}: DataTableProps<T> = $props();

	let sortColumn = $state<keyof T | null>(null);
	let sortDirection = $state<'asc' | 'desc'>('asc');

	// Sort data based on current sort state
	const sortedData = $derived.by(() => {
		if (!sortColumn || !sortable) return data;

		return [...data].sort((a, b) => {
			const aVal = a[sortColumn];
			const bVal = b[sortColumn];

			if (aVal === bVal) return 0;
			if (aVal === null || aVal === undefined) return 1;
			if (bVal === null || bVal === undefined) return -1;

			const comparison = aVal < bVal ? -1 : 1;
			return sortDirection === 'asc' ? comparison : -comparison;
		});
	});

	function handleSort(column: keyof T) {
		if (!sortable) return;

		if (sortColumn === column) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortColumn = column;
			sortDirection = 'asc';
		}
	}

	function getCellAlignment(align?: string) {
		switch (align) {
			case 'center':
				return 'text-center';
			case 'right':
				return 'text-right';
			default:
				return 'text-left';
		}
	}

	const tableClasses = cn(
		'atelier-data-table',
		'w-full border-collapse',
		'border border-atelier-gold/20 dark:border-atelier-gold/10',
		'bg-atelier-cream dark:bg-atelier-dark-card',
		'rounded-lg overflow-hidden shadow-atelier',
		className
	);

	const headerClasses = cn(
		'bg-atelier-gold/5 dark:bg-atelier-gold/10',
		'border-b border-atelier-gold/20 dark:border-atelier-gold/10',
		'font-display font-medium',
		'text-atelier-dark dark:text-atelier-cream',
		compact ? 'px-4 py-2 text-sm' : 'px-6 py-4'
	);

	const cellClasses = cn(
		'border-b border-atelier-gold/10 dark:border-atelier-gold/5',
		'text-atelier-dark/80 dark:text-atelier-cream/80',
		compact ? 'px-4 py-2 text-sm' : 'px-6 py-4'
	);
</script>

<div class="atelier-data-table-wrapper overflow-x-auto">
	<table class={tableClasses}>
		<thead>
			<tr>
				{#each columns as column}
					<th class={cn(headerClasses, getCellAlignment(column.align))} style:width={column.width}>
						{#if sortable && column.sortable !== false}
							<button
								type="button"
								class="hover:text-atelier-gold inline-flex items-center gap-1 transition-colors"
								onclick={() => handleSort(column.key)}
								aria-label={`Sort by ${column.header}`}
							>
								<span>{column.header}</span>
								{#if sortColumn === column.key}
									{#if sortDirection === 'asc'}
										<ChevronUp class="h-4 w-4" />
									{:else}
										<ChevronDown class="h-4 w-4" />
									{/if}
								{:else}
									<ChevronsUpDown class="h-4 w-4 opacity-50" />
								{/if}
							</button>
						{:else}
							{column.header}
						{/if}
					</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#if sortedData.length === 0}
				<tr>
					<td
						colspan={columns.length}
						class="text-atelier-dark/50 dark:text-atelier-cream/50 py-12 text-center"
					>
						{emptyMessage}
					</td>
				</tr>
			{:else}
				{#each sortedData as row, index (getrowkey(row, index))}
					<tr
						class={cn(
							'transition-colors',
							striped && index % 2 === 1 && 'bg-atelier-gold/5 dark:bg-atelier-gold/5',
							hoverable && 'hover:bg-atelier-gold/10 dark:hover:bg-atelier-gold/10',
							onrowclick && 'cursor-pointer'
						)}
						onclick={() => onrowclick?.(row, index)}
						role={onrowclick ? 'button' : undefined}
						tabindex={onrowclick ? 0 : undefined}
						onkeydown={(e) => {
							if (onrowclick && (e.key === 'Enter' || e.key === ' ')) {
								e.preventDefault();
								onrowclick(row, index);
							}
						}}
					>
						{#each columns as column}
							<td class={cn(cellClasses, getCellAlignment(column.align))}>
								{#if column.cell}
									{@render column.cell(row[column.key], row)}
								{:else}
									{row[column.key] ?? ''}
								{/if}
							</td>
						{/each}
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>

<style>
	.atelier-data-table-wrapper {
		/* Custom scrollbar for horizontal overflow */
		scrollbar-width: thin;
		scrollbar-color: var(--color-gold-500) transparent;
	}

	.atelier-data-table-wrapper::-webkit-scrollbar {
		height: 6px;
	}

	.atelier-data-table-wrapper::-webkit-scrollbar-track {
		background: transparent;
	}

	.atelier-data-table-wrapper::-webkit-scrollbar-thumb {
		background-color: var(--color-gold-500);
		border-radius: 3px;
		opacity: 0.5;
	}

	.atelier-data-table-wrapper::-webkit-scrollbar-thumb:hover {
		opacity: 0.7;
	}

	:global(.atelier-data-table) {
		/* Ensure proper rendering on all browsers */
		table-layout: auto;
	}

	:global(.atelier-data-table tbody tr:last-child td) {
		border-bottom: none;
	}
</style>
