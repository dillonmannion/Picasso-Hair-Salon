<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';
	import { validate, type ValidationRule } from '../utils/validation';

	interface InputProps extends HTMLInputAttributes {
		label?: string;
		error?: string;
		hint?: string;
		rules?: ValidationRule[];
		validateOnBlur?: boolean;
		validateOnChange?: boolean;
		class?: string;
		containerClass?: string;
		labelClass?: string;
		inputClass?: string;
		errorClass?: string;
		hintClass?: string;
	}

	let {
		label,
		error: externalError,
		hint,
		rules = [],
		validateOnBlur = true,
		validateOnChange = false,
		class: className,
		containerClass,
		labelClass,
		inputClass,
		errorClass,
		hintClass,
		value = $bindable(''),
		type = 'text',
		disabled = false,
		required = false,
		id,
		name,
		placeholder,
		...restProps
	}: InputProps = $props();

	let touched = $state(false);
	let internalError = $state('');

	const error = $derived(externalError || internalError);
	const hasError = $derived(!!error && touched);
	const inputId = $derived(id || `atelier-input-${crypto.randomUUID()}`);

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

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		value = target.value;
		if (validateOnChange && touched) {
			handleValidation(value);
		}
		restProps.oninput?.(e);
	}

	const baseInputStyles = `
		w-full px-4 py-2.5 
		bg-white dark:bg-gray-900 
		border rounded-lg 
		font-sans text-base
		transition-all duration-200
		placeholder:text-gray-400 dark:placeholder:text-gray-600
		focus:outline-none focus:ring-2 focus:ring-offset-0
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

	const computedInputClass = $derived(
		cn(
			baseInputStyles,
			hasError ? stateStyles.error : stateStyles.default,
			disabled && stateStyles.disabled,
			inputClass,
			className
		)
	);
</script>

<div class={cn('atelier-input-container', containerClass)}>
	{#if label}
		<label
			for={inputId}
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
		<input
			{...restProps}
			id={inputId}
			{type}
			{name}
			{placeholder}
			{disabled}
			{required}
			bind:value
			onblur={handleBlur}
			oninput={handleInput}
			class={computedInputClass}
			aria-invalid={hasError}
			aria-describedby={hasError ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
		/>

		{#if type === 'password' && value}
			<button
				type="button"
				onclick={() => (type = type === 'password' ? 'text' : 'password')}
				class="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
				aria-label={type === 'password' ? 'Show password' : 'Hide password'}
			>
				<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					{#if type === 'password'}
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
						/>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
						/>
					{:else}
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
						/>
					{/if}
				</svg>
			</button>
		{/if}
	</div>

	{#if hasError}
		<p
			id={`${inputId}-error`}
			class={cn('mt-1.5 text-sm text-red-600 dark:text-red-400', errorClass)}
			role="alert"
		>
			{error}
		</p>
	{:else if hint}
		<p
			id={`${inputId}-hint`}
			class={cn('mt-1.5 text-sm text-gray-500 dark:text-gray-400', hintClass)}
		>
			{hint}
		</p>
	{/if}
</div>
