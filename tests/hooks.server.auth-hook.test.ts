import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';
import type { Session, User } from '@supabase/supabase-js';
import { handle } from '../src/hooks.server';

// Mock Vercel KV
vi.mock('@vercel/kv', () => ({
  kv: {
    incr: vi.fn(),
    expire: vi.fn(),
  },
}));

// Mock the edge rate limiter
vi.mock('$lib/security/edge-rate-limiter', () => {
  const mockInstance = {
    checkLimit: vi.fn(),
    getConfig: vi.fn(() => ({ maxAttempts: 5, windowSeconds: 900 })),
  };

  return {
    EdgeRateLimiter: vi.fn(() => mockInstance),
    __mockInstance: mockInstance,
  };
});

// Mock the CSP handler
vi.mock('$lib/security/csp-config', () => ({
  generateNonce: vi.fn(() => 'test-nonce-123'),
  getCSPHeader: vi.fn(() => "default-src 'self'; script-src 'self' 'nonce-test-nonce-123'"),
}));

// Mock the session manager
vi.mock('$lib/server/auth/session', () => ({
  validateAndPopulateSession: vi.fn(),
}));

// Mock environment variables
vi.mock('$env/static/public', () => ({
  PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
}));

describe('Authentication Hook - Complete Implementation', () => {
  let mockEvent: RequestEvent;
  let mockEdgeRateLimiterInstance: {
    checkLimit: ReturnType<typeof vi.fn>;
    resetLimit: ReturnType<typeof vi.fn>;
  };
  let mockGenerateNonce: ReturnType<typeof vi.fn>;
  let mockGetCSPHeader: ReturnType<typeof vi.fn>;
  let mockValidateAndPopulateSession: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Get the mock instance from the mocked module
    const edgeRateLimiterModule = await import('$lib/security/edge-rate-limiter');
    mockEdgeRateLimiterInstance = (
      edgeRateLimiterModule as unknown as {
        __mockInstance: {
          checkLimit: ReturnType<typeof vi.fn>;
          resetLimit: ReturnType<typeof vi.fn>;
        };
      }
    ).__mockInstance;

    const cspConfig = await import('$lib/security/csp-config');
    mockGenerateNonce = cspConfig.generateNonce as ReturnType<typeof vi.fn>;
    mockGetCSPHeader = cspConfig.getCSPHeader as ReturnType<typeof vi.fn>;

    const session = await import('$lib/server/auth/session');
    mockValidateAndPopulateSession = session.validateAndPopulateSession as ReturnType<typeof vi.fn>;

    // Create a minimal mock event
    const cookies = {
      getAll: vi.fn(() => []),
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
      serialize: vi.fn(),
    };

    mockEvent = {
      cookies,
      locals: {},
      request: new Request('http://localhost:3000/'),
      url: new URL('http://localhost:3000/'),
      params: {},
      route: { id: '/' },
      fetch: vi.fn(),
      setHeaders: vi.fn(),
      getClientAddress: vi.fn(() => '127.0.0.1'),
      platform: {},
      isDataRequest: false,
      isSubRequest: false,
    } as unknown as RequestEvent;
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to all requests', async () => {
      mockEdgeRateLimiterInstance.checkLimit.mockResolvedValue({
        allowed: true,
        remaining: 4,
        resetAt: new Date(),
      });
      mockValidateAndPopulateSession.mockResolvedValue(undefined);

      const mockResolve = vi.fn(async () => new Response('OK'));

      await handle({ event: mockEvent, resolve: mockResolve });

      expect(mockEdgeRateLimiterInstance.checkLimit).toHaveBeenCalledWith('127.0.0.1');
    });

    it('should return 429 when rate limit is exceeded', async () => {
      mockEdgeRateLimiterInstance.checkLimit.mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetAt: new Date(),
      });

      const mockResolve = vi.fn(async () => new Response('OK'));

      const response = await handle({ event: mockEvent, resolve: mockResolve });

      expect(response.status).toBe(429);
      expect(await response.text()).toContain('Too many requests');
      expect(mockResolve).not.toHaveBeenCalled();
    });

    it('should continue processing when rate limit is not exceeded', async () => {
      mockEdgeRateLimiterInstance.checkLimit.mockResolvedValue({
        allowed: true,
        remaining: 4,
        resetAt: new Date(),
      });
      mockValidateAndPopulateSession.mockResolvedValue(undefined);

      const mockResolve = vi.fn(async () => new Response('OK'));

      const response = await handle({ event: mockEvent, resolve: mockResolve });

      expect(response.status).toBe(200);
      expect(mockResolve).toHaveBeenCalled();
    });
  });

  describe('Session Validation', () => {
    it('should validate and populate session for all requests', async () => {
      mockEdgeRateLimiterInstance.checkLimit.mockResolvedValue({
        allowed: true,
        remaining: 4,
        resetAt: new Date(),
      });
      mockValidateAndPopulateSession.mockResolvedValue(undefined);

      const mockResolve = vi.fn(async () => new Response('OK'));

      await handle({ event: mockEvent, resolve: mockResolve });

      expect(mockValidateAndPopulateSession).toHaveBeenCalledWith(mockEvent);
    });

    it('should populate event.locals.user when session is valid', async () => {
      mockEdgeRateLimiterInstance.checkLimit.mockResolvedValue({
        allowed: true,
        remaining: 4,
        resetAt: new Date(),
      });

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'customer',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as User & { role: string };

      mockValidateAndPopulateSession.mockImplementation(async (event: RequestEvent) => {
        event.locals.user = mockUser;
        event.locals.session = { access_token: 'test-token' } as Session;
      });

      const mockResolve = vi.fn(async () => new Response('OK'));

      await handle({ event: mockEvent, resolve: mockResolve });

      expect(mockEvent.locals.user).toEqual(mockUser);
      expect(mockEvent.locals.session).toBeDefined();
    });
  });

  describe('Route Protection', () => {
    it('should allow access to public routes without authentication', async () => {
      mockEdgeRateLimiterInstance.checkLimit.mockResolvedValue({
        allowed: true,
        remaining: 4,
        resetAt: new Date(),
      });
      mockValidateAndPopulateSession.mockResolvedValue(undefined);

      // Test public routes
      const publicRoutes = ['/', '/about', '/contact', '/auth/login', '/auth/register'];

      for (const route of publicRoutes) {
        mockEvent.url = new URL(`http://localhost:3000${route}`);
        const mockResolve = vi.fn(async () => new Response('OK'));

        const response = await handle({ event: mockEvent, resolve: mockResolve });

        expect(response.status).toBe(200);
        expect(mockResolve).toHaveBeenCalled();
      }
    });

    it('should redirect to login for protected routes without authentication', async () => {
      mockEdgeRateLimiterInstance.checkLimit.mockResolvedValue({
        allowed: true,
        remaining: 4,
        resetAt: new Date(),
      });
      mockValidateAndPopulateSession.mockResolvedValue(undefined);

      // No user in locals (not authenticated)
      mockEvent.locals.user = null;

      // Test protected routes
      const protectedRoutes = ['/dashboard', '/profile', '/settings'];

      for (const route of protectedRoutes) {
        mockEvent.url = new URL(`http://localhost:3000${route}`);
        const mockResolve = vi.fn(async () => new Response('OK'));

        try {
          await handle({ event: mockEvent, resolve: mockResolve });
          // Should not reach here
          expect.fail('Expected redirect to be thrown');
        } catch (error) {
          expect((error as { status: number }).status).toBe(303);
          expect((error as { location: string }).location).toBe(
            `/auth/login?redirectTo=${encodeURIComponent(route)}`
          );
          expect(mockResolve).not.toHaveBeenCalled();
        }
      }
    });

    it('should allow access to protected routes with authentication', async () => {
      mockEdgeRateLimiterInstance.checkLimit.mockResolvedValue({
        allowed: true,
        remaining: 4,
        resetAt: new Date(),
      });

      // User is authenticated
      mockValidateAndPopulateSession.mockImplementation(async (event: RequestEvent) => {
        event.locals.user = {
          id: 'user-123',
          email: 'test@example.com',
          role: 'customer',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        } as User & { role: string };
      });

      // Test protected routes
      const protectedRoutes = ['/dashboard', '/profile', '/settings'];

      for (const route of protectedRoutes) {
        mockEvent.url = new URL(`http://localhost:3000${route}`);
        const mockResolve = vi.fn(async () => new Response('OK'));

        const response = await handle({ event: mockEvent, resolve: mockResolve });

        expect(response.status).toBe(200);
        expect(mockResolve).toHaveBeenCalled();
      }
    });

    it('should protect admin routes from non-admin users', async () => {
      mockEdgeRateLimiterInstance.checkLimit.mockResolvedValue({
        allowed: true,
        remaining: 4,
        resetAt: new Date(),
      });

      // User is authenticated but not admin
      mockValidateAndPopulateSession.mockImplementation(async (event: RequestEvent) => {
        event.locals.user = {
          id: 'user-123',
          email: 'test@example.com',
          role: 'customer',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        } as User & { role: string };
      });

      // Test admin routes
      const adminRoutes = ['/admin', '/admin/users', '/admin/settings'];

      for (const route of adminRoutes) {
        mockEvent.url = new URL(`http://localhost:3000${route}`);
        const mockResolve = vi.fn(async () => new Response('OK'));

        const response = await handle({ event: mockEvent, resolve: mockResolve });

        expect(response.status).toBe(403);
        expect(await response.text()).toContain('Forbidden');
        expect(mockResolve).not.toHaveBeenCalled();
      }
    });

    it('should allow admin access to admin routes', async () => {
      mockEdgeRateLimiterInstance.checkLimit.mockResolvedValue({
        allowed: true,
        remaining: 4,
        resetAt: new Date(),
      });

      // User is admin
      mockValidateAndPopulateSession.mockImplementation(async (event: RequestEvent) => {
        event.locals.user = {
          id: 'admin-123',
          email: 'admin@example.com',
          role: 'admin',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        } as User & { role: string };
      });

      // Test admin routes
      const adminRoutes = ['/admin', '/admin/users', '/admin/settings'];

      for (const route of adminRoutes) {
        mockEvent.url = new URL(`http://localhost:3000${route}`);
        const mockResolve = vi.fn(async () => new Response('OK'));

        const response = await handle({ event: mockEvent, resolve: mockResolve });

        expect(response.status).toBe(200);
        expect(mockResolve).toHaveBeenCalled();
      }
    });
  });

  describe('CSP Headers', () => {
    it('should apply CSP headers to all responses', async () => {
      mockEdgeRateLimiterInstance.checkLimit.mockResolvedValue({
        allowed: true,
        remaining: 4,
        resetAt: new Date(),
      });
      mockValidateAndPopulateSession.mockResolvedValue(undefined);

      const mockResolve = vi.fn(async () => new Response('OK'));

      const response = await handle({ event: mockEvent, resolve: mockResolve });

      expect(mockGenerateNonce).toHaveBeenCalled();
      expect(mockGetCSPHeader).toHaveBeenCalledWith('test-nonce-123');
      expect(response.headers.get('Content-Security-Policy')).toBe(
        "default-src 'self'; script-src 'self' 'nonce-test-nonce-123'"
      );
    });

    it('should pass development flag based on NODE_ENV', async () => {
      mockEdgeRateLimiterInstance.checkLimit.mockResolvedValue({
        allowed: true,
        remaining: 4,
        resetAt: new Date(),
      });
      mockValidateAndPopulateSession.mockResolvedValue(undefined);

      const originalEnv = process.env.NODE_ENV;

      // Test development mode
      process.env.NODE_ENV = 'development';
      mockGetCSPHeader.mockReturnValue(
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'nonce-test-nonce-123'"
      );

      const mockResolve = vi.fn(async () => new Response('OK'));
      const devResponse = await handle({ event: mockEvent, resolve: mockResolve });

      expect(mockGetCSPHeader).toHaveBeenCalledWith('test-nonce-123');
      expect(devResponse.headers.get('Content-Security-Policy')).toContain('unsafe-inline');

      // Test production mode
      process.env.NODE_ENV = 'production';
      vi.clearAllMocks();
      mockGenerateNonce.mockReturnValue('test-nonce-456');
      mockGetCSPHeader.mockReturnValue(
        "default-src 'self'; script-src 'self' 'nonce-test-nonce-456'"
      );

      const prodResponse = await handle({ event: mockEvent, resolve: mockResolve });

      expect(mockGetCSPHeader).toHaveBeenCalledWith('test-nonce-456');
      expect(prodResponse.headers.get('Content-Security-Policy')).not.toContain('unsafe-inline');

      // Restore original env
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Hook Sequence', () => {
    it('should execute hooks in correct order: rate limit -> session -> auth guard -> CSP', async () => {
      const executionOrder: string[] = [];

      mockEdgeRateLimiterInstance.checkLimit.mockImplementation(async () => {
        executionOrder.push('rate-limit');
        return { allowed: true, remaining: 4, resetAt: new Date() };
      });

      mockValidateAndPopulateSession.mockImplementation(async () => {
        executionOrder.push('session');
      });

      mockGetCSPHeader.mockImplementation((nonce: string) => {
        executionOrder.push('csp');
        return "default-src 'self'; script-src 'self' 'nonce-" + nonce + "'";
      });

      const mockResolve = vi.fn(async (_event) => {
        executionOrder.push('resolve');
        return new Response('OK');
      });

      await handle({ event: mockEvent, resolve: mockResolve });

      expect(executionOrder).toEqual(['rate-limit', 'session', 'resolve', 'csp']);
    });
  });
});
