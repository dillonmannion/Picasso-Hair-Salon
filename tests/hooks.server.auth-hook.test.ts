import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';
import type { Session, User } from '@supabase/supabase-js';
import { handle } from '../src/hooks.server';

// Mock the rate limiter
vi.mock('$lib/security/rate-limiter', () => ({
  checkRateLimit: vi.fn()
}));

// Mock the CSP handler
vi.mock('$lib/security/csp', () => ({
  applyCSPHeaders: vi.fn()
}));

// Mock the session manager
vi.mock('$lib/server/auth/session', () => ({
  validateAndPopulateSession: vi.fn()
}));

// Mock environment variables
vi.mock('$env/static/public', () => ({
  PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
}));

describe('Authentication Hook - Complete Implementation', () => {
  let mockEvent: RequestEvent;
  let mockCheckRateLimit: ReturnType<typeof vi.fn>;
  let mockApplyCSPHeaders: ReturnType<typeof vi.fn>;
  let mockValidateAndPopulateSession: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Get mocked functions
    const rateLimiter = await import('$lib/security/rate-limiter');
    mockCheckRateLimit = rateLimiter.checkRateLimit as ReturnType<typeof vi.fn>;
    
    const csp = await import('$lib/security/csp');
    mockApplyCSPHeaders = csp.applyCSPHeaders as ReturnType<typeof vi.fn>;
    
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
      mockCheckRateLimit.mockReturnValue(true);
      mockApplyCSPHeaders.mockImplementation((response: Response) => response);
      mockValidateAndPopulateSession.mockResolvedValue(undefined);
      
      const mockResolve = vi.fn(async () => new Response('OK'));

      await handle({ event: mockEvent, resolve: mockResolve });

      expect(mockCheckRateLimit).toHaveBeenCalledWith('127.0.0.1');
    });

    it('should return 429 when rate limit is exceeded', async () => {
      mockCheckRateLimit.mockReturnValue(false);
      
      const mockResolve = vi.fn(async () => new Response('OK'));

      const response = await handle({ event: mockEvent, resolve: mockResolve });

      expect(response.status).toBe(429);
      expect(await response.text()).toContain('Too many requests');
      expect(mockResolve).not.toHaveBeenCalled();
    });

    it('should continue processing when rate limit is not exceeded', async () => {
      mockCheckRateLimit.mockReturnValue(true);
      mockApplyCSPHeaders.mockImplementation((response: Response) => response);
      mockValidateAndPopulateSession.mockResolvedValue(undefined);
      
      const mockResolve = vi.fn(async () => new Response('OK'));

      const response = await handle({ event: mockEvent, resolve: mockResolve });

      expect(response.status).toBe(200);
      expect(mockResolve).toHaveBeenCalled();
    });
  });

  describe('Session Validation', () => {
    it('should validate and populate session for all requests', async () => {
      mockCheckRateLimit.mockReturnValue(true);
      mockApplyCSPHeaders.mockImplementation((response: Response) => response);
      mockValidateAndPopulateSession.mockResolvedValue(undefined);
      
      const mockResolve = vi.fn(async () => new Response('OK'));

      await handle({ event: mockEvent, resolve: mockResolve });

      expect(mockValidateAndPopulateSession).toHaveBeenCalledWith(mockEvent);
    });

    it('should populate event.locals.user when session is valid', async () => {
      mockCheckRateLimit.mockReturnValue(true);
      mockApplyCSPHeaders.mockImplementation((response: Response) => response);
      
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'customer',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString()
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
      mockCheckRateLimit.mockReturnValue(true);
      mockApplyCSPHeaders.mockImplementation((response: Response) => response);
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
      mockCheckRateLimit.mockReturnValue(true);
      mockApplyCSPHeaders.mockImplementation((response: Response) => response);
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
          expect((error as { location: string }).location).toBe(`/auth/login?redirectTo=${encodeURIComponent(route)}`);
          expect(mockResolve).not.toHaveBeenCalled();
        }
      }
    });

    it('should allow access to protected routes with authentication', async () => {
      mockCheckRateLimit.mockReturnValue(true);
      mockApplyCSPHeaders.mockImplementation((response: Response) => response);
      
      // User is authenticated
      mockValidateAndPopulateSession.mockImplementation(async (event: RequestEvent) => {
        event.locals.user = {
          id: 'user-123',
          email: 'test@example.com',
          role: 'customer',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString()
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
      mockCheckRateLimit.mockReturnValue(true);
      mockApplyCSPHeaders.mockImplementation((response: Response) => response);
      
      // User is authenticated but not admin
      mockValidateAndPopulateSession.mockImplementation(async (event: RequestEvent) => {
        event.locals.user = {
          id: 'user-123',
          email: 'test@example.com',
          role: 'customer',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString()
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
      mockCheckRateLimit.mockReturnValue(true);
      mockApplyCSPHeaders.mockImplementation((response: Response) => response);
      
      // User is admin
      mockValidateAndPopulateSession.mockImplementation(async (event: RequestEvent) => {
        event.locals.user = {
          id: 'admin-123',
          email: 'admin@example.com',
          role: 'admin',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString()
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
      mockCheckRateLimit.mockReturnValue(true);
      mockValidateAndPopulateSession.mockResolvedValue(undefined);
      
      const mockResponse = new Response('OK');
      mockApplyCSPHeaders.mockReturnValue(mockResponse);
      
      const mockResolve = vi.fn(async () => new Response('OK'));

      await handle({ event: mockEvent, resolve: mockResolve });

      expect(mockApplyCSPHeaders).toHaveBeenCalled();
    });

    it('should pass development flag based on NODE_ENV', async () => {
      mockCheckRateLimit.mockReturnValue(true);
      mockValidateAndPopulateSession.mockResolvedValue(undefined);
      
      const originalEnv = process.env.NODE_ENV;
      
      // Test development mode
      process.env.NODE_ENV = 'development';
      mockApplyCSPHeaders.mockImplementation((response: Response) => response);
      
      const mockResolve = vi.fn(async () => new Response('OK'));
      await handle({ event: mockEvent, resolve: mockResolve });
      
      expect(mockApplyCSPHeaders).toHaveBeenCalledWith(
        expect.any(Response),
        { isDevelopment: true }
      );
      
      // Test production mode
      process.env.NODE_ENV = 'production';
      vi.clearAllMocks();
      
      await handle({ event: mockEvent, resolve: mockResolve });
      
      expect(mockApplyCSPHeaders).toHaveBeenCalledWith(
        expect.any(Response),
        { isDevelopment: false }
      );
      
      // Restore original env
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Hook Sequence', () => {
    it('should execute hooks in correct order: rate limit -> session -> auth guard -> CSP', async () => {
      const executionOrder: string[] = [];
      
      mockCheckRateLimit.mockImplementation(() => {
        executionOrder.push('rate-limit');
        return true;
      });
      
      mockValidateAndPopulateSession.mockImplementation(async () => {
        executionOrder.push('session');
      });
      
      mockApplyCSPHeaders.mockImplementation((response: Response) => {
        executionOrder.push('csp');
        return response;
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