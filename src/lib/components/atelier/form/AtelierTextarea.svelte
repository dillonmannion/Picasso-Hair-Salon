<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	interface AtelierTextareaProps extends Omit<HTMLTextareaAttributes, 'value' | 'class'> {
		value?: string;
		label?: string;
		error?: string;
		maxLength?: number;
		autoResize?: boolean;
		rows?: number;
		required?: boolean;
		disabled?: boolean;
		class?: string;
	}

	let {
		value = $bindable(''),
		label,
		error,
		maxLength,
		autoResize = true,
		rows = 4,
		required = false,
		disabled = false,
		placeholder = '',
		class: className = '',
		id = `atelier-textarea-${Math.random().toString(36).substr(2, 9)}`,
		...restProps
	}: AtelierTextareaProps = $props();

	const dispatch = createEventDispatcher();

	let isFocused = $state(false);
	let textareaElement: HTMLTextAreaElement;

	// Calculate character count
	$: charCount = value.length;
	$: charPercentage = maxLength ? (charCount / maxLength) * 100 : 0;

	// Determine if label should float
	$: hasValue = value !== '';
	$: shouldFloat = hasValue || isFocused || placeholder;

	// Auto-resize logic
	function adjustHeight() {
		if (!autoResize || !textareaElement) return;

		// Reset height to recalculate
		textareaElement.style.height = 'auto';

		// Set new height based on scrollHeight
		const newHeight = Math.max(
			textareaElement.scrollHeight,
			parseInt(getComputedStyle(textareaElement).minHeight) || 0
		);

		textareaElement.style.height = `${newHeight}px`;
	}

	function handleFocus(event: FocusEvent) {
		isFocused = true;
		dispatch('focus', event);
	}

	function handleBlur(event: FocusEvent) {
		isFocused = false;
		dispatch('blur', event);
	}

	function handleInput(event: Event) {
		const target = event.target as HTMLTextAreaElement;
		value = target.value;

		// Enforce maxLength if specified
		if (maxLength && value.length > maxLength) {
			value = value.slice(0, maxLength);
			target.value = value;
		}

		adjustHeight();
		dispatch('input', event);
	}

	function handleChange(event: Event) {
		dispatch('change', event);
	}

	// Determine border color based on state
	$: borderColor = error
		? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
		: charPercentage > 90 && maxLength
			? 'border-orange-500 focus:border-orange-500 focus:ring-orange-500/30'
			: 'border-gray-300 dark:border-gray-600 focus:border-atelier-gold focus:ring-atelier-gold/30';

	// Determine label color
	$: labelColor = error
		? 'text-red-500'
		: isFocused
			? 'text-atelier-gold'
			: 'text-gray-500 dark:text-gray-400';

	// Determine character count color
	$: charCountColor =
		charPercentage > 90
			? 'text-orange-500'
			: charPercentage > 75
				? 'text-yellow-600'
				: 'text-gray-500';

	// Initial height adjustment
	onMount(() => {
		adjustHeight();
	});

	// Adjust height when value changes programmatically
	$: if (textareaElement && value !== undefined) {
		adjustHeight();
	}
</script>

<div class="atelier-textarea-wrapper relative {className}">
	{#if label}
		<label
			for={id}
			class="pointer-events-none absolute left-3 z-10 transition-all duration-200 ease-out
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

	<textarea
		bind:this={textareaElement}
		{id}
		{value}
		{rows}
		{placeholder}
		{required}
		{disabled}
		onfocus={handleFocus}
		onblur={handleBlur}
		oninput={handleInput}
		onchange={handleChange}
		aria-invalid={error ? 'true' : undefined}
		aria-describedby={error ? `${id}-error` : maxLength ? `${id}-char-count` : undefined}
		class="atelier-textarea w-full resize-none rounded-lg border bg-white px-4 py-3.5
			text-gray-900 transition-all duration-200 focus:ring-4 focus:outline-none
			disabled:cursor-not-allowed disabled:bg-gray-100
			disabled:opacity-60 dark:bg-gray-900 dark:text-gray-100 disabled:dark:bg-gray-800
			{borderColor}
			{label ? 'pt-6 pb-2' : ''}
			{autoResize ? '' : 'overflow-auto'}"
		style="min-height: {rows * 1.5}rem;"
		{...restProps}
	/>

	{#if maxLength}
		<div
			id="{id}-char-count"
			class="absolute right-0 -bottom-5 text-xs {charCountColor} transition-colors duration-200"
			aria-live="polite"
			aria-atomic="true"
		>
			{charCount}/{maxLength}
		</div>
	{/if}

	{#if error}
		<div
			id="{id}-error"
			class="animate-fadeIn absolute -bottom-5 left-0 text-xs text-red-500 {maxLength
				? 'mr-20'
				: ''}"
			role="alert"
		>
			{error}
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

	/* Ensure smooth height transitions */
	.atelier-textarea {
		transition:
			border-color 0.2s,
			box-shadow 0.2s,
			height 0.1s ease-out;
	}

	/* Custom scrollbar for non-auto-resize mode */
	.atelier-textarea:not([style*='height']) {
		scrollbar-width: thin;
		scrollbar-color: rgb(209 213 219) transparent;
	}

	:global(.dark) .atelier-textarea:not([style*='height']) {
		scrollbar-color: rgb(75 85 99) transparent;
	}

	.atelier-textarea::-webkit-scrollbar {
		width: 6px;
	}

	.atelier-textarea::-webkit-scrollbar-track {
		background: transparent;
	}

	.atelier-textarea::-webkit-scrollbar-thumb {
		background-color: rgb(209 213 219);
		border-radius: 3px;
	}

	:global(.dark) .atelier-textarea::-webkit-scrollbar-thumb {
		background-color: rgb(75 85 99);
	}

	/* Autofill styles */
	.atelier-textarea:-webkit-autofill {
		-webkit-box-shadow: 0 0 0 1000px white inset;
		-webkit-text-fill-color: inherit;
	}

	:global(.dark) .atelier-textarea:-webkit-autofill {
		-webkit-box-shadow: 0 0 0 1000px rgb(17 24 39) inset;
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.atelier-textarea-wrapper * {
			transition-duration: 0.01ms !important;
			animation-duration: 0.01ms !important;
		}

		.atelier-textarea {
			transition: none !important;
		}
	}

	/* Print styles */
	@media print {
		.atelier-textarea {
			border: 1px solid #000 !important;
			height: auto !important;
		}
	}
</style>
