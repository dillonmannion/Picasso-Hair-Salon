<script lang="ts">
	import { theme, toggleTheme, setTheme as setThemeMode } from '$lib/stores/theme.svelte';
	import { Sun, Moon, Monitor } from 'lucide-svelte';

	interface Props {
		showLabel?: boolean;
		variant?: 'icon' | 'button' | 'dropdown';
		className?: string;
	}

	let { showLabel = false, variant = 'icon', className = '' }: Props = $props();

	let dropdownOpen = $state(false);

	const themeOptions = [
		{ value: 'light', label: 'Light', icon: Sun },
		{ value: 'dark', label: 'Dark', icon: Moon },
		{ value: 'system', label: 'System', icon: Monitor }
	] as const;

	const currentMode = $derived(theme.currentMode);

	const currentIcon = $derived(() => {
		switch (currentMode) {
			case 'dark':
				return Moon;
			case 'system':
				return Monitor;
			default:
				return Sun;
		}
	});

	const currentLabel = $derived(() => {
		switch (currentMode) {
			case 'dark':
				return 'Dark';
			case 'system':
				return 'System';
			default:
				return 'Light';
		}
	});

	function handleToggle() {
		if (variant === 'dropdown') {
			dropdownOpen = !dropdownOpen;
		} else {
			toggleTheme();
		}
	}

	function selectTheme(mode: 'light' | 'dark' | 'system') {
		setThemeMode(mode);
		dropdownOpen = false;
	}
</script>

{#if variant === 'icon'}
	<button
		onclick={handleToggle}
		class="luxe-theme-toggle-icon group text-luxe-black-700 hover:bg-luxe-cream-200 hover:text-luxe-burgundy-700 dark:text-luxe-cream-100 dark:hover:bg-luxe-black-700 relative rounded-lg p-2 transition-all {className}"
		aria-label="Toggle theme"
	>
		<svelte:component
			this={currentIcon()}
			class="h-5 w-5 transition-transform group-hover:scale-110"
		/>
	</button>
{:else if variant === 'button'}
	<button
		onclick={handleToggle}
		class="luxe-btn luxe-btn-secondary flex items-center gap-2 {className}"
		aria-label="Toggle theme"
	>
		<svelte:component this={currentIcon()} class="h-4 w-4" />
		{#if showLabel}
			<span>{currentLabel()}</span>
		{/if}
	</button>
{:else if variant === 'dropdown'}
	<div class="relative">
		<button
			onclick={handleToggle}
			class="luxe-btn luxe-btn-ghost flex items-center gap-2 {className}"
			aria-label="Theme selector"
			aria-expanded={dropdownOpen}
		>
			<svelte:component this={currentIcon()} class="h-4 w-4" />
			{#if showLabel}
				<span>{currentLabel()}</span>
			{/if}
			<svg
				class="h-4 w-4 transition-transform {dropdownOpen ? 'rotate-180' : ''}"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M19 9l-7 7-7-7" />
			</svg>
		</button>

		{#if dropdownOpen}
			<div
				class="ring-opacity-5 dark:bg-luxe-black-800 dark:ring-luxe-black-600 absolute right-0 z-50 mt-2 w-36 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black"
			>
				<div class="py-1" role="menu">
					{#each themeOptions as option}
						<button
							onclick={() => selectTheme(option.value)}
							class="text-luxe-black-700 hover:bg-luxe-cream-100 dark:text-luxe-cream-100 dark:hover:bg-luxe-black-700 flex w-full items-center gap-2 px-4 py-2 text-sm {currentMode ===
							option.value
								? 'bg-luxe-cream-100 dark:bg-luxe-black-700'
								: ''}"
							role="menuitem"
						>
							<svelte:component this={option.icon} class="h-4 w-4" />
							<span>{option.label}</span>
							{#if currentMode === option.value}
								<svg
									class="text-luxe-burgundy-700 dark:text-luxe-burgundy-300 ml-auto h-4 w-4"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fill-rule="evenodd"
										d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
										clip-rule="evenodd"
									/>
								</svg>
							{/if}
						</button>
					{/each}
				</div>
			</div>

			<!-- Backdrop to close dropdown when clicking outside -->
			<button
				class="fixed inset-0 z-40"
				onclick={() => (dropdownOpen = false)}
				aria-hidden="true"
				tabindex="-1"
			></button>
		{/if}
	</div>
{/if}

<style>
	:global(.luxe-theme-toggle-icon) {
		/* Smooth icon transitions */
		svg {
			transition: transform 0.2s ease-in-out;
		}
	}
</style>
