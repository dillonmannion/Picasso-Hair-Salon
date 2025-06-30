import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, waitFor, cleanup } from '@testing-library/svelte';
import ServiceGrid from './ServiceGrid.svelte';

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
	observe: vi.fn(),
	unobserve: vi.fn(),
	disconnect: vi.fn()
});
window.IntersectionObserver = mockIntersectionObserver;

describe('ServiceGrid', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		cleanup();
	});

	const mockServices = [
		{
			id: '1',
			title: 'Hair Cut',
			description: 'Professional hair cutting service',
			price: '$50',
			duration: '45 min',
			image: '/haircut.jpg'
		},
		{
			id: '2',
			title: 'Hair Color',
			description: 'Full color treatment',
			price: '$120',
			duration: '2 hours',
			icon: '🎨'
		},
		{
			id: '3',
			title: 'Hair Treatment',
			description: 'Deep conditioning treatment',
			price: '$80',
			duration: '1 hour',
			link: '/services/treatment'
		}
	];

	it('renders all services', () => {
		const { getByText, getAllByRole } = render(ServiceGrid, {
			props: { services: mockServices }
		});

		expect(getByText('Hair Cut')).toBeInTheDocument();
		expect(getByText('Hair Color')).toBeInTheDocument();
		expect(getByText('Hair Treatment')).toBeInTheDocument();

		const articles = getAllByRole('article');
		expect(articles).toHaveLength(3);
	});

	it('renders service details correctly', () => {
		const { getByText, getByAltText } = render(ServiceGrid, {
			props: { services: [mockServices[0]] }
		});

		expect(getByText('Hair Cut')).toBeInTheDocument();
		expect(getByText('Professional hair cutting service')).toBeInTheDocument();
		expect(getByText('$50')).toBeInTheDocument();
		expect(getByText('45 min')).toBeInTheDocument();
		expect(getByAltText('Hair Cut')).toHaveAttribute('src', '/haircut.jpg');
	});

	it('renders icon when no image provided', () => {
		const { getByText } = render(ServiceGrid, {
			props: { services: [mockServices[1]] }
		});

		expect(getByText('🎨')).toBeInTheDocument();
	});

	it('applies different column layouts', () => {
		const { container, rerender } = render(ServiceGrid, {
			props: { services: mockServices, columns: 2 }
		});

		let grid = container.querySelector('.atelier-service-grid');
		expect(grid).toHaveClass('md:grid-cols-2');

		rerender({ props: { services: mockServices, columns: 3 } });
		grid = container.querySelector('.atelier-service-grid');
		expect(grid).toHaveClass('md:grid-cols-2', 'lg:grid-cols-3');

		rerender({ props: { services: mockServices, columns: 4 } });
		grid = container.querySelector('.atelier-service-grid');
		expect(grid).toHaveClass('xl:grid-cols-4');
	});

	it('applies different gap sizes', () => {
		const { container, rerender } = render(ServiceGrid, {
			props: { services: mockServices, gap: 'sm' }
		});

		let grid = container.querySelector('.atelier-service-grid');
		expect(grid).toHaveClass('gap-4');

		rerender({ props: { services: mockServices, gap: 'md' } });
		grid = container.querySelector('.atelier-service-grid');
		expect(grid).toHaveClass('gap-6');

		rerender({ props: { services: mockServices, gap: 'lg' } });
		grid = container.querySelector('.atelier-service-grid');
		expect(grid).toHaveClass('gap-8');
	});

	it('makes cards clickable when link is provided', async () => {
		const { getAllByRole } = render(ServiceGrid, {
			props: { services: mockServices }
		});

		const articles = getAllByRole('article');
		const buttons = getAllByRole('button');

		// Only the third service has a link
		expect(buttons).toHaveLength(1);
		expect(articles[2]).toHaveClass('atelier-service-card--clickable');
		expect(articles[2]).toHaveAttribute('tabindex', '0');
	});

	it('handles keyboard navigation for clickable cards', async () => {
		Object.defineProperty(window, 'location', {
			value: { href: '' },
			writable: true
		});

		const { getByText } = render(ServiceGrid, {
			props: { services: [mockServices[2]] }
		});

		const card = getByText('Hair Treatment').closest('article');

		// Test Enter key
		await fireEvent.keyDown(card!, { key: 'Enter' });
		expect(window.location.href).toBe('/services/treatment');

		// Reset href
		window.location.href = '';

		// Test Space key
		await fireEvent.keyDown(card!, { key: ' ' });
		expect(window.location.href).toBe('/services/treatment');
	});

	it('animates cards on scroll when animateOnScroll is true', async () => {
		const observerCallback = mockIntersectionObserver.mock.calls[0][0];

		const { container } = render(ServiceGrid, {
			props: { services: mockServices, animateOnScroll: true }
		});

		const cards = container.querySelectorAll('.atelier-service-card');

		// Initially not visible
		cards.forEach((card) => {
			expect(card).not.toHaveClass('atelier-service-card--visible');
		});

		// Simulate intersection
		const mockEntry = {
			isIntersecting: true,
			target: cards[0]
		};
		cards[0].setAttribute('data-service-id', '1');
		observerCallback([mockEntry]);

		await waitFor(() => {
			expect(cards[0]).toHaveClass('atelier-service-card--visible');
		});
	});

	it('shows all cards immediately when animateOnScroll is false', () => {
		const { container } = render(ServiceGrid, {
			props: { services: mockServices, animateOnScroll: false }
		});

		const cards = container.querySelectorAll('.atelier-service-card');
		cards.forEach((card) => {
			expect(card).toHaveClass('atelier-service-card--visible');
		});
	});

	it('applies stagger delay to animations', () => {
		const { container } = render(ServiceGrid, {
			props: {
				services: mockServices,
				staggerDelay: 150,
				animateOnScroll: true
			}
		});

		const cards = container.querySelectorAll('.atelier-service-card');
		expect(cards[0]).toHaveStyle({ animationDelay: '0ms' });
		expect(cards[1]).toHaveStyle({ animationDelay: '150ms' });
		expect(cards[2]).toHaveStyle({ animationDelay: '300ms' });
	});

	it('respects custom className', () => {
		const { container } = render(ServiceGrid, {
			props: {
				services: mockServices,
				class: 'custom-grid-class'
			}
		});

		const grid = container.querySelector('.atelier-service-grid');
		expect(grid).toHaveClass('custom-grid-class');
	});

	it('sets up IntersectionObserver correctly', () => {
		render(ServiceGrid, {
			props: { services: mockServices, animateOnScroll: true }
		});

		expect(mockIntersectionObserver).toHaveBeenCalledWith(expect.any(Function), {
			threshold: 0.1,
			rootMargin: '50px'
		});
		expect(mockIntersectionObserver().observe).toHaveBeenCalledTimes(3);
	});

	it('cleans up observer on unmount', () => {
		const { unmount } = render(ServiceGrid, {
			props: { services: mockServices, animateOnScroll: true }
		});

		unmount();

		expect(mockIntersectionObserver().disconnect).toHaveBeenCalled();
	});
});
