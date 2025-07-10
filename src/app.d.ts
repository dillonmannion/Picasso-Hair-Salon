// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    interface Error {
      message: string;
      code?: string;
    }

    interface Locals {
      supabase: import('@supabase/supabase-js').SupabaseClient;
      safeGetSession: () => Promise<{
        session: import('@supabase/supabase-js').Session | null;
        user: import('@supabase/supabase-js').User | null;
      }>;
      session: import('@supabase/supabase-js').Session | null;
      user: import('@supabase/supabase-js').User | null;
    }

    interface PageData {
      session: import('@supabase/supabase-js').Session | null;
      user: import('@supabase/supabase-js').User | null;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface PageState {}

    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface Platform {}
  }
}

export {};
