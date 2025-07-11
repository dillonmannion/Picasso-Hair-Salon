import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { RequestEvent, Cookies } from '@sveltejs/kit';
import { cspHandler } from '../../src/hooks.server';
import { generateNonce, getCSPHeader } from '../../src/lib/security/csp-config';

type MockLocals = App.Locals;

vi.mock('../../src/lib/security/csp-config', () => ({
  generateNonce: vi.fn(),
  getCSPHeader: vi.fn()
}));

describe('CSP Hook Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockCookies = (): Partial<Cookies> => ({
    get: vi.fn(),
    getAll: vi.fn().mockReturnValue([]),
    set: vi.fn(),
    delete: vi.fn(),
    serialize: vi.fn()
  });

  const createMockLocals = (): Partial<MockLocals> => ({});

  it('should apply CSP headers with generated nonce to all responses', async () => {
    const mockNonce = 'test-nonce-12345';
    const mockCSPHeader = "default-src 'self'; script-src 'self' 'nonce-test-nonce-12345'";
    
    vi.mocked(generateNonce).mockReturnValue(mockNonce);
    vi.mocked(getCSPHeader).mockReturnValue(mockCSPHeader);

    const mockEvent: RequestEvent = {
      request: new Request('https://example.com/'),
      locals: createMockLocals() as MockLocals,
      url: new URL('https://example.com/'),
      params: {},
      route: { id: null },
      platform: undefined,
      cookies: createMockCookies() as Cookies,
      fetch: globalThis.fetch,
      getClientAddress: () => '127.0.0.1',
      setHeaders: vi.fn(),
      isDataRequest: false,
      isSubRequest: false
    };

    const mockResolve = vi.fn().mockResolvedValue(
      new Response('test response', { status: 200 })
    );

    const response = await cspHandler({ event: mockEvent, resolve: mockResolve });

    expect(generateNonce).toHaveBeenCalledOnce();
    expect(getCSPHeader).toHaveBeenCalledWith(mockNonce);
    expect(response.headers.get('Content-Security-Policy')).toBe(mockCSPHeader);
    expect(mockEvent.locals).toHaveProperty('cspNonce', mockNonce);
  });

  it('should generate unique nonces for each request', async () => {
    let callCount = 0;
    const noncesUsed: string[] = [];
    
    vi.mocked(generateNonce).mockImplementation(() => {
      const nonce = `nonce-${++callCount}`;
      noncesUsed.push(nonce);
      return nonce;
    });
    vi.mocked(getCSPHeader).mockImplementation((nonce) => `script-src 'nonce-${nonce}'`);

    const createMockEvent = (): RequestEvent => ({
      request: new Request('https://example.com/'),
      locals: createMockLocals() as MockLocals,
      url: new URL('https://example.com/'),
      params: {},
      route: { id: null },
      platform: undefined,
      cookies: createMockCookies() as Cookies,
      fetch: globalThis.fetch,
      getClientAddress: () => '127.0.0.1',
      setHeaders: vi.fn(),
      isDataRequest: false,
      isSubRequest: false
    });

    const mockResolve = vi.fn().mockImplementation(async () => {
      return new Response('test response', { status: 200 });
    });

    const event1 = createMockEvent();
    const event2 = createMockEvent();
    
    const response1 = await cspHandler({ event: event1, resolve: mockResolve });
    const response2 = await cspHandler({ event: event2, resolve: mockResolve });

    expect(generateNonce).toHaveBeenCalledTimes(2);
    expect(event1.locals.cspNonce).toBe('nonce-1');
    expect(event2.locals.cspNonce).toBe('nonce-2');
    expect(response1.headers.get('Content-Security-Policy')).toBe("script-src 'nonce-nonce-1'");
    expect(response2.headers.get('Content-Security-Policy')).toBe("script-src 'nonce-nonce-2'");
  });

  it('should preserve existing response headers when adding CSP', async () => {
    vi.mocked(generateNonce).mockReturnValue('test-nonce');
    vi.mocked(getCSPHeader).mockReturnValue("default-src 'self'");

    const mockEvent: RequestEvent = {
      request: new Request('https://example.com/'),
      locals: createMockLocals() as MockLocals,
      url: new URL('https://example.com/'),
      params: {},
      route: { id: null },
      platform: undefined,
      cookies: createMockCookies() as Cookies,
      fetch: globalThis.fetch,
      getClientAddress: () => '127.0.0.1',
      setHeaders: vi.fn(),
      isDataRequest: false,
      isSubRequest: false
    };

    const mockResolve = vi.fn().mockResolvedValue(
      new Response('test response', {
        status: 200,
        headers: {
          'X-Custom-Header': 'custom-value',
          'Cache-Control': 'no-cache'
        }
      })
    );

    const response = await cspHandler({ event: mockEvent, resolve: mockResolve });

    expect(response.headers.get('X-Custom-Header')).toBe('custom-value');
    expect(response.headers.get('Cache-Control')).toBe('no-cache');
    expect(response.headers.get('Content-Security-Policy')).toBe("default-src 'self'");
  });

  it('should handle responses without modifying status or body', async () => {
    vi.mocked(generateNonce).mockReturnValue('test-nonce');
    vi.mocked(getCSPHeader).mockReturnValue("default-src 'self'");

    const mockEvent: RequestEvent = {
      request: new Request('https://example.com/'),
      locals: createMockLocals() as MockLocals,
      url: new URL('https://example.com/'),
      params: {},
      route: { id: null },
      platform: undefined,
      cookies: createMockCookies() as Cookies,
      fetch: globalThis.fetch,
      getClientAddress: () => '127.0.0.1',
      setHeaders: vi.fn(),
      isDataRequest: false,
      isSubRequest: false
    };

    const originalBody = 'original response body';
    const mockResolve = vi.fn().mockResolvedValue(
      new Response(originalBody, { status: 201 })
    );

    const response = await cspHandler({ event: mockEvent, resolve: mockResolve });

    expect(response.status).toBe(201);
    const responseBody = await response.text();
    expect(responseBody).toBe(originalBody);
  });
});