import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import OptimizedImage from './OptimizedImage.svelte';

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
	observe: vi.fn(),
	unobserve: vi.fn(),
	disconnect: vi.fn()
});
global.IntersectionObserver = mockIntersectionObserver;

describe('OptimizedImage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Reset IntersectionObserver mock
		mockIntersectionObserver.mockClear();
	});

	it('renders with required props', () => {
		render(OptimizedImage, {
			props: {
				src: '/test-image.jpg',
				alt: 'Test image'
			}
		});

		const img = screen.getByAltText('Test image');
		expect(img).toBeInTheDocument();
	});

	it('applies custom class and style', () => {
		render(OptimizedImage, {
			props: {
				src: '/test.jpg',
				alt: 'Test',
				class: 'custom-class',
				style: 'border: 1px solid red'
			}
		});

		const container = screen.getByAltText('Test').parentElement;
		expect(container).toHaveClass('custom-class');
		expect(container).toHaveAttribute('style', expect.stringContaining('border: 1px solid red'));
	});

	it('sets width and height attributes', () => {
		render(OptimizedImage, {
			props: {
				src: '/test.jpg',
				alt: 'Test',
				width: 800,
				height: 600
			}
		});

		const img = screen.getByAltText('Test');
		expect(img).toHaveAttribute('width', '800');
		expect(img).toHaveAttribute('height', '600');
	});

	it('uses native lazy loading when supported', () => {
		// Mock native lazy loading support
		Object.defineProperty(HTMLImageElement.prototype, 'loading', {
			writable: true,
			configurable: true,
			value: 'lazy'
		});

		render(OptimizedImage, {
			props: {
				src: '/test.jpg',
				alt: 'Test',
				loading: 'lazy'
			}
		});

		const img = screen.getByAltText('Test');
		expect(img).toHaveAttribute('loading', 'lazy');
		expect(img).toHaveAttribute('src', '/test.jpg');
	});

	it('renders placeholder while loading', () => {
		render(OptimizedImage, {
			props: {
				src: '/test.jpg',
				alt: 'Test',
				placeholder: 'data:image/jpeg;base64,placeholder'
			}
		});

		// Should show placeholder
		const placeholder = screen.getByRole('img', { hidden: true });
		expect(placeholder).toHaveAttribute('src', 'data:image/jpeg;base64,placeholder');
		expect(placeholder).toHaveClass('opacity-100');
	});

	it('hides placeholder after image loads', async () => {
		render(OptimizedImage, {
			props: {
				src: '/test.jpg',
				alt: 'Test',
				placeholder: 'data:image/jpeg;base64,placeholder'
			}
		});

		const mainImg = screen.getByAltText('Test');
		const placeholder = screen.getByRole('img', { hidden: true });

		// Initially placeholder is visible
		expect(placeholder).toHaveClass('opacity-100');

		// Trigger load event
		fireEvent.load(mainImg);

		await waitFor(() => {
			expect(placeholder).toHaveClass('opacity-0');
		});
	});

	it('shows loading skeleton when no placeholder', () => {
		render(OptimizedImage, {
			props: {
				src: '/test.jpg',
				alt: 'Test'
			}
		});

		const skeleton = screen.getByAltText('Test').parentElement?.querySelector('.animate-pulse');
		expect(skeleton).toBeInTheDocument();
	});

	it('handles image loading error', async () => {
		render(OptimizedImage, {
			props: {
				src: '/broken.jpg',
				alt: 'Broken image'
			}
		});

		const img = screen.getByAltText('Broken image');
		fireEvent.error(img);

		// Should show error state
		await waitFor(() => {
			const errorState = screen.getByRole('img', { name: 'Broken image' });
			expect(errorState).toBeInTheDocument();
			expect(errorState.querySelector('svg')).toBeInTheDocument();
		});
	});

	it('supports srcset and sizes attributes', () => {
		render(OptimizedImage, {
			props: {
				src: '/test.jpg',
				alt: 'Test',
				srcset: '/test-400.jpg 400w, /test-800.jpg 800w',
				sizes: '(max-width: 400px) 400px, 800px'
			}
		});

		const img = screen.getByAltText('Test');
		expect(img).toHaveAttribute('srcset', '/test-400.jpg 400w, /test-800.jpg 800w');
		expect(img).toHaveAttribute('sizes', '(max-width: 400px) 400px, 800px');
	});

	it('uses IntersectionObserver for lazy loading fallback', async () => {
		// Mock no native lazy loading support
		delete (HTMLImageElement.prototype as any).loading;

		let observerCallback: any;
		mockIntersectionObserver.mockImplementation((callback) => ({
			observe: vi.fn(),
			unobserve: vi.fn(),
			disconnect: vi.fn()
		}));

		mockIntersectionObserver.mockImplementationOnce((callback) => {
			observerCallback = callback;
			return {
				observe: vi.fn(),
				unobserve: vi.fn(),
				disconnect: vi.fn()
			};
		});

		render(OptimizedImage, {
			props: {
				src: '/test.jpg',
				alt: 'Test',
				loading: 'lazy'
			}
		});

		// Initially no src
		const img = screen.getByAltText('Test');
		expect(img).not.toHaveAttribute('src');

		// Simulate intersection
		if (observerCallback) {
			observerCallback([{ isIntersecting: true, target: img }]);
		}

		// Should now have src
		await waitFor(() => {
			expect(img).toHaveAttribute('src', '/test.jpg');
		});
	});

	it('loads immediately with eager loading', () => {
		render(OptimizedImage, {
			props: {
				src: '/test.jpg',
				alt: 'Test',
				loading: 'eager'
			}
		});

		const img = screen.getByAltText('Test');
		expect(img).toHaveAttribute('src', '/test.jpg');
	});

	it('passes through additional props', () => {
		render(OptimizedImage, {
			props: {
				src: '/test.jpg',
				alt: 'Test',
				'data-testid': 'optimized-img',
				id: 'hero-image'
			}
		});

		const img = screen.getByAltText('Test');
		expect(img).toHaveAttribute('data-testid', 'optimized-img');
		expect(img).toHaveAttribute('id', 'hero-image');
	});
});
