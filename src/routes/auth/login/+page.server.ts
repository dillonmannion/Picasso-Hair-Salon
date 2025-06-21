import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { signInWithGoogle } from '$lib/auth/oauth';

export const load: PageServerLoad = ({ locals }) => {
	// Redirect if already authenticated
	if (locals.session) {
		redirect(303, '/');
	}

	return {};
};

export const actions: Actions = {
	google: async ({ locals: { supabase }, url }) => {
		const redirectTo = url.searchParams.get('redirectTo') ?? '/';

		try {
			const { data, error } = await signInWithGoogle(
				supabase,
				`${url.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`
			);

			if (error) {
				return {
					error: 'Failed to sign in with Google. Please try again.',
					provider: 'google'
				};
			}

			if (data?.url) {
				redirect(303, data.url);
			}

			return {
				error: 'Failed to initiate Google sign-in'
			};
		} catch (err) {
			// Check if this is a SvelteKit redirect (which is expected)
			if (err && typeof err === 'object' && 'status' in err && err.status === 303) {
				// This is a successful redirect, re-throw it to complete the flow
				throw err;
			}

			console.error('Google OAuth server error:', err);
			return {
				error: 'An unexpected error occurred. Please try again.'
			};
		}
	}
};
