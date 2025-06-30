import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import AtelierDataTable from './AtelierDataTable.svelte';

describe('AtelierDataTable', () => {
	const mockData = [
		{ id: 1, name: 'John Doe', email: 'john@example.com', age: 30 },
		{ id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 25 },
		{ id: 3, name: 'Bob Johnson', email: 'bob@example.com', age: 35 }
	];

	const mockColumns = [
		{ key: 'name', header: 'Name' },
		{ key: 'email', header: 'Email' },
		{ key: 'age', header: 'Age', align: 'right' as const }
	];

	it('renders table with data', () => {
		const { getByText } = render(AtelierDataTable, {
			props: { data: mockData, columns: mockColumns }
		});

		expect(getByText('John Doe')).toBeInTheDocument();
		expect(getByText('jane@example.com')).toBeInTheDocument();
		expect(getByText('35')).toBeInTheDocument();
	});

	it('renders column headers', () => {
		const { getByText } = render(AtelierDataTable, {
			props: { data: mockData, columns: mockColumns }
		});

		expect(getByText('Name')).toBeInTheDocument();
		expect(getByText('Email')).toBeInTheDocument();
		expect(getByText('Age')).toBeInTheDocument();
	});

	it('displays empty message when no data', () => {
		const { getByText } = render(AtelierDataTable, {
			props: { data: [], columns: mockColumns, emptyMessage: 'No records found' }
		});

		expect(getByText('No records found')).toBeInTheDocument();
	});

	it('sorts data when column header is clicked', async () => {
		const { getByLabelText, getAllByRole } = render(AtelierDataTable, {
			props: { data: mockData, columns: mockColumns, sortable: true }
		});

		const nameSort = getByLabelText('Sort by Name');
		await fireEvent.click(nameSort);

		const rows = getAllByRole('row');
		// First row is header, so data starts at index 1
		expect(rows[1]).toHaveTextContent('Bob Johnson');
		expect(rows[2]).toHaveTextContent('Jane Smith');
		expect(rows[3]).toHaveTextContent('John Doe');
	});

	it('reverses sort direction on second click', async () => {
		const { getByLabelText, getAllByRole } = render(AtelierDataTable, {
			props: { data: mockData, columns: mockColumns, sortable: true }
		});

		const ageSort = getByLabelText('Sort by Age');

		// First click - ascending
		await fireEvent.click(ageSort);
		let rows = getAllByRole('row');
		expect(rows[1]).toHaveTextContent('25');

		// Second click - descending
		await fireEvent.click(ageSort);
		rows = getAllByRole('row');
		expect(rows[1]).toHaveTextContent('35');
	});

	it('handles row click when onrowclick is provided', async () => {
		const onrowclick = vi.fn();
		const { getAllByRole } = render(AtelierDataTable, {
			props: { data: mockData, columns: mockColumns, onrowclick }
		});

		const rows = getAllByRole('row');
		await fireEvent.click(rows[1]); // Click first data row

		expect(onrowclick).toHaveBeenCalledWith(mockData[0], 0);
	});

	it('handles keyboard navigation for clickable rows', async () => {
		const onrowclick = vi.fn();
		const { getAllByRole } = render(AtelierDataTable, {
			props: { data: mockData, columns: mockColumns, onrowclick }
		});

		const rows = getAllByRole('button'); // Clickable rows have button role
		await fireEvent.keyDown(rows[0], { key: 'Enter' });

		expect(onrowclick).toHaveBeenCalledWith(mockData[0], 0);
	});

	it('applies custom cell renderer', () => {
		const customColumns = [
			{
				key: 'name',
				header: 'Name',
				cell: (value: string) => ({
					render: () => `<strong>Name: ${value}</strong>`,
					$$slots: { default: true }
				})
			}
		];

		const { container } = render(AtelierDataTable, {
			props: { data: mockData, columns: customColumns }
		});

		expect(container.querySelector('strong')).toHaveTextContent('Name: John Doe');
	});

	it('applies striped styling when enabled', () => {
		const { container } = render(AtelierDataTable, {
			props: { data: mockData, columns: mockColumns, striped: true }
		});

		const rows = container.querySelectorAll('tbody tr');
		expect(rows[1]).toHaveClass('bg-atelier-gold/5');
	});

	it('applies compact styling when enabled', () => {
		const { container } = render(AtelierDataTable, {
			props: { data: mockData, columns: mockColumns, compact: true }
		});

		const cells = container.querySelectorAll('td');
		expect(cells[0]).toHaveClass('px-4', 'py-2', 'text-sm');
	});

	it('uses custom getrowkey function', () => {
		const getrowkey = (row: (typeof mockData)[0]) => row.id;
		const { container } = render(AtelierDataTable, {
			props: { data: mockData, columns: mockColumns, getrowkey }
		});

		// Component should render without errors using custom key function
		expect(container.querySelectorAll('tbody tr')).toHaveLength(3);
	});
});
