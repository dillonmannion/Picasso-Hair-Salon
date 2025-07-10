import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../../../../src/routes/auth/callback/+server';
import { redirect } from '@sveltejs/kit';
import type { SupabaseClient } from '@supabase/supabase-js';

// Mock @sveltejs/kit
vi.mock('@sveltejs/kit', () => ({
  redirect: vi.fn((status, location) => {
    throw { status, location };
  }),
}));

// Mock Supabase client
const mockExchangeCodeForSession = vi.fn();
const mockSupabase = {
  auth: {
    exchangeCodeForSession: mockExchangeCodeForSession,
  },
} as unknown as SupabaseClient;

// Type for mock request event - use the parameter type of GET
type MockRequestEvent = Parameters<typeof GET>[0];

describe('OAuth Callback Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should exchange code for session and redirect to home on success', async () => {
    const mockCode = 'test-auth-code';
    const mockSession = {
      user: { id: 'user-123', email: 'test@example.com' },
      access_token: 'token-123',
      refresh_token: 'refresh-123',
    };

    mockExchangeCodeForSession.mockResolvedValueOnce({
      data: {
        session: mockSession,
        user: mockSession.user,
      },
      error: null,
    });

    const mockEvent = {
      url: new URL(`http://localhost:5173/auth/callback?code=${mockCode}`),
      locals: {
        supabase: mockSupabase,
      },
    };

    await expect(GET(mockEvent as unknown as MockRequestEvent)).rejects.toEqual({
      status: 303,
      location: '/',
    });

    expect(mockExchangeCodeForSession).toHaveBeenCalledWith(mockCode);
    expect(redirect).toHaveBeenCalledWith(303, '/');
  });

  it('should redirect with next parameter if provided', async () => {
    const mockCode = 'test-auth-code';
    const nextPath = '/protected/dashboard';
    const mockSession = {
      user: { id: 'user-123', email: 'test@example.com' },
      access_token: 'token-123',
      refresh_token: 'refresh-123',
    };

    mockExchangeCodeForSession.mockResolvedValueOnce({
      data: {
        session: mockSession,
        user: mockSession.user,
      },
      error: null,
    });

    const mockEvent = {
      url: new URL(
        `http://localhost:5173/auth/callback?code=${mockCode}&next=${encodeURIComponent(nextPath)}`
      ),
      locals: {
        supabase: mockSupabase,
      },
    };

    await expect(GET(mockEvent as unknown as MockRequestEvent)).rejects.toEqual({
      status: 303,
      location: nextPath,
    });

    expect(mockExchangeCodeForSession).toHaveBeenCalledWith(mockCode);
    expect(redirect).toHaveBeenCalledWith(303, nextPath);
  });

  it('should redirect to login with error when no code is provided', async () => {
    const mockEvent = {
      url: new URL('http://localhost:5173/auth/callback'),
      locals: {
        supabase: mockSupabase,
      },
    };

    await expect(GET(mockEvent as unknown as MockRequestEvent)).rejects.toEqual({
      status: 303,
      location: '/auth/login?error=no_code',
    });

    expect(mockExchangeCodeForSession).not.toHaveBeenCalled();
  });

  it('should redirect to login with error when exchange fails', async () => {
    const mockCode = 'test-auth-code';

    mockExchangeCodeForSession.mockResolvedValueOnce({
      data: { session: null },
      error: new Error('Invalid authorization code'),
    });

    const mockEvent = {
      url: new URL(`http://localhost:5173/auth/callback?code=${mockCode}`),
      locals: {
        supabase: mockSupabase,
      },
    };

    await expect(GET(mockEvent as unknown as MockRequestEvent)).rejects.toEqual({
      status: 303,
      location: '/auth/login?error=auth_failed',
    });

    expect(mockExchangeCodeForSession).toHaveBeenCalledWith(mockCode);
  });

  it('should handle OAuth errors from provider', async () => {
    const mockEvent = {
      url: new URL(
        'http://localhost:5173/auth/callback?error=access_denied&error_description=User+denied+access'
      ),
      locals: {
        supabase: mockSupabase,
      },
    };

    await expect(GET(mockEvent as unknown as MockRequestEvent)).rejects.toEqual({
      status: 303,
      location: '/auth/login?error=access_denied',
    });

    expect(mockExchangeCodeForSession).not.toHaveBeenCalled();
  });

  it('should validate and sanitize next parameter to prevent open redirects', async () => {
    const mockCode = 'test-auth-code';
    const maliciousNext = 'https://evil.com/phishing';
    const mockSession = {
      user: { id: 'user-123', email: 'test@example.com' },
      access_token: 'token-123',
      refresh_token: 'refresh-123',
    };

    mockExchangeCodeForSession.mockResolvedValueOnce({
      data: {
        session: mockSession,
        user: mockSession.user,
      },
      error: null,
    });

    const mockEvent = {
      url: new URL(
        `http://localhost:5173/auth/callback?code=${mockCode}&next=${encodeURIComponent(maliciousNext)}`
      ),
      locals: {
        supabase: mockSupabase,
      },
    };

    await expect(GET(mockEvent as unknown as MockRequestEvent)).rejects.toEqual({
      status: 303,
      location: '/', // Should redirect to home instead of malicious URL
    });
  });
});
