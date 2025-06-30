import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import AtelierTextarea from './AtelierTextarea.svelte';

describe('AtelierTextarea', () => {
	it('renders with default props', () => {
		render(AtelierTextarea);
		const textarea = screen.getByRole('textbox');
		expect(textarea).toBeInTheDocument();
		expect(textarea).toHaveAttribute('rows', '4');
	});

	it('renders with label', () => {
		render(AtelierTextarea, {
			props: {
				label: 'Comments',
				id: 'comments-textarea'
			}
		});

		const label = screen.getByText('Comments');
		expect(label).toBeInTheDocument();
		expect(label).toHaveAttribute('for', 'comments-textarea');
	});

	it('shows required asterisk', () => {
		render(AtelierTextarea, {
			props: {
				label: 'Description',
				required: true
			}
		});

		const asterisk = screen.getByText('*');
		expect(asterisk).toBeInTheDocument();
		expect(asterisk).toHaveClass('text-red-500');
	});

	it('binds value correctly', async () => {
		let value = 'initial text';
		const { component } = render(AtelierTextarea, {
			props: {
				value
			}
		});

		const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
		expect(textarea.value).toBe('initial text');

		// Update via prop
		await component.$set({ value: 'updated text' });
		expect(textarea.value).toBe('updated text');
	});

	it('handles user input', async () => {
		const user = userEvent.setup();
		let value = '';

		render(AtelierTextarea, {
			props: {
				value: $state(value),
				onInput: (e: Event) => {
					value = (e.target as HTMLTextAreaElement).value;
				}
			}
		});

		const textarea = screen.getByRole('textbox');
		await user.type(textarea, 'Hello World');

		expect(textarea).toHaveValue('Hello World');
	});

	it('shows character count', () => {
		render(AtelierTextarea, {
			props: {
				value: 'Hello',
				maxLength: 100,
				id: 'test-textarea'
			}
		});

		const charCount = screen.getByText('5/100');
		expect(charCount).toBeInTheDocument();

		const textarea = screen.getByRole('textbox');
		expect(textarea).toHaveAttribute('aria-describedby', 'test-textarea-char-count');
	});

	it('enforces maxLength', async () => {
		const user = userEvent.setup();
		let value = '';

		render(AtelierTextarea, {
			props: {
				value: $state(value),
				maxLength: 10,
				onInput: (e: Event) => {
					value = (e.target as HTMLTextAreaElement).value;
				}
			}
		});

		const textarea = screen.getByRole('textbox');
		await user.type(textarea, 'This is a very long text');

		expect(textarea).toHaveValue('This is a ');
		expect(screen.getByText('10/10')).toBeInTheDocument();
	});

	it('changes character count color based on percentage', () => {
		const { rerender } = render(AtelierTextarea, {
			props: {
				value: 'Short',
				maxLength: 100
			}
		});

		// Under 75%
		expect(screen.getByText('5/100')).toHaveClass('text-gray-500');

		// Over 75%
		rerender({ value: 'A'.repeat(80), maxLength: 100 });
		expect(screen.getByText('80/100')).toHaveClass('text-yellow-600');

		// Over 90%
		rerender({ value: 'A'.repeat(95), maxLength: 100 });
		expect(screen.getByText('95/100')).toHaveClass('text-orange-500');
	});

	it('shows error state', () => {
		render(AtelierTextarea, {
			props: {
				error: 'This field is required',
				id: 'test-textarea'
			}
		});

		const textarea = screen.getByRole('textbox');
		const errorMsg = screen.getByRole('alert');

		expect(textarea).toHaveAttribute('aria-invalid', 'true');
		expect(textarea).toHaveAttribute('aria-describedby', 'test-textarea-error');
		expect(errorMsg).toHaveTextContent('This field is required');
		expect(textarea).toHaveClass('border-red-500');
	});

	it('handles disabled state', () => {
		render(AtelierTextarea, {
			props: {
				disabled: true
			}
		});

		const textarea = screen.getByRole('textbox');
		expect(textarea).toBeDisabled();
		expect(textarea).toHaveClass('disabled:cursor-not-allowed');
	});

	it('floats label on focus', async () => {
		render(AtelierTextarea, {
			props: {
				label: 'Message'
			}
		});

		const textarea = screen.getByRole('textbox');
		const label = screen.getByText('Message');

		// Initially not floating
		expect(label).toHaveClass('top-3.5', 'text-base');

		// Focus textarea
		fireEvent.focus(textarea);

		// Label should float
		await waitFor(() => {
			expect(label).toHaveClass('-top-2.5', 'text-xs');
		});
	});

	it('keeps label floating when has value', () => {
		render(AtelierTextarea, {
			props: {
				label: 'Notes',
				value: 'Some notes here'
			}
		});

		const label = screen.getByText('Notes');
		expect(label).toHaveClass('-top-2.5', 'text-xs');
	});

	it('adjusts height automatically when autoResize is true', async () => {
		const user = userEvent.setup();

		render(AtelierTextarea, {
			props: {
				autoResize: true,
				rows: 2
			}
		});

		const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
		const initialHeight = textarea.style.height;

		// Type multiple lines
		await user.type(textarea, 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5');

		// Height should have increased
		expect(textarea.style.height).not.toBe(initialHeight);
	});

	it('does not adjust height when autoResize is false', async () => {
		const user = userEvent.setup();

		render(AtelierTextarea, {
			props: {
				autoResize: false,
				rows: 2
			}
		});

		const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
		const initialHeight = textarea.style.height;

		// Type multiple lines
		await user.type(textarea, 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5');

		// Height should remain the same
		expect(textarea.style.height).toBe(initialHeight);
	});

	it('dispatches focus and blur events', async () => {
		const handleFocus = vi.fn();
		const handleBlur = vi.fn();

		render(AtelierTextarea, {
			props: {
				onFocus: handleFocus,
				onBlur: handleBlur
			}
		});

		const textarea = screen.getByRole('textbox');

		fireEvent.focus(textarea);
		expect(handleFocus).toHaveBeenCalled();

		fireEvent.blur(textarea);
		expect(handleBlur).toHaveBeenCalled();
	});

	it('dispatches input and change events', async () => {
		const handleInput = vi.fn();
		const handleChange = vi.fn();

		render(AtelierTextarea, {
			props: {
				onInput: handleInput,
				onChange: handleChange
			}
		});

		const textarea = screen.getByRole('textbox');

		fireEvent.input(textarea, { target: { value: 'test' } });
		expect(handleInput).toHaveBeenCalled();

		fireEvent.change(textarea, { target: { value: 'test' } });
		expect(handleChange).toHaveBeenCalled();
	});

	it('applies custom class', () => {
		render(AtelierTextarea, {
			props: {
				class: 'custom-wrapper-class'
			}
		});

		const wrapper = screen.getByRole('textbox').parentElement;
		expect(wrapper).toHaveClass('custom-wrapper-class');
	});

	it('supports custom rows', () => {
		render(AtelierTextarea, {
			props: {
				rows: 10
			}
		});

		const textarea = screen.getByRole('textbox');
		expect(textarea).toHaveAttribute('rows', '10');
	});

	it('passes through additional props', () => {
		render(AtelierTextarea, {
			props: {
				spellcheck: false,
				'data-testid': 'custom-textarea',
				autocomplete: 'off'
			}
		});

		const textarea = screen.getByRole('textbox');
		expect(textarea).toHaveAttribute('spellcheck', 'false');
		expect(textarea).toHaveAttribute('data-testid', 'custom-textarea');
		expect(textarea).toHaveAttribute('autocomplete', 'off');
	});

	it('generates unique id if not provided', () => {
		render(AtelierTextarea, {
			props: { label: 'Test' }
		});

		const textarea = screen.getByRole('textbox');
		const id = textarea.getAttribute('id');

		expect(id).toBeTruthy();
		expect(id).toMatch(/^atelier-textarea-/);
	});
});
