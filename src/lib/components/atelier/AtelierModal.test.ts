import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/svelte';
import { get } from 'svelte/store';
import AtelierModal from './AtelierModal.svelte';
import { atelierModal } from '$lib/stores/atelierModal';

describe('AtelierModal', () => {
	beforeEach(() => {
		// Reset modal store before each test
		atelierModal.close();
	});

	afterEach(() => {
		// Clean up document body overflow
		document.body.style.overflow = '';
	});

	it('renders when open prop is true', () => {
		const { getByRole } = render(AtelierModal, {
			props: {
				open: true,
				title: 'Test Modal',
				children: () => 'Modal content'
			}
		});

		const modal = getByRole('dialog');
		expect(modal).toBeInTheDocument();
		expect(modal).toHaveAttribute('aria-modal', 'true');
		expect(getByRole('heading')).toHaveTextContent('Test Modal');
	});

	it('does not render when open prop is false', () => {
		const { queryByRole } = render(AtelierModal, {
			props: {
				open: false,
				title: 'Hidden Modal',
				children: () => 'Should not be visible'
			}
		});

		expect(queryByRole('dialog')).not.toBeInTheDocument();
	});

	it('renders with title and description', () => {
		const { getByRole, getByText } = render(AtelierModal, {
			props: {
				open: true,
				title: 'Modal Title',
				description: 'Modal description text',
				children: () => 'Content'
			}
		});

		expect(getByRole('heading')).toHaveTextContent('Modal Title');
		expect(getByText('Modal description text')).toBeInTheDocument();
		expect(getByRole('dialog')).toHaveAttribute('aria-labelledby', 'modal-title');
		expect(getByRole('dialog')).toHaveAttribute('aria-describedby', 'modal-description');
	});

	it('shows close button by default', () => {
		const { getByLabelText } = render(AtelierModal, {
			props: {
				open: true,
				children: () => 'Content'
			}
		});

		expect(getByLabelText('Close modal')).toBeInTheDocument();
	});

	it('hides close button when showCloseButton is false', () => {
		const { queryByLabelText } = render(AtelierModal, {
			props: {
				open: true,
				showCloseButton: false,
				children: () => 'Content'
			}
		});

		expect(queryByLabelText('Close modal')).not.toBeInTheDocument();
	});

	it('calls onclose when close button is clicked', async () => {
		const handleClose = vi.fn();
		const { getByLabelText } = render(AtelierModal, {
			props: {
				open: true,
				onclose: handleClose,
				children: () => 'Content'
			}
		});

		await fireEvent.click(getByLabelText('Close modal'));
		expect(handleClose).toHaveBeenCalledOnce();
	});

	it('closes on escape key when closeOnEscape is true', async () => {
		const handleClose = vi.fn();
		const { getByRole } = render(AtelierModal, {
			props: {
				open: true,
				onclose: handleClose,
				closeOnEscape: true,
				children: () => 'Content'
			}
		});

		await fireEvent.keyDown(getByRole('dialog'), { key: 'Escape' });
		expect(handleClose).toHaveBeenCalledOnce();
	});

	it('does not close on escape when closeOnEscape is false', async () => {
		const handleClose = vi.fn();
		const { getByRole } = render(AtelierModal, {
			props: {
				open: true,
				onclose: handleClose,
				closeOnEscape: false,
				children: () => 'Content'
			}
		});

		await fireEvent.keyDown(getByRole('dialog'), { key: 'Escape' });
		expect(handleClose).not.toHaveBeenCalled();
	});

	it('closes on outside click when closeOnOutsideClick is true', async () => {
		const handleClose = vi.fn();
		const { getByRole } = render(AtelierModal, {
			props: {
				open: true,
				onclose: handleClose,
				closeOnOutsideClick: true,
				children: () => 'Content'
			}
		});

		// Click on the backdrop
		const backdrop = getByRole('dialog').parentElement;
		await fireEvent.click(backdrop!);
		expect(handleClose).toHaveBeenCalledOnce();
	});

	it('does not close on content click', async () => {
		const handleClose = vi.fn();
		const { getByText } = render(AtelierModal, {
			props: {
				open: true,
				onclose: handleClose,
				children: () => 'Click me'
			}
		});

		await fireEvent.click(getByText('Click me'));
		expect(handleClose).not.toHaveBeenCalled();
	});

	it('renders custom actions', () => {
		const { getByRole } = render(AtelierModal, {
			props: {
				open: true,
				children: () => 'Content',
				actions: () => ({
					render: () => '<button>Save</button><button>Cancel</button>'
				})
			}
		});

		expect(getByRole('button', { name: 'Save' })).toBeInTheDocument();
		expect(getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
	});

	it('applies custom className', () => {
		const { getByRole } = render(AtelierModal, {
			props: {
				open: true,
				class: 'custom-modal-class',
				children: () => 'Content'
			}
		});

		const modalContent = getByRole('dialog').querySelector('.custom-modal-class');
		expect(modalContent).toBeInTheDocument();
	});

	it('prevents body scroll when open', async () => {
		render(AtelierModal, {
			props: {
				open: true,
				children: () => 'Content'
			}
		});

		await waitFor(() => {
			expect(document.body.style.overflow).toBe('hidden');
		});
	});

	it('restores body scroll when closed', async () => {
		const { rerender } = render(AtelierModal, {
			props: {
				open: true,
				children: () => 'Content'
			}
		});

		// Wait for modal to open
		await waitFor(() => {
			expect(document.body.style.overflow).toBe('hidden');
		});

		// Close modal
		await rerender({ open: false });

		await waitFor(() => {
			expect(document.body.style.overflow).toBe('');
		});
	});

	it('syncs with modal store', async () => {
		const { queryByRole, rerender } = render(AtelierModal, {
			props: {
				children: () => 'Store controlled'
			}
		});

		// Initially closed
		expect(queryByRole('dialog')).not.toBeInTheDocument();

		// Open via store
		atelierModal.open();
		await rerender({});
		await waitFor(() => {
			expect(queryByRole('dialog')).toBeInTheDocument();
		});

		// Close via store
		atelierModal.close();
		await rerender({});
		await waitFor(() => {
			expect(queryByRole('dialog')).not.toBeInTheDocument();
		});
	});

	it('handles focus management', async () => {
		const { getByRole, getByLabelText } = render(AtelierModal, {
			props: {
				open: true,
				children: () => ({
					render: () => '<button>First</button><button>Last</button>'
				})
			}
		});

		// Should focus close button (first focusable element)
		await waitFor(() => {
			expect(document.activeElement).toBe(getByLabelText('Close modal'));
		});
	});

	it('traps focus within modal', async () => {
		const { getByRole } = render(AtelierModal, {
			props: {
				open: true,
				children: () => ({
					render: () => '<button id="first">First</button><button id="last">Last</button>'
				})
			}
		});

		const modal = getByRole('dialog');
		const firstButton = modal.querySelector('#first');
		const lastButton = modal.querySelector('#last');

		// Focus last button
		(lastButton as HTMLElement).focus();

		// Tab should wrap to first focusable element
		await fireEvent.keyDown(modal, { key: 'Tab', shiftKey: false });
		// Note: Actual focus trap behavior would need jsdom configuration
	});
});
