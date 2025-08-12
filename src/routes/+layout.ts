import { createBrowserClient, isBrowser } from '@supabase/ssr';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = ({ fetch, data, depends }) => {
	depends('supabase:auth');

	// Create browser client with proper cookie handling for session persistence
	const supabase = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		global: {
			fetch
		},
		cookies: {
			getAll() {
				if (!isBrowser()) return [];

				return document.cookie
					.split(';')
					.map((cookie) => {
						const [name, ...parts] = cookie.split('=');
						return {
							name: name?.trim() ?? '',
							value: parts.join('=').trim()
						};
					})
					.filter((cookie) => cookie.name && cookie.value);
			},
			setAll(cookiesToSet) {
				if (!isBrowser()) return;

				cookiesToSet.forEach(({ name, value, options }) => {
					let cookieString = `${name}=${value}`;

					if (options?.maxAge) {
						cookieString += `; Max-Age=${options.maxAge}`;
					}
					if (options?.expires) {
						cookieString += `; Expires=${options.expires.toUTCString()}`;
					}
					if (options?.path) {
						cookieString += `; Path=${options.path}`;
					}
					if (options?.domain) {
						cookieString += `; Domain=${options.domain}`;
					}
					if (options?.secure) {
						cookieString += '; Secure';
					}
					if (options?.httpOnly) {
						// Note: Can't set HttpOnly from JavaScript
						console.warn('Cannot set HttpOnly cookie from JavaScript');
					}
					if (options?.sameSite) {
						cookieString += `; SameSite=${options.sameSite}`;
					}

					document.cookie = cookieString;
				});
			}
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
