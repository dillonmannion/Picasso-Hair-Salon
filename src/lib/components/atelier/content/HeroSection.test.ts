import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, waitFor, cleanup } from '@testing-library/svelte';
import HeroSection from './HeroSection.svelte';

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
	observe: vi.fn(),
	unobserve: vi.fn(),
	disconnect: vi.fn()
});
window.IntersectionObserver = mockIntersectionObserver;

describe('HeroSection', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		window.scrollY = 0;
	});

	afterEach(() => {
		cleanup();
	});

	const defaultProps = {
		backgroundImage: '/hero-bg.jpg',
		title: 'Welcome to Atelier',
		subtitle: 'Elegant design system for modern web'
	};

	it('renders title and subtitle', () => {
		const { getByText, getByRole } = render(HeroSection, {
			props: defaultProps
		});

		expect(getByText('Welcome to Atelier')).toBeInTheDocument();
		expect(getByText('Elegant design system for modern web')).toBeInTheDocument();
		expect(getByRole('banner')).toBeInTheDocument();
	});

	it('renders with different height variants', () => {
		const { container, rerender } = render(HeroSection, {
			props: { ...defaultProps, height: 'full' }
		});

		let hero = container.querySelector('.atelier-hero');
		expect(hero).toHaveClass('min-h-screen');

		rerender({ props: { ...defaultProps, height: 'large' } });
		hero = container.querySelector('.atelier-hero');
		expect(hero).toHaveClass('min-h-[80vh]');

		rerender({ props: { ...defaultProps, height: 'medium' } });
		hero = container.querySelector('.atelier-hero');
		expect(hero).toHaveClass('min-h-[60vh]');
	});

	it('renders with different overlay styles', () => {
		const { container, rerender } = render(HeroSection, {
			props: { ...defaultProps, overlay: 'dark' }
		});

		let overlay = container.querySelector('.atelier-hero__overlay');
		expect(overlay).toHaveClass('atelier-hero__overlay--dark');

		rerender({ props: { ...defaultProps, overlay: 'light' } });
		overlay = container.querySelector('.atelier-hero__overlay');
		expect(overlay).toHaveClass('atelier-hero__overlay--light');

		rerender({ props: { ...defaultProps, overlay: 'gradient' } });
		overlay = container.querySelector('.atelier-hero__overlay');
		expect(overlay).toHaveClass('atelier-hero__overlay--gradient');

		rerender({ props: { ...defaultProps, overlay: 'none' } });
		overlay = container.querySelector('.atelier-hero__overlay');
		expect(overlay).not.toBeInTheDocument();
	});

	it('renders CTA buttons when provided', () => {
		const { getByText } = render(HeroSection, {
			props: {
				...defaultProps,
				cta: {
					text: 'Get Started',
					href: '/start',
					variant: 'primary'
				},
				ctaSecondary: {
					text: 'Learn More',
					href: '/learn',
					variant: 'outline'
				}
			}
		});

		expect(getByText('Get Started')).toBeInTheDocument();
		expect(getByText('Learn More')).toBeInTheDocument();
	});

	it('handles eager loading of images', async () => {
		const { container } = render(HeroSection, {
			props: {
				...defaultProps,
				loading: 'eager'
			}
		});

		const img = container.querySelector('.atelier-hero__image');
		expect(img).toBeInTheDocument();
		expect(img).toHaveAttribute('src', '/hero-bg.jpg');
		expect(img).not.toHaveAttribute('loading');
	});

	it('handles lazy loading of images', async () => {
		const observerCallback = mockIntersectionObserver.mock.calls[0][0];

		const { container } = render(HeroSection, {
			props: {
				...defaultProps,
				loading: 'lazy'
			}
		});

		// Initially no image
		let img = container.querySelector('.atelier-hero__image');
		expect(img).not.toBeInTheDocument();

		// Simulate intersection
		observerCallback([{ isIntersecting: true }]);

		await waitFor(() => {
			img = container.querySelector('.atelier-hero__image');
			expect(img).toBeInTheDocument();
			expect(img).toHaveAttribute('loading', 'lazy');
		});
	});

	it('applies parallax transform based on scroll', async () => {
		const { container } = render(HeroSection, {
			props: {
				...defaultProps,
				parallaxSpeed: 0.5
			}
		});

		const img = container.querySelector('.atelier-hero__image');

		// Initial position
		expect(img).toHaveStyle({ transform: 'translate3d(0, 0px, 0)' });

		// Simulate scroll
		window.scrollY = 100;
		window.dispatchEvent(new Event('scroll'));

		await waitFor(() => {
			expect(img).toHaveStyle({ transform: 'translate3d(0, 50px, 0)' });
		});
	});

	it('respects custom className', () => {
		const { container } = render(HeroSection, {
			props: {
				...defaultProps,
				class: 'custom-hero-class'
			}
		});

		const hero = container.querySelector('.atelier-hero');
		expect(hero).toHaveClass('custom-hero-class');
	});

	it('sets alt text for accessibility', () => {
		const { container } = render(HeroSection, {
			props: {
				...defaultProps,
				alt: 'Beautiful landscape',
				loading: 'eager'
			}
		});

		const img = container.querySelector('.atelier-hero__image');
		expect(img).toHaveAttribute('alt', 'Beautiful landscape');
	});

	it('sets up IntersectionObserver correctly', () => {
		render(HeroSection, { props: defaultProps });

		expect(mockIntersectionObserver).toHaveBeenCalledWith(expect.any(Function), {
			threshold: 0,
			rootMargin: '50px'
		});
		expect(mockIntersectionObserver().observe).toHaveBeenCalled();
	});

	it('cleans up on unmount', () => {
		const { unmount } = render(HeroSection, { props: defaultProps });

		const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

		unmount();

		expect(mockIntersectionObserver().disconnect).toHaveBeenCalled();
		expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
	});
});
