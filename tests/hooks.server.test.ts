import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';

// Mock modules
const mockGetSession = vi.fn();
const mockGetUser = vi.fn();

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getSession: mockGetSession,
      getUser: mockGetUser,
    },
  })),
}));

// Mock environment variables
vi.mock('$env/static/public', () => ({
  PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
}));

// Mock process.env for rate limiting
vi.stubGlobal('process', {
  env: {
    RATE_LIMIT_MAX_ATTEMPTS: '5',
    RATE_LIMIT_WINDOW_SECONDS: '900',
  },
});

// Mock the new dependencies
vi.mock('@vercel/kv', () => ({
  kv: {
    incr: vi.fn(),
    expire: vi.fn(),
  },
}));

// Create a mock instance with the methods we need
const mockEdgeRateLimiterInstance = {
  checkLimit: vi.fn(),
  getConfig: vi.fn(),
};

// Mock the EdgeRateLimiter constructor to return our instance
vi.mock('$lib/security/edge-rate-limiter', () => ({
  EdgeRateLimiter: vi.fn(() => mockEdgeRateLimiterInstance),
}));

vi.mock('$lib/security/csp', () => ({
  applyCSPHeaders: vi.fn((response: Response) => response),
}));

vi.mock('$lib/server/auth/session', () => ({
  validateAndPopulateSession: vi.fn(),
}));

// Import handle after all mocks are set up
const { handle } = await import('../src/hooks.server');

describe('Server Hooks - Authentication Setup', () => {
  let mockEvent: RequestEvent;

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mock return values for each test
    mockEdgeRateLimiterInstance.checkLimit.mockResolvedValue({
      allowed: true,
      remaining: 5,
      resetAt: new Date(),
    });
    mockEdgeRateLimiterInstance.getConfig.mockReturnValue({
      maxAttempts: 5,
      windowSeconds: 900,
    });

    // Create a minimal mock event
    const cookies = {
      getAll: vi.fn(() => []),
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
      serialize: vi.fn(),
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
      isSubRequest: false,
    } as unknown as RequestEvent;
  });

  it('should create a Supabase client and attach it to event.locals', async () => {
    const mockResolve = vi.fn(async (_event) => new Response('OK'));

    await handle({ event: mockEvent, resolve: mockResolve });

    expect(mockEvent.locals).toHaveProperty('supabase');
    expect(typeof mockEvent.locals.supabase).toBe('object');
    expect(mockEvent.locals.supabase).toHaveProperty('auth');
  });

  it('should properly handle cookies with Supabase client', async () => {
    const { createServerClient } = await import('@supabase/ssr');
    const mockResolve = vi.fn(async (_event) => new Response('OK'));

    await handle({ event: mockEvent, resolve: mockResolve });

    // Verify createServerClient was called with proper cookie handlers
    expect(createServerClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-anon-key',
      expect.objectContaining({
        cookies: expect.objectContaining({
          getAll: expect.any(Function),
          setAll: expect.any(Function),
        }),
      })
    );
  });

  it('should call resolve with the event after setup', async () => {
    const mockResolve = vi.fn(async (_event) => new Response('OK'));

    const response = await handle({ event: mockEvent, resolve: mockResolve });

    expect(mockResolve).toHaveBeenCalledWith(
      mockEvent,
      expect.objectContaining({
        filterSerializedResponseHeaders: expect.any(Function),
      })
    );
    expect(response).toBeInstanceOf(Response);
  });
});
