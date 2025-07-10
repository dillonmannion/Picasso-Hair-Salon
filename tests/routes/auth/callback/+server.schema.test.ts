import { describe, it, expect, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { GET } from '../../../../src/routes/auth/callback/server-schema';
import {
  createMockOAuthCallback,
  createMockOAuthError,
  createMockProfile,
} from '$lib/test-utils/factories';

type MockRequestEvent = Parameters<typeof GET>[0];

vi.mock('@sveltejs/kit', () => ({
  redirect: vi.fn((status, location) => {
    throw { status, location };
  }),
}));


describe('OAuth callback with schema validation', () => {
  it('should validate and parse callback parameters with schemas', async () => {
    const mockParams = createMockOAuthCallback({
      code: 'valid_auth_code',
      next: '/dashboard',
    });

    const mockLocals = {
      supabase: {
        auth: {
          exchangeCodeForSession: vi.fn().mockResolvedValue({
            data: {
              session: { access_token: 'token' },
              user: createMockProfile(),
            },
            error: null,
          }),
        },
      } as unknown as SupabaseClient,
      safeGetSession: vi.fn().mockResolvedValue({ session: null, user: null }),
      session: null,
      user: null,
    };

    const url = new URL(
      `http://localhost/auth/callback?code=${mockParams.code}&next=${mockParams.next}`
    );
    const mockEvent: MockRequestEvent = { url, locals: mockLocals } as unknown as MockRequestEvent;

    await expect(GET(mockEvent)).rejects.toEqual({
      status: 303,
      location: '/dashboard',
    });

    expect(mockLocals.supabase.auth.exchangeCodeForSession).toHaveBeenCalledWith('valid_auth_code');
  });

  it('should handle missing code with schema validation error', async () => {
    const url = new URL('http://localhost/auth/callback?next=/dashboard');
    const mockEvent = { 
      url, 
      locals: { 
        supabase: {} as unknown as SupabaseClient,
        safeGetSession: vi.fn().mockResolvedValue({ session: null, user: null }),
        session: null,
        user: null,
      } 
    };

    await expect(GET(mockEvent as unknown as MockRequestEvent)).rejects.toEqual({
      status: 303,
      location: '/auth/login?error=invalid_request&message=Authorization%20code%20is%20required',
    });
  });

  it('should handle OAuth error parameters with schema', async () => {
    const mockError = createMockOAuthError({
      error: 'access_denied',
      error_description: 'User denied access',
    });

    const url = new URL(
      `http://localhost/auth/callback?error=${mockError.error}&error_description=${encodeURIComponent(mockError.error_description!)}`
    );
    const mockEvent = { 
      url, 
      locals: { 
        supabase: {} as unknown as SupabaseClient,
        safeGetSession: vi.fn().mockResolvedValue({ session: null, user: null }),
        session: null,
        user: null,
      } 
    };

    await expect(GET(mockEvent as unknown as MockRequestEvent)).rejects.toEqual({
      status: 303,
      location: '/auth/login?error=access_denied&message=User%20denied%20access',
    });
  });

  it('should validate next parameter for security', async () => {
    const mockParams = createMockOAuthCallback({
      code: 'valid_auth_code',
      next: 'https://malicious.com', // Invalid external URL
    });

    const mockLocals = {
      supabase: {
        auth: {
          exchangeCodeForSession: vi.fn().mockResolvedValue({
            data: {
              session: { access_token: 'token' },
              user: createMockProfile(),
            },
            error: null,
          }),
        },
      } as unknown as SupabaseClient,
      safeGetSession: vi.fn().mockResolvedValue({ session: null, user: null }),
      session: null,
      user: null,
    };

    const url = new URL(
      `http://localhost/auth/callback?code=${mockParams.code}&next=${encodeURIComponent(mockParams.next || '')}`
    );
    const mockEvent = { url, locals: mockLocals };

    await expect(GET(mockEvent as unknown as MockRequestEvent)).rejects.toEqual({
      status: 303,
      location: '/', // Should redirect to home, not the malicious URL
    });
  });

  it('should handle supabase exchange errors gracefully', async () => {
    const mockParams = createMockOAuthCallback({ code: 'invalid_code' });

    const mockLocals = {
      supabase: {
        auth: {
          exchangeCodeForSession: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Invalid authorization code', status: 400 },
          }),
        },
      } as unknown as SupabaseClient,
      safeGetSession: vi.fn().mockResolvedValue({ session: null, user: null }),
      session: null,
      user: null,
    };

    const url = new URL(`http://localhost/auth/callback?code=${mockParams.code}`);
    const mockEvent = { url, locals: mockLocals };

    await expect(GET(mockEvent as unknown as MockRequestEvent)).rejects.toEqual({
      status: 303,
      location: '/auth/login?error=auth_failed&message=Invalid%20authorization%20code',
    });
  });
});
