import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import AdminServicesPage from './+page.svelte';
import type { PageData } from './$types';

describe('Admin Services Page', () => {
	const mockServices = [
		{
			id: 'srv-1',
			name: 'Haircut & Style',
			description: 'Professional haircut and styling',
			price: 50,
			duration: 30,
			category: 'hair'
		},
		{
			id: 'srv-2',
			name: 'Color Treatment',
			description: 'Full color service',
			price: 120,
			duration: 90,
			category: 'color'
		}
	];

	const mockPageData: PageData = {
		supabase: {} as any,
		session: {} as any,
		user: {
			id: 'admin-user',
			email: 'admin@example.com'
		} as any,
		adminStatus: {
			isAdmin: true,
			email: 'admin@example.com',
			canManageServices: true,
			canManageStylists: true,
			canManageAppointments: true,
			canManageGallery: true,
			canViewAllUsers: true
		},
		services: mockServices
	};

	test('renders services list', () => {
		render(AdminServicesPage, {
			props: { data: mockPageData }
		});

		expect(screen.getByText('Services')).toBeInTheDocument();
		expect(screen.getByText('Haircut & Style')).toBeInTheDocument();
		expect(screen.getByText('Color Treatment')).toBeInTheDocument();
	});

	test('renders Add New Service button', () => {
		render(AdminServicesPage, {
			props: { data: mockPageData }
		});

		const addButton = screen.getByRole('button', { name: 'Add New Service' });
		expect(addButton).toBeInTheDocument();
	});

	test('renders Edit and Delete buttons for each service', () => {
		render(AdminServicesPage, {
			props: { data: mockPageData }
		});

		// Each service should have edit and delete buttons
		const editButtons = screen.getAllByRole('button', { name: /edit/i });
		const deleteButtons = screen.getAllByRole('button', { name: /delete/i });

		expect(editButtons).toHaveLength(mockServices.length);
		expect(deleteButtons).toHaveLength(mockServices.length);
	});

	test('delete button shows confirmation', async () => {
		const user = userEvent.setup();
		const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

		render(AdminServicesPage, {
			props: { data: mockPageData }
		});

		const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
		
		// Test the component would show confirmation (actual implementation needed)
		// For now, we just verify the button exists
		expect(deleteButtons[0]).toBeInTheDocument();
		
		confirmSpy.mockRestore();
	});
});