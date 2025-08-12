import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	// Allow public access to profile page
	// Profile data is loaded based on authentication status

	return {
		user: locals.user
	};
};
