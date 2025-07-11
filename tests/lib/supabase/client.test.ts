import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

// Mock the modules
vi.mock('@supabase/ssr');
vi.mock('$env/static/public', () => ({
  PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
}));

// Import after mocking
import { createSupabaseBrowserClient } from '$lib/supabase/client';

describe('Supabase Client Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
      const mockBrowserClient = {
        auth: {
          onAuthStateChange: vi.fn(),
          getSession: vi.fn(),
        },
      };

      vi.mocked(createBrowserClient).mockReturnValue(
        mockBrowserClient as unknown as SupabaseClient
      );

      const browserClient = createSupabaseBrowserClient();

      // Type checks - these should compile without errors
      expect(browserClient.auth.onAuthStateChange).toBeDefined();
      expect(browserClient.auth.getSession).toBeDefined();
    });
  });

  describe('supabase instance', () => {
    it('should export a default supabase instance', () => {
      const mockClient = { auth: { onAuthStateChange: vi.fn() } } as unknown as SupabaseClient;
      vi.mocked(createBrowserClient).mockReturnValue(mockClient);

      // Re-import to trigger module execution
      vi.resetModules();
      return import('$lib/supabase/client').then((module) => {
        expect(module.supabase).toBeDefined();
      });
    });
  });
});
