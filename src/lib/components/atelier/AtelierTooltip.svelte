<script lang="ts">
	import { cn } from '$lib/utils';

	type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

	interface TooltipProps {
		content: string;
		position?: TooltipPosition;
		delay?: number;
		class?: string;
		children?: () => any;
	}

	let {
		content,
		position = 'top',
		delay = 500,
		class: className,
		children = () => {}
	}: TooltipProps = $props();

	let visible = $state(false);
	let timeoutId: NodeJS.Timeout;
	let tooltipElement: HTMLDivElement;
	let triggerElement: HTMLDivElement;

	function showTooltip() {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => {
			visible = true;
		}, delay);
	}

	function hideTooltip() {
		clearTimeout(timeoutId);
		visible = false;
	}

	const positionClasses: Record<TooltipPosition, string> = {
		top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
		bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
		left: 'right-full top-1/2 -translate-y-1/2 mr-2',
		right: 'left-full top-1/2 -translate-y-1/2 ml-2'
	};

	const arrowClasses: Record<TooltipPosition, string> = {
		top: 'top-full left-1/2 -translate-x-1/2 -mt-1',
		bottom: 'bottom-full left-1/2 -translate-x-1/2 -mb-1 rotate-180',
		left: 'left-full top-1/2 -translate-y-1/2 -ml-1 -rotate-90',
		right: 'right-full top-1/2 -translate-y-1/2 -mr-1 rotate-90'
	};

	const tooltipClass = $derived(
		cn(
			'absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 dark:bg-gray-700 rounded-lg shadow-lg whitespace-nowrap',
			'transition-opacity duration-200',
			visible ? 'opacity-100' : 'opacity-0 pointer-events-none',
			positionClasses[position],
			className
		)
	);

	const arrowClass = $derived(
		cn(
			'absolute w-0 h-0 border-4 border-transparent',
			position === 'top' || position === 'bottom'
				? 'border-t-gray-900 dark:border-t-gray-700'
				: 'border-t-gray-900 dark:border-t-gray-700',
			arrowClasses[position]
		)
	);

	// Clean up timeout on destroy
	$effect(() => {
		return () => {
			clearTimeout(timeoutId);
		};
	});
</script>

<div
	bind:this={triggerElement}
	class="relative inline-block"
	onmouseenter={showTooltip}
	onmouseleave={hideTooltip}
	onfocus={showTooltip}
	onblur={hideTooltip}
>
	<div aria-describedby={visible ? 'atelier-tooltip' : undefined}>
		{@render children()}
	</div>

	<div
		bind:this={tooltipElement}
		id="atelier-tooltip"
		role="tooltip"
		class={tooltipClass}
		aria-hidden={!visible}
	>
		{content}
		<div class={arrowClass}></div>
	</div>
</div>

<style>
	/* Ensure tooltip appears above other content */
	:global(.atelier-tooltip-container) {
		position: relative;
		z-index: 50;
	}
</style>
