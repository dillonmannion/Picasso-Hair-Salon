import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

// Theme types
export type AtelierTheme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

// Local storage key
const ATELIER_THEME_KEY = 'atelier-theme-preference';

// Create theme store with persistence
function createAtelierThemeStore() {
	const defaultTheme: AtelierTheme = 'system';

	// Initialize from localStorage or default
	const initialTheme = browser
		? (localStorage.getItem(ATELIER_THEME_KEY) as AtelierTheme) || defaultTheme
		: defaultTheme;

	const { subscribe, set, update } = writable<AtelierTheme>(initialTheme);

	return {
		subscribe,
		set: (theme: AtelierTheme) => {
			if (browser) {
				localStorage.setItem(ATELIER_THEME_KEY, theme);
			}
			set(theme);
		},
		update
	};
}

// Theme preference store
export const atelierTheme = createAtelierThemeStore();

// System preference detection
function getSystemTheme(): ResolvedTheme {
	if (!browser) return 'light';

	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Resolved theme (what actually gets applied)
export const resolvedAtelierTheme = derived<typeof atelierTheme, ResolvedTheme>(
	atelierTheme,
	($theme) => {
		if ($theme === 'system') {
			return getSystemTheme();
		}
		return $theme;
	}
);

// Listen for system theme changes
if (browser) {
	const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
	mediaQuery.addEventListener('change', () => {
		// Trigger update for subscribers when system preference changes
		atelierTheme.update((t) => t);
	});
}

// Apply theme to document
resolvedAtelierTheme.subscribe((theme) => {
	if (browser) {
		const root = document.documentElement;
		root.classList.remove('light', 'dark');
		root.classList.add(theme);

		// Also set color-scheme for native elements
		root.style.colorScheme = theme;
	}
});

// Utility functions
export function toggleAtelierTheme() {
	atelierTheme.update((current) => {
		const themes: AtelierTheme[] = ['light', 'dark', 'system'];
		const currentIndex = themes.indexOf(current);
		return themes[(currentIndex + 1) % themes.length] as AtelierTheme;
	});
}

export function setAtelierTheme(theme: AtelierTheme) {
	atelierTheme.set(theme);
}
