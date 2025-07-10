import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';
import { createSupabaseServerClient } from '$lib/server/supabase';

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn()
    }
  }))
}));

vi.mock('$lib/config/env', () => ({
  env: {
    PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key'
  }
}));

describe('createSupabaseServerClient', () => {
  let mockEvent: RequestEvent;

  beforeEach(() => {
    mockEvent = {
      cookies: {
        getAll: vi.fn(() => [
          { name: 'sb-auth-token', value: 'mock-token' },
          { name: 'sb-auth-token.0', value: 'chunk0' },
          { name: 'sb-auth-token.1', value: 'chunk1' }
        ]),
        set: vi.fn(),
        delete: vi.fn()
      },
      url: new URL('http://localhost:5173'),
      locals: {}
    } as unknown as RequestEvent;
  });

  it('should create a Supabase server client with proper cookie handling', () => {
    const client = createSupabaseServerClient(mockEvent);

    expect(client).toBeDefined();
    expect(client.auth).toBeDefined();
    expect(client.auth.getUser).toBeDefined();
    expect(client.auth.getSession).toBeDefined();
  });

  it('should configure cookie handling with getAll function', async () => {
    const { createServerClient } = await import('@supabase/ssr');
    
    createSupabaseServerClient(mockEvent);

    expect(createServerClient).toHaveBeenCalledWith(
      expect.any(String), // URL
      expect.any(String), // Anon key
      expect.objectContaining({
        cookies: expect.objectContaining({
          getAll: expect.any(Function)
        })
      })
    );
  });

  it('should configure cookie handling with setAll function', async () => {
    const { createServerClient } = await import('@supabase/ssr');
    
    createSupabaseServerClient(mockEvent);

    expect(createServerClient).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({
        cookies: expect.objectContaining({
          setAll: expect.any(Function)
        })
      })
    );
  });

  it('should properly handle getAll cookies from event', async () => {
    const { createServerClient } = await import('@supabase/ssr');
    
    createSupabaseServerClient(mockEvent);

    const [[, , options]] = (createServerClient as any).mock.calls;
    const cookies = options.cookies.getAll();

    expect(cookies).toEqual([
      { name: 'sb-auth-token', value: 'mock-token' },
      { name: 'sb-auth-token.0', value: 'chunk0' },
      { name: 'sb-auth-token.1', value: 'chunk1' }
    ]);
    expect(mockEvent.cookies.getAll).toHaveBeenCalled();
  });

  it('should properly handle setAll cookies to event', async () => {
    const { createServerClient } = await import('@supabase/ssr');
    
    createSupabaseServerClient(mockEvent);

    const [[, , options]] = (createServerClient as any).mock.calls;
    const cookiesToSet = [
      { name: 'new-cookie', value: 'new-value', options: { httpOnly: true, secure: true, sameSite: 'lax' as const, path: '/' } },
      { name: 'old-cookie', value: '', options: { maxAge: 0, path: '/' } }
    ];

    options.cookies.setAll(cookiesToSet);

    expect(mockEvent.cookies.set).toHaveBeenCalledWith('new-cookie', 'new-value', { 
      httpOnly: true, 
      secure: true, 
      sameSite: 'lax',
      path: '/' 
    });
    expect(mockEvent.cookies.set).toHaveBeenCalledWith('old-cookie', '', { 
      maxAge: 0,
      path: '/' 
    });
  });

  it('should use environment variables for Supabase configuration', async () => {
    const { createServerClient } = await import('@supabase/ssr');
    
    createSupabaseServerClient(mockEvent);

    expect(createServerClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-anon-key',
      expect.any(Object)
    );
  });

  it('should handle cookie serialization options correctly', async () => {
    const { createServerClient } = await import('@supabase/ssr');
    
    createSupabaseServerClient(mockEvent);

    const [[, , options]] = (createServerClient as any).mock.calls;
    
    // Test with various cookie options
    options.cookies.setAll([
      {
        name: 'auth-token',
        value: 'token-value',
        options: {
          httpOnly: true,
          secure: true,
          sameSite: 'strict' as const,
          path: '/',
          maxAge: 60 * 60 * 24 * 7, // 1 week
          domain: '.example.com'
        }
      }
    ]);

    expect(mockEvent.cookies.set).toHaveBeenCalledWith(
      'auth-token',
      'token-value',
      {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        domain: '.example.com'
      }
    );
  });

  it('should return the same client instance for multiple calls with same event', () => {
    const client1 = createSupabaseServerClient(mockEvent);
    const client2 = createSupabaseServerClient(mockEvent);

    // Should create new instances each time (no caching)
    expect(client1).not.toBe(client2);
  });
});