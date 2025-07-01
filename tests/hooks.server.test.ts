import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handle } from '../src/hooks.server';
import { redirect } from '@sveltejs/kit';

vi.mock('@sveltejs/kit', () => ({
  redirect: vi.fn((status, location) => {
    throw { status, location };
  }),
  sequence: vi.fn((supabase, authGuard) => {
    return async ({ event, resolve }) => {
      await supabase({ event, resolve });
      return authGuard({ event, resolve });
    };
  })
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn(),
      getUser: vi.fn()
    }
  }))
}));

describe('Authentication Guard', () => {
  let mockEvent: any;
  let mockResolve: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockResolve = vi.fn(async (event) => new Response('OK'));
    
    mockEvent = {
      url: new URL('http://localhost:5173/'),
      cookies: {
        getAll: vi.fn(() => []),
        set: vi.fn()
      },
      locals: {}
    };
  });

  describe('Protected route access', () => {
    it('should redirect unauthenticated users to login when accessing protected routes', async () => {
      mockEvent.url = new URL('http://localhost:5173/protected/dashboard');
      mockEvent.locals.supabase = {
        auth: {
          getSession: vi.fn().mockResolvedValue({ data: { session: null } })
        }
      };
      mockEvent.locals.safeGetSession = vi.fn().mockResolvedValue({ 
        session: null, 
        user: null 
      });

      await expect(handle({ event: mockEvent, resolve: mockResolve })).rejects.toEqual({
        status: 303,
        location: '/auth/login'
      });

      expect(redirect).toHaveBeenCalledWith(303, '/auth/login');
    });

    it('should allow authenticated users to access protected routes', async () => {
      const mockSession = { access_token: 'token-123' };
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      
      mockEvent.url = new URL('http://localhost:5173/protected/dashboard');
      mockEvent.locals.supabase = {
        auth: {
          getSession: vi.fn().mockResolvedValue({ data: { session: mockSession } }),
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null })
        }
      };
      mockEvent.locals.safeGetSession = vi.fn().mockResolvedValue({ 
        session: mockSession, 
        user: mockUser 
      });

      const response = await handle({ event: mockEvent, resolve: mockResolve });
      
      expect(response).toBeInstanceOf(Response);
      expect(redirect).not.toHaveBeenCalled();
      expect(mockResolve).toHaveBeenCalledWith(mockEvent);
    });
  });

  describe('Login page access', () => {
    it('should redirect authenticated users away from login page', async () => {
      const mockSession = { access_token: 'token-123' };
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      
      mockEvent.url = new URL('http://localhost:5173/auth/login');
      mockEvent.locals.supabase = {
        auth: {
          getSession: vi.fn().mockResolvedValue({ data: { session: mockSession } }),
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null })
        }
      };
      mockEvent.locals.safeGetSession = vi.fn().mockResolvedValue({ 
        session: mockSession, 
        user: mockUser 
      });

      await expect(handle({ event: mockEvent, resolve: mockResolve })).rejects.toEqual({
        status: 303,
        location: '/'
      });

      expect(redirect).toHaveBeenCalledWith(303, '/');
    });

    it('should allow unauthenticated users to access login page', async () => {
      mockEvent.url = new URL('http://localhost:5173/auth/login');
      mockEvent.locals.supabase = {
        auth: {
          getSession: vi.fn().mockResolvedValue({ data: { session: null } })
        }
      };
      mockEvent.locals.safeGetSession = vi.fn().mockResolvedValue({ 
        session: null, 
        user: null 
      });

      const response = await handle({ event: mockEvent, resolve: mockResolve });
      
      expect(response).toBeInstanceOf(Response);
      expect(redirect).not.toHaveBeenCalled();
    });
  });

  describe('Public route access', () => {
    it('should allow unauthenticated users to access public routes', async () => {
      mockEvent.url = new URL('http://localhost:5173/about');
      mockEvent.locals.supabase = {
        auth: {
          getSession: vi.fn().mockResolvedValue({ data: { session: null } })
        }
      };
      mockEvent.locals.safeGetSession = vi.fn().mockResolvedValue({ 
        session: null, 
        user: null 
      });

      const response = await handle({ event: mockEvent, resolve: mockResolve });
      
      expect(response).toBeInstanceOf(Response);
      expect(redirect).not.toHaveBeenCalled();
    });

    it('should allow authenticated users to access public routes', async () => {
      const mockSession = { access_token: 'token-123' };
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      
      mockEvent.url = new URL('http://localhost:5173/about');
      mockEvent.locals.supabase = {
        auth: {
          getSession: vi.fn().mockResolvedValue({ data: { session: mockSession } }),
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null })
        }
      };
      mockEvent.locals.safeGetSession = vi.fn().mockResolvedValue({ 
        session: mockSession, 
        user: mockUser 
      });

      const response = await handle({ event: mockEvent, resolve: mockResolve });
      
      expect(response).toBeInstanceOf(Response);
      expect(redirect).not.toHaveBeenCalled();
    });
  });

  describe('Session validation', () => {
    it('should treat invalid JWT sessions as unauthenticated', async () => {
      mockEvent.url = new URL('http://localhost:5173/protected/profile');
      mockEvent.locals.supabase = {
        auth: {
          getSession: vi.fn().mockResolvedValue({ 
            data: { session: { access_token: 'invalid-token' } } 
          }),
          getUser: vi.fn().mockResolvedValue({ 
            data: { user: null }, 
            error: new Error('Invalid JWT') 
          })
        }
      };
      mockEvent.locals.safeGetSession = vi.fn().mockResolvedValue({ 
        session: null, 
        user: null 
      });

      await expect(handle({ event: mockEvent, resolve: mockResolve })).rejects.toEqual({
        status: 303,
        location: '/auth/login'
      });
    });

    it('should populate locals with session and user data', async () => {
      const mockSession = { access_token: 'token-123' };
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      
      mockEvent.url = new URL('http://localhost:5173/');
      mockEvent.locals.supabase = {
        auth: {
          getSession: vi.fn().mockResolvedValue({ data: { session: mockSession } }),
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null })
        }
      };
      mockEvent.locals.safeGetSession = vi.fn().mockResolvedValue({ 
        session: mockSession, 
        user: mockUser 
      });

      await handle({ event: mockEvent, resolve: mockResolve });
      
      expect(mockEvent.locals.session).toEqual(mockSession);
      expect(mockEvent.locals.user).toEqual(mockUser);
    });
  });
});