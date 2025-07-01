<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { ChevronDown, X, Check } from 'lucide-svelte';

	interface Option {
		value: string;
		label: string;
		disabled?: boolean;
	}

	interface AtelierSelectProps {
		options: Option[];
		value?: string | string[];
		placeholder?: string;
		label?: string;
		multiple?: boolean;
		searchable?: boolean;
		error?: string;
		required?: boolean;
		disabled?: boolean;
		class?: string;
		id?: string;
	}

	let {
		options = [],
		value = $bindable(undefined),
		placeholder = 'Select an option',
		label,
		multiple = false,
		searchable = false,
		error,
		required = false,
		disabled = false,
		class: className = '',
		id = `atelier-select-${Math.random().toString(36).substr(2, 9)}`,
		...restProps
	}: AtelierSelectProps = $props();

	const dispatch = createEventDispatcher();

	let isOpen = $state(false);
	let searchQuery = $state('');
	let highlightedIndex = $state(-1);
	let selectElement: HTMLDivElement;
	let searchInput: HTMLInputElement;

	// Normalize value to always be an array internally for easier handling
	let internalValue = $derived(
		multiple
			? Array.isArray(value)
				? value
				: value
					? [value]
					: []
			: Array.isArray(value)
				? value[0]
				: value
	);

	// Filter options based on search
	let filteredOptions = $derived(
		searchable && searchQuery
			? options.filter((opt) => opt.label.toLowerCase().includes(searchQuery.toLowerCase()))
			: options
	);

	// Get display text
	let displayText = $derived(
		multiple
			? Array.isArray(internalValue) && internalValue.length > 0
				? `${internalValue.length} selected`
				: placeholder
			: internalValue
				? (options.find((opt) => opt.value === internalValue)?.label ?? placeholder)
				: placeholder
	);

	function toggleDropdown() {
		if (disabled) return;

		isOpen = !isOpen;
		if (isOpen && searchable) {
			// Focus search input when opening
			setTimeout(() => searchInput?.focus(), 50);
		}
	}

	function selectOption(option: Option) {
		if (option.disabled) return;

		if (multiple) {
			const currentValues = Array.isArray(value) ? value : [];
			if (currentValues.includes(option.value)) {
				value = currentValues.filter((v) => v !== option.value);
			} else {
				value = [...currentValues, option.value];
			}
		} else {
			value = option.value;
			isOpen = false;
		}

		dispatch('change', { value });
	}

	function clearSelection() {
		value = multiple ? [] : undefined;
		dispatch('change', { value });
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (disabled) return;

		switch (event.key) {
			case 'Enter':
			case ' ':
				if (!isOpen) {
					event.preventDefault();
					isOpen = true;
				} else if (highlightedIndex >= 0) {
					event.preventDefault();
					selectOption(filteredOptions[highlightedIndex]);
				}
				break;
			case 'Escape':
				if (isOpen) {
					event.preventDefault();
					isOpen = false;
				}
				break;
			case 'ArrowDown':
				event.preventDefault();
				if (!isOpen) {
					isOpen = true;
				} else {
					highlightedIndex = Math.min(highlightedIndex + 1, filteredOptions.length - 1);
				}
				break;
			case 'ArrowUp':
				event.preventDefault();
				if (isOpen) {
					highlightedIndex = Math.max(highlightedIndex - 1, -1);
				}
				break;
		}
	}

	function handleClickOutside(event: MouseEvent) {
		if (selectElement && !selectElement.contains(event.target as Node)) {
			isOpen = false;
		}
	}

	function isSelected(optionValue: string): boolean {
		if (multiple) {
			return Array.isArray(value) && value.includes(optionValue);
		}
		return value === optionValue;
	}

	// Reset highlighted index when filtered options change
	$effect(() => {
		// Access filteredOptions to trigger reactivity
		void filteredOptions;
		highlightedIndex = -1;
	});

	// Handle click outside
	$effect(() => {
		if (typeof window !== 'undefined') {
			if (isOpen) {
				window.addEventListener('click', handleClickOutside);
				return () => {
					window.removeEventListener('click', handleClickOutside);
				};
			}
		}
	});
</script>

