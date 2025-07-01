import { vi } from 'vitest';

export interface MediaQueryMock {
	matches: boolean;
	media: string;
	onchange: ((this: MediaQueryList, ev: MediaQueryListEvent) => any) | null;
	addListener: (listener: (this: MediaQueryList, ev: MediaQueryListEvent) => any) => void;
	removeListener: (listener: (this: MediaQueryList, ev: MediaQueryListEvent) => any) => void;
	addEventListener: (type: string, listener: EventListener) => void;
	removeEventListener: (type: string, listener: EventListener) => void;
	dispatchEvent: (event: Event) => boolean;
}

export class MediaQueryListMock implements MediaQueryList {
	private listeners: Array<(this: MediaQueryList, ev: MediaQueryListEvent) => any> = [];
	private eventListeners: Map<string, EventListener[]> = new Map();

	constructor(
		public media: string,
		public matches: boolean
	) {}

	onchange: ((this: MediaQueryList, ev: MediaQueryListEvent) => any) | null = null;

	addListener(listener: (this: MediaQueryList, ev: MediaQueryListEvent) => any): void {
		this.listeners.push(listener);
	}

	removeListener(listener: (this: MediaQueryList, ev: MediaQueryListEvent) => any): void {
		const index = this.listeners.indexOf(listener);
		if (index !== -1) {
			this.listeners.splice(index, 1);
		}
	}

	addEventListener(type: string, listener: EventListener): void {
		if (!this.eventListeners.has(type)) {
			this.eventListeners.set(type, []);
		}
		this.eventListeners.get(type)!.push(listener);
	}

	removeEventListener(type: string, listener: EventListener): void {
		const listeners = this.eventListeners.get(type);
		if (listeners) {
			const index = listeners.indexOf(listener);
			if (index !== -1) {
				listeners.splice(index, 1);
			}
		}
	}

	dispatchEvent(event: Event): boolean {
		const listeners = this.eventListeners.get(event.type);
		if (listeners) {
			listeners.forEach((listener) => listener(event));
		}

		if (event.type === 'change') {
			const mediaQueryEvent = event as MediaQueryListEvent;
			this.listeners.forEach((listener) => listener.call(this, mediaQueryEvent));
			if (this.onchange) {
				this.onchange.call(this, mediaQueryEvent);
			}
		}

		return true;
	}

	updateMatches(matches: boolean): void {
		if (this.matches !== matches) {
			this.matches = matches;
			// Create a custom event since MediaQueryListEvent might not be available in jsdom
			const event = new Event('change') as any;
			event.matches = this.matches;
			event.media = this.media;
			this.dispatchEvent(event);
		}
	}
}

export const breakpoints = {
	mobile: '(max-width: 640px)',
	tablet: '(min-width: 641px) and (max-width: 1024px)',
	desktop: '(min-width: 1025px)',
	sm: '(min-width: 640px)',
	md: '(min-width: 768px)',
	lg: '(min-width: 1024px)',
	xl: '(min-width: 1280px)',
	'2xl': '(min-width: 1536px)',
	prefersReducedMotion: '(prefers-reduced-motion: reduce)',
	prefersDark: '(prefers-color-scheme: dark)',
	prefersLight: '(prefers-color-scheme: light)',
	highContrast: '(prefers-contrast: high)'
} as const;

export type Breakpoint = keyof typeof breakpoints;

export function setupMediaQueryMock(defaultMatches: Record<string, boolean> = {}) {
	const mockInstances = new Map<string, MediaQueryListMock>();

	const matchMediaMock = vi.fn((query: string) => {
		if (!mockInstances.has(query)) {
			const matches = defaultMatches[query] ?? false;
			mockInstances.set(query, new MediaQueryListMock(query, matches));
		}
		return mockInstances.get(query)!;
	});

	Object.defineProperty(window, 'matchMedia', {
		writable: true,
		configurable: true,
		value: matchMediaMock
	});

	return {
		matchMedia: matchMediaMock,
		updateQuery: (query: string, matches: boolean) => {
			const instance = mockInstances.get(query);
			if (instance) {
				instance.updateMatches(matches);
			}
		},
		updateBreakpoint: (breakpoint: Breakpoint, matches: boolean) => {
			const query = breakpoints[breakpoint];
			const instance = mockInstances.get(query);
			if (instance) {
				instance.updateMatches(matches);
			}
		},
		getInstance: (query: string) => mockInstances.get(query),
		reset: () => {
			mockInstances.clear();
			matchMediaMock.mockClear();
		}
	};
}

export function mockViewport(viewport: 'mobile' | 'tablet' | 'desktop') {
	const config: Record<string, boolean> = {};

	switch (viewport) {
		case 'mobile':
			config[breakpoints.mobile] = true;
			config[breakpoints.tablet] = false;
			config[breakpoints.desktop] = false;
			config[breakpoints.sm] = false;
			config[breakpoints.md] = false;
			config[breakpoints.lg] = false;
			break;
		case 'tablet':
			config[breakpoints.mobile] = false;
			config[breakpoints.tablet] = true;
			config[breakpoints.desktop] = false;
			config[breakpoints.sm] = true;
			config[breakpoints.md] = true;
			config[breakpoints.lg] = false;
			break;
		case 'desktop':
			config[breakpoints.mobile] = false;
			config[breakpoints.tablet] = false;
			config[breakpoints.desktop] = true;
			config[breakpoints.sm] = true;
			config[breakpoints.md] = true;
			config[breakpoints.lg] = true;
			break;
	}

	return setupMediaQueryMock(config);
}

export function expectMediaQuery(query: string, shouldMatch: boolean) {
	const mediaQuery = window.matchMedia(query);
	expect(mediaQuery.matches).toBe(shouldMatch);
}

export function expectViewport(viewport: 'mobile' | 'tablet' | 'desktop') {
	switch (viewport) {
		case 'mobile':
			expectMediaQuery(breakpoints.mobile, true);
			expectMediaQuery(breakpoints.desktop, false);
			break;
		case 'tablet':
			expectMediaQuery(breakpoints.tablet, true);
			expectMediaQuery(breakpoints.mobile, false);
			expectMediaQuery(breakpoints.desktop, false);
			break;
		case 'desktop':
			expectMediaQuery(breakpoints.desktop, true);
			expectMediaQuery(breakpoints.mobile, false);
			expectMediaQuery(breakpoints.tablet, false);
			break;
	}
}