import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import AtelierBadge from './AtelierBadge.svelte';

describe('AtelierBadge', () => {
	it('renders with default props', () => {
		const { getByRole } = render(AtelierBadge, {
			props: {
				children: () => 'Badge'
			}
		});

		const badge = getByRole('status');
		expect(badge).toBeInTheDocument();
		expect(badge).toHaveTextContent('Badge');
		expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
	});

	it('renders different variants correctly', () => {
		const variants = ['default', 'success', 'warning', 'error', 'info'] as const;

		variants.forEach((variant) => {
			const { getByRole } = render(AtelierBadge, {
				props: {
					variant,
					children: () => variant
				}
			});

			const badge = getByRole('status');
			expect(badge).toBeInTheDocument();

			if (variant === 'default') {
				expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
			} else if (variant === 'success') {
				expect(badge).toHaveClass('bg-green-100', 'text-green-800');
			} else if (variant === 'warning') {
				expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
			} else if (variant === 'error') {
				expect(badge).toHaveClass('bg-red-100', 'text-red-800');
			} else if (variant === 'info') {
				expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
			}
		});
	});

	it('renders different sizes correctly', () => {
		const sizes = ['sm', 'md'] as const;

		sizes.forEach((size) => {
			const { getByRole } = render(AtelierBadge, {
				props: {
					size,
					children: () => size
				}
			});

			const badge = getByRole('status');

			if (size === 'sm') {
				expect(badge).toHaveClass('px-2', 'py-0.5', 'text-xs');
			} else if (size === 'md') {
				expect(badge).toHaveClass('px-2.5', 'py-1', 'text-sm');
			}
		});
	});

	it('renders different shapes correctly', () => {
		const shapes = ['pill', 'square'] as const;

		shapes.forEach((shape) => {
			const { getByRole } = render(AtelierBadge, {
				props: {
					shape,
					children: () => shape
				}
			});

			const badge = getByRole('status');

			if (shape === 'pill') {
				expect(badge).toHaveClass('rounded-full');
			} else if (shape === 'square') {
				expect(badge).toHaveClass('rounded-md');
			}
		});
	});

	it('shows close button when closable', () => {
		const { getByLabelText } = render(AtelierBadge, {
			props: {
				closable: true,
				children: () => 'Closable'
			}
		});

		expect(getByLabelText('Remove badge')).toBeInTheDocument();
	});

	it('hides close button when not closable', () => {
		const { queryByLabelText } = render(AtelierBadge, {
			props: {
				closable: false,
				children: () => 'Not closable'
			}
		});

		expect(queryByLabelText('Remove badge')).not.toBeInTheDocument();
	});

	it('calls onclose when close button is clicked', async () => {
		const handleClose = vi.fn();
		const { getByLabelText } = render(AtelierBadge, {
			props: {
				closable: true,
				onclose: handleClose,
				children: () => 'Click to close'
			}
		});

		await fireEvent.click(getByLabelText('Remove badge'));
		expect(handleClose).toHaveBeenCalledOnce();
	});

	it('applies correct close button size based on badge size', () => {
		const { getByLabelText, rerender } = render(AtelierBadge, {
			props: {
				closable: true,
				size: 'sm',
				children: () => 'Small'
			}
		});

		let closeButton = getByLabelText('Remove badge');
		expect(closeButton).toHaveClass('p-0.5');
		expect(closeButton.querySelector('svg')).toHaveClass('w-2.5', 'h-2.5');

		rerender({
			closable: true,
			size: 'md',
			children: () => 'Medium'
		});

		closeButton = getByLabelText('Remove badge');
		expect(closeButton).toHaveClass('p-1');
		expect(closeButton.querySelector('svg')).toHaveClass('w-3', 'h-3');
	});

	it('applies custom className', () => {
		const { getByRole } = render(AtelierBadge, {
			props: {
				class: 'custom-badge-class',
				children: () => 'Custom'
			}
		});

		const badge = getByRole('status');
		expect(badge).toHaveClass('custom-badge-class');
	});

	it('renders complex content', () => {
		const { getByRole, getByText } = render(AtelierBadge, {
			props: {
				children: () => ({
					render: () => '<span>Count: </span><strong>42</strong>'
				})
			}
		});

		const badge = getByRole('status');
		expect(badge).toBeInTheDocument();
		expect(getByText('Count:')).toBeInTheDocument();
		expect(getByText('42')).toBeInTheDocument();
	});

	it('has proper focus styles on close button', () => {
		const { getByLabelText } = render(AtelierBadge, {
			props: {
				closable: true,
				variant: 'success',
				children: () => 'Focusable'
			}
		});

		const closeButton = getByLabelText('Remove badge');
		expect(closeButton).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-green-500');
	});

	it('combines multiple props correctly', () => {
		const { getByRole, getByLabelText } = render(AtelierBadge, {
			props: {
				variant: 'error',
				size: 'sm',
				shape: 'square',
				closable: true,
				class: 'custom',
				children: () => 'Combined'
			}
		});

		const badge = getByRole('status');
		expect(badge).toHaveClass(
			'bg-red-100',
			'text-red-800',
			'px-2',
			'py-0.5',
			'text-xs',
			'rounded-md',
			'custom'
		);
		expect(getByLabelText('Remove badge')).toBeInTheDocument();
	});
});
