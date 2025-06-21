import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	// Check if user is authenticated
	const session = await locals.safeGetSession();
	const user = session?.user;

	if (!user) {
		// Save the intended destination
		throw redirect(303, `/auth/login?redirectTo=${encodeURIComponent(url.pathname + url.search)}`);
	}

	// Get user profile
	const { data: profile } = await locals.supabase
		.from('users')
		.select('*')
		.eq('id', user.id)
		.single();

	return {
		user,
		profile
	};
};
