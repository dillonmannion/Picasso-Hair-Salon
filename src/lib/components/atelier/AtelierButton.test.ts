import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import AtelierButton from './AtelierButton.svelte';

describe('AtelierButton', () => {
	it('renders with default props', () => {
		const { getByRole } = render(AtelierButton, {
			props: {
				children: () => 'Click me'
			}
		});

		const button = getByRole('button');
		expect(button).toBeInTheDocument();
		expect(button).toHaveTextContent('Click me');
		expect(button).toHaveClass('bg-atelier-primary');
	});

	it('renders different variants correctly', () => {
		const variants = ['primary', 'secondary', 'outline', 'ghost', 'destructive'] as const;

		variants.forEach((variant) => {
			const { getByRole } = render(AtelierButton, {
				props: {
					variant,
					children: () => variant
				}
			});

			const button = getByRole('button');
			expect(button).toBeInTheDocument();

			if (variant === 'primary') {
				expect(button).toHaveClass('bg-atelier-primary');
			} else if (variant === 'secondary') {
				expect(button).toHaveClass('bg-atelier-secondary');
			} else if (variant === 'outline') {
				expect(button).toHaveClass('border-2', 'border-atelier-primary');
			} else if (variant === 'ghost') {
				expect(button).toHaveClass('hover:bg-atelier-primary/10');
			} else if (variant === 'destructive') {
				expect(button).toHaveClass('bg-red-600');
			}
		});
	});

	it('renders different sizes correctly', () => {
		const sizes = ['sm', 'md', 'lg'] as const;

		sizes.forEach((size) => {
			const { getByRole } = render(AtelierButton, {
				props: {
					size,
					children: () => size
				}
			});

			const button = getByRole('button');

			if (size === 'sm') {
				expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm');
			} else if (size === 'md') {
				expect(button).toHaveClass('px-4', 'py-2', 'text-base');
			} else if (size === 'lg') {
				expect(button).toHaveClass('px-6', 'py-3', 'text-lg');
			}
		});
	});

	it('shows loading state correctly', () => {
		const { getByRole } = render(AtelierButton, {
			props: {
				loading: true,
				children: () => 'Loading'
			}
		});

		const button = getByRole('button');
		expect(button).toHaveAttribute('aria-busy', 'true');
		expect(button).toBeDisabled();
		expect(button).toHaveClass('cursor-wait');

		const spinner = button.querySelector('svg');
		expect(spinner).toBeInTheDocument();
		expect(spinner).toHaveClass('animate-spin');
	});

	it('handles disabled state correctly', () => {
		const { getByRole } = render(AtelierButton, {
			props: {
				disabled: true,
				children: () => 'Disabled'
			}
		});

		const button = getByRole('button');
		expect(button).toBeDisabled();
		expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
	});

	it('handles click events', async () => {
		let clicked = false;
		const { getByRole } = render(AtelierButton, {
			props: {
				onclick: () => {
					clicked = true;
				},
				children: () => 'Click me'
			}
		});

		const button = getByRole('button');
		await fireEvent.click(button);
		expect(clicked).toBe(true);
	});

	it('does not trigger click when disabled', async () => {
		let clicked = false;
		const { getByRole } = render(AtelierButton, {
			props: {
				disabled: true,
				onclick: () => {
					clicked = true;
				},
				children: () => 'Disabled'
			}
		});

		const button = getByRole('button');
		await fireEvent.click(button);
		expect(clicked).toBe(false);
	});

	it('applies custom className', () => {
		const { getByRole } = render(AtelierButton, {
			props: {
				class: 'custom-class',
				children: () => 'Custom'
			}
		});

		const button = getByRole('button');
		expect(button).toHaveClass('custom-class');
	});

	it('passes through additional HTML attributes', () => {
		const { getByRole } = render(AtelierButton, {
			props: {
				'data-testid': 'test-button',
				'aria-label': 'Test button',
				type: 'submit',
				children: () => 'Submit'
			}
		});

		const button = getByRole('button');
		expect(button).toHaveAttribute('data-testid', 'test-button');
		expect(button).toHaveAttribute('aria-label', 'Test button');
		expect(button).toHaveAttribute('type', 'submit');
	});

	it('has proper focus styles', () => {
		const { getByRole } = render(AtelierButton, {
			props: {
				children: () => 'Focus me'
			}
		});

		const button = getByRole('button');
		expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2');
	});
});
