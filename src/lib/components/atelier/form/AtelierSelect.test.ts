import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import AtelierSelect from './AtelierSelect.svelte';

const mockOptions = [
	{ value: 'option1', label: 'Option 1' },
	{ value: 'option2', label: 'Option 2' },
	{ value: 'option3', label: 'Option 3', disabled: true },
	{ value: 'option4', label: 'Option 4' }
];

describe('AtelierSelect', () => {
	it('renders with default props', () => {
		render(AtelierSelect, {
			props: {
				options: mockOptions
			}
		});

		const select = screen.getByRole('combobox');
		expect(select).toBeInTheDocument();
		expect(select).toHaveTextContent('Select an option');
	});

	it('renders with label', () => {
		render(AtelierSelect, {
			props: {
				options: mockOptions,
				label: 'Choose an option',
				required: true
			}
		});

		const label = screen.getByText('Choose an option');
		expect(label).toBeInTheDocument();
		expect(screen.getByText('*')).toHaveClass('text-red-500');
	});

	it('displays selected value', () => {
		render(AtelierSelect, {
			props: {
				options: mockOptions,
				value: 'option2'
			}
		});

		const select = screen.getByRole('combobox');
		expect(select).toHaveTextContent('Option 2');
	});

	it('opens dropdown on click', async () => {
		render(AtelierSelect, {
			props: {
				options: mockOptions
			}
		});

		const select = screen.getByRole('combobox');
		expect(select).toHaveAttribute('aria-expanded', 'false');

		fireEvent.click(select);

		expect(select).toHaveAttribute('aria-expanded', 'true');
		expect(screen.getByRole('listbox')).toBeInTheDocument();
	});

	it('selects option on click', async () => {
		let value = '';
		const handleChange = vi.fn();

		render(AtelierSelect, {
			props: {
				options: mockOptions,
				value: $state(value),
				onChange: handleChange
			}
		});

		const select = screen.getByRole('combobox');
		fireEvent.click(select);

		const option2 = screen.getByText('Option 2');
		fireEvent.click(option2);

		expect(handleChange).toHaveBeenCalledWith(
			expect.objectContaining({
				detail: { value: 'option2' }
			})
		);
		expect(select).toHaveAttribute('aria-expanded', 'false');
	});

	it('handles disabled options', async () => {
		const handleChange = vi.fn();

		render(AtelierSelect, {
			props: {
				options: mockOptions,
				onChange: handleChange
			}
		});

		const select = screen.getByRole('combobox');
		fireEvent.click(select);

		const disabledOption = screen.getByText('Option 3');
		fireEvent.click(disabledOption);

		expect(handleChange).not.toHaveBeenCalled();
	});

	it('supports multiple selection', async () => {
		let value: string[] = [];
		const handleChange = vi.fn();

		render(AtelierSelect, {
			props: {
				options: mockOptions,
				value: $state(value),
				multiple: true,
				onChange: handleChange
			}
		});

		const select = screen.getByRole('combobox');
		fireEvent.click(select);

		// Select first option
		fireEvent.click(screen.getByText('Option 1'));
		expect(handleChange).toHaveBeenCalledWith(
			expect.objectContaining({
				detail: { value: ['option1'] }
			})
		);

		// Select second option
		fireEvent.click(screen.getByText('Option 2'));
		expect(handleChange).toHaveBeenLastCalledWith(
			expect.objectContaining({
				detail: { value: ['option1', 'option2'] }
			})
		);
	});

	it('displays multiple selection count', () => {
		render(AtelierSelect, {
			props: {
				options: mockOptions,
				value: ['option1', 'option2'],
				multiple: true
			}
		});

		const select = screen.getByRole('combobox');
		expect(select).toHaveTextContent('2 selected');
	});

	it('clears selection', async () => {
		let value = 'option1';
		const handleChange = vi.fn();

		render(AtelierSelect, {
			props: {
				options: mockOptions,
				value: $state(value),
				onChange: handleChange
			}
		});

		const clearButton = screen.getByLabelText('Clear selection');
		fireEvent.click(clearButton);

		expect(handleChange).toHaveBeenCalledWith(
			expect.objectContaining({
				detail: { value: undefined }
			})
		);
	});

	it('supports searchable mode', async () => {
		render(AtelierSelect, {
			props: {
				options: mockOptions,
				searchable: true
			}
		});

		const select = screen.getByRole('combobox');
		fireEvent.click(select);

		const searchInput = screen.getByPlaceholderText('Search...');
		expect(searchInput).toBeInTheDocument();

		fireEvent.input(searchInput, { target: { value: '2' } });

		// Only Option 2 should be visible
		expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
		expect(screen.getByText('Option 2')).toBeInTheDocument();
	});

	it('shows no options message when filtered empty', async () => {
		render(AtelierSelect, {
			props: {
				options: mockOptions,
				searchable: true
			}
		});

		const select = screen.getByRole('combobox');
		fireEvent.click(select);

		const searchInput = screen.getByPlaceholderText('Search...');
		fireEvent.input(searchInput, { target: { value: 'xyz' } });

		expect(screen.getByText('No options found')).toBeInTheDocument();
	});

	it('handles keyboard navigation', async () => {
		render(AtelierSelect, {
			props: {
				options: mockOptions
			}
		});

		const select = screen.getByRole('combobox');
		select.focus();

		// Open with Enter
		fireEvent.keyDown(select, { key: 'Enter' });
		expect(select).toHaveAttribute('aria-expanded', 'true');

		// Navigate down
		fireEvent.keyDown(select, { key: 'ArrowDown' });
		fireEvent.keyDown(select, { key: 'ArrowDown' });

		// Select with Enter
		fireEvent.keyDown(select, { key: 'Enter' });
		expect(select).toHaveTextContent('Option 2');

		// Close with Escape
		fireEvent.click(select); // Open again
		fireEvent.keyDown(select, { key: 'Escape' });
		expect(select).toHaveAttribute('aria-expanded', 'false');
	});

	it('shows error state', () => {
		render(AtelierSelect, {
			props: {
				options: mockOptions,
				error: 'Please select an option',
				id: 'test-select'
			}
		});

		const select = screen.getByRole('combobox');
		const errorMsg = screen.getByRole('alert');

		expect(select).toHaveAttribute('aria-invalid', 'true');
		expect(select).toHaveAttribute('aria-describedby', 'test-select-error');
		expect(errorMsg).toHaveTextContent('Please select an option');
		expect(select).toHaveClass('border-red-500');
	});

	it('handles disabled state', () => {
		render(AtelierSelect, {
			props: {
				options: mockOptions,
				disabled: true
			}
		});

		const select = screen.getByRole('combobox');
		expect(select).toHaveAttribute('tabindex', '-1');
		expect(select).toHaveClass('opacity-60', 'cursor-not-allowed');

		// Should not open when clicked
		fireEvent.click(select);
		expect(select).toHaveAttribute('aria-expanded', 'false');
	});

	it('closes on outside click', async () => {
		const { container } = render(AtelierSelect, {
			props: {
				options: mockOptions
			}
		});

		const select = screen.getByRole('combobox');
		fireEvent.click(select);
		expect(select).toHaveAttribute('aria-expanded', 'true');

		// Click outside
		fireEvent.click(container);
		await waitFor(() => {
			expect(select).toHaveAttribute('aria-expanded', 'false');
		});
	});

	it('highlights options on hover', async () => {
		render(AtelierSelect, {
			props: {
				options: mockOptions
			}
		});

		const select = screen.getByRole('combobox');
		fireEvent.click(select);

		const option2 = screen.getByText('Option 2');
		fireEvent.mouseEnter(option2);

		expect(option2.parentElement).toHaveClass('bg-gray-100');
	});

	it('shows check mark for selected options', () => {
		render(AtelierSelect, {
			props: {
				options: mockOptions,
				value: 'option1'
			}
		});

		const select = screen.getByRole('combobox');
		fireEvent.click(select);

		const selectedOption = screen.getByText('Option 1').parentElement;
		expect(selectedOption?.querySelector('svg')).toBeInTheDocument();
	});
});
