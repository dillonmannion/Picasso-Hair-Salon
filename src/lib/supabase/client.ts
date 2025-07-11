import { createBrowserClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$types/database.types';

export const createSupabaseBrowserClient = (
  fetch?: typeof window.fetch
): SupabaseClient<Database> => {
  const options = fetch ? { global: { fetch } } : {};

  return createBrowserClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, options);
};

export const supabase = createSupabaseBrowserClient();
