import { render } from '@testing-library/svelte';
import { writable } from 'svelte/store';
import userEvent from '@testing-library/user-event';

/**
 * Custom render function with theme provider
 * @param {import('svelte').Component} Component
 * @param {object} props
 * @param {object} options
 * @returns {object} Render result with user event
 */
export function renderWithTheme(Component, props = {}, options = {}) {
	// Create theme store
	const theme = writable(options.theme || 'light');
	
	// Create a wrapper component that provides theme context
	const TestWrapper = {
		Component,
		props,
		context: new Map([['theme', theme]])
	};

	const result = render(TestWrapper, options);
	
	// Add user event to result
	const user = userEvent.setup();
	
	return {
		...result,
		user,
		theme,
		// Helper to change theme
		setTheme: (newTheme) => theme.set(newTheme)
	};
}

/**
 * Wait for element to appear in DOM
 * @param {Function} callback
 * @param {object} options
 */
export async function waitForElement(callback, options = {}) {
	const { timeout = 1000 } = options;
	const startTime = Date.now();
	
	while (Date.now() - startTime < timeout) {
		try {
			const element = callback();
			if (element) return element;
		} catch (e) {
			// Element not found yet
		}
		await new Promise(resolve => setTimeout(resolve, 50));
	}
	
	throw new Error(`Element not found within ${timeout}ms`);
}

/**
 * Debug helper for complex DOM structures
 * @param {HTMLElement} container
 * @param {string} filename
 */
export function debugDOM(container, filename = 'dom-snapshot.html') {
	if (process.env.DEBUG_TESTS) {
		const fs = require('fs');
		const path = require('path');
		const snapshotDir = path.join(process.cwd(), 'test-failures');
		
		if (!fs.existsSync(snapshotDir)) {
			fs.mkdirSync(snapshotDir, { recursive: true });
		}
		
		const content = container.innerHTML;
		const filepath = path.join(snapshotDir, filename);
		fs.writeFileSync(filepath, content);
		console.log(`DOM snapshot saved to: ${filepath}`);
	}
}

/**
 * Mock component for testing
 * @param {string} name
 * @param {object} props
 */
export function createMockComponent(name, props = {}) {
	return {
		name,
		props,
		$$prop_def: props,
		$$events_def: {},
		$$slot_def: {}
	};
}

/**
 * Test ID generator for consistent test selectors
 * @param {string} component
 * @param {string} element
 */
export function testId(component, element) {
	return `${component}-${element}`;
}

/**
 * Assert element has expected classes
 * @param {HTMLElement} element
 * @param {string[]} expectedClasses
 */
export function assertClasses(element, expectedClasses) {
	expectedClasses.forEach(className => {
		expect(element).toHaveClass(className);
	});
}

/**
 * Assert element has expected styles
 * @param {HTMLElement} element
 * @param {object} expectedStyles
 */
export function assertStyles(element, expectedStyles) {
	Object.entries(expectedStyles).forEach(([property, value]) => {
		expect(element).toHaveStyle({ [property]: value });
	});
}