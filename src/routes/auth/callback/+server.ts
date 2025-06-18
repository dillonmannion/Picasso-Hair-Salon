import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
	const code = url.searchParams.get('code');
	let next = url.searchParams.get('next') ?? '/';

	// Ensure next is a relative URL
	if (!next.startsWith('/')) {
		next = '/';
	}

	if (code) {
		const { error } = await supabase.auth.exchangeCodeForSession(code);
		if (!error) {
			throw redirect(303, next);
		}
	}

	// Return the user to an error page with instructions
	throw redirect(303, '/auth/auth-code-error');
};
