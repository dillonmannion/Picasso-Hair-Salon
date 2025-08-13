import { browser } from '$app/environment';

type ThemeMode = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

class ThemeStore {
	private mode = $state<ThemeMode>('light'); // Luxe light theme is default
	private systemPreference = $state<ResolvedTheme>('light');

	constructor() {
		if (browser) {
			// Load saved preference
			const saved = localStorage.getItem('theme-mode') as ThemeMode;
			if (saved && ['light', 'dark', 'system'].includes(saved)) {
				this.mode = saved;
			}

			// Detect system preference
			this.detectSystemPreference();

			// Watch for system theme changes
			const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
			mediaQuery.addEventListener('change', (e) => {
				this.systemPreference = e.matches ? 'dark' : 'light';
				if (this.mode === 'system') {
					this.applyTheme();
				}
			});

			// Apply initial theme
			this.applyTheme();
		}
	}

	private detectSystemPreference() {
		if (browser) {
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			this.systemPreference = prefersDark ? 'dark' : 'light';
		}
	}

	private applyTheme() {
		if (!browser) return;

		const resolvedTheme = this.resolvedTheme;
		const root = document.documentElement;

		// Remove existing theme classes
		root.classList.remove('light', 'dark', 'luxe-light', 'luxe-dark');

		// Apply theme class
		if (resolvedTheme === 'dark') {
			root.classList.add('dark', 'luxe-dark');
		} else {
			root.classList.add('light', 'luxe-light');
		}

		// Update meta theme-color
		const metaThemeColor = document.querySelector('meta[name="theme-color"]');
		if (metaThemeColor) {
			metaThemeColor.setAttribute('content', resolvedTheme === 'dark' ? '#0d0d0d' : '#fdfcfa');
		}
	}

	get currentMode(): ThemeMode {
		return this.mode;
	}

	get resolvedTheme(): ResolvedTheme {
		if (this.mode === 'system') {
			return this.systemPreference;
		}
		return this.mode === 'dark' ? 'dark' : 'light';
	}

	get isDark(): boolean {
		return this.resolvedTheme === 'dark';
	}

	setTheme(mode: ThemeMode) {
		this.mode = mode;

		if (browser) {
			localStorage.setItem('theme-mode', mode);
			this.applyTheme();
		}
	}

	toggleTheme() {
		const newMode = this.resolvedTheme === 'dark' ? 'light' : 'dark';
		this.setTheme(newMode);
	}
}

// Export a singleton instance
export const theme = new ThemeStore();

// Export direct access to theme properties and methods
export function getThemeMode() {
	return theme.currentMode;
}

export function getResolvedTheme() {
	return theme.resolvedTheme;
}

export function getIsDark() {
	return theme.isDark;
}

export function setTheme(mode: ThemeMode) {
	theme.setTheme(mode);
}

export function toggleTheme() {
	theme.toggleTheme();
}
