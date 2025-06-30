import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import AtelierTabs from './AtelierTabs.svelte';

describe('AtelierTabs', () => {
	const mockTabs = [
		{
			id: 'tab1',
			label: 'Tab 1',
			content: () => ({ render: () => '<div>Content 1</div>', $$slots: { default: true } })
		},
		{
			id: 'tab2',
			label: 'Tab 2',
			content: () => ({ render: () => '<div>Content 2</div>', $$slots: { default: true } })
		},
		{
			id: 'tab3',
			label: 'Tab 3',
			disabled: true,
			content: () => ({ render: () => '<div>Content 3</div>', $$slots: { default: true } })
		}
	];

	it('renders all tabs', () => {
		const { getByText } = render(AtelierTabs, {
			props: { tabs: mockTabs }
		});

		expect(getByText('Tab 1')).toBeInTheDocument();
		expect(getByText('Tab 2')).toBeInTheDocument();
		expect(getByText('Tab 3')).toBeInTheDocument();
	});

	it('shows first tab content by default', () => {
		const { getByText } = render(AtelierTabs, {
			props: { tabs: mockTabs }
		});

		expect(getByText('Content 1')).toBeInTheDocument();
	});

	it('switches tabs on click', async () => {
		const { getByText, queryByText } = render(AtelierTabs, {
			props: { tabs: mockTabs }
		});

		await fireEvent.click(getByText('Tab 2'));

		expect(queryByText('Content 1')).not.toBeInTheDocument();
		expect(getByText('Content 2')).toBeInTheDocument();
	});

	it('respects disabled tabs', async () => {
		const ontabchange = vi.fn();
		const { getByText, queryByText } = render(AtelierTabs, {
			props: { tabs: mockTabs, ontabchange }
		});

		await fireEvent.click(getByText('Tab 3'));

		// Should not switch to disabled tab
		expect(queryByText('Content 3')).not.toBeInTheDocument();
		expect(ontabchange).not.toHaveBeenCalled();
	});

	it('calls ontabchange when tab is selected', async () => {
		const ontabchange = vi.fn();
		const { getByText } = render(AtelierTabs, {
			props: { tabs: mockTabs, ontabchange }
		});

		await fireEvent.click(getByText('Tab 2'));

		expect(ontabchange).toHaveBeenCalledWith('tab2');
	});

	it('supports keyboard navigation with arrow keys', async () => {
		const { getByRole, getByText } = render(AtelierTabs, {
			props: { tabs: mockTabs }
		});

		const tablist = getByRole('tablist');

		// Press right arrow
		await fireEvent.keyDown(tablist, { key: 'ArrowRight' });
		expect(getByText('Content 2')).toBeInTheDocument();

		// Press left arrow
		await fireEvent.keyDown(tablist, { key: 'ArrowLeft' });
		expect(getByText('Content 1')).toBeInTheDocument();
	});

	it('skips disabled tabs during keyboard navigation', async () => {
		const { getByRole, getByText, queryByText } = render(AtelierTabs, {
			props: { tabs: mockTabs, activeTab: 'tab2' }
		});

		const tablist = getByRole('tablist');

		// Press right arrow from tab2 - should skip disabled tab3 and wrap to tab1
		await fireEvent.keyDown(tablist, { key: 'ArrowRight' });
		expect(getByText('Content 1')).toBeInTheDocument();
		expect(queryByText('Content 3')).not.toBeInTheDocument();
	});

	it('supports vertical orientation', async () => {
		const { getByRole, getByText } = render(AtelierTabs, {
			props: { tabs: mockTabs, orientation: 'vertical' }
		});

		const tablist = getByRole('tablist');
		expect(tablist).toHaveAttribute('aria-orientation', 'vertical');

		// Vertical orientation uses up/down arrows
		await fireEvent.keyDown(tablist, { key: 'ArrowDown' });
		expect(getByText('Content 2')).toBeInTheDocument();
	});

	it('applies different variants', () => {
		const { container, rerender } = render(AtelierTabs, {
			props: { tabs: mockTabs, variant: 'pills' }
		});

		let tabList = container.querySelector('.atelier-tabs-list');
		expect(tabList).toHaveClass('gap-2', 'p-1');

		rerender({ tabs: mockTabs, variant: 'underline' });
		tabList = container.querySelector('.atelier-tabs-list');
		expect(tabList).toHaveClass('gap-4');
	});

	it('applies size variants', () => {
		const { container } = render(AtelierTabs, {
			props: { tabs: mockTabs, size: 'sm' }
		});

		const firstTab = container.querySelector('.atelier-tab');
		expect(firstTab).toHaveClass('px-3', 'py-1.5', 'text-sm');
	});

	it('renders tab icons when provided', () => {
		const tabsWithIcons = [
			{
				...mockTabs[0],
				icon: () => ({ render: () => '<span>Icon</span>', $$slots: { default: true } })
			}
		];

		const { getByText } = render(AtelierTabs, {
			props: { tabs: tabsWithIcons }
		});

		expect(getByText('Icon')).toBeInTheDocument();
	});

	it('uses activeTab prop when provided', () => {
		const { getByText } = render(AtelierTabs, {
			props: { tabs: mockTabs, activeTab: 'tab2' }
		});

		expect(getByText('Content 2')).toBeInTheDocument();
	});
});
