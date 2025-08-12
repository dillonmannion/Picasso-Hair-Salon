import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	// Allow public access to settings page
	// Settings data is loaded based on authentication status

	return {
		user: locals.user
	};
};

export const actions: Actions = {
	updateProfile: async ({ request, locals: { supabase, user } }) => {
		// Require authentication for profile updates
		if (!user) {
			redirect(303, '/auth/login');
		}

		const formData = await request.formData();
		const displayName = formData.get('displayName') as string;

		if (!displayName || displayName.trim().length === 0) {
			return fail(400, {
				error: 'Display name is required',
				displayName
			});
		}

		const { error } = await supabase.auth.updateUser({
			data: {
				full_name: displayName.trim()
			}
		});

		if (error) {
			return fail(400, {
				error: 'Failed to update profile. Please try again.',
				displayName
			});
		}

		return {
			success: true,
			message: 'Profile updated successfully!'
		};
	},

	updateEmail: async ({ request, locals: { supabase, user } }) => {
		// Require authentication for email updates
		if (!user) {
			redirect(303, '/auth/login');
		}

		const formData = await request.formData();
		const email = formData.get('email') as string;

		if (!email || !email.includes('@')) {
			return fail(400, {
				error: 'Please enter a valid email address',
				email
			});
		}

		const { error } = await supabase.auth.updateUser({
			email: email.trim()
		});

		if (error) {
			return fail(400, {
				error: 'Failed to update email. Please try again.',
				email
			});
		}

		return {
			success: true,
			message: 'Email update request sent! Please check your email to confirm the change.'
		};
	}
};
