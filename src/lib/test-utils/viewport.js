import { vi } from 'vitest';

/**
 * Viewport size presets
 */
export const viewports = {
	mobile: { width: 375, height: 667 },
	tablet: { width: 768, height: 1024 },
	desktop: { width: 1440, height: 900 },
	wide: { width: 1920, height: 1080 }
};

/**
 * Mock viewport size for testing responsive behavior
 * @param {object} size
 * @param {number} size.width
 * @param {number} size.height
 */
export function mockViewport({ width, height }) {
	// Set window dimensions
	Object.defineProperty(window, 'innerWidth', {
		writable: true,
		configurable: true,
		value: width
	});

	Object.defineProperty(window, 'innerHeight', {
		writable: true,
		configurable: true,
		value: height
	});

	// Update matchMedia to respond to viewport queries
	window.matchMedia = vi.fn().mockImplementation((query) => {
		// Parse common media queries
		const matches = {
			'(max-width: 640px)': width <= 640,
			'(max-width: 768px)': width <= 768,
			'(max-width: 1024px)': width <= 1024,
			'(min-width: 640px)': width >= 640,
			'(min-width: 768px)': width >= 768,
			'(min-width: 1024px)': width >= 1024,
			'(prefers-color-scheme: dark)': false,
			'(prefers-reduced-motion)': false
		};

		return {
			matches: matches[query] || false,
			media: query,
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn()
		};
	});

	// Trigger resize event
	window.dispatchEvent(new Event('resize'));
}

/**
 * Reset viewport to default desktop size
 */
export function resetViewport() {
	mockViewport(viewports.desktop);
}

/**
 * Test helper to run tests at different viewport sizes
 * @param {Function} testFn
 */
export function testResponsive(testFn) {
	Object.entries(viewports).forEach(([name, size]) => {
		describe(`@${name} (${size.width}x${size.height})`, () => {
			beforeEach(() => {
				mockViewport(size);
			});

			afterEach(() => {
				resetViewport();
			});

			testFn(name, size);
		});
	});
}

/**
 * Mock touch support
 */
export function mockTouchSupport() {
	Object.defineProperty(window, 'ontouchstart', {
		writable: true,
		value: () => {}
	});

	Object.defineProperty(navigator, 'maxTouchPoints', {
		writable: true,
		value: 5
	});
}

/**
 * Mock device orientation
 * @param {'portrait' | 'landscape'} orientation
 */
export function mockOrientation(orientation) {
	const isPortrait = orientation === 'portrait';

	Object.defineProperty(window.screen, 'orientation', {
		writable: true,
		value: {
			type: isPortrait ? 'portrait-primary' : 'landscape-primary',
			angle: isPortrait ? 0 : 90
		}
	});

	// Update matchMedia for orientation queries
	const originalMatchMedia = window.matchMedia;
	window.matchMedia = vi.fn().mockImplementation((query) => {
		if (query === '(orientation: portrait)') {
			return { matches: isPortrait };
		}
		if (query === '(orientation: landscape)') {
			return { matches: !isPortrait };
		}
		return originalMatchMedia(query);
	});
}
