<script lang="ts">
	import { cn } from '$lib/utils';
	import { fade, slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	interface Tab {
		id: string;
		label: string;
		icon?: any;
		disabled?: boolean;
		content: () => any;
	}

	interface TabsProps {
		tabs: Tab[];
		activeTab?: string;
		variant?: 'default' | 'pills' | 'underline';
		size?: 'sm' | 'default' | 'lg';
		orientation?: 'horizontal' | 'vertical';
		class?: string;
		tabsClass?: string;
		contentClass?: string;
		ontabchange?: (tabId: string) => void;
	}

	let {
		tabs = [],
		activeTab = $bindable(tabs[0]?.id),
		variant = 'default',
		size = 'default',
		orientation = 'horizontal',
		class: className,
		tabsClass,
		contentClass,
		ontabchange
	}: TabsProps = $props();

	// Ensure activeTab is valid
	$effect(() => {
		if (!activeTab && tabs.length > 0 && tabs[0]) {
			activeTab = tabs[0].id;
		}
	});

	// Find active tab index for indicator position
	const activeIndex = $derived.by(() => tabs.findIndex((tab) => tab.id === activeTab));

	function selectTab(tabId: string) {
		const tab = tabs.find((t) => t.id === tabId);
		if (tab && !tab.disabled) {
			activeTab = tabId;
			ontabchange?.(tabId);
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
		let newIndex = currentIndex;

		if (orientation === 'horizontal') {
			if (event.key === 'ArrowRight') {
				newIndex = (currentIndex + 1) % tabs.length;
			} else if (event.key === 'ArrowLeft') {
				newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
			}
		} else {
			if (event.key === 'ArrowDown') {
				newIndex = (currentIndex + 1) % tabs.length;
			} else if (event.key === 'ArrowUp') {
				newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
			}
		}

		// Skip disabled tabs
		while (tabs[newIndex]?.disabled && newIndex !== currentIndex) {
			if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
				newIndex = (newIndex + 1) % tabs.length;
			} else {
				newIndex = (newIndex - 1 + tabs.length) % tabs.length;
			}
		}

		if (newIndex !== currentIndex && tabs[newIndex] && !tabs[newIndex].disabled) {
			selectTab(tabs[newIndex].id);
		}
	}

	const containerClasses = cn(
		'atelier-tabs',
		orientation === 'vertical' && 'flex gap-6',
		className
	);

	const tabListClasses = cn(
		'atelier-tabs-list',
		'relative',
		orientation === 'horizontal' ? 'flex' : 'flex flex-col',
		variant === 'default' && 'border-b border-atelier-gold/20 dark:border-atelier-gold/10',
		variant === 'pills' && 'gap-2 p-1 bg-atelier-gold/5 dark:bg-atelier-gold/10 rounded-lg',
		variant === 'underline' && 'gap-4',
		orientation === 'vertical' && 'border-b-0 border-r pr-4',
		tabsClass
	);

	const tabClasses = (tab: Tab) =>
		cn(
			'atelier-tab',
			'relative font-display transition-all duration-200',
			'focus:outline-none focus-visible:ring-2 focus-visible:ring-atelier-gold/50',
			// Size variants
			size === 'sm' && 'px-3 py-1.5 text-sm',
			size === 'default' && 'px-4 py-2',
			size === 'lg' && 'px-6 py-3 text-lg',
			// Style variants
			variant === 'default' && [
				'hover:text-atelier-gold',
				activeTab === tab.id
					? 'text-atelier-gold'
					: 'text-atelier-dark/60 dark:text-atelier-cream/60'
			],
			variant === 'pills' && [
				'rounded-md',
				activeTab === tab.id
					? 'bg-white dark:bg-atelier-dark text-atelier-gold shadow-atelier'
					: 'hover:bg-atelier-gold/10 text-atelier-dark/60 dark:text-atelier-cream/60'
			],
			variant === 'underline' && [
				'pb-3',
				activeTab === tab.id
					? 'text-atelier-gold'
					: 'text-atelier-dark/60 dark:text-atelier-cream/60 hover:text-atelier-gold'
			],
			// Disabled state
			tab.disabled && 'opacity-50 cursor-not-allowed hover:text-current'
		);

	const contentClasses = cn(
		'atelier-tabs-content',
		'mt-6',
		orientation === 'vertical' && 'mt-0 flex-1',
		contentClass
	);

	// Calculate indicator position
	const indicatorStyle = $derived.by(() => {
		if (variant !== 'default' && variant !== 'underline') return '';
		if (activeIndex === -1) return 'opacity: 0';

		if (orientation === 'horizontal') {
			const tabWidth = 100 / tabs.length;
			const left = activeIndex * tabWidth;
			return `left: ${left}%; width: ${tabWidth}%;`;
		} else {
			const tabHeight = 100 / tabs.length;
			const top = activeIndex * tabHeight;
			return `top: ${top}%; height: ${tabHeight}%;`;
		}
	});
</script>

<div class={containerClasses}>
	<div
		class={tabListClasses}
		role="tablist"
		aria-orientation={orientation}
		onkeydown={handleKeydown}
	>
		{#if (variant === 'default' || variant === 'underline') && tabs.length > 0}
			<div
				class="atelier-tabs-indicator absolute transition-all duration-300 ease-out"
				style={indicatorStyle}
			>
				<div
					class={cn(
						'bg-atelier-gold absolute',
						orientation === 'horizontal'
							? 'right-0 bottom-0 left-0 h-0.5'
							: 'top-0 right-0 bottom-0 w-0.5'
					)}
				/>
			</div>
		{/if}

		{#each tabs as tab}
			<button
				type="button"
				role="tab"
				id={`tab-${tab.id}`}
				aria-selected={activeTab === tab.id}
				aria-controls={`panel-${tab.id}`}
				aria-disabled={tab.disabled}
				disabled={tab.disabled}
				class={tabClasses(tab)}
				onclick={() => selectTab(tab.id)}
			>
				{#if tab.icon}
					<span class="inline-flex items-center gap-2">
						{@render tab.icon()}
						{tab.label}
					</span>
				{:else}
					{tab.label}
				{/if}
			</button>
		{/each}
	</div>

	<div class={contentClasses}>
		{#each tabs as tab (tab.id)}
			{#if activeTab === tab.id}
				<div
					role="tabpanel"
					id={`panel-${tab.id}`}
					aria-labelledby={`tab-${tab.id}`}
					tabindex="0"
					in:fade={{ duration: 150, delay: 100 }}
					out:fade={{ duration: 100 }}
				>
					{@render tab.content()}
				</div>
			{/if}
		{/each}
	</div>
</div>

<style>
	:global(.atelier-tabs-list) {
		/* Ensure smooth indicator transitions */
		will-change: transform;
	}

	:global(.atelier-tab) {
		/* Remove default button styles */
		background: none;
		border: none;
		cursor: pointer;
		white-space: nowrap;
	}

	:global(.atelier-tab:disabled) {
		cursor: not-allowed;
	}

	/* Smooth content transitions */
	:global(.atelier-tabs-content > *) {
		will-change: opacity;
	}
</style>
