<script lang="ts">
	import { cn } from '$lib/utils';
	import { slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { ChevronDown } from 'lucide-svelte';
	import type { Snippet } from 'svelte';

	interface AccordionItem {
		id: string;
		title: string;
		content: Snippet;
		icon?: Snippet;
		disabled?: boolean;
	}

	interface AccordionProps {
		items: AccordionItem[];
		multiple?: boolean;
		collapsible?: boolean;
		defaultOpen?: string | string[];
		variant?: 'default' | 'bordered' | 'separated';
		size?: 'sm' | 'default' | 'lg';
		class?: string;
		itemClass?: string;
		onchange?: (openItems: string[]) => void;
	}

	let {
		items = [],
		multiple = false,
		collapsible = true,
		defaultOpen = [],
		variant = 'default',
		size = 'default',
		class: className,
		itemClass,
		onchange
	}: AccordionProps = $props();

	// Initialize open items
	let openItems = $state<Set<string>>(
		new Set(Array.isArray(defaultOpen) ? defaultOpen : [defaultOpen])
	);

	function toggleItem(itemId: string) {
		const item = items.find((i) => i.id === itemId);
		if (!item || item.disabled) return;

		const newOpenItems = new Set(openItems);

		if (openItems.has(itemId)) {
			// Closing an item
			if (collapsible || openItems.size > 1) {
				newOpenItems.delete(itemId);
			}
		} else {
			// Opening an item
			if (!multiple) {
				newOpenItems.clear();
			}
			newOpenItems.add(itemId);
		}

		openItems = newOpenItems;
		onchange?.(Array.from(openItems));
	}

	function handleKeydown(event: KeyboardEvent, itemId: string) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			toggleItem(itemId);
		}
	}

	const containerClasses = cn(
		'atelier-accordion',
		variant === 'separated' && 'space-y-4',
		className
	);

	const itemClasses = (item: AccordionItem, index: number) =>
		cn(
			'atelier-accordion-item',
			'bg-atelier-cream dark:bg-atelier-dark-card',
			variant === 'default' && [
				'border-b border-atelier-gold/20 dark:border-atelier-gold/10',
				index === 0 && 'border-t'
			],
			variant === 'bordered' && [
				'border border-atelier-gold/20 dark:border-atelier-gold/10',
				index === 0 ? 'rounded-t-lg' : '-mt-px',
				index === items.length - 1 && 'rounded-b-lg'
			],
			variant === 'separated' && [
				'border border-atelier-gold/20 dark:border-atelier-gold/10',
				'rounded-lg shadow-atelier dark:shadow-atelier-dark'
			],
			itemClass
		);

	const triggerClasses = (item: AccordionItem) =>
		cn(
			'atelier-accordion-trigger',
			'w-full flex items-center justify-between',
			'font-display transition-all duration-200',
			'hover:bg-atelier-gold/5 dark:hover:bg-atelier-gold/10',
			'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-atelier-gold/50',
			// Size variants
			size === 'sm' && 'px-4 py-3 text-sm gap-3',
			size === 'default' && 'px-6 py-4 gap-4',
			size === 'lg' && 'px-8 py-5 text-lg gap-5',
			// State styles
			openItems.has(item.id) ? 'text-atelier-gold' : 'text-atelier-dark dark:text-atelier-cream',
			item.disabled && 'opacity-50 cursor-not-allowed hover:bg-transparent'
		);

	const contentClasses = cn(
		'atelier-accordion-content',
		'text-atelier-dark/80 dark:text-atelier-cream/80',
		size === 'sm' && 'px-4 pb-3 text-sm',
		size === 'default' && 'px-6 pb-4',
		size === 'lg' && 'px-8 pb-5'
	);

	function chevronClasses(isOpen: boolean) {
		return cn(
			'transition-transform duration-200',
			'text-atelier-gold',
			isOpen && 'rotate-180',
			size === 'sm' && 'h-4 w-4',
			size === 'default' && 'h-5 w-5',
			size === 'lg' && 'h-6 w-6'
		);
	}
</script>

<div class={containerClasses} role="region" aria-label="Accordion">
	{#each items as item, index (item.id)}
		{@const isOpen = openItems.has(item.id)}
		<div class={itemClasses(item, index)}>
			<button
				type="button"
				class={triggerClasses(item)}
				aria-expanded={isOpen}
				aria-controls={`accordion-content-${item.id}`}
				disabled={item.disabled}
				onclick={() => toggleItem(item.id)}
				onkeydown={(e) => handleKeydown(e, item.id)}
			>
				<span class="flex items-center gap-3">
					{#if item.icon}
						{@render item.icon()}
					{/if}
					<span class="text-left">{item.title}</span>
				</span>
				<ChevronDown class={chevronClasses(isOpen)} />
			</button>

			{#if isOpen}
				<div
					id={`accordion-content-${item.id}`}
					class={contentClasses}
					transition:slide={{ duration: 200, easing: cubicOut }}
				>
					{@render item.content()}
				</div>
			{/if}
		</div>
	{/each}
</div>

<style>
	:global(.atelier-accordion-trigger) {
		cursor: pointer;
		text-align: left;
		background: none;
		border: none;
	}

	:global(.atelier-accordion-trigger:disabled) {
		cursor: not-allowed;
	}

	:global(.atelier-accordion-content) {
		/* Ensure smooth slide transition */
		overflow: hidden;
	}

	/* Smooth icon rotation */
	:global(.atelier-accordion-trigger svg) {
		will-change: transform;
	}
</style>
