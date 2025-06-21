import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
	const code = url.searchParams.get('code');
	const next = url.searchParams.get('next') ?? '/';

	// Handle OAuth errors from provider - redirect to login with error
	if (url.searchParams.get('error')) {
		console.error(
			'OAuth error:',
			url.searchParams.get('error'),
			url.searchParams.get('error_description')
		);
		redirect(303, '/auth/login?error=oauth_failed');
	}

	if (code) {
		try {
			const { error } = await supabase.auth.exchangeCodeForSession(code);

			if (error) {
				console.error('Code exchange error:', error);
				redirect(303, '/auth/login?error=exchange_failed');
			}

			// Successful authentication - redirect to intended destination
			const redirectTo = next.startsWith('/') ? next : '/';
			redirect(303, redirectTo);
		} catch (err) {
			// Check if this is a SvelteKit redirect (which is expected)
			if (err && typeof err === 'object' && 'status' in err && err.status === 303) {
				throw err;
			}

			console.error('Unexpected error during code exchange:', err);
			redirect(303, '/auth/login?error=server_error');
		}
	}

	// No code provided - redirect back to login
	redirect(303, '/auth/login?error=no_code');
};
