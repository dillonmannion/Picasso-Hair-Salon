<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';
	import { validate, type ValidationRule } from '../utils/validation';

	interface TextareaProps extends HTMLTextareaAttributes {
		label?: string;
		error?: string;
		hint?: string;
		rules?: ValidationRule[];
		validateOnBlur?: boolean;
		validateOnChange?: boolean;
		autoResize?: boolean;
		minRows?: number;
		maxRows?: number;
		class?: string;
		containerClass?: string;
		labelClass?: string;
		textareaClass?: string;
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
		autoResize = true,
		minRows = 3,
		maxRows = 10,
		class: className,
		containerClass,
		labelClass,
		textareaClass,
		errorClass,
		hintClass,
		value = $bindable(''),
		disabled = false,
		required = false,
		id,
		name,
		placeholder,
		rows = minRows,
		...restProps
	}: TextareaProps = $props();

	let touched = $state(false);
	let internalError = $state('');
	let textareaRef: HTMLTextAreaElement;
	
	const error = $derived(externalError || internalError);
	const hasError = $derived(!!error && touched);
	const textareaId = $derived(id || `atelier-textarea-${crypto.randomUUID()}`);

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
		const target = e.target as HTMLTextAreaElement;
		value = target.value;
		
		if (autoResize) {
			adjustHeight();
		}
		
		if (validateOnChange && touched) {
			handleValidation(value);
		}
		
		restProps.oninput?.(e);
	}

	function adjustHeight() {
		if (!textareaRef || !autoResize) return;

		textareaRef.style.height = 'auto';
		
		const scrollHeight = textareaRef.scrollHeight;
		const lineHeight = parseInt(getComputedStyle(textareaRef).lineHeight);
		const minHeight = lineHeight * minRows;
		const maxHeight = lineHeight * maxRows;
		
		const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
		textareaRef.style.height = `${newHeight}px`;
	}

	$effect(() => {
		if (autoResize && textareaRef) {
			adjustHeight();
		}
	});

	const baseTextareaStyles = `
		w-full px-4 py-2.5 
		bg-white dark:bg-gray-900 
		border rounded-lg 
		font-sans text-base
		transition-all duration-200
		placeholder:text-gray-400 dark:placeholder:text-gray-600
		focus:outline-none focus:ring-2 focus:ring-offset-0
		resize-none
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

	const computedTextareaClass = $derived(
		cn(
			baseTextareaStyles,
			hasError ? stateStyles.error : stateStyles.default,
			disabled && stateStyles.disabled,
			!autoResize && 'resize-y',
			textareaClass,
			className
		)
	);
</script>

<div class={cn('atelier-textarea-container', containerClass)}>
	{#if label}
		<label
			for={textareaId}
			class={cn(
				'block mb-1.5 text-sm font-medium',
				'text-gray-700 dark:text-gray-300',
				hasError && 'text-red-600 dark:text-red-400',
				disabled && 'text-gray-500 dark:text-gray-500',
				labelClass
			)}
		>
			{label}
			{#if required}
				<span class="text-red-500 ml-0.5">*</span>
			{/if}
		</label>
	{/if}

	<div class="relative">
		<textarea
			{...restProps}
			bind:this={textareaRef}
			id={textareaId}
			{name}
			{placeholder}
			{disabled}
			{required}
			{rows}
			bind:value
			onblur={handleBlur}
			oninput={handleInput}
			class={computedTextareaClass}
			aria-invalid={hasError}
			aria-describedby={hasError ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined}
		/>

		{#if value && !disabled}
			<div class="absolute bottom-2 right-2 text-xs text-gray-400 dark:text-gray-600 pointer-events-none">
				{value.length} characters
			</div>
		{/if}
	</div>

	{#if hasError}
		<p
			id={`${textareaId}-error`}
			class={cn(
				'mt-1.5 text-sm text-red-600 dark:text-red-400',
				errorClass
			)}
			role="alert"
		>
			{error}
		</p>
	{:else if hint}
		<p
			id={`${textareaId}-hint`}
			class={cn(
				'mt-1.5 text-sm text-gray-500 dark:text-gray-400',
				hintClass
			)}
		>
			{hint}
		</p>
	{/if}
</div>

<style>
	textarea {
		field-sizing: content;
		min-height: 4.5rem;
	}

	@supports not (field-sizing: content) {
		textarea {
			overflow-y: auto;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		textarea {
			transition: none;
		}
	}
</style>