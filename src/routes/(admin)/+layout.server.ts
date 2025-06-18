import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { redirect, error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import type { Database } from '$lib/types/database.types';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
	const supabase = createClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

	// Check if user is authenticated
	const session = cookies.get('sb-access-token');
	if (!session) {
		throw redirect(303, `/auth/login?redirectTo=${encodeURIComponent(url.pathname)}`);
	}

	try {
		// For now, we'll use a placeholder admin check since we need proper auth integration
		// TODO: Implement proper user role checking from Supabase auth
		
		// In a real implementation, you would:
		// 1. Verify the session token
		// 2. Get the user ID from the session
		// 3. Check the user's role in the database
		// 4. Only allow access if role is 'admin'
		
		// For demonstration purposes, we'll simulate admin access
		// In production, this should be replaced with proper role verification
		const isAdmin = true; // This should be determined from actual user data

		if (!isAdmin) {
			error(403, 'Access denied. Admin privileges required.');
		}

		return {
			user: {
				id: 'admin-user-id',
				email: 'admin@picassosalon.com',
				role: 'admin'
			}
		};
	} catch (err) {
		console.error('Error checking admin status:', err);
		throw redirect(303, '/auth/login');
	}
};