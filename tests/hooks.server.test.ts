import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handle } from '../src/hooks.server';
import { redirect } from '@sveltejs/kit';
import { createServerClient } from '@supabase/ssr';

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
  createServerClient: vi.fn()
}));

vi.mock('$env/static/public', () => ({
  PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key'
}));

describe('Authentication Guard', () => {
  let mockEvent: any;
  let mockResolve: any;
  let mockSupabaseClient: any;
  let mockGetSession: any;
  let mockGetUser: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockResolve = vi.fn(async (event) => new Response('OK'));
    
    mockGetSession = vi.fn();
    mockGetUser = vi.fn();
    
    mockSupabaseClient = {
      auth: {
        getSession: mockGetSession,
        getUser: mockGetUser
      }
    };
    
    // Configure the createServerClient mock
    vi.mocked(createServerClient).mockReturnValue(mockSupabaseClient);
    
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
      
      // Configure mocks for unauthenticated user
      mockGetSession.mockResolvedValue({ data: { session: null } });

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
      
      // Configure mocks for authenticated user
      mockGetSession.mockResolvedValue({ data: { session: mockSession } });
      mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });

      const response = await handle({ event: mockEvent, resolve: mockResolve });
      
      expect(response).toBeInstanceOf(Response);
      expect(redirect).not.toHaveBeenCalled();
      expect(mockResolve).toHaveBeenCalled();
    });
  });

  describe('Login page access', () => {
    it('should redirect authenticated users away from login page', async () => {
      const mockSession = { access_token: 'token-123' };
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      
      mockEvent.url = new URL('http://localhost:5173/auth/login');
      
      // Configure mocks for authenticated user
      mockGetSession.mockResolvedValue({ data: { session: mockSession } });
      mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });

      await expect(handle({ event: mockEvent, resolve: mockResolve })).rejects.toEqual({
        status: 303,
        location: '/'
      });

      expect(redirect).toHaveBeenCalledWith(303, '/');
    });

    it('should allow unauthenticated users to access login page', async () => {
      mockEvent.url = new URL('http://localhost:5173/auth/login');
      
      // Configure mocks for unauthenticated user
      mockGetSession.mockResolvedValue({ data: { session: null } });

      const response = await handle({ event: mockEvent, resolve: mockResolve });
      
      expect(response).toBeInstanceOf(Response);
      expect(redirect).not.toHaveBeenCalled();
    });
  });

  describe('Public route access', () => {
    it('should allow unauthenticated users to access public routes', async () => {
      mockEvent.url = new URL('http://localhost:5173/about');
      
      // Configure mocks for unauthenticated user
      mockGetSession.mockResolvedValue({ data: { session: null } });

      const response = await handle({ event: mockEvent, resolve: mockResolve });
      
      expect(response).toBeInstanceOf(Response);
      expect(redirect).not.toHaveBeenCalled();
    });

    it('should allow authenticated users to access public routes', async () => {
      const mockSession = { access_token: 'token-123' };
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      
      mockEvent.url = new URL('http://localhost:5173/about');
      
      // Configure mocks for authenticated user
      mockGetSession.mockResolvedValue({ data: { session: mockSession } });
      mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });

      const response = await handle({ event: mockEvent, resolve: mockResolve });
      
      expect(response).toBeInstanceOf(Response);
      expect(redirect).not.toHaveBeenCalled();
    });
  });

  describe('Session validation', () => {
    it('should treat invalid JWT sessions as unauthenticated', async () => {
      mockEvent.url = new URL('http://localhost:5173/protected/profile');
      
      // Configure mocks for invalid JWT
      mockGetSession.mockResolvedValue({ 
        data: { session: { access_token: 'invalid-token' } } 
      });
      mockGetUser.mockResolvedValue({ 
        data: { user: null }, 
        error: new Error('Invalid JWT') 
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
      
      // Configure mocks for authenticated user
      mockGetSession.mockResolvedValue({ data: { session: mockSession } });
      mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });

      await handle({ event: mockEvent, resolve: mockResolve });
      
      expect(mockEvent.locals.session).toEqual(mockSession);
      expect(mockEvent.locals.user).toEqual(mockUser);
    });
  });
});