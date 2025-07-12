import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

const ROUTE_PATTERNS = {
  ADMIN: '/admin',
  EMPLOYEE: '/employee'
} as const;

const redirectToLogin = (url: URL): never => {
  const redirectTo = url.pathname + url.search;
  const params = new URLSearchParams({ redirectTo });
  redirect(307, `/login?${params}`);
};

const hasAccess = (userRole: string, requiredRole: 'admin' | 'employee'): boolean => {
  if (requiredRole === 'admin') {
    return userRole === 'admin';
  }
  
  if (requiredRole === 'employee') {
    return userRole === 'employee' || userRole === 'admin';
  }
  
  return true;
};

export const load: LayoutServerLoad = async (event) => {
  const { locals, url, route } = event;
  
  if (!locals.user) {
    redirectToLogin(url);
  }

  const user = locals.user;
  const userRole = (user as { role?: string }).role || '';
  const routeId = route.id || '';
  
  if (routeId.includes(ROUTE_PATTERNS.ADMIN) && !hasAccess(userRole, 'admin')) {
    redirectToLogin(url);
  }
  
  if (routeId.includes(ROUTE_PATTERNS.EMPLOYEE) && !hasAccess(userRole, 'employee')) {
    redirectToLogin(url);
  }

  return {
    user
  };
};