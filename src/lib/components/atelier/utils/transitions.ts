import { onNavigate } from '$app/navigation';
import { cubicOut } from 'svelte/easing';

export interface TransitionConfig {
	duration?: number;
	delay?: number;
	easing?: (t: number) => number;
	css?: (t: number, u: number) => string;
}

export const atelierTransitions = {
	fadeScale: (node: HTMLElement, params: TransitionConfig = {}) => {
		const defaultParams = {
			duration: 250,
			delay: 0,
			easing: cubicOut
		};

		const config = { ...defaultParams, ...params };

		return {
			duration: config.duration,
			delay: config.delay,
			easing: config.easing,
			css: (t: number) => `
				opacity: ${t};
				transform: scale(${0.95 + 0.05 * t});
			`
		};
	},

	slideReveal: (node: HTMLElement, params: TransitionConfig = {}) => {
		const defaultParams = {
			duration: 350,
			delay: 0,
			easing: cubicOut
		};

		const config = { ...defaultParams, ...params };

		return {
			duration: config.duration,
			delay: config.delay,
			easing: config.easing,
			css: (t: number, u: number) => `
				opacity: ${t};
				transform: translateY(${u * 20}px);
			`
		};
	},

	luxuryFade: (node: HTMLElement, params: TransitionConfig = {}) => {
		const defaultParams = {
			duration: 500,
			delay: 0,
			easing: cubicOut
		};

		const config = { ...defaultParams, ...params };

		return {
			duration: config.duration,
			delay: config.delay,
			easing: config.easing,
			css: (t: number) => `
				opacity: ${t};
				filter: blur(${(1 - t) * 4}px);
			`
		};
	}
};

export function setupPageTransitions() {
	if (typeof document === 'undefined') return;

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
}

export function addViewTransitionNames() {
	if (typeof document === 'undefined') return;

	const style = document.createElement('style');
	style.textContent = `
		/* Page transition styles */
		@supports (view-transition-name: root) {
			:root {
				view-transition-name: root;
			}

			.atelier-header {
				view-transition-name: header;
			}

			.atelier-hero-title {
				view-transition-name: hero-title;
			}

			.atelier-gallery-item {
				view-transition-name: gallery-item;
			}

			::view-transition-old(root),
			::view-transition-new(root) {
				animation-duration: 350ms;
				animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
			}

			::view-transition-old(root) {
				animation-name: fade-and-scale-out;
			}

			::view-transition-new(root) {
				animation-name: fade-and-scale-in;
			}

			@keyframes fade-and-scale-out {
				from {
					opacity: 1;
					transform: scale(1);
				}
				to {
					opacity: 0;
					transform: scale(0.95);
				}
			}

			@keyframes fade-and-scale-in {
				from {
					opacity: 0;
					transform: scale(1.05);
				}
				to {
					opacity: 1;
					transform: scale(1);
				}
			}

			/* Reduced motion support */
			@media (prefers-reduced-motion: reduce) {
				::view-transition-old(root),
				::view-transition-new(root) {
					animation-duration: 0.01ms;
				}
			}
		}
	`;
	document.head.appendChild(style);
}

export const pageTransitionClasses = {
	entering: 'atelier-page-entering',
	leaving: 'atelier-page-leaving',
	container: 'atelier-page-transition-container'
};
