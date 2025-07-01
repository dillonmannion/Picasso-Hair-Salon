<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface AtelierInputProps extends Omit<HTMLInputAttributes, 'type' | 'value' | 'class'> {
		type?: HTMLInputAttributes['type'];
		value?: string | number;
		label?: string;
		error?: string;
		success?: boolean;
		required?: boolean;
		disabled?: boolean;
		class?: string;
	}

	let {
		type = 'text',
		value = $bindable(''),
		label,
		error,
		success = false,
		required = false,
		disabled = false,
		placeholder = '',
		class: className = '',
		id = `atelier-input-${Math.random().toString(36).substr(2, 9)}`,
		...restProps
	}: AtelierInputProps = $props();

	const dispatch = createEventDispatcher();

	let isFocused = $state(false);
	let inputElement: HTMLInputElement;

	// Determine if label should float
	let hasValue = $derived(value !== '' && value !== null && value !== undefined);
	let shouldFloat = $derived(hasValue || isFocused || placeholder);

	function handleFocus(event: FocusEvent) {
		isFocused = true;
		dispatch('focus', event);
	}

	function handleBlur(event: FocusEvent) {
		isFocused = false;
		dispatch('blur', event);
	}

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		if (type === 'number') {
			value = target.valueAsNumber || 0;
		} else {
			value = target.value;
		}
		dispatch('input', event);
	}

	function handleChange(event: Event) {
		dispatch('change', event);
	}

	// Determine border color based on state
	let borderColor = $derived(
		error
			? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
			: success
				? 'border-green-500 focus:border-green-500 focus:ring-green-500/30'
				: 'border-gray-300 dark:border-gray-600 focus:border-atelier-gold focus:ring-atelier-gold/30'
	);

	// Determine label color based on state
	let labelColor = $derived(
		error
			? 'text-red-500'
			: success
				? 'text-green-500'
				: isFocused
					? 'text-atelier-gold'
					: 'text-gray-500 dark:text-gray-400'
	);
</script>

<div class="atelier-input-wrapper relative {className}">
	{#if label}
		<label
			for={id}
			class="pointer-events-none absolute left-3 transition-all duration-200 ease-out
				{shouldFloat
				? '-top-2.5 bg-white px-1 text-xs dark:bg-gray-900'
				: 'top-3.5 text-base'} {labelColor}"
		>
			{label}
			{#if required}
				<span class="ml-0.5 text-red-500">*</span>
			{/if}
		</label>
	{/if}

	<input
		bind:this={inputElement}
		{id}
		{type}
		{value}
		{placeholder}
		{required}
		{disabled}
		onfocus={handleFocus}
		onblur={handleBlur}
		oninput={handleInput}
		onchange={handleChange}
		aria-invalid={error ? 'true' : undefined}
		aria-describedby={error ? `${id}-error` : undefined}
		class="atelier-input w-full rounded-lg border bg-white px-4 py-3.5 text-gray-900
			transition-all duration-200 focus:ring-4 focus:outline-none
			disabled:cursor-not-allowed disabled:bg-gray-100
			disabled:opacity-60 dark:bg-gray-900 dark:text-gray-100 disabled:dark:bg-gray-800
			{borderColor}
			{label ? 'pt-5 pb-2' : ''}"
		{...restProps}
	/>

	{#if error}
		<div
			id="{id}-error"
			class="animate-fadeIn absolute -bottom-5 left-0 text-xs text-red-500"
			role="alert"
		>
			{error}
		</div>
	{/if}

	{#if success && !error}
		<div class="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-green-500">
			<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
				<path
					fill-rule="evenodd"
					d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
					clip-rule="evenodd"
				/>
			</svg>
		</div>
	{/if}
</div>

<style>
	/* Animation for error message */
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

	.animate-fadeIn {
		animation: fadeIn 0.2s ease-out;
	}

	/* Ensure smooth transitions */
	.atelier-input {
		font-variant-numeric: tabular-nums;
	}

	/* Remove spinner for number inputs */
	.atelier-input[type='number']::-webkit-inner-spin-button,
	.atelier-input[type='number']::-webkit-outer-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	.atelier-input[type='number'] {
		-moz-appearance: textfield;
	}

	/* Autofill styles */
	.atelier-input:-webkit-autofill {
		-webkit-box-shadow: 0 0 0 1000px white inset;
		-webkit-text-fill-color: inherit;
	}

	:global(.dark) .atelier-input:-webkit-autofill {
		-webkit-box-shadow: 0 0 0 1000px rgb(17 24 39) inset;
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.atelier-input-wrapper * {
			transition-duration: 0.01ms !important;
			animation-duration: 0.01ms !important;
		}
	}

	/* Print styles */
	@media print {
		.atelier-input {
			border: 1px solid #000 !important;
		}
	}
</style>
