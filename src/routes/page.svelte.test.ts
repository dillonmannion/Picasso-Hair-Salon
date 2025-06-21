import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
	test('should render h1', () => {
		// Provide mock data that the component expects
		const mockData = {
			supabase: {} as any, // Mock Supabase client
			session: null,
			user: {
				id: 'test-user',
				email: 'test@example.com',
				app_metadata: {},
				user_metadata: {},
				aud: 'authenticated',
				created_at: '2024-01-01T00:00:00Z',
				email_confirmed_at: '2024-01-01T00:00:00Z',
				phone: undefined,
				confirmed_at: '2024-01-01T00:00:00Z',
				last_sign_in_at: '2024-01-01T00:00:00Z',
				role: 'authenticated',
				updated_at: '2024-01-01T00:00:00Z'
			},
			adminStatus: {
				isAdmin: false,
				email: null,
				canManageServices: false,
				canManageStylists: false,
				canManageAppointments: false,
				canManageGallery: false,
				canViewAllUsers: false
			}
		};

		render(Page, {
			props: {
				data: mockData
			}
		});

		expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
	});
});
