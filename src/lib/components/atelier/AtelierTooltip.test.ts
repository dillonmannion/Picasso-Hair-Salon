import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/svelte';
import AtelierTooltip from './AtelierTooltip.svelte';

describe('AtelierTooltip', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('renders trigger content', () => {
		const { getByText } = render(AtelierTooltip, {
			props: {
				content: 'Tooltip text',
				children: () => 'Hover me'
			}
		});

		expect(getByText('Hover me')).toBeInTheDocument();
	});

	it('shows tooltip on hover after delay', async () => {
		const { getByText, getByRole } = render(AtelierTooltip, {
			props: {
				content: 'Tooltip content',
				delay: 500,
				children: () => 'Trigger'
			}
		});

		const trigger = getByText('Trigger');

		// Initially hidden
		expect(getByRole('tooltip', { hidden: true })).toHaveAttribute('aria-hidden', 'true');

		// Hover over trigger
		await fireEvent.mouseEnter(trigger.parentElement!);

		// Still hidden before delay
		expect(getByRole('tooltip', { hidden: true })).toHaveAttribute('aria-hidden', 'true');

		// Advance timers
		vi.advanceTimersByTime(500);

		// Now visible
		await waitFor(() => {
			expect(getByRole('tooltip')).toHaveAttribute('aria-hidden', 'false');
			expect(getByRole('tooltip')).toHaveTextContent('Tooltip content');
		});
	});

	it('hides tooltip on mouse leave', async () => {
		const { getByText, getByRole } = render(AtelierTooltip, {
			props: {
				content: 'Tooltip',
				delay: 0,
				children: () => 'Trigger'
			}
		});

		const trigger = getByText('Trigger');

		// Show tooltip
		await fireEvent.mouseEnter(trigger.parentElement!);
		vi.advanceTimersByTime(0);

		await waitFor(() => {
			expect(getByRole('tooltip')).toHaveAttribute('aria-hidden', 'false');
		});

		// Hide tooltip
		await fireEvent.mouseLeave(trigger.parentElement!);

		await waitFor(() => {
			expect(getByRole('tooltip', { hidden: true })).toHaveAttribute('aria-hidden', 'true');
		});
	});

	it('shows tooltip on focus', async () => {
		const { getByText, getByRole } = render(AtelierTooltip, {
			props: {
				content: 'Focus tooltip',
				delay: 100,
				children: () => '<button>Focusable</button>'
			}
		});

		const trigger = getByText('Focusable').parentElement!;

		// Focus trigger
		await fireEvent.focus(trigger);
		vi.advanceTimersByTime(100);

		await waitFor(() => {
			expect(getByRole('tooltip')).toHaveAttribute('aria-hidden', 'false');
		});
	});

	it('hides tooltip on blur', async () => {
		const { getByText, getByRole } = render(AtelierTooltip, {
			props: {
				content: 'Blur tooltip',
				delay: 0,
				children: () => '<button>Focusable</button>'
			}
		});

		const trigger = getByText('Focusable').parentElement!;

		// Show tooltip
		await fireEvent.focus(trigger);
		vi.advanceTimersByTime(0);

		await waitFor(() => {
			expect(getByRole('tooltip')).toHaveAttribute('aria-hidden', 'false');
		});

		// Hide tooltip
		await fireEvent.blur(trigger);

		await waitFor(() => {
			expect(getByRole('tooltip', { hidden: true })).toHaveAttribute('aria-hidden', 'true');
		});
	});

	it('renders in different positions', () => {
		const positions = ['top', 'bottom', 'left', 'right'] as const;

		positions.forEach((position) => {
			const { getByRole } = render(AtelierTooltip, {
				props: {
					content: `${position} tooltip`,
					position,
					children: () => 'Trigger'
				}
			});

			const tooltip = getByRole('tooltip', { hidden: true });

			// Check position-specific classes
			if (position === 'top') {
				expect(tooltip).toHaveClass('bottom-full', 'mb-2');
			} else if (position === 'bottom') {
				expect(tooltip).toHaveClass('top-full', 'mt-2');
			} else if (position === 'left') {
				expect(tooltip).toHaveClass('right-full', 'mr-2');
			} else if (position === 'right') {
				expect(tooltip).toHaveClass('left-full', 'ml-2');
			}
		});
	});

	it('cancels show timeout on quick hover', async () => {
		const { getByText, getByRole } = render(AtelierTooltip, {
			props: {
				content: 'Quick hover',
				delay: 1000,
				children: () => 'Trigger'
			}
		});

		const trigger = getByText('Trigger');

		// Hover in
		await fireEvent.mouseEnter(trigger.parentElement!);

		// Advance time partially
		vi.advanceTimersByTime(300);

		// Hover out before delay completes
		await fireEvent.mouseLeave(trigger.parentElement!);

		// Advance time past original delay
		vi.advanceTimersByTime(1000);

		// Tooltip should never have shown
		expect(getByRole('tooltip', { hidden: true })).toHaveAttribute('aria-hidden', 'true');
	});

	it('applies custom className', () => {
		const { getByRole } = render(AtelierTooltip, {
			props: {
				content: 'Custom tooltip',
				class: 'custom-tooltip-class',
				children: () => 'Trigger'
			}
		});

		expect(getByRole('tooltip', { hidden: true })).toHaveClass('custom-tooltip-class');
	});

	it('sets aria-describedby when visible', async () => {
		const { getByText } = render(AtelierTooltip, {
			props: {
				content: 'Accessible tooltip',
				delay: 0,
				children: () => 'Trigger'
			}
		});

		const trigger = getByText('Trigger');
		const triggerContainer = trigger.parentElement!;

		// Initially no aria-describedby
		expect(trigger).not.toHaveAttribute('aria-describedby');

		// Show tooltip
		await fireEvent.mouseEnter(triggerContainer);
		vi.advanceTimersByTime(0);

		await waitFor(() => {
			expect(trigger).toHaveAttribute('aria-describedby', 'atelier-tooltip');
		});

		// Hide tooltip
		await fireEvent.mouseLeave(triggerContainer);

		await waitFor(() => {
			expect(trigger).not.toHaveAttribute('aria-describedby');
		});
	});

	it('renders with arrow indicator', async () => {
		const { getByText, container } = render(AtelierTooltip, {
			props: {
				content: 'Arrow tooltip',
				delay: 0,
				children: () => 'Trigger'
			}
		});

		await fireEvent.mouseEnter(getByText('Trigger').parentElement!);
		vi.advanceTimersByTime(0);

		await waitFor(() => {
			const arrow = container.querySelector('.border-transparent');
			expect(arrow).toBeInTheDocument();
		});
	});
});
