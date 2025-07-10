import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createBrowserClient, createServerClient } from '@supabase/ssr';
import type { RequestEvent } from '@sveltejs/kit';
import type { SupabaseClient } from '@supabase/supabase-js';

// Mock the modules
vi.mock('@supabase/ssr');
vi.mock('$env/static/public', () => ({
  PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
}));

// Import after mocking
import { createSupabaseServerClient, createSupabaseBrowserClient } from '$lib/supabase/client';

describe('Supabase Client Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createSupabaseServerClient', () => {
    it('should create a server client with proper cookie handling', () => {
      const mockGetAll = vi.fn().mockReturnValue([]);
      const mockSet = vi.fn();
      const mockEvent = {
        cookies: {
          getAll: mockGetAll,
          set: mockSet,
        },
      } as unknown as RequestEvent;

      const mockClient = { auth: { getSession: vi.fn() } } as unknown as SupabaseClient;
      vi.mocked(createServerClient).mockReturnValue(mockClient);

      const client = createSupabaseServerClient(mockEvent);

      expect(createServerClient).toHaveBeenCalledWith('https://test.supabase.co', 'test-anon-key', {
        cookies: {
          getAll: expect.any(Function),
          setAll: expect.any(Function),
        },
      });

      // Test cookie handling
      const cookieConfig = vi.mocked(createServerClient).mock.calls[0][2];

      // Test getAll
      cookieConfig.cookies.getAll();
      expect(mockGetAll).toHaveBeenCalled();

      // Test setAll
      const testCookies = [
        { name: 'test-cookie', value: 'test-value', options: { httpOnly: true } },
      ];
      cookieConfig.cookies.setAll?.(testCookies);
      expect(mockSet).toHaveBeenCalledWith('test-cookie', 'test-value', {
        httpOnly: true,
        path: '/',
      });

      expect(client).toBe(mockClient);
    });

    it('should use environment variables for Supabase configuration', () => {
      const mockEvent = {
        cookies: {
          getAll: vi.fn().mockReturnValue([]),
          set: vi.fn(),
        },
      } as unknown as RequestEvent;

      vi.mocked(createServerClient).mockReturnValue({} as unknown as SupabaseClient);

      createSupabaseServerClient(mockEvent);

      expect(createServerClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-anon-key',
        expect.any(Object)
      );
    });
  });

  describe('createSupabaseBrowserClient', () => {
    it('should create a browser client with fetch option', () => {
      const mockFetch = vi.fn();
      const mockClient = { auth: { onAuthStateChange: vi.fn() } } as unknown as SupabaseClient;
      vi.mocked(createBrowserClient).mockReturnValue(mockClient);

      const client = createSupabaseBrowserClient(mockFetch);

      expect(createBrowserClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-anon-key',
        {
          global: {
            fetch: mockFetch,
          },
        }
      );

      expect(client).toBe(mockClient);
    });

    it('should create a browser client without fetch when not provided', () => {
      const mockClient = { auth: { onAuthStateChange: vi.fn() } } as unknown as SupabaseClient;
      vi.mocked(createBrowserClient).mockReturnValue(mockClient);

      const client = createSupabaseBrowserClient();

      expect(createBrowserClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-anon-key',
        {}
      );

      expect(client).toBe(mockClient);
    });

    it('should use environment variables for Supabase configuration', () => {
      vi.mocked(createBrowserClient).mockReturnValue({} as unknown as SupabaseClient);

      createSupabaseBrowserClient();

      expect(createBrowserClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-anon-key',
        expect.any(Object)
      );
    });
  });

  describe('type safety', () => {
    it('should return properly typed Supabase clients', () => {
      const mockEvent = {
        cookies: {
          getAll: vi.fn().mockReturnValue([]),
          set: vi.fn(),
        },
      } as unknown as RequestEvent;

      const mockServerClient = {
        auth: {
          getSession: vi.fn(),
          getUser: vi.fn(),
          signInWithOAuth: vi.fn(),
        },
      };
      const mockBrowserClient = {
        auth: {
          onAuthStateChange: vi.fn(),
          getSession: vi.fn(),
        },
      };

      vi.mocked(createServerClient).mockReturnValue(mockServerClient as unknown as SupabaseClient);
      vi.mocked(createBrowserClient).mockReturnValue(mockBrowserClient as unknown as SupabaseClient);

      const serverClient = createSupabaseServerClient(mockEvent);
      const browserClient = createSupabaseBrowserClient();

      // Type checks - these should compile without errors
      expect(serverClient.auth.getSession).toBeDefined();
      expect(browserClient.auth.onAuthStateChange).toBeDefined();
    });
  });
});
