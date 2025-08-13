<script lang="ts">
	import { page } from '$app/stores';
	import { cn } from '$lib/utils/cn';

	interface Step {
		id: string;
		title: string;
		path: string;
		icon?: string;
	}

	interface Props {
		steps?: Step[];
	}

	let {
		steps = [
			{ id: 'service', title: 'Service', path: '/booking/service', icon: '✂️' },
			{ id: 'stylist', title: 'Stylist', path: '/booking/stylist', icon: '👤' },
			{ id: 'schedule', title: 'Schedule', path: '/booking/schedule', icon: '📅' },
			{ id: 'confirm', title: 'Confirm', path: '/booking/confirm', icon: '✔️' },
			{ id: 'success', title: 'Success', path: '/booking/success', icon: '🎉' }
		]
	}: Props = $props();

	const currentStepIndex = $derived(
		steps.findIndex((step) => $page.url.pathname.startsWith(step.path))
	);

	function isStepComplete(index: number): boolean {
		return index < currentStepIndex;
	}

	function isStepActive(index: number): boolean {
		return index === currentStepIndex;
	}

	function canNavigateToStep(index: number): boolean {
		// Can navigate to any previous step or the next immediate step
		return index <= currentStepIndex + 1;
	}
</script>

<div class="w-full px-4 py-8">
	<div class="relative flex items-center justify-between">
		<!-- Progress line -->
		<div class="bg-luxe-cream-300 absolute top-1/2 left-0 h-0.5 w-full -translate-y-1/2">
			<div
				class="bg-luxe-burgundy-700 h-full transition-all duration-300"
				style="width: {currentStepIndex === -1
					? 0
					: (currentStepIndex / (steps.length - 1)) * 100}%"
			></div>
		</div>

		<!-- Steps -->
		{#each steps as step, index (step.id)}
			<div class="relative">
				<button
					type="button"
					disabled={!canNavigateToStep(index)}
					class={cn(
						'bg-luxe-cream-50 relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 shadow-[0_2px_4px_rgba(94,28,28,0.08)] transition-all duration-200',
						isStepComplete(index) &&
							'border-luxe-burgundy-700 bg-luxe-burgundy-700 text-luxe-cream-50',
						isStepActive(index) &&
							'border-luxe-burgundy-700 bg-luxe-cream-50 text-luxe-burgundy-700 ring-luxe-burgundy-200 ring-4',
						!isStepComplete(index) &&
							!isStepActive(index) &&
							'border-luxe-cream-400 text-luxe-black-400',
						canNavigateToStep(index) &&
							'cursor-pointer hover:scale-110 hover:shadow-[0_4px_8px_rgba(94,28,28,0.12)]',
						!canNavigateToStep(index) && 'cursor-not-allowed opacity-50'
					)}
					aria-label="{step.title} - Step {index + 1} of {steps.length}"
				>
					{#if isStepComplete(index)}
						<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
							<path
								fill-rule="evenodd"
								d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
								clip-rule="evenodd"
							/>
						</svg>
					{:else}
						<span class="font-['Cormorant_Garamond'] text-base font-semibold">{index + 1}</span>
					{/if}
				</button>

				<!-- Step label -->
				{#if index === currentStepIndex || index === currentStepIndex - 1 || index === currentStepIndex + 1}
					<div
						class={cn(
							'absolute left-1/2 top-full mt-2 -translate-x-1/2 text-center transition-opacity duration-200',
							isStepActive(index) ? 'opacity-100' : 'opacity-60'
						)}
					>
						<p
							class="text-luxe-black-600 text-xs font-medium tracking-wider whitespace-nowrap uppercase"
						>
							{step.title}
						</p>
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>
