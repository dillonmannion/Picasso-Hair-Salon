import { describe, it, expect, vi, beforeEach } from 'vitest';
import { redirect } from '@sveltejs/kit';
import type { RequestEvent, ResolveOptions } from '@sveltejs/kit';
import type { SupabaseClient } from '@supabase/supabase-js';

vi.mock('@sveltejs/kit', () => ({
  redirect: vi.fn((status, location) => {
    throw { status, location };
  }),
}));

import { authGuard } from '../../src/hooks/authGuard';

describe('Auth Guard Behavior', () => {
  let mockEvent: Partial<RequestEvent> & { url: URL; locals: App.Locals };
  let mockResolve: (event: RequestEvent, opts?: ResolveOptions) => Promise<Response> | Response;
  let mockSafeGetSession: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockResolve = vi.fn(async () => new Response('OK'));
    mockSafeGetSession = vi.fn();
    
    mockEvent = {
      url: new URL('http://localhost:5173/'),
      locals: {
        supabase: {} as unknown as SupabaseClient,
        safeGetSession: mockSafeGetSession,
        session: null,
        user: null,
      },
    } as Partial<RequestEvent> & { url: URL; locals: App.Locals };
  });

  describe('Protected routes', () => {
    it('should redirect unauthenticated users to login', async () => {
      mockEvent.url.pathname = '/protected/dashboard';
      mockSafeGetSession.mockResolvedValue({
        session: null,
        user: null,
      });

      await expect(authGuard({ event: mockEvent as RequestEvent, resolve: mockResolve })).rejects.toEqual({
        status: 303,
        location: '/auth/login',
      });

      expect(redirect).toHaveBeenCalledWith(303, '/auth/login');
      expect(mockEvent.locals.session).toBeNull();
      expect(mockEvent.locals.user).toBeNull();
    });

    it('should allow authenticated users through', async () => {
      const mockSession = { access_token: 'valid-token' };
      const mockUser = { id: 'user-123', email: 'test@example.com' };

      mockEvent.url.pathname = '/protected/dashboard';
      mockSafeGetSession.mockResolvedValue({
        session: mockSession,
        user: mockUser,
      });

      const response = await authGuard({ event: mockEvent as RequestEvent, resolve: mockResolve });

      expect(response).toBeInstanceOf(Response);
      expect(redirect).not.toHaveBeenCalled();
      expect(mockResolve).toHaveBeenCalledWith(mockEvent);
      expect(mockEvent.locals.session).toEqual(mockSession);
      expect(mockEvent.locals.user).toEqual(mockUser);
    });

    it('should protect all routes under /protected', async () => {
      const protectedRoutes = [
        '/protected',
        '/protected/',
        '/protected/profile',
        '/protected/settings',
        '/protected/admin/users',
      ];

      for (const route of protectedRoutes) {
        vi.clearAllMocks();
        mockEvent.url.pathname = route;
        mockSafeGetSession.mockResolvedValue({
          session: null,
          user: null,
        });

        await expect(authGuard({ event: mockEvent as RequestEvent, resolve: mockResolve })).rejects.toEqual({
          status: 303,
          location: '/auth/login',
        });
      }
    });
  });

  describe('Login page', () => {
    it('should redirect authenticated users to home', async () => {
      const mockSession = { access_token: 'valid-token' };
      const mockUser = { id: 'user-123', email: 'test@example.com' };

      mockEvent.url.pathname = '/auth/login';
      mockSafeGetSession.mockResolvedValue({
        session: mockSession,
        user: mockUser,
      });

      await expect(authGuard({ event: mockEvent as RequestEvent, resolve: mockResolve })).rejects.toEqual({
        status: 303,
        location: '/',
      });

      expect(redirect).toHaveBeenCalledWith(303, '/');
    });

    it('should allow unauthenticated users to access login', async () => {
      mockEvent.url.pathname = '/auth/login';
      mockSafeGetSession.mockResolvedValue({
        session: null,
        user: null,
      });

      const response = await authGuard({ event: mockEvent as RequestEvent, resolve: mockResolve });

      expect(response).toBeInstanceOf(Response);
      expect(redirect).not.toHaveBeenCalled();
    });
  });

  describe('Public routes', () => {
    it('should allow all users to access public routes', async () => {
      const publicRoutes = ['/', '/about', '/pricing', '/blog/post-1'];

      // Test unauthenticated access
      for (const route of publicRoutes) {
        vi.clearAllMocks();
        mockEvent.url.pathname = route;
        mockSafeGetSession.mockResolvedValue({
          session: null,
          user: null,
        });

        const response = await authGuard({ event: mockEvent as RequestEvent, resolve: mockResolve });
        expect(response).toBeInstanceOf(Response);
        expect(redirect).not.toHaveBeenCalled();
      }

      // Test authenticated access
      const mockSession = { access_token: 'valid-token' };
      const mockUser = { id: 'user-123', email: 'test@example.com' };

      for (const route of publicRoutes) {
        vi.clearAllMocks();
        mockEvent.url.pathname = route;
        mockSafeGetSession.mockResolvedValue({
          session: mockSession,
          user: mockUser,
        });

        const response = await authGuard({ event: mockEvent as RequestEvent, resolve: mockResolve });
        expect(response).toBeInstanceOf(Response);
        expect(redirect).not.toHaveBeenCalled();
      }
    });
  });

  describe('Edge cases', () => {
    it('should handle routes that start with /protected but are not protected', async () => {
      // The refactored implementation correctly checks for exact '/protected' or '/protected/' paths
      mockEvent.url.pathname = '/protectedinfo';
      mockSafeGetSession.mockResolvedValue({
        session: null,
        user: null,
      });

      const response = await authGuard({ event: mockEvent as RequestEvent, resolve: mockResolve });

      expect(response).toBeInstanceOf(Response);
      expect(redirect).not.toHaveBeenCalled();
    });

    it('should handle authentication paths other than login', async () => {
      const authPaths = ['/auth/callback', '/auth/logout', '/auth/register'];
      const mockSession = { access_token: 'valid-token' };
      const mockUser = { id: 'user-123', email: 'test@example.com' };

      for (const path of authPaths) {
        vi.clearAllMocks();
        mockEvent.url.pathname = path;
        mockSafeGetSession.mockResolvedValue({
          session: mockSession,
          user: mockUser,
        });

        const response = await authGuard({ event: mockEvent as RequestEvent, resolve: mockResolve });
        expect(response).toBeInstanceOf(Response);
        expect(redirect).not.toHaveBeenCalled();
      }
    });
  });
});
