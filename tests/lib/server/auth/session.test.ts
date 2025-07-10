import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SupabaseClient, Session, User, AuthError } from '@supabase/supabase-js';
import { validateSession, clearInvalidSession, getUserWithRole } from '$lib/server/auth/session';

describe('Authentication State Manager', () => {
  let mockSupabaseClient: SupabaseClient;
  let mockSession: Session;
  let mockUser: User;

  beforeEach(() => {
    mockSession = {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      token_type: 'bearer',
      user: {
        id: 'user-123',
        email: 'test@example.com',
        aud: 'authenticated',
        role: 'authenticated',
        email_confirmed_at: '2024-01-01T00:00:00Z',
        phone: undefined,
        confirmed_at: '2024-01-01T00:00:00Z',
        last_sign_in_at: '2024-01-10T00:00:00Z',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { name: 'Test User' },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-10T00:00:00Z'
      }
    };

    mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      aud: 'authenticated',
      role: 'authenticated',
      email_confirmed_at: '2024-01-01T00:00:00Z',
      phone: undefined,
      confirmed_at: '2024-01-01T00:00:00Z',
      last_sign_in_at: '2024-01-10T00:00:00Z',
      app_metadata: { provider: 'email', providers: ['email'] },
      user_metadata: { name: 'Test User' },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-10T00:00:00Z'
    };

    mockSupabaseClient = {
      auth: {
        getSession: vi.fn(),
        getUser: vi.fn(),
        signOut: vi.fn()
      }
    } as unknown as SupabaseClient;
  });

  describe('validateSession', () => {
    it('should return valid session and user when JWT is valid', async () => {
      vi.mocked(mockSupabaseClient.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null
      });

      vi.mocked(mockSupabaseClient.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const result = await validateSession(mockSupabaseClient);

      expect(result).toEqual({
        session: mockSession,
        user: mockUser,
        isValid: true
      });
      expect(mockSupabaseClient.auth.getSession).toHaveBeenCalledOnce();
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalledOnce();
    });

    it('should return null session when no session exists', async () => {
      vi.mocked(mockSupabaseClient.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null
      });

      const result = await validateSession(mockSupabaseClient);

      expect(result).toEqual({
        session: null,
        user: null,
        isValid: false
      });
      expect(mockSupabaseClient.auth.getUser).not.toHaveBeenCalled();
    });

    it('should return null when JWT validation fails', async () => {
      vi.mocked(mockSupabaseClient.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null
      });

      vi.mocked(mockSupabaseClient.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: { name: 'AuthApiError', message: 'Invalid JWT' } as unknown as AuthError
      });

      const result = await validateSession(mockSupabaseClient);

      expect(result).toEqual({
        session: null,
        user: null,
        isValid: false
      });
    });

    it('should handle getSession errors gracefully', async () => {
      vi.mocked(mockSupabaseClient.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: { name: 'AuthError', message: 'Failed to get session' } as unknown as AuthError
      });

      const result = await validateSession(mockSupabaseClient);

      expect(result).toEqual({
        session: null,
        user: null,
        isValid: false
      });
    });
  });

  describe('clearInvalidSession', () => {
    it('should sign out the user when called', async () => {
      vi.mocked(mockSupabaseClient.auth.signOut).mockResolvedValue({
        error: null
      });

      await clearInvalidSession(mockSupabaseClient);

      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalledOnce();
    });

    it('should handle sign out errors gracefully', async () => {
      vi.mocked(mockSupabaseClient.auth.signOut).mockResolvedValue({
        error: { name: 'AuthError', message: 'Sign out failed' } as unknown as AuthError
      });

      await expect(clearInvalidSession(mockSupabaseClient)).resolves.not.toThrow();
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalledOnce();
    });
  });

  describe('getUserWithRole', () => {
    it('should return user with standard role when no profile exists', async () => {
      const mockProfileData = { data: null, error: null };
      
      mockSupabaseClient.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockProfileData)
          })
        })
      });

      const result = await getUserWithRole(mockSupabaseClient, mockUser);

      expect(result).toEqual({
        ...mockUser,
        role: 'customer'
      });
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles');
    });

    it('should return user with admin role when profile indicates admin', async () => {
      const mockProfileData = {
        data: { id: 'user-123', is_admin: true, role: 'admin' },
        error: null
      };
      
      mockSupabaseClient.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockProfileData)
          })
        })
      });

      const result = await getUserWithRole(mockSupabaseClient, mockUser);

      expect(result).toEqual({
        ...mockUser,
        role: 'admin'
      });
    });

    it('should return user with stylist role when profile indicates stylist', async () => {
      const mockProfileData = {
        data: { id: 'user-123', is_admin: false, role: 'stylist' },
        error: null
      };
      
      mockSupabaseClient.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockProfileData)
          })
        })
      });

      const result = await getUserWithRole(mockSupabaseClient, mockUser);

      expect(result).toEqual({
        ...mockUser,
        role: 'stylist'
      });
    });

    it('should return customer role when profile query fails', async () => {
      const mockProfileData = {
        data: null,
        error: { code: 'PGRST116', message: 'Profile not found' }
      };
      
      mockSupabaseClient.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockProfileData)
          })
        })
      });

      const result = await getUserWithRole(mockSupabaseClient, mockUser);

      expect(result).toEqual({
        ...mockUser,
        role: 'customer'
      });
    });

    it('should handle null user gracefully', async () => {
      const result = await getUserWithRole(mockSupabaseClient, null);
      expect(result).toBeNull();
    });
  });
});