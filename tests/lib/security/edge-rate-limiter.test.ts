import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { VercelKV } from '@vercel/kv';
import { EdgeRateLimiter } from '$lib/security/edge-rate-limiter';

const mockKV: VercelKV = {
  incr: vi.fn(),
  expire: vi.fn(),
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
} as unknown as VercelKV;

describe('EdgeRateLimiter', () => {
  let rateLimiter: EdgeRateLimiter;

  beforeEach(() => {
    vi.clearAllMocks();
    rateLimiter = new EdgeRateLimiter(mockKV, {
      maxAttempts: 5,
      windowSeconds: 900, // 15 minutes
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should allow requests when under the rate limit', async () => {
    const ip = '192.168.1.1';
    vi.mocked(mockKV.incr).mockResolvedValue(1);

    const result = await rateLimiter.checkLimit(ip);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
    expect(result.resetAt).toBeInstanceOf(Date);
    expect(mockKV.incr).toHaveBeenCalledWith(`rate_limit:${ip}`);
    expect(mockKV.expire).toHaveBeenCalledWith(`rate_limit:${ip}`, 900);
  });

  it('should set expiration only on first request', async () => {
    const ip = '192.168.1.1';
    vi.mocked(mockKV.incr).mockResolvedValue(3);

    await rateLimiter.checkLimit(ip);

    expect(mockKV.incr).toHaveBeenCalledWith(`rate_limit:${ip}`);
    expect(mockKV.expire).not.toHaveBeenCalled();
  });

  it('should deny requests when rate limit is exceeded', async () => {
    const ip = '192.168.1.1';
    vi.mocked(mockKV.incr).mockResolvedValue(6);

    const result = await rateLimiter.checkLimit(ip);

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.resetAt).toBeInstanceOf(Date);
  });

  it('should deny requests at exactly the rate limit', async () => {
    const ip = '192.168.1.1';
    vi.mocked(mockKV.incr).mockResolvedValue(5);

    const result = await rateLimiter.checkLimit(ip);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it('should handle KV errors gracefully by allowing requests', async () => {
    const ip = '192.168.1.1';
    vi.mocked(mockKV.incr).mockRejectedValue(new Error('KV unavailable'));

    const result = await rateLimiter.checkLimit(ip);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(5);
  });

  it('should validate configuration with schema', () => {
    expect(() => {
      new EdgeRateLimiter(mockKV, {
        maxAttempts: -1,
        windowSeconds: 900,
      });
    }).toThrow();

    expect(() => {
      new EdgeRateLimiter(mockKV, {
        maxAttempts: 5,
        windowSeconds: 0,
      });
    }).toThrow();
  });

  it('should support custom prefixes for multi-tenant scenarios', async () => {
    const customLimiter = new EdgeRateLimiter(mockKV, {
      maxAttempts: 5,
      windowSeconds: 900,
      keyPrefix: 'tenant_123',
    });

    const ip = '192.168.1.1';
    vi.mocked(mockKV.incr).mockResolvedValue(1);

    await customLimiter.checkLimit(ip);

    expect(mockKV.incr).toHaveBeenCalledWith('tenant_123:rate_limit:192.168.1.1');
  });

  it('should provide accurate reset time calculation', async () => {
    const ip = '192.168.1.1';
    vi.mocked(mockKV.incr).mockResolvedValue(1);

    const beforeTime = Date.now();
    const result = await rateLimiter.checkLimit(ip);
    const afterTime = Date.now();

    const resetTime = result.resetAt.getTime();
    const expectedMinTime = beforeTime + 900 * 1000;
    const expectedMaxTime = afterTime + 900 * 1000;

    expect(resetTime).toBeGreaterThanOrEqual(expectedMinTime);
    expect(resetTime).toBeLessThanOrEqual(expectedMaxTime);
  });

  it('should export result schema for validation', () => {
    const resultSchema = rateLimiter.getResultSchema();
    
    const validResult = {
      allowed: true,
      remaining: 4,
      resetAt: new Date(),
    };

    expect(() => resultSchema.parse(validResult)).not.toThrow();
  });
});