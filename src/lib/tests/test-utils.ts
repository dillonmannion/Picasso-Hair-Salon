import { render, type RenderOptions } from '@testing-library/svelte';
import { expect, vi } from 'vitest';
import type { ComponentProps, Component } from 'svelte';

export interface TestRenderOptions<T extends Component<any>> extends Omit<RenderOptions, 'props'> {
	props?: ComponentProps<T>;
	route?: string;
	mediaQuery?: string;
}

export function customRender<T extends Component<any>>(
	component: T,
	options: TestRenderOptions<T> = {}
) {
	const { route = '/', mediaQuery, ...renderOptions } = options;

	if (typeof window !== 'undefined') {
		window.history.pushState({}, '', route);
	}

	if (mediaQuery) {
		window.matchMedia = vi.fn().mockImplementation((query) => ({
			matches: query === mediaQuery,
			media: query,
			onchange: null,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn()
		}));
	}

	return render(component, renderOptions);
}

export async function captureDebugInfo(container: HTMLElement, testName: string) {
	const debugDir = 'test-failures';
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
	const filename = `${debugDir}/${testName}-${timestamp}.html`;

	const debugInfo = {
		html: container.innerHTML,
		computedStyles: Array.from(container.querySelectorAll('*')).map((el) => ({
			element: el.tagName,
			classes: el.className,
			styles: window.getComputedStyle(el).cssText
		})),
		timestamp
	};

	console.log(`Debug info captured for ${testName}:`, filename);
	console.log('HTML:', debugInfo.html);
	console.log('Computed styles sample:', debugInfo.computedStyles.slice(0, 5));

	return debugInfo;
}

export function mockResizeObserver() {
	const ResizeObserverMock = vi.fn(() => ({
		observe: vi.fn(),
		unobserve: vi.fn(),
		disconnect: vi.fn()
	}));

	window.ResizeObserver = ResizeObserverMock as any;
	return ResizeObserverMock;
}

export function mockIntersectionObserver() {
	const IntersectionObserverMock = vi.fn(() => ({
		observe: vi.fn(),
		unobserve: vi.fn(),
		disconnect: vi.fn()
	}));

	window.IntersectionObserver = IntersectionObserverMock as any;
	return IntersectionObserverMock;
}

export function createMockPointerEvent(type: string, options: Partial<PointerEvent> = {}) {
	return new PointerEvent(type, {
		bubbles: true,
		cancelable: true,
		pointerId: 1,
		width: 1,
		height: 1,
		pressure: 0,
		pointerType: 'mouse',
		...options
	});
}

export function createMockTouchEvent(type: string, touches: Touch[] = []) {
	return new TouchEvent(type, {
		bubbles: true,
		cancelable: true,
		touches,
		targetTouches: touches,
		changedTouches: touches
	});
}

export function waitForTransition(element: HTMLElement): Promise<void> {
	return new Promise((resolve) => {
		const handleTransitionEnd = () => {
			element.removeEventListener('transitionend', handleTransitionEnd);
			resolve();
		};
		element.addEventListener('transitionend', handleTransitionEnd);

		setTimeout(resolve, 500);
	});
}

export function getCSSVariable(element: HTMLElement, variableName: string): string {
	return getComputedStyle(element).getPropertyValue(variableName).trim();
}

export function expectAriaLive(element: HTMLElement, message: string) {
	const liveRegion = element.querySelector('[aria-live]');
	expect(liveRegion).toBeInTheDocument();
	expect(liveRegion).toHaveTextContent(message);
}

export function expectFocusable(element: HTMLElement) {
	expect(element).toHaveAttribute('tabindex');
	const tabindex = element.getAttribute('tabindex');
	expect(Number(tabindex)).toBeGreaterThanOrEqual(0);
}

export function expectKeyboardNavigable(element: HTMLElement, role: string) {
	expect(element).toHaveAttribute('role', role);
	expectFocusable(element);
	
	const ariaLabel = element.getAttribute('aria-label') || element.getAttribute('aria-labelledby');
	expect(ariaLabel).toBeTruthy();
}

export function simulateSwipe(
	element: HTMLElement,
	direction: 'left' | 'right' | 'up' | 'down',
	distance = 100
) {
	const startX = direction === 'left' ? distance : direction === 'right' ? 0 : 50;
	const startY = direction === 'up' ? distance : direction === 'down' ? 0 : 50;
	const endX = direction === 'left' ? 0 : direction === 'right' ? distance : 50;
	const endY = direction === 'up' ? 0 : direction === 'down' ? distance : 50;

	const touchStart = createMockTouchEvent('touchstart', [
		new Touch({
			identifier: 1,
			target: element,
			clientX: startX,
			clientY: startY,
			screenX: startX,
			screenY: startY,
			pageX: startX,
			pageY: startY
		})
	]);

	const touchMove = createMockTouchEvent('touchmove', [
		new Touch({
			identifier: 1,
			target: element,
			clientX: endX,
			clientY: endY,
			screenX: endX,
			screenY: endY,
			pageX: endX,
			pageY: endY
		})
	]);

	const touchEnd = createMockTouchEvent('touchend', []);

	element.dispatchEvent(touchStart);
	element.dispatchEvent(touchMove);
	element.dispatchEvent(touchEnd);
}

export const testIds = {
	themeToggle: 'theme-toggle',
	paletteSwitcher: 'palette-switcher',
	contrastChecker: 'contrast-checker',
	accordion: 'accordion',
	accordionItem: 'accordion-item',
	tabs: 'tabs',
	tabList: 'tab-list',
	tabPanel: 'tab-panel',
	carousel: 'carousel',
	carouselItem: 'carousel-item',
	modal: 'modal',
	modalTrigger: 'modal-trigger',
	modalContent: 'modal-content',
	responsiveGrid: 'responsive-grid',
	mobileMenu: 'mobile-menu'
} as const;

export * from '@testing-library/svelte';
export { expect, vi } from 'vitest';
export { default as userEvent } from '@testing-library/user-event';