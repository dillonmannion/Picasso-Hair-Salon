export class AppState {
	// UI State
	isSidebarOpen = $state(false);
	isLoading = $state(false);
	notification = $state<{
		message: string;
		type: 'success' | 'error' | 'info' | 'warning';
	} | null>(null);

	// Theme State
	theme = $state<'light' | 'dark'>('light');

	// Derived states
	isDarkMode = $derived(this.theme === 'dark');
	hasNotification = $derived(!!this.notification);

	// UI Methods
	toggleSidebar() {
		this.isSidebarOpen = !this.isSidebarOpen;
	}

	setSidebarOpen(open: boolean) {
		this.isSidebarOpen = open;
	}

	setLoading(loading: boolean) {
		this.isLoading = loading;
	}

	// Notification Methods
	showNotification(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
		this.notification = { message, type };

		// Auto-dismiss after 5 seconds
		setTimeout(() => {
			this.clearNotification();
		}, 5000);
	}

	clearNotification() {
		this.notification = null;
	}

	// Theme Methods
	toggleTheme() {
		this.theme = this.theme === 'light' ? 'dark' : 'light';
		this.persistTheme();
	}

	setTheme(theme: 'light' | 'dark') {
		this.theme = theme;
		this.persistTheme();
	}

	private persistTheme() {
		if (typeof window !== 'undefined') {
			localStorage.setItem('theme', this.theme);
			document.documentElement.classList.toggle('dark', this.theme === 'dark');
		}
	}

	// Initialize theme from localStorage
	initializeTheme() {
		if (typeof window !== 'undefined') {
			const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

			this.theme = savedTheme || (prefersDark ? 'dark' : 'light');
			this.persistTheme();
		}
	}

	reset() {
		this.isSidebarOpen = false;
		this.isLoading = false;
		this.notification = null;
		this.theme = 'light';
	}
}

// Create singleton instance
export const appState = new AppState();

// Export convenience function
export function useAppState() {
	return appState;
}

// Initialize theme on module load
if (typeof window !== 'undefined') {
	appState.initializeTheme();
}
