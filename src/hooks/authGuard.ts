import { type Handle, redirect } from '@sveltejs/kit';

const isProtectedRoute = (pathname: string): boolean => {
  return pathname === '/protected' || pathname.startsWith('/protected/');
};

const isLoginRoute = (pathname: string): boolean => {
  return pathname === '/auth/login';
};

export const authGuard: Handle = async ({ event, resolve }) => {
  const { session, user } = await event.locals.safeGetSession();
  event.locals.session = session;
  event.locals.user = user;

  const isAuthenticated = !!session;
  const { pathname } = event.url;

  if (!isAuthenticated && isProtectedRoute(pathname)) {
    redirect(303, '/auth/login');
  }

  if (isAuthenticated && isLoginRoute(pathname)) {
    redirect(303, '/');
  }

  return resolve(event);
};