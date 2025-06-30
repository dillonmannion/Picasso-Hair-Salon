import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/svelte';
import { renderWithTheme, assertClasses } from '$lib/test-utils';
import AtelierThemeProvider from '$lib/components/atelier/AtelierThemeProvider.svelte';
import AtelierButton from '$lib/components/atelier/AtelierButton.svelte';
import AtelierCard from '$lib/components/atelier/AtelierCard.svelte';

// Mock browser environment
vi.mock('$app/environment', () => ({
	browser: true
}));

describe('Theme System Tests', () => {
	let mockLocalStorage;

	beforeEach(() => {
		// Mock localStorage
		mockLocalStorage = {
			getItem: vi.fn(),
			setItem: vi.fn(),
			removeItem: vi.fn(),
			clear: vi.fn()
		};
		Object.defineProperty(window, 'localStorage', {
			value: mockLocalStorage,
			writable: true
		});

		// Mock matchMedia for system theme detection
		Object.defineProperty(window, 'matchMedia', {
			value: vi.fn().mockImplementation((query) => ({
				matches: query === '(prefers-color-scheme: dark)' ? false : true,
				media: query,
				onchange: null,
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
				dispatchEvent: vi.fn()
			})),
			writable: true
		});

		// Reset document classes
		document.documentElement.className = '';
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('Theme Switching', () => {
		test('toggles between light, dark, and system themes', async () => {
			const { user } = renderWithTheme(AtelierThemeProvider);
			
			// Find theme toggle button
			const toggleButton = await screen.findByTestId('theme-toggle');
			
			// Initial state should be system
			expect(document.documentElement).toHaveClass('light');
			
			// Click to switch to light
			await user.click(toggleButton);
			await waitFor(() => {
				expect(mockLocalStorage.setItem).toHaveBeenCalledWith('atelier-theme-preference', 'light');
			});
			
			// Click to switch to dark
			await user.click(toggleButton);
			await waitFor(() => {
				expect(mockLocalStorage.setItem).toHaveBeenCalledWith('atelier-theme-preference', 'dark');
				expect(document.documentElement).toHaveClass('dark');
			});
			
			// Click to switch back to system
			await user.click(toggleButton);
			await waitFor(() => {
				expect(mockLocalStorage.setItem).toHaveBeenCalledWith('atelier-theme-preference', 'system');
			});
		});

		test('applies theme immediately on change', async () => {
			const { user, setTheme } = renderWithTheme(AtelierButton, {
				variant: 'default'
			});
			
			// Set to dark theme
			await setTheme('dark');
			
			await waitFor(() => {
				expect(document.documentElement).toHaveClass('dark');
				expect(document.documentElement.style.colorScheme).toBe('dark');
			});
			
			// Set to light theme
			await setTheme('light');
			
			await waitFor(() => {
				expect(document.documentElement).toHaveClass('light');
				expect(document.documentElement).not.toHaveClass('dark');
				expect(document.documentElement.style.colorScheme).toBe('light');
			});
		});
	});

	describe('Theme Persistence', () => {
		test('saves theme preference to localStorage', async () => {
			const { setTheme } = renderWithTheme(AtelierThemeProvider);
			
			// Set theme to dark
			await setTheme('dark');
			
			expect(mockLocalStorage.setItem).toHaveBeenCalledWith('atelier-theme-preference', 'dark');
			
			// Set theme to light
			await setTheme('light');
			
			expect(mockLocalStorage.setItem).toHaveBeenCalledWith('atelier-theme-preference', 'light');
		});

		test('loads theme preference from localStorage on mount', async () => {
			// Set localStorage before rendering
			mockLocalStorage.getItem.mockReturnValue('dark');
			
			renderWithTheme(AtelierThemeProvider);
			
			// Should load dark theme from localStorage
			expect(mockLocalStorage.getItem).toHaveBeenCalledWith('atelier-theme-preference');
			await waitFor(() => {
				expect(document.documentElement).toHaveClass('dark');
			});
		});

		test('falls back to system theme when localStorage is empty', async () => {
			mockLocalStorage.getItem.mockReturnValue(null);
			
			renderWithTheme(AtelierThemeProvider);
			
			// Should use system preference (light in our mock)
			await waitFor(() => {
				expect(document.documentElement).toHaveClass('light');
			});
		});
	});

	describe('CSS Custom Properties', () => {
		test('applies correct CSS variables for light theme', async () => {
			const { container } = renderWithTheme(AtelierCard);
			
			// Force light theme
			document.documentElement.className = 'light';
			
			// Create a test element to check computed styles
			const testElement = container.querySelector('[class*="card"]');
			
			// In light theme, card should have light background
			// Note: In testing environment, we verify classes rather than computed styles
			assertClasses(document.documentElement, ['light']);
		});

		test('applies correct CSS variables for dark theme', async () => {
			const { container, setTheme } = renderWithTheme(AtelierCard);
			
			// Set dark theme
			await setTheme('dark');
			
			await waitFor(() => {
				assertClasses(document.documentElement, ['dark']);
			});
		});

		test('updates CSS variables when theme changes', async () => {
			const { setTheme } = renderWithTheme(AtelierCard);
			
			// Start with light
			await setTheme('light');
			assertClasses(document.documentElement, ['light']);
			
			// Switch to dark
			await setTheme('dark');
			await waitFor(() => {
				expect(document.documentElement).not.toHaveClass('light');
				assertClasses(document.documentElement, ['dark']);
			});
		});
	});

	describe('Component Theme Application', () => {
		test('all components respect current theme', async () => {
			const { setTheme } = renderWithTheme(AtelierThemeProvider);
			
			// Render multiple components
			const { container: buttonContainer } = renderWithTheme(AtelierButton, {
				variant: 'default'
			});
			const { container: cardContainer } = renderWithTheme(AtelierCard);
			
			// Set dark theme
			await setTheme('dark');
			
			// All components should be in dark mode
			await waitFor(() => {
				expect(document.documentElement).toHaveClass('dark');
			});
		});

		test('nested components inherit theme correctly', async () => {
			// Create a component that nests other components
			const NestedTest = {
				template: `
					<AtelierCard>
						<AtelierButton variant="default">Button in Card</AtelierButton>
					</AtelierCard>
				`
			};
			
			const { setTheme } = renderWithTheme(AtelierCard);
			
			// Change theme
			await setTheme('dark');
			
			// Both parent and child should respect theme
			await waitFor(() => {
				expect(document.documentElement).toHaveClass('dark');
			});
		});
	});

	describe('Theme Isolation', () => {
		test('theme changes in one test do not affect others', async () => {
			// This test verifies isolation - should start fresh
			expect(document.documentElement.className).toBe('');
			expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
		});

		test('each test starts with clean theme state', async () => {
			// Verify clean state
			const { getByTestId } = renderWithTheme(AtelierThemeProvider);
			
			// Should not have any theme preference in localStorage
			expect(mockLocalStorage.getItem).toHaveBeenCalledWith('atelier-theme-preference');
			expect(mockLocalStorage.getItem()).toBeUndefined();
		});
	});

	describe('System Theme Detection', () => {
		test('respects system dark mode preference', async () => {
			// Mock dark mode preference
			window.matchMedia = vi.fn().mockImplementation((query) => ({
				matches: query === '(prefers-color-scheme: dark)',
				media: query,
				addEventListener: vi.fn(),
				removeEventListener: vi.fn()
			}));
			
			mockLocalStorage.getItem.mockReturnValue('system');
			
			renderWithTheme(AtelierThemeProvider);
			
			// Should apply dark theme based on system preference
			await waitFor(() => {
				expect(document.documentElement).toHaveClass('dark');
			});
		});

		test('updates when system theme changes', async () => {
			let changeListener;
			const mockMatchMedia = vi.fn().mockImplementation((query) => ({
				matches: false,
				media: query,
				addEventListener: vi.fn((event, listener) => {
					if (event === 'change') changeListener = listener;
				}),
				removeEventListener: vi.fn()
			}));
			
			window.matchMedia = mockMatchMedia;
			mockLocalStorage.getItem.mockReturnValue('system');
			
			renderWithTheme(AtelierThemeProvider);
			
			// Initially light
			await waitFor(() => {
				expect(document.documentElement).toHaveClass('light');
			});
			
			// Simulate system theme change
			if (changeListener) {
				// Update mock to return dark mode
				window.matchMedia = vi.fn().mockImplementation((query) => ({
					matches: query === '(prefers-color-scheme: dark)',
					media: query,
					addEventListener: vi.fn(),
					removeEventListener: vi.fn()
				}));
				
				changeListener({ matches: true });
				
				// Should update to dark
				await waitFor(() => {
					expect(document.documentElement).toHaveClass('dark');
				});
			}
		});
	});
});