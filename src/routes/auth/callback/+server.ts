import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/';

  // Check for OAuth errors
  const error = url.searchParams.get('error');
  if (error) {
    const errorDescription = url.searchParams.get('error_description');
    console.error('OAuth error:', error, errorDescription);
    throw redirect(303, `/auth/login?error=${encodeURIComponent(error)}`);
  }

  // If no code, redirect to login with error
  if (!code) {
    throw redirect(303, '/auth/login?error=no_code');
  }

  try {
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Session exchange error:', error);
      throw redirect(303, '/auth/login?error=auth_failed');
    }

    // Validate the next parameter to prevent open redirects
    const isValidRedirect = next.startsWith('/') && !next.startsWith('//');
    const redirectTo = isValidRedirect ? next : '/';

    throw redirect(303, redirectTo);
  } catch (err) {
    // If the error is already a redirect, re-throw it
    if (err && typeof err === 'object' && 'status' in err && 'location' in err) {
      throw err;
    }
    console.error('Callback error:', err);
    throw redirect(303, '/auth/login?error=auth_failed');
  }
};
