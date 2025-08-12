import { createBrowserClient, isBrowser } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from './types/database.types';

/**
 * Creates a browser client with proper cookie handling.
 * This client is designed for client-side use.
 * For server-side operations, use the client from event.locals.supabase
 */
function createSafeSupabaseClient() {
	return createBrowserClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			getAll() {
				// Only access document if we're in browser
				if (typeof document === 'undefined') {
					return [];
				}
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
				// Only set cookies if we're in browser
				if (typeof document === 'undefined') {
					return;
				}
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
						cookieString += '; HttpOnly';
					}
					if (options?.sameSite) {
						cookieString += `; SameSite=${options.sameSite}`;
					}

					document.cookie = cookieString;
				});
			}
		}
	});
}

export const supabase = createSafeSupabaseClient();

/**
 * Helper function to get the current user
 * This validates the JWT and returns the user data
 * CLIENT-SIDE ONLY: Use event.locals.safeGetSession() on server-side
 */
export async function getCurrentUser() {
	if (!isBrowser()) {
		console.warn(
			'getCurrentUser() should only be used client-side. Use event.locals.safeGetSession() on server-side.'
		);
		return null;
	}

	const {
		data: { user },
		error
	} = await supabase.auth.getUser();
	if (error) {
		console.error('Error getting user:', error);
		return null;
	}
	return user;
}

/**
 * Helper function to get the current session
 * WARNING: This should only be used on client-side after JWT validation
 * CLIENT-SIDE ONLY: Use event.locals.safeGetSession() on server-side
 */
export async function getCurrentSession() {
	if (!isBrowser()) {
		console.warn(
			'getCurrentSession() should only be used client-side. Use event.locals.safeGetSession() on server-side.'
		);
		return null;
	}

	const {
		data: { session },
		error
	} = await supabase.auth.getSession();
	if (error) {
		console.error('Error getting session:', error);
		return null;
	}
	return session;
}

/**
 * Helper function to sign out user
 * CLIENT-SIDE ONLY: Use event.locals.supabase.auth.signOut() on server-side
 */
export async function signOut() {
	if (!isBrowser()) {
		console.warn(
			'signOut() should only be used client-side. Use event.locals.supabase.auth.signOut() on server-side.'
		);
		return { error: new Error('Server-side signOut not supported from this client') };
	}

	const { error } = await supabase.auth.signOut();
	if (error) {
		console.error('Error signing out:', error);
		return { error };
	}
	return { error: null };
}

/**
 * Helper function to get redirect URL for OAuth
 */
export function getAuthRedirectURL(origin?: string): string {
	if (typeof window !== 'undefined') {
		return `${window.location.origin}/auth/callback`;
	}
	// Server-side: use provided origin or fallback to localhost for dev
	if (origin) {
		return `${origin}/auth/callback`;
	}
	return `http://localhost:5173/auth/callback`;
}
