import { createServerClient } from '@supabase/ssr';
import { type Handle, type RequestEvent, redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { kv } from '@vercel/kv';
import { EdgeRateLimiter } from '$lib/security/edge-rate-limiter';

import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { applyCSPHeaders } from '$lib/security/csp';
import { validateAndPopulateSession } from '$lib/server/auth/session';

const supabase: Handle = async ({ event, resolve }) => {
  /**
   * Creates a Supabase client specific to this server request.
   *
   * The Supabase client gets the Auth token from the request cookies.
   */
  event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => event.cookies.getAll(),
      /**
       * SvelteKit's cookies API requires `path` to be explicitly set in
       * the cookie options. Setting `path` to `/` replicates previous/
       * standard behavior.
       */
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          event.cookies.set(name, value, { ...options, path: '/' });
        });
      },
    },
  });

  /**
   * Unlike `supabase.auth.getSession()`, which returns the session _without_
   * validating the JWT, this function also calls `getUser()` to validate the
   * JWT before returning the session.
   */
  event.locals.safeGetSession = async () => {
    const {
      data: { session },
    } = await event.locals.supabase.auth.getSession();
    if (!session) {
      return { session: null, user: null };
    }

    const {
      data: { user },
      error,
    } = await event.locals.supabase.auth.getUser();
    if (error) {
      // JWT validation has failed
      return { session: null, user: null };
    }

    return { session, user };
  };

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      /**
       * Supabase libraries use the `content-range` and `x-supabase-api-version`
       * headers, so we need to tell SvelteKit to pass it through.
       */
      return name === 'content-range' || name === 'x-supabase-api-version';
    },
  });
};

const DEFAULT_RATE_LIMIT_MAX_ATTEMPTS = 5;
const DEFAULT_RATE_LIMIT_WINDOW_SECONDS = 900;

const edgeRateLimiter = new EdgeRateLimiter(kv, {
  maxAttempts: Number(process.env.RATE_LIMIT_MAX_ATTEMPTS || DEFAULT_RATE_LIMIT_MAX_ATTEMPTS),
  windowSeconds: Number(process.env.RATE_LIMIT_WINDOW_SECONDS || DEFAULT_RATE_LIMIT_WINDOW_SECONDS),
});

const extractClientIp = (event: RequestEvent): string => {
  const xForwardedFor = event.request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  return event.getClientAddress();
};

const buildRateLimitHeaders = (
  config: ReturnType<typeof edgeRateLimiter.getConfig>,
  result: { remaining: number; resetAt: Date }
): Record<string, string> => {
  return {
    'X-RateLimit-Limit': String(config.maxAttempts),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.floor(result.resetAt.getTime() / 1000)),
  };
};

const rateLimiter: Handle = async ({ event, resolve }) => {
  const clientIp = extractClientIp(event);
  const result = await edgeRateLimiter.checkLimit(clientIp);
  const config = edgeRateLimiter.getConfig();
  
  event.locals.rateLimit = {
    allowed: result.allowed,
    remaining: result.remaining,
    limit: config.maxAttempts,
    resetAt: result.resetAt,
  };
  
  if (!result.allowed) {
    return new Response('Too many requests. Please try again later.', { 
      status: 429,
      headers: {
        'Retry-After': String(config.windowSeconds),
        ...buildRateLimitHeaders(config, result),
      }
    });
  }
  
  const response = await resolve(event);
  
  if (!response || !response.headers) {
    throw new Error('Invalid response from resolve function');
  }
  
  const rateLimitHeaders = buildRateLimitHeaders(config, result);
  Object.entries(rateLimitHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
};

const sessionValidator: Handle = async ({ event, resolve }) => {
  await validateAndPopulateSession(event);
  return resolve(event);
};

const ROUTE_CONFIG = {
  PUBLIC_ROUTES: ['/', '/about', '/contact', '/auth/login', '/auth/register'],
  PUBLIC_PREFIXES: ['/auth/'],
  PROTECTED_PREFIXES: ['/dashboard', '/profile', '/settings'],
  ADMIN_PREFIXES: ['/admin']
} as const;


const isProtectedRoute = (pathname: string): boolean => {
  return ROUTE_CONFIG.PROTECTED_PREFIXES.some(prefix => pathname.startsWith(prefix));
};

const isAdminRoute = (pathname: string): boolean => {
  return ROUTE_CONFIG.ADMIN_PREFIXES.some(prefix => pathname.startsWith(prefix));
};

const createLoginRedirect = (pathname: string) => {
  return `/auth/login?redirectTo=${encodeURIComponent(pathname)}`;
};

const routeProtection: Handle = async ({ event, resolve }) => {
  const { url, locals } = event;
  const path = url.pathname;
  
  if (isProtectedRoute(path) && !locals.user) {
    throw redirect(303, createLoginRedirect(path));
  }
  
  if (isAdminRoute(path)) {
    if (!locals.user) {
      throw redirect(303, createLoginRedirect(path));
    }
    if (locals.user.role !== 'admin') {
      return new Response('Forbidden', { status: 403 });
    }
  }
  
  return resolve(event);
};

const cspHandler: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return applyCSPHeaders(response, { isDevelopment });
};

export const handle: Handle = sequence(rateLimiter, supabase, sessionValidator, routeProtection, cspHandler);

export { rateLimiter };
