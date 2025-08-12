import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals }) => {
	// Require admin access for all admin routes
	if (!locals.adminStatus.isAdmin) {
		error(403, 'Admin access required');
	}

	return {
		user: locals.user,
		adminStatus: locals.adminStatus
	};
};
