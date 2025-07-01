import { describe, it, expect, vi, beforeEach } from 'vitest';
import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';

vi.mock('@sveltejs/kit', () => ({
  redirect: vi.fn((status, location) => {
    throw { status, location };
  })
}));

import { authGuard } from '../../src/hooks/authGuard';

describe('Auth Guard Behavior', () => {
  let mockEvent: any;
  let mockResolve: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockResolve = vi.fn(async () => new Response('OK'));
    
    mockEvent = {
      url: new URL('http://localhost:5173/'),
      locals: {
        safeGetSession: vi.fn()
      }
    };
  });

  describe('Protected routes', () => {
    it('should redirect unauthenticated users to login', async () => {
      mockEvent.url.pathname = '/protected/dashboard';
      mockEvent.locals.safeGetSession.mockResolvedValue({ 
        session: null, 
        user: null 
      });

      await expect(authGuard({ event: mockEvent, resolve: mockResolve })).rejects.toEqual({
        status: 303,
        location: '/auth/login'
      });

      expect(redirect).toHaveBeenCalledWith(303, '/auth/login');
      expect(mockEvent.locals.session).toBeNull();
      expect(mockEvent.locals.user).toBeNull();
    });

    it('should allow authenticated users through', async () => {
      const mockSession = { access_token: 'valid-token' };
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      
      mockEvent.url.pathname = '/protected/dashboard';
      mockEvent.locals.safeGetSession.mockResolvedValue({ 
        session: mockSession, 
        user: mockUser 
      });

      const response = await authGuard({ event: mockEvent, resolve: mockResolve });
      
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
        '/protected/admin/users'
      ];

      for (const route of protectedRoutes) {
        vi.clearAllMocks();
        mockEvent.url.pathname = route;
        mockEvent.locals.safeGetSession.mockResolvedValue({ 
          session: null, 
          user: null 
        });

        await expect(authGuard({ event: mockEvent, resolve: mockResolve })).rejects.toEqual({
          status: 303,
          location: '/auth/login'
        });
      }
    });
  });

  describe('Login page', () => {
    it('should redirect authenticated users to home', async () => {
      const mockSession = { access_token: 'valid-token' };
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      
      mockEvent.url.pathname = '/auth/login';
      mockEvent.locals.safeGetSession.mockResolvedValue({ 
        session: mockSession, 
        user: mockUser 
      });

      await expect(authGuard({ event: mockEvent, resolve: mockResolve })).rejects.toEqual({
        status: 303,
        location: '/'
      });

      expect(redirect).toHaveBeenCalledWith(303, '/');
    });

    it('should allow unauthenticated users to access login', async () => {
      mockEvent.url.pathname = '/auth/login';
      mockEvent.locals.safeGetSession.mockResolvedValue({ 
        session: null, 
        user: null 
      });

      const response = await authGuard({ event: mockEvent, resolve: mockResolve });
      
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
        mockEvent.locals.safeGetSession.mockResolvedValue({ 
          session: null, 
          user: null 
        });

        const response = await authGuard({ event: mockEvent, resolve: mockResolve });
        expect(response).toBeInstanceOf(Response);
        expect(redirect).not.toHaveBeenCalled();
      }

      // Test authenticated access
      const mockSession = { access_token: 'valid-token' };
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      
      for (const route of publicRoutes) {
        vi.clearAllMocks();
        mockEvent.url.pathname = route;
        mockEvent.locals.safeGetSession.mockResolvedValue({ 
          session: mockSession, 
          user: mockUser 
        });

        const response = await authGuard({ event: mockEvent, resolve: mockResolve });
        expect(response).toBeInstanceOf(Response);
        expect(redirect).not.toHaveBeenCalled();
      }
    });
  });

  describe('Edge cases', () => {
    it('should handle routes that start with /protected but are not protected', async () => {
      // The refactored implementation correctly checks for exact '/protected' or '/protected/' paths
      mockEvent.url.pathname = '/protectedinfo';
      mockEvent.locals.safeGetSession.mockResolvedValue({ 
        session: null, 
        user: null 
      });

      const response = await authGuard({ event: mockEvent, resolve: mockResolve });
      
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
        mockEvent.locals.safeGetSession.mockResolvedValue({ 
          session: mockSession, 
          user: mockUser 
        });

        const response = await authGuard({ event: mockEvent, resolve: mockResolve });
        expect(response).toBeInstanceOf(Response);
        expect(redirect).not.toHaveBeenCalled();
      }
    });
  });
});