import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { OAuthCallbackParamsSchema, OAuthErrorParamsSchema } from '$lib/schemas';

const buildErrorRedirect = (error: string, message: string): never => {
  throw redirect(303, `/auth/login?error=${error}&message=${encodeURIComponent(message)}`);
};

const isValidInternalRedirect = (url: string): boolean => {
  return url.startsWith('/') && !url.startsWith('//');
};

const parseSearchParams = (url: URL): Record<string, string> => {
  return Object.fromEntries(url.searchParams);
};

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
  const searchParams = parseSearchParams(url);

  const errorParseResult = OAuthErrorParamsSchema.safeParse(searchParams);
  if (errorParseResult.success) {
    const { error, error_description } = errorParseResult.data;
    buildErrorRedirect(error, error_description || error);
  }

  const paramsParseResult = OAuthCallbackParamsSchema.safeParse(searchParams);
  if (!paramsParseResult.success) {
    const errorMessage = paramsParseResult.error.issues[0]?.message || 'Invalid request';
    buildErrorRedirect('invalid_request', errorMessage);
  }

  const { code, next = '/' } = paramsParseResult.data!;

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    buildErrorRedirect('auth_failed', error.message);
  }

  const redirectTo = isValidInternalRedirect(next) ? next : '/';
  throw redirect(303, redirectTo);
};
