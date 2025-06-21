import { createBrowserClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = ({ fetch, data, depends }) => {
	depends('supabase:auth');

	// For our simplified auth system, we only need a browser client
	// Server-side operations are handled via hooks.server.ts
	const supabase = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		global: {
			fetch
		}
	});

	/**
	 * Simplified auth system: Use server-validated session data from +layout.server.ts
	 * - No complex JWT validation on client side
	 * - Session and user data already validated via hooks.server.ts
	 * - Admin status included for simplified privilege checking
	 */

	return {
		supabase,
		session: data.session, // Server-validated session
		user: data.user, // Server-validated user
		adminStatus: data.adminStatus // Admin privileges from server
	};
};
