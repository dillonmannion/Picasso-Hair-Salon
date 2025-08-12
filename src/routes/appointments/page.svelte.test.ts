import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import AppointmentsPage from './+page.svelte';
import type { PageData } from './$types';

// Mock SvelteKit navigation
vi.mock('$app/navigation', () => ({
	goto: vi.fn().mockResolvedValue(undefined)
}));

describe('Appointments Page', () => {
	const mockUser = {
		id: 'test-user',
		email: 'test@example.com'
	} as any;

	const mockAppointments = [
		{
			id: 'apt-1',
			service: 'Haircut & Style',
			stylist: 'Jane Smith',
			status: 'confirmed',
			date: '2024-12-15',
			time: '10:00 AM'
		},
		{
			id: 'apt-2',
			service: 'Color Treatment',
			stylist: 'John Doe',
			status: 'pending',
			date: '2024-12-20',
			time: '2:00 PM'
		}
	];

	test('renders appointments list', () => {
		render(AppointmentsPage, {
			props: {
				data: {
					user: mockUser,
					appointments: mockAppointments
				} as PageData
			}
		});

		expect(screen.getByText('My Appointments')).toBeInTheDocument();
		expect(screen.getByText('Haircut & Style')).toBeInTheDocument();
		expect(screen.getByText('Color Treatment')).toBeInTheDocument();
	});

	test('renders Book New Appointment button', () => {
		render(AppointmentsPage, {
			props: {
				data: {
					user: mockUser,
					appointments: mockAppointments
				} as PageData
			}
		});

		const bookButtons = screen.getAllByRole('button', { name: 'Book New Appointment' });
		expect(bookButtons.length).toBeGreaterThan(0);
	});

	test('renders action buttons for each appointment', () => {
		render(AppointmentsPage, {
			props: {
				data: {
					user: mockUser,
					appointments: mockAppointments
				} as PageData
			}
		});

		// Should have action buttons for each appointment
		expect(screen.getAllByRole('button', { name: 'Reschedule' })).toHaveLength(2);
		expect(screen.getAllByRole('button', { name: 'Cancel' })).toHaveLength(2);
		expect(screen.getAllByRole('button', { name: 'View Details' })).toHaveLength(2);
	});

	test('shows empty state when no appointments', () => {
		render(AppointmentsPage, {
			props: {
				data: {
					user: mockUser,
					appointments: []
				} as PageData
			}
		});

		expect(screen.getByText('No appointments yet')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Book Your First Appointment' })).toBeInTheDocument();
	});

	test('shows login prompt when user not logged in', () => {
		render(AppointmentsPage, {
			props: {
				data: {
					user: null,
					appointments: []
				} as unknown as PageData
			}
		});

		expect(screen.getByText('Please sign in to view your appointments.')).toBeInTheDocument();
		const signInLink = screen.getByRole('link', { name: 'Sign In' });
		expect(signInLink).toHaveAttribute('href', '/auth/login');
	});

	test('appointment action buttons trigger console logs', async () => {
		const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
		const user = userEvent.setup();

		render(AppointmentsPage, {
			props: {
				data: {
					user: mockUser,
					appointments: mockAppointments
				} as PageData
			}
		});

		const rescheduleButton = screen.getAllByRole('button', { name: 'Reschedule' })[0];
		await user.click(rescheduleButton);

		expect(consoleSpy).toHaveBeenCalledWith('Reschedule appointment:', 'apt-1');

		consoleSpy.mockRestore();
	});
});