<div bind:this={selectElement} class="atelier-select-wrapper relative {className}">
	{#if label}
		<label for={id} class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
			{label}
			{#if required}
				<span class="ml-0.5 text-red-500">*</span>
			{/if}
		</label>
	{/if}

	<div
		{id}
		role="combobox"
		aria-expanded={isOpen}
		aria-haspopup="listbox"
		aria-controls="{id}-listbox"
		aria-invalid={error ? 'true' : undefined}
		aria-describedby={error ? `${id}-error` : undefined}
		tabindex={disabled ? -1 : 0}
		class="atelier-select relative w-full cursor-pointer rounded-lg border bg-white px-4 py-3
			text-gray-900 transition-all duration-200 focus:ring-4 focus:outline-none
			dark:bg-gray-900 dark:text-gray-100
			{error
			? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
			: 'focus:border-atelier-gold focus:ring-atelier-gold/30 border-gray-300 dark:border-gray-600'}
			{disabled ? 'cursor-not-allowed bg-gray-100 opacity-60 dark:bg-gray-800' : ''}"
		onclick={toggleDropdown}
		onkeydown={handleKeyDown}
		{...restProps}
	>
		<div class="flex items-center justify-between">
			<span class={!internalValue ? 'text-gray-500' : ''}>
				{displayText}
			</span>
			<div class="flex items-center gap-2">
				{#if internalValue && !disabled}
					<button
						type="button"
						onclick={(e) => {
							e.stopPropagation();
							clearSelection();
						}}
						class="text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
						aria-label="Clear selection"
					>
						<X size={18} />
					</button>
				{/if}
				<ChevronDown
					size={20}
					class="text-gray-400 transition-transform duration-200 {isOpen ? 'rotate-180' : ''}"
				/>
			</div>
		</div>
	</div>

	{#if isOpen}
		<div
			id="{id}-listbox"
			role="listbox"
			aria-multiselectable={multiple}
			class="animate-slideDown absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg
				border border-gray-300 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-900"
		>
			{#if searchable}
				<div
					class="sticky top-0 border-b border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-900"
				>
					<input
						bind:this={searchInput}
						bind:value={searchQuery}
						type="text"
						placeholder="Search..."
						class="focus:ring-atelier-gold/50 w-full rounded-md border border-gray-300 bg-white px-3
							py-2 text-sm text-gray-900 focus:ring-2 focus:outline-none
							dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
						onclick={(e) => e.stopPropagation()}
					/>
				</div>
			{/if}

			{#if filteredOptions.length === 0}
				<div class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">No options found</div>
			{:else}
				{#each filteredOptions as option, index (option.value)}
					<div
						role="option"
						aria-selected={isSelected(option.value)}
						aria-disabled={option.disabled}
						class="flex cursor-pointer items-center justify-between px-4 py-3 transition-colors
							{option.disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}
							{highlightedIndex === index ? 'bg-gray-100 dark:bg-gray-800' : ''}
							{isSelected(option.value) ? 'text-atelier-gold' : ''}"
						onclick={() => selectOption(option)}
						onmouseenter={() => (highlightedIndex = index)}
					>
						<span>{option.label}</span>
						{#if isSelected(option.value)}
							<Check size={18} />
						{/if}
					</div>
				{/each}
			{/if}
		</div>
	{/if}

	{#if error}
		<div
			id="{id}-error"
			class="animate-fadeIn absolute -bottom-5 left-0 text-xs text-red-500"
			role="alert"
		>
			{error}
		</div>
	{/if}
</div>

<style>
	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-slideDown {
		animation: slideDown 0.2s ease-out;
	}

	.animate-fadeIn {
		animation: fadeIn 0.2s ease-out;
	}

	/* Scrollbar styling */
	.atelier-select-wrapper [role='listbox'] {
		scrollbar-width: thin;
		scrollbar-color: rgb(209 213 219) transparent;
	}

	:global(.dark) .atelier-select-wrapper [role='listbox'] {
		scrollbar-color: rgb(75 85 99) transparent;
	}

	.atelier-select-wrapper [role='listbox']::-webkit-scrollbar {
		width: 6px;
	}

	.atelier-select-wrapper [role='listbox']::-webkit-scrollbar-track {
		background: transparent;
	}

	.atelier-select-wrapper [role='listbox']::-webkit-scrollbar-thumb {
		background-color: rgb(209 213 219);
		border-radius: 3px;
	}

	:global(.dark) .atelier-select-wrapper [role='listbox']::-webkit-scrollbar-thumb {
		background-color: rgb(75 85 99);
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.atelier-select-wrapper * {
			transition-duration: 0.01ms !important;
			animation-duration: 0.01ms !important;
		}
	}

	/* Print styles */
	@media print {
		.atelier-select-wrapper [role='listbox'] {
			display: none !important;
		}
	}
</style>
