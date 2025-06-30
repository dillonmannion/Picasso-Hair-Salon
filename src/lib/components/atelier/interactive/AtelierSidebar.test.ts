import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/svelte';
import AtelierSidebar from './AtelierSidebar.svelte';

describe('AtelierSidebar', () => {
	it('renders trigger button by default', () => {
		const { getByLabelText } = render(AtelierSidebar);
		expect(getByLabelText('Open sidebar')).toBeInTheDocument();
	});

	it('opens sidebar when trigger is clicked', async () => {
		const { getByLabelText, getByRole } = render(AtelierSidebar, {
			props: { title: 'Test Sidebar' }
		});

		const trigger = getByLabelText('Open sidebar');
		await fireEvent.click(trigger);

		await waitFor(() => {
			expect(getByRole('dialog')).toBeInTheDocument();
			expect(getByRole('dialog')).toHaveAttribute('aria-label', 'Test Sidebar');
		});
	});

	it('closes sidebar when close button is clicked', async () => {
		const onclose = vi.fn();
		const { getByLabelText, queryByRole } = render(AtelierSidebar, {
			props: { open: true, onclose }
		});

		const closeButton = getByLabelText('Close sidebar');
		await fireEvent.click(closeButton);

		await waitFor(() => {
			expect(onclose).toHaveBeenCalled();
			expect(queryByRole('dialog')).not.toBeInTheDocument();
		});
	});

	it('closes sidebar on Escape key when closeOnEscape is true', async () => {
		const onclose = vi.fn();
		const { container } = render(AtelierSidebar, {
			props: { open: true, onclose, closeOnEscape: true }
		});

		await fireEvent.keyDown(window, { key: 'Escape' });

		await waitFor(() => {
			expect(onclose).toHaveBeenCalled();
		});
	});

	it('does not close on Escape when closeOnEscape is false', async () => {
		const onclose = vi.fn();
		render(AtelierSidebar, {
			props: { open: true, onclose, closeOnEscape: false }
		});

		await fireEvent.keyDown(window, { key: 'Escape' });

		await waitFor(() => {
			expect(onclose).not.toHaveBeenCalled();
		});
	});

	it('closes sidebar on backdrop click when closeOnOutsideClick is true', async () => {
		const onclose = vi.fn();
		const { container } = render(AtelierSidebar, {
			props: { open: true, onclose, closeOnOutsideClick: true }
		});

		const backdrop = container.querySelector('.atelier-sidebar-backdrop');
		if (backdrop) {
			await fireEvent.click(backdrop);
		}

		await waitFor(() => {
			expect(onclose).toHaveBeenCalled();
		});
	});

	it('renders from left by default', () => {
		const { container } = render(AtelierSidebar, { props: { open: true } });
		const sidebar = container.querySelector('.atelier-sidebar');
		expect(sidebar).toHaveClass('left-0');
	});

	it('renders from right when position is right', () => {
		const { container } = render(AtelierSidebar, {
			props: { open: true, position: 'right' }
		});
		const sidebar = container.querySelector('.atelier-sidebar');
		expect(sidebar).toHaveClass('right-0');
	});

	it('applies custom width', () => {
		const { container } = render(AtelierSidebar, {
			props: { open: true, width: '30rem' }
		});
		const sidebar = container.querySelector('.atelier-sidebar');
		expect(sidebar).toHaveStyle({ width: '30rem' });
	});

	it('renders custom trigger when provided', () => {
		const { getByText } = render(AtelierSidebar, {
			props: {
				trigger: ({ onclick }: { onclick: () => void }) => ({
					render: () => `<button onclick={onclick}>Custom Trigger</button>`,
					$$slots: { default: true }
				})
			}
		});
		expect(getByText('Custom Trigger')).toBeInTheDocument();
	});

	it('locks body scroll when variant is overlay', async () => {
		render(AtelierSidebar, {
			props: { open: true, variant: 'overlay' }
		});

		await waitFor(() => {
			expect(document.body.style.overflow).toBe('hidden');
		});
	});
});
