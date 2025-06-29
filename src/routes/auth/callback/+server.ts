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

			// Get the authenticated user
			const {
				data: { user }
			} = await supabase.auth.getUser();

			if (user) {
				// Check if user profile exists
				const { data: existingProfile } = await supabase
					.from('users')
					.select('id')
					.eq('id', user.id)
					.single();

				// Create user profile if it doesn't exist
				if (!existingProfile) {
					const { error: profileError } = await supabase.from('users').insert({
						id: user.id,
						email: user.email,
						full_name: user.user_metadata?.full_name || null,
						avatar_url: user.user_metadata?.avatar_url || null
					});

					if (profileError) {
						console.error('Error creating user profile:', profileError);
						// Continue with redirect even if profile creation fails
					}
				}
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
