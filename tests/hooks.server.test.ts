import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Handle, RequestEvent } from '@sveltejs/kit';
import { handle } from '../src/hooks.server';

// Mock modules
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn(),
      getUser: vi.fn()
    }
  }))
}));

// Mock environment variables
vi.mock('$env/static/public', () => ({
  PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key'
}));

// Mock authGuard to prevent it from interfering with our tests
vi.mock('../src/hooks/authGuard', () => ({
  authGuard: vi.fn(async ({ event, resolve }) => resolve(event))
}));

describe('Server Hooks - Authentication Setup', () => {
  let mockEvent: RequestEvent;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create a minimal mock event
    const cookies = {
      getAll: vi.fn(() => []),
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
      serialize: vi.fn()
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
      isSubRequest: false
    } as unknown as RequestEvent;
  });

  it('should create a Supabase client and attach it to event.locals', async () => {
    const mockResolve = vi.fn(async (event) => new Response('OK'));
    
    await handle({ event: mockEvent, resolve: mockResolve });

    expect(mockEvent.locals).toHaveProperty('supabase');
    expect(typeof mockEvent.locals.supabase).toBe('object');
    expect(mockEvent.locals.supabase).toHaveProperty('auth');
  });

  it('should provide a safeGetSession helper in event.locals', async () => {
    const mockResolve = vi.fn(async (event) => new Response('OK'));
    
    await handle({ event: mockEvent, resolve: mockResolve });

    expect(mockEvent.locals).toHaveProperty('safeGetSession');
    expect(typeof mockEvent.locals.safeGetSession).toBe('function');
  });

  it('should return null session when no auth session exists', async () => {
    const mockResolve = vi.fn(async (event) => new Response('OK'));
    
    await handle({ event: mockEvent, resolve: mockResolve });

    // Mock no session
    mockEvent.locals.supabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null
    });

    const result = await mockEvent.locals.safeGetSession();
    
    expect(result).toEqual({ session: null, user: null });
  });

  it('should validate session with getUser when session exists', async () => {
    const mockResolve = vi.fn(async (event) => new Response('OK'));
    
    await handle({ event: mockEvent, resolve: mockResolve });

    const mockSession = {
      access_token: 'test-token',
      refresh_token: 'test-refresh',
      expires_in: 3600,
      token_type: 'bearer',
      user: { id: 'user-123', email: 'test@example.com' }
    };

    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      app_metadata: { role: 'customer' }
    };

    // Mock session exists
    mockEvent.locals.supabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null
    });

    // Mock user validation
    mockEvent.locals.supabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    });

    const result = await mockEvent.locals.safeGetSession();
    
    expect(result).toEqual({ session: mockSession, user: mockUser });
    expect(mockEvent.locals.supabase.auth.getUser).toHaveBeenCalled();
  });

  it('should return null when getUser fails even with valid session', async () => {
    const mockResolve = vi.fn(async (event) => new Response('OK'));
    
    await handle({ event: mockEvent, resolve: mockResolve });

    const mockSession = {
      access_token: 'test-token',
      refresh_token: 'test-refresh',
      expires_in: 3600,
      token_type: 'bearer',
      user: { id: 'user-123', email: 'test@example.com' }
    };

    // Mock session exists
    mockEvent.locals.supabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null
    });

    // Mock user validation fails
    mockEvent.locals.supabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: new Error('Invalid token')
    });

    const result = await mockEvent.locals.safeGetSession();
    
    expect(result).toEqual({ session: null, user: null });
  });

  it('should properly handle cookies with Supabase client', async () => {
    const { createServerClient } = await import('@supabase/ssr');
    const mockResolve = vi.fn(async (event) => new Response('OK'));
    
    await handle({ event: mockEvent, resolve: mockResolve });

    // Verify createServerClient was called with proper cookie handlers
    expect(createServerClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-anon-key',
      expect.objectContaining({
        cookies: expect.objectContaining({
          getAll: expect.any(Function),
          setAll: expect.any(Function)
        })
      })
    );
  });

  it('should call resolve with the event after setup', async () => {
    const mockResolve = vi.fn(async (event) => new Response('OK'));
    
    const response = await handle({ event: mockEvent, resolve: mockResolve });

    expect(mockResolve).toHaveBeenCalledWith(mockEvent);
    expect(response).toBeInstanceOf(Response);
  });
});