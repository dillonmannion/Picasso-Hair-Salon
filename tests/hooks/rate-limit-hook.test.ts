import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';
import type { VercelKV } from '@vercel/kv';
import { rateLimiter } from '../../src/hooks.server';

vi.mock('@vercel/kv', () => ({
  kv: {
    incr: vi.fn(),
    expire: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  } as unknown as VercelKV,
}));

vi.mock('$env/static/private', () => ({
  KV_REST_API_URL: 'https://test.kv.vercel-storage.com',
  KV_REST_API_TOKEN: 'test-token',
}));

vi.mock('$env/static/public', () => ({
  PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
}));

vi.stubGlobal('process', {
  env: {
    NODE_ENV: 'test',
  },
});

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
  })),
}));

vi.mock('$lib/server/auth/session', () => ({
  validateAndPopulateSession: vi.fn(),
}));

vi.mock('$lib/security/csp', () => ({
  applyCSPHeaders: vi.fn((response) => response),
}));

const createMockEvent = (overrides?: Partial<RequestEvent>): RequestEvent => {
  return {
    url: new URL('http://localhost:3000/'),
    request: new Request('http://localhost:3000/'),
    getClientAddress: vi.fn().mockReturnValue('192.168.1.1'),
    locals: {},
    cookies: {
      get: vi.fn(),
      getAll: vi.fn().mockReturnValue([]),
      set: vi.fn(),
      delete: vi.fn(),
      serialize: vi.fn(),
    },
    params: {},
    route: { id: '/' },
    platform: undefined,
    ...overrides,
  } as unknown as RequestEvent;
};

const createMockResolve = () => vi.fn().mockImplementation(async () => {
  const response = new Response('OK', { status: 200 });
  return response;
});

describe('Rate Limiter Hook with Edge-Compatible KV', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockKV: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const kvModule = await import('@vercel/kv');
    mockKV = vi.mocked(kvModule).kv;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should allow requests when under rate limit', async () => {
    mockKV.incr.mockResolvedValue(1);
    const event = createMockEvent();
    const mockResolve = createMockResolve();
    const response = await rateLimiter({ event, resolve: mockResolve });

    expect(response.status).toBe(200);
    expect(mockKV.incr).toHaveBeenCalledWith('rate_limit:192.168.1.1');
    expect(mockKV.expire).toHaveBeenCalledWith('rate_limit:192.168.1.1', 900);
  });

  it('should return 429 when rate limit exceeded', async () => {
    mockKV.incr.mockResolvedValue(6);
    const event = createMockEvent();

    const mockResolve = createMockResolve();
    const response = await rateLimiter({ event, resolve: mockResolve });

    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBe('900');
    expect(response.headers.get('X-RateLimit-Limit')).toBe('5');
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
    expect(response.headers.get('X-RateLimit-Reset')).toMatch(/^\d+$/);
    
    const body = await response.text();
    expect(body).toBe('Too many requests. Please try again later.');
  });

  it('should handle different client IPs separately', async () => {
    mockKV.incr.mockResolvedValueOnce(1).mockResolvedValueOnce(1);
    
    const event1 = createMockEvent();
    const event2 = createMockEvent();
    event2.getClientAddress = vi.fn().mockReturnValue('192.168.1.2');

    const mockResolve1 = createMockResolve();
    const mockResolve2 = createMockResolve();
    
    await rateLimiter({ event: event1, resolve: mockResolve1 });
    await rateLimiter({ event: event2, resolve: mockResolve2 });

    expect(mockKV.incr).toHaveBeenCalledWith('rate_limit:192.168.1.1');
    expect(mockKV.incr).toHaveBeenCalledWith('rate_limit:192.168.1.2');
  });

  it('should extract IP from X-Forwarded-For header when configured', async () => {
    mockKV.incr.mockResolvedValue(1);
    const event = createMockEvent({
      request: new Request('http://localhost:3000/', {
        headers: {
          'x-forwarded-for': '10.0.0.1, 172.16.0.1',
        },
      }),
    });

    const mockResolve = createMockResolve();
    await rateLimiter({ event, resolve: mockResolve });

    expect(mockKV.incr).toHaveBeenCalledWith('rate_limit:10.0.0.1');
  });

  it('should allow requests when KV service fails', async () => {
    mockKV.incr.mockRejectedValue(new Error('KV service unavailable'));
    const event = createMockEvent();

    const mockResolve = createMockResolve();
    const response = await rateLimiter({ event, resolve: mockResolve });

    expect(response.status).toBe(200);
    expect(mockKV.incr).toHaveBeenCalled();
  });

  it('should set rate limit info in event.locals', async () => {
    mockKV.incr.mockResolvedValue(3);
    const event = createMockEvent();

    const mockResolve = createMockResolve();
    await rateLimiter({ event, resolve: mockResolve });

    expect(event.locals.rateLimit).toEqual({
      allowed: true,
      remaining: 2,
      limit: 5,
      resetAt: expect.any(Date),
    });
  });

  it('should not set expire on subsequent requests', async () => {
    mockKV.incr.mockResolvedValue(3);
    const event = createMockEvent();

    const mockResolve = createMockResolve();
    await rateLimiter({ event, resolve: mockResolve });

    expect(mockKV.incr).toHaveBeenCalledWith('rate_limit:192.168.1.1');
    expect(mockKV.expire).not.toHaveBeenCalled();
  });

  it('should include rate limit headers in successful responses', async () => {
    mockKV.incr.mockResolvedValue(2);
    const event = createMockEvent();

    const mockResolve = createMockResolve();
    const response = await rateLimiter({ event, resolve: mockResolve });

    expect(response.headers.get('X-RateLimit-Limit')).toBe('5');
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('3');
    expect(response.headers.get('X-RateLimit-Reset')).toMatch(/^\d+$/);
  });

  it('should use default rate limit configuration', async () => {
    mockKV.incr.mockResolvedValue(1);
    const event = createMockEvent();

    const mockResolve = createMockResolve();
    await rateLimiter({ event, resolve: mockResolve });

    expect(mockKV.expire).toHaveBeenCalledWith('rate_limit:192.168.1.1', 900);
    expect(event.locals.rateLimit?.limit).toBe(5);
  });
});