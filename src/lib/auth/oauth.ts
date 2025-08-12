import { getAuthRedirectURL } from '$lib/supabaseClient';
import type { Provider, SupabaseClient } from '@supabase/supabase-js';

/**
 * Initiate Google OAuth sign-in
 */
export async function signInWithGoogle(
	supabase: SupabaseClient,
	redirectTo?: string,
	origin?: string
) {
	const { data, error } = await supabase.auth.signInWithOAuth({
		provider: 'google',
		options: {
			redirectTo: redirectTo ?? getAuthRedirectURL(origin),
			queryParams: {
				access_type: 'offline',
				prompt: 'consent'
			}
		}
	});

	if (error) {
		console.error('Google OAuth error:', error);
		return { data: null, error };
	}

	return { data, error: null };
}

/**
 * Generic OAuth sign-in function
 */
export async function signInWithOAuth(
	supabase: SupabaseClient,
	provider: Provider,
	redirectTo?: string,
	origin?: string
) {
	const { data, error } = await supabase.auth.signInWithOAuth({
		provider,
		options: {
			redirectTo: redirectTo ?? getAuthRedirectURL(origin)
		}
	});

	if (error) {
		console.error(`${provider} OAuth error:`, error);
		return { data: null, error };
	}

	return { data, error: null };
}

/**
 * Get OAuth redirect URL with optional next parameter
 */
export function getOAuthRedirectURL(next?: string, origin?: string): string {
	const baseURL = getAuthRedirectURL(origin);
	if (next) {
		const url = new URL(baseURL);
		url.searchParams.set('next', next);
		return url.toString();
	}
	return baseURL;
}

/**
 * Supported OAuth providers
 */
export const OAUTH_PROVIDERS = {
	google: {
		name: 'Google',
		icon: '🔍', // You can replace with actual icon component
		signIn: signInWithGoogle
	}
	// Add more providers here as needed
	// github: {
	//   name: 'GitHub',
	//   icon: '🐙',
	//   signIn: (supabase: SupabaseClient, redirectTo?: string) => signInWithOAuth(supabase, 'github', redirectTo)
	// }
} as const;

/**
 * Check if we're running on client side for OAuth redirects
 */
export function isClientSide(): boolean {
	return typeof window !== 'undefined';
}

/**
 * Handle OAuth redirect (for server-side frameworks)
 * This would be used if you need to handle OAuth from server actions
 */
export async function handleOAuthRedirect(
	supabase: SupabaseClient,
	provider: Provider,
	redirectTo?: string,
	origin?: string
) {
	if (!isClientSide()) {
		// Server-side OAuth initiation
		const { data, error } = await signInWithOAuth(supabase, provider, redirectTo, origin);

		if (error) {
			throw new Error(`OAuth initiation failed: ${error.message}`);
		}

		if (data?.url) {
			// Return URL for server-side redirect
			return data.url;
		}

		throw new Error('No OAuth URL received');
	}

	// Client-side OAuth (automatic redirect)
	return signInWithOAuth(supabase, provider, redirectTo, origin);
}
