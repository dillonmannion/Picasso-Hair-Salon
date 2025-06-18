import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from './types/database.types';

// Client-side Supabase client
export const supabase = createClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
	auth: {
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: true
	}
});

// Server-side Supabase client factory
export function createSupabaseServerClient(cookies: {
	get: (key: string) => string | undefined;
	set: (key: string, value: string, options?: any) => void;
	delete: (key: string, options?: any) => void;
}) {
	return createServerClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			get: (key) => cookies.get(key),
			set: (key, value, options) => {
				cookies.set(key, value, {
					...options,
					path: '/',
					httpOnly: true,
					secure: true,
					sameSite: 'lax'
				});
			},
			remove: (key, options) => {
				cookies.delete(key, {
					...options,
					path: '/'
				});
			}
		}
	});
}
