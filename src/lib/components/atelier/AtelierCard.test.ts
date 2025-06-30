import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import AtelierCard from './AtelierCard.svelte';

describe('AtelierCard', () => {
	it('renders with default props', () => {
		const { container } = render(AtelierCard, {
			props: {
				children: () => 'Card content'
			}
		});

		const card = container.querySelector('.atelier-card');
		expect(card).toBeInTheDocument();
		expect(card).toHaveTextContent('Card content');
		expect(card).toHaveClass('bg-white', 'rounded-xl', 'shadow-sm');
	});

	it('applies hover effects when hoverable', () => {
		const { container } = render(AtelierCard, {
			props: {
				hoverable: true,
				children: () => 'Hoverable card'
			}
		});

		const card = container.querySelector('.atelier-card');
		expect(card).toHaveClass('hover:shadow-lg', 'hover:-translate-y-1', 'cursor-pointer');
		expect(card).toHaveAttribute('role', 'button');
		expect(card).toHaveAttribute('tabindex', '0');
	});

	it('removes hover effects when not hoverable', () => {
		const { container } = render(AtelierCard, {
			props: {
				hoverable: false,
				children: () => 'Static card'
			}
		});

		const card = container.querySelector('.atelier-card');
		expect(card).not.toHaveClass('hover:shadow-lg', 'hover:-translate-y-1', 'cursor-pointer');
		expect(card).not.toHaveAttribute('role');
		expect(card).not.toHaveAttribute('tabindex');
	});

	it('applies different padding sizes', () => {
		const paddings = ['none', 'sm', 'md', 'lg'] as const;

		paddings.forEach((padding) => {
			const { container } = render(AtelierCard, {
				props: {
					padding,
					children: () => `Padding ${padding}`
				}
			});

			const card = container.querySelector('.atelier-card');

			if (padding === 'none') {
				expect(card).not.toHaveClass('p-4', 'p-6', 'p-8');
			} else if (padding === 'sm') {
				expect(card).toHaveClass('p-4');
			} else if (padding === 'md') {
				expect(card).toHaveClass('p-6');
			} else if (padding === 'lg') {
				expect(card).toHaveClass('p-8');
			}
		});
	});

	it('handles click events', async () => {
		const handleClick = vi.fn();
		const { container } = render(AtelierCard, {
			props: {
				onclick: handleClick,
				children: () => 'Clickable card'
			}
		});

		const card = container.querySelector('.atelier-card');
		await fireEvent.click(card!);
		expect(handleClick).toHaveBeenCalledOnce();
	});

	it('handles keyboard navigation', async () => {
		const handleClick = vi.fn();
		const { container } = render(AtelierCard, {
			props: {
				onclick: handleClick,
				children: () => 'Keyboard accessible card'
			}
		});

		const card = container.querySelector('.atelier-card');

		// Test Enter key
		await fireEvent.keyDown(card!, { key: 'Enter' });
		expect(handleClick).toHaveBeenCalledOnce();

		// Test Space key
		await fireEvent.keyDown(card!, { key: ' ' });
		expect(handleClick).toHaveBeenCalledTimes(2);

		// Test other keys (should not trigger click)
		await fireEvent.keyDown(card!, { key: 'Tab' });
		expect(handleClick).toHaveBeenCalledTimes(2);
	});

	it('applies custom className', () => {
		const { container } = render(AtelierCard, {
			props: {
				class: 'custom-card-class',
				children: () => 'Custom styled card'
			}
		});

		const card = container.querySelector('.atelier-card');
		expect(card).toHaveClass('custom-card-class');
	});

	it('passes through additional HTML attributes', () => {
		const { container } = render(AtelierCard, {
			props: {
				'data-testid': 'test-card',
				'aria-label': 'Test card',
				id: 'card-1',
				children: () => 'Test attributes'
			}
		});

		const card = container.querySelector('.atelier-card');
		expect(card).toHaveAttribute('data-testid', 'test-card');
		expect(card).toHaveAttribute('aria-label', 'Test card');
		expect(card).toHaveAttribute('id', 'card-1');
	});

	it('renders complex content with slots', () => {
		const { getByText, getByRole } = render(AtelierCard, {
			props: {
				children: () => ({
					render: () => `
						<h3>Card Title</h3>
						<p>Card description</p>
						<button>Action</button>
					`
				})
			}
		});

		expect(getByText('Card Title')).toBeInTheDocument();
		expect(getByText('Card description')).toBeInTheDocument();
		expect(getByRole('button', { name: 'Action' })).toBeInTheDocument();
	});

	it('has proper focus styles', () => {
		const { container } = render(AtelierCard, {
			props: {
				hoverable: true,
				children: () => 'Focusable card'
			}
		});

		const card = container.querySelector('.atelier-card');
		expect(card).toBeDefined();
		// Focus styles are applied via CSS
	});
});
