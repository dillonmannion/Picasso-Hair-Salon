import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import AtelierInput from './AtelierInput.svelte';

describe('AtelierInput', () => {
	it('renders with default props', () => {
		render(AtelierInput);
		const input = screen.getByRole('textbox');
		expect(input).toBeInTheDocument();
		expect(input).toHaveAttribute('type', 'text');
	});

	it('renders with label', () => {
		render(AtelierInput, {
			props: {
				label: 'Email Address',
				id: 'email-input'
			}
		});

		const label = screen.getByText('Email Address');
		expect(label).toBeInTheDocument();
		expect(label).toHaveAttribute('for', 'email-input');
	});

	it('shows required asterisk when required', () => {
		render(AtelierInput, {
			props: {
				label: 'Name',
				required: true
			}
		});

		const asterisk = screen.getByText('*');
		expect(asterisk).toBeInTheDocument();
		expect(asterisk).toHaveClass('text-red-500');
	});

	it('binds value correctly', async () => {
		let value = 'initial';
		const { component } = render(AtelierInput, {
			props: {
				value
			}
		});

		const input = screen.getByRole('textbox') as HTMLInputElement;
		expect(input.value).toBe('initial');

		// Update via prop
		await component.$set({ value: 'updated' });
		expect(input.value).toBe('updated');
	});

	it('handles user input', async () => {
		const user = userEvent.setup();
		let value = '';

		render(AtelierInput, {
			props: {
				value: $state(value),
				onInput: (e: Event) => {
					value = (e.target as HTMLInputElement).value;
				}
			}
		});

		const input = screen.getByRole('textbox');
		await user.type(input, 'Hello World');

		expect(input).toHaveValue('Hello World');
	});

	it('supports different input types', () => {
		const { rerender } = render(AtelierInput, { props: { type: 'email' } });
		expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');

		rerender({ type: 'password' });
		expect(screen.getByRole('textbox')).toHaveAttribute('type', 'password');

		rerender({ type: 'number' });
		expect(screen.getByRole('spinbutton')).toHaveAttribute('type', 'number');
	});

	it('shows error state and message', () => {
		render(AtelierInput, {
			props: {
				error: 'Please enter a valid email',
				id: 'test-input'
			}
		});

		const input = screen.getByRole('textbox');
		const errorMsg = screen.getByRole('alert');

		expect(input).toHaveAttribute('aria-invalid', 'true');
		expect(input).toHaveAttribute('aria-describedby', 'test-input-error');
		expect(errorMsg).toHaveTextContent('Please enter a valid email');
		expect(input).toHaveClass('border-red-500');
	});

	it('shows success state', () => {
		render(AtelierInput, {
			props: {
				success: true
			}
		});

		const input = screen.getByRole('textbox');
		const successIcon = screen.getByRole('textbox').parentElement?.querySelector('svg');

		expect(input).toHaveClass('border-green-500');
		expect(successIcon).toBeInTheDocument();
	});

	it('handles disabled state', () => {
		render(AtelierInput, {
			props: {
				disabled: true
			}
		});

		const input = screen.getByRole('textbox');
		expect(input).toBeDisabled();
		expect(input).toHaveClass('disabled:cursor-not-allowed');
	});

	it('floats label on focus', async () => {
		render(AtelierInput, {
			props: {
				label: 'Username'
			}
		});

		const input = screen.getByRole('textbox');
		const label = screen.getByText('Username');

		// Initially not floating
		expect(label).toHaveClass('top-3.5', 'text-base');

		// Focus input
		fireEvent.focus(input);

		// Label should float
		await waitFor(() => {
			expect(label).toHaveClass('-top-2.5', 'text-xs');
		});
	});

	it('keeps label floating when has value', async () => {
		render(AtelierInput, {
			props: {
				label: 'Email',
				value: 'test@example.com'
			}
		});

		const label = screen.getByText('Email');
		expect(label).toHaveClass('-top-2.5', 'text-xs');
	});

	it('dispatches focus and blur events', async () => {
		const handleFocus = vi.fn();
		const handleBlur = vi.fn();

		render(AtelierInput, {
			props: {
				onFocus: handleFocus,
				onBlur: handleBlur
			}
		});

		const input = screen.getByRole('textbox');

		fireEvent.focus(input);
		expect(handleFocus).toHaveBeenCalled();

		fireEvent.blur(input);
		expect(handleBlur).toHaveBeenCalled();
	});

	it('dispatches input and change events', async () => {
		const handleInput = vi.fn();
		const handleChange = vi.fn();

		render(AtelierInput, {
			props: {
				onInput: handleInput,
				onChange: handleChange
			}
		});

		const input = screen.getByRole('textbox');

		fireEvent.input(input, { target: { value: 'test' } });
		expect(handleInput).toHaveBeenCalled();

		fireEvent.change(input, { target: { value: 'test' } });
		expect(handleChange).toHaveBeenCalled();
	});

	it('handles number type correctly', async () => {
		let value = 0;

		render(AtelierInput, {
			props: {
				type: 'number',
				value: $state(value),
				onInput: (e: Event) => {
					value = (e.target as HTMLInputElement).valueAsNumber || 0;
				}
			}
		});

		const input = screen.getByRole('spinbutton') as HTMLInputElement;
		fireEvent.input(input, { target: { value: '42', valueAsNumber: 42 } });

		expect(input.value).toBe('42');
	});

	it('applies custom class', () => {
		render(AtelierInput, {
			props: {
				class: 'custom-wrapper-class'
			}
		});

		const wrapper = screen.getByRole('textbox').parentElement;
		expect(wrapper).toHaveClass('custom-wrapper-class');
	});

	it('passes through additional props', () => {
		render(AtelierInput, {
			props: {
				maxLength: 50,
				'data-testid': 'custom-input',
				autocomplete: 'email'
			}
		});

		const input = screen.getByRole('textbox');
		expect(input).toHaveAttribute('maxLength', '50');
		expect(input).toHaveAttribute('data-testid', 'custom-input');
		expect(input).toHaveAttribute('autocomplete', 'email');
	});

	it('generates unique id if not provided', () => {
		const { container } = render(AtelierInput, {
			props: { label: 'Test' }
		});

		const input = screen.getByRole('textbox');
		const id = input.getAttribute('id');

		expect(id).toBeTruthy();
		expect(id).toMatch(/^atelier-input-/);
	});
});
