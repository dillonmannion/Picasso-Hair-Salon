/**
 * Authentication URL utilities
 * Ensures correct URLs for authentication flows in different environments
 */

/**
 * Gets the current application URL
 * Works correctly in both server and client contexts
 */
export function getAppUrl(): string {
  // Client-side: use window.location.origin
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Server-side: check various environment variables
  // Vercel provides VERCEL_URL automatically
  if (process.env.VERCEL_URL) {
    // Vercel URLs don't include protocol, so we add it
    const protocol = process.env.VERCEL_ENV === 'production' ? 'https' : 'https';
    return `${protocol}://${process.env.VERCEL_URL}`;
  }

  // Fallback to PUBLIC_APP_URL if set
  if (process.env.PUBLIC_APP_URL) {
    return process.env.PUBLIC_APP_URL;
  }

  // Development fallback
  return 'http://localhost:5173';
}

/**
 * Gets the auth callback URL
 */
export function getAuthCallbackUrl(): string {
  return `${getAppUrl()}/auth/callback`;
}

/**
 * Gets the post-login redirect URL
 * @param defaultPath - Default path to redirect to after login
 */
export function getPostLoginRedirectUrl(defaultPath: string = '/dashboard'): string {
  return `${getAppUrl()}${defaultPath}`;
}
