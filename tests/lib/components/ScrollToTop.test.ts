import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import ScrollToTop from '$lib/components/ScrollToTop.svelte';

describe('ScrollToTop', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		window.scrollY = 0;
		window.scrollTo = vi.fn();
	});

	it('should be hidden when not scrolled past threshold', async () => {
		render(ScrollToTop);
		
		const button = screen.queryByRole('button', { name: /scroll to top/i });
		expect(button).not.toBeInTheDocument();
	});

	it('should show button when scrolled past threshold', async () => {
		render(ScrollToTop);
		
		window.scrollY = 400;
		window.dispatchEvent(new Event('scroll'));
		
		const button = await screen.findByRole('button', { name: /scroll to top/i });
		expect(button).toBeInTheDocument();
	});

	it('should hide button when scrolled back above threshold', async () => {
		render(ScrollToTop);
		
		window.scrollY = 400;
		window.dispatchEvent(new Event('scroll'));
		
		const button = await screen.findByRole('button', { name: /scroll to top/i });
		expect(button).toBeInTheDocument();
		
		window.scrollY = 200;
		window.dispatchEvent(new Event('scroll'));
		
		// Wait for the button to disappear
		await vi.waitFor(() => {
			expect(screen.queryByRole('button', { name: /scroll to top/i })).not.toBeInTheDocument();
		});
	});

	it('should smoothly scroll to top on click', async () => {
		const user = userEvent.setup();
		render(ScrollToTop);
		
		window.scrollY = 400;
		window.dispatchEvent(new Event('scroll'));
		
		const button = await screen.findByRole('button', { name: /scroll to top/i });
		await user.click(button);
		
		expect(window.scrollTo).toHaveBeenCalledWith({
			top: 0,
			behavior: 'smooth'
		});
	});

	it('should position fixed at bottom-right', async () => {
		render(ScrollToTop);
		
		window.scrollY = 400;
		window.dispatchEvent(new Event('scroll'));
		
		const button = await screen.findByRole('button', { name: /scroll to top/i });
		expect(button).toHaveClass('fixed', 'bottom-6', 'right-6');
	});

	it('should have proper styling and hover effects', async () => {
		render(ScrollToTop);
		
		window.scrollY = 400;
		window.dispatchEvent(new Event('scroll'));
		
		const button = await screen.findByRole('button', { name: /scroll to top/i });
		expect(button).toHaveClass('bg-primary', 'text-white', 'rounded-full', 'shadow-lg');
		expect(button).toHaveClass('hover:bg-primary-dark', 'hover:shadow-xl');
	});

	it('should have proper z-index to appear above other content', async () => {
		render(ScrollToTop);
		
		window.scrollY = 400;
		window.dispatchEvent(new Event('scroll'));
		
		const button = await screen.findByRole('button', { name: /scroll to top/i });
		expect(button).toHaveClass('z-50');
	});

	it('should have smooth fade transitions', async () => {
		render(ScrollToTop);
		
		window.scrollY = 400;
		window.dispatchEvent(new Event('scroll'));
		
		const button = await screen.findByRole('button', { name: /scroll to top/i });
		expect(button).toHaveClass('transition-opacity', 'duration-300');
	});

	it('should have proper aria attributes for accessibility', async () => {
		render(ScrollToTop);
		
		window.scrollY = 400;
		window.dispatchEvent(new Event('scroll'));
		
		const button = await screen.findByRole('button', { name: /scroll to top/i });
		expect(button).toHaveAttribute('aria-label', 'Scroll to top');
	});

	it('should clean up scroll listener on unmount', () => {
		const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
		const { unmount } = render(ScrollToTop);
		
		unmount();
		
		expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
	});
});