import { createBrowserClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { LayoutLoad } from './$types';
import type { Database } from '$types/database.types';

export const load: LayoutLoad = async ({ fetch, data, depends }) => {
  depends('supabase:auth');

  const supabase = createBrowserClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    global: {
      fetch,
    },
  });

  let session = null;
  
  try {
    const {
      data: { session: authSession },
    } = await supabase.auth.getSession();
    session = authSession;
  } catch (error) {
    console.error('Error getting session in layout:', error);
    // Session remains null on error
  }

  return {
    supabase,
    session: session ?? data.session,
    user: data.user,
  };
};
