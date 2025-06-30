import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/svelte';
import AtelierAccordion from './AtelierAccordion.svelte';

describe('AtelierAccordion', () => {
	const mockItems = [
		{
			id: 'item1',
			title: 'First Item',
			content: () => ({ render: () => '<div>Content 1</div>', $$slots: { default: true } })
		},
		{
			id: 'item2',
			title: 'Second Item',
			content: () => ({ render: () => '<div>Content 2</div>', $$slots: { default: true } })
		},
		{
			id: 'item3',
			title: 'Third Item',
			disabled: true,
			content: () => ({ render: () => '<div>Content 3</div>', $$slots: { default: true } })
		}
	];

	it('renders all accordion items', () => {
		const { getByText } = render(AtelierAccordion, {
			props: { items: mockItems }
		});

		expect(getByText('First Item')).toBeInTheDocument();
		expect(getByText('Second Item')).toBeInTheDocument();
		expect(getByText('Third Item')).toBeInTheDocument();
	});

	it('expands item on click', async () => {
		const { getByText, queryByText } = render(AtelierAccordion, {
			props: { items: mockItems }
		});

		expect(queryByText('Content 1')).not.toBeInTheDocument();

		await fireEvent.click(getByText('First Item'));

		await waitFor(() => {
			expect(getByText('Content 1')).toBeInTheDocument();
		});
	});

	it('collapses expanded item when collapsible is true', async () => {
		const { getByText, queryByText } = render(AtelierAccordion, {
			props: { items: mockItems, collapsible: true }
		});

		await fireEvent.click(getByText('First Item'));
		expect(getByText('Content 1')).toBeInTheDocument();

		await fireEvent.click(getByText('First Item'));
		await waitFor(() => {
			expect(queryByText('Content 1')).not.toBeInTheDocument();
		});
	});

	it('keeps at least one item open when collapsible is false', async () => {
		const { getByText } = render(AtelierAccordion, {
			props: { items: mockItems, collapsible: false, defaultOpen: 'item1' }
		});

		expect(getByText('Content 1')).toBeInTheDocument();

		await fireEvent.click(getByText('First Item'));

		// Should still be open
		expect(getByText('Content 1')).toBeInTheDocument();
	});

	it('allows multiple items open when multiple is true', async () => {
		const { getByText } = render(AtelierAccordion, {
			props: { items: mockItems, multiple: true }
		});

		await fireEvent.click(getByText('First Item'));
		await fireEvent.click(getByText('Second Item'));

		await waitFor(() => {
			expect(getByText('Content 1')).toBeInTheDocument();
			expect(getByText('Content 2')).toBeInTheDocument();
		});
	});

	it('closes other items when multiple is false', async () => {
		const { getByText, queryByText } = render(AtelierAccordion, {
			props: { items: mockItems, multiple: false }
		});

		await fireEvent.click(getByText('First Item'));
		expect(getByText('Content 1')).toBeInTheDocument();

		await fireEvent.click(getByText('Second Item'));

		await waitFor(() => {
			expect(queryByText('Content 1')).not.toBeInTheDocument();
			expect(getByText('Content 2')).toBeInTheDocument();
		});
	});

	it('respects disabled items', async () => {
		const onchange = vi.fn();
		const { getByText, queryByText } = render(AtelierAccordion, {
			props: { items: mockItems, onchange }
		});

		await fireEvent.click(getByText('Third Item'));

		expect(queryByText('Content 3')).not.toBeInTheDocument();
		expect(onchange).not.toHaveBeenCalled();
	});

	it('opens items specified in defaultOpen', () => {
		const { getByText } = render(AtelierAccordion, {
			props: { items: mockItems, defaultOpen: ['item1', 'item2'], multiple: true }
		});

		expect(getByText('Content 1')).toBeInTheDocument();
		expect(getByText('Content 2')).toBeInTheDocument();
	});

	it('calls onchange with open items', async () => {
		const onchange = vi.fn();
		const { getByText } = render(AtelierAccordion, {
			props: { items: mockItems, onchange }
		});

		await fireEvent.click(getByText('First Item'));

		expect(onchange).toHaveBeenCalledWith(['item1']);
	});

	it('handles keyboard navigation', async () => {
		const { getByText } = render(AtelierAccordion, {
			props: { items: mockItems }
		});

		const button = getByText('First Item').closest('button');
		if (button) {
			await fireEvent.keyDown(button, { key: 'Enter' });
			expect(getByText('Content 1')).toBeInTheDocument();

			await fireEvent.keyDown(button, { key: ' ' });
			await waitFor(() => {
				expect(getByText('Content 1')).not.toBeInTheDocument();
			});
		}
	});

	it('applies different variants', () => {
		const { container } = render(AtelierAccordion, {
			props: { items: mockItems, variant: 'separated' }
		});

		expect(container.querySelector('.atelier-accordion')).toHaveClass('space-y-4');
		expect(container.querySelector('.atelier-accordion-item')).toHaveClass('rounded-lg');
	});

	it('applies size variants', () => {
		const { container } = render(AtelierAccordion, {
			props: { items: mockItems, size: 'sm' }
		});

		const trigger = container.querySelector('.atelier-accordion-trigger');
		expect(trigger).toHaveClass('px-4', 'py-3', 'text-sm');
	});

	it('renders item icons when provided', () => {
		const itemsWithIcons = [
			{
				...mockItems[0],
				icon: () => ({ render: () => '<span>Icon</span>', $$slots: { default: true } })
			}
		];

		const { getByText } = render(AtelierAccordion, {
			props: { items: itemsWithIcons }
		});

		expect(getByText('Icon')).toBeInTheDocument();
	});

	it('applies correct aria attributes', () => {
		const { getByText } = render(AtelierAccordion, {
			props: { items: mockItems, defaultOpen: 'item1' }
		});

		const button = getByText('First Item').closest('button');
		expect(button).toHaveAttribute('aria-expanded', 'true');
		expect(button).toHaveAttribute('aria-controls', 'accordion-content-item1');
	});
});
