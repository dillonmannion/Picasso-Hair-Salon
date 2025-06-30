import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import ScrollToTop from './ScrollToTop.svelte';

describe('ScrollToTop', () => {
	let scrollToMock: any;
	let originalScrollY: number;

	beforeEach(() => {
		// Mock window.scrollTo
		scrollToMock = vi.fn();
		window.scrollTo = scrollToMock;

		// Store original scrollY
		originalScrollY = window.scrollY;

		// Reset scroll position
		Object.defineProperty(window, 'scrollY', {
			writable: true,
			configurable: true,
			value: 0
		});
	});

	afterEach(() => {
		vi.clearAllMocks();
		// Restore original scrollY
		Object.defineProperty(window, 'scrollY', {
			writable: true,
			configurable: true,
			value: originalScrollY
		});
	});

	it('renders with default props', () => {
		render(ScrollToTop);
		const button = screen.getByRole('button', { name: 'Scroll to top' });
		expect(button).toBeInTheDocument();
		expect(button).toHaveClass('w-12', 'h-12', 'right-4');
	});

	it('renders with custom props', () => {
		render(ScrollToTop, {
			props: {
				size: 'large',
				position: 'bottom-left',
				ariaLabel: 'Back to top',
				class: 'custom-class'
			}
		});

		const button = screen.getByRole('button', { name: 'Back to top' });
		expect(button).toHaveClass('w-14', 'h-14', 'left-4', 'custom-class');
	});

	it('is hidden when scroll position is below threshold', () => {
		render(ScrollToTop, { props: { threshold: 300 } });
		const button = screen.getByRole('button');

		expect(button).toHaveClass('opacity-0', 'pointer-events-none');
		expect(button).toBeDisabled();
	});

	it('becomes visible when scroll position exceeds threshold', async () => {
		render(ScrollToTop, { props: { threshold: 300 } });
		const button = screen.getByRole('button');

		// Simulate scrolling past threshold
		Object.defineProperty(window, 'scrollY', { value: 400 });
		fireEvent.scroll(window);

		// Wait for state update
		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(button).toHaveClass('opacity-100');
		expect(button).not.toHaveClass('pointer-events-none');
		expect(button).not.toBeDisabled();
	});

	it('scrolls to top when clicked', async () => {
		render(ScrollToTop);

		// Make button visible
		Object.defineProperty(window, 'scrollY', { value: 400 });
		fireEvent.scroll(window);
		await new Promise((resolve) => setTimeout(resolve, 0));

		const button = screen.getByRole('button');
		fireEvent.click(button);

		expect(scrollToMock).toHaveBeenCalledWith({
			top: 0,
			behavior: 'smooth'
		});
	});

	it('supports different sizes', () => {
		const { rerender } = render(ScrollToTop, { props: { size: 'small' } });
		expect(screen.getByRole('button')).toHaveClass('w-10', 'h-10');

		rerender({ size: 'medium' });
		expect(screen.getByRole('button')).toHaveClass('w-12', 'h-12');

		rerender({ size: 'large' });
		expect(screen.getByRole('button')).toHaveClass('w-14', 'h-14');
	});

	it('supports different positions', () => {
		const { rerender } = render(ScrollToTop, { props: { position: 'bottom-right' } });
		expect(screen.getByRole('button')).toHaveClass('right-4');

		rerender({ position: 'bottom-left' });
		expect(screen.getByRole('button')).toHaveClass('left-4');
	});

	it('updates visibility on scroll', async () => {
		render(ScrollToTop, { props: { threshold: 200 } });
		const button = screen.getByRole('button');

		// Initially hidden
		expect(button).toBeDisabled();

		// Scroll past threshold
		Object.defineProperty(window, 'scrollY', { value: 250 });
		fireEvent.scroll(window);
		await new Promise((resolve) => setTimeout(resolve, 0));
		expect(button).not.toBeDisabled();

		// Scroll back up
		Object.defineProperty(window, 'scrollY', { value: 100 });
		fireEvent.scroll(window);
		await new Promise((resolve) => setTimeout(resolve, 0));
		expect(button).toBeDisabled();
	});

	it('maintains focus after scrolling', async () => {
		render(ScrollToTop);

		// Make visible and click
		Object.defineProperty(window, 'scrollY', { value: 400 });
		fireEvent.scroll(window);
		await new Promise((resolve) => setTimeout(resolve, 0));

		const button = screen.getByRole('button');
		button.focus();
		fireEvent.click(button);

		// Focus should remain on button
		expect(document.activeElement).toBe(button);
	});

	it('passes through additional props', () => {
		render(ScrollToTop, {
			props: {
				'data-testid': 'scroll-button',
				id: 'back-to-top'
			}
		});

		const button = screen.getByRole('button');
		expect(button).toHaveAttribute('data-testid', 'scroll-button');
		expect(button).toHaveAttribute('id', 'back-to-top');
	});
});
