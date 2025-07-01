<script lang="ts">
	import type { HTMLSelectAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';
	import { validate, type ValidationRule } from '../utils/validation';

	export type SelectOption = {
		value: string | number;
		label: string;
		disabled?: boolean;
	};

	interface SelectProps extends Omit<HTMLSelectAttributes, 'value'> {
		label?: string;
		error?: string;
		hint?: string;
		options: SelectOption[];
		placeholder?: string;
		rules?: ValidationRule[];
		validateOnBlur?: boolean;
		validateOnChange?: boolean;
		class?: string;
		containerClass?: string;
		labelClass?: string;
		selectClass?: string;
		errorClass?: string;
		hintClass?: string;
		value?: string | number;
	}

	let {
		label,
		error: externalError,
		hint,
		options = [],
		placeholder = 'Select an option',
		rules = [],
		validateOnBlur = true,
		validateOnChange = false,
		class: className,
		containerClass,
		labelClass,
		selectClass,
		errorClass,
		hintClass,
		value = $bindable(''),
		disabled = false,
		required = false,
		id,
		name,
		...restProps
	}: SelectProps = $props();

	let touched = $state(false);
	let internalError = $state('');

	const error = $derived(externalError || internalError);
	const hasError = $derived(!!error && touched);
	const selectId = $derived(id || `atelier-select-${crypto.randomUUID()}`);

	function handleValidation(val: any) {
		if (rules.length > 0) {
			const result = validate(val, rules);
			internalError = result.errors[0] || '';
		}
	}

	function handleBlur(e: FocusEvent) {
		touched = true;
		if (validateOnBlur) {
			handleValidation(value);
		}
		restProps.onblur?.(e);
	}

	function handleChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		value = target.value;
		if (validateOnChange) {
			handleValidation(value);
		}
		restProps.onchange?.(e);
	}

	const baseSelectStyles = `
		w-full px-4 py-2.5 pr-10
		bg-white dark:bg-gray-900 
		border rounded-lg 
		font-sans text-base
		transition-all duration-200
		focus:outline-none focus:ring-2 focus:ring-offset-0
		appearance-none
		cursor-pointer
	`;

	const stateStyles = {
		default: `
			border-atelier-border dark:border-gray-700
			text-gray-900 dark:text-gray-100
			focus:border-atelier-primary focus:ring-atelier-primary/20
		`,
		error: `
			border-red-500 dark:border-red-400
			text-gray-900 dark:text-gray-100
			focus:border-red-500 focus:ring-red-500/20
		`,
		disabled: `
			bg-gray-50 dark:bg-gray-950
			border-gray-200 dark:border-gray-800
			text-gray-500 dark:text-gray-500
			cursor-not-allowed
		`
	};

	const computedSelectClass = $derived(
		cn(
			baseSelectStyles,
			hasError ? stateStyles.error : stateStyles.default,
			disabled && stateStyles.disabled,
			selectClass,
			className
		)
	);
</script>

<div class={cn('atelier-select-container', containerClass)}>
	{#if label}
		<label
			for={selectId}
			class={cn(
				'mb-1.5 block text-sm font-medium',
				'text-gray-700 dark:text-gray-300',
				hasError && 'text-red-600 dark:text-red-400',
				disabled && 'text-gray-500 dark:text-gray-500',
				labelClass
			)}
		>
			{label}
			{#if required}
				<span class="ml-0.5 text-red-500">*</span>
			{/if}
		</label>
	{/if}

	<div class="relative">
		<select
			{...restProps}
			id={selectId}
			{name}
			{disabled}
			{required}
			bind:value
			onblur={handleBlur}
			onchange={handleChange}
			class={computedSelectClass}
			aria-invalid={hasError}
			aria-describedby={hasError ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
		>
			{#if placeholder}
				<option value="" disabled selected hidden>{placeholder}</option>
			{/if}
			{#each options as option}
				<option value={option.value} disabled={option.disabled}>
					{option.label}
				</option>
			{/each}
		</select>

		<div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
			<svg
				class={cn('h-5 w-5', hasError ? 'text-red-500' : 'text-gray-400 dark:text-gray-600')}
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
			</svg>
		</div>
	</div>

	{#if hasError}
		<p
			id={`${selectId}-error`}
			class={cn('mt-1.5 text-sm text-red-600 dark:text-red-400', errorClass)}
			role="alert"
		>
			{error}
		</p>
	{:else if hint}
		<p
			id={`${selectId}-hint`}
			class={cn('mt-1.5 text-sm text-gray-500 dark:text-gray-400', hintClass)}
		>
			{hint}
		</p>
	{/if}
</div>

<style>
	select option {
		background-color: var(--atelier-background);
		color: var(--atelier-foreground);
	}

	:global(.dark) select option {
		background-color: rgb(17 24 39);
		color: rgb(243 244 246);
	}

	@media (prefers-reduced-motion: reduce) {
		select {
			transition: none;
		}
	}
</style>
