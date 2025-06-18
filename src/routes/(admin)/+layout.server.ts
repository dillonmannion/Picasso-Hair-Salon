import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { safeGetSession }, url }) => {
	const { session, user } = await safeGetSession();

	// Check if user is authenticated
	if (!session || !user) {
		throw redirect(303, `/auth/login?redirectTo=${encodeURIComponent(url.pathname)}`);
	}

	// For now, we'll allow any authenticated user as admin
	// In production, you would check user roles from your database
	// For example: Check if user.user_metadata.role === 'admin' or query a user_roles table

	// TODO: Implement proper role-based access control
	// const { data: userRole } = await locals.supabase
	//   .from('user_roles')
	//   .select('role')
	//   .eq('user_id', user.id)
	//   .single();

	// if (userRole?.role !== 'admin') {
	//   error(403, 'Access denied. Admin privileges required.');
	// }

	return {
		user: {
			id: user.id,
			email: user.email,
			role: 'admin' // Simplified for now
		}
	};
};
