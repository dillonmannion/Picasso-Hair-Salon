import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RateLimiter } from '$lib/security/rate-limiter';

describe('Rate Limiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    vi.useFakeTimers();
    rateLimiter = new RateLimiter();
  });

  it('should allow requests within the limit', () => {
    const ip = '192.168.1.100';
    
    for (let i = 0; i < 100; i++) {
      const allowed = rateLimiter.checkLimit(ip);
      expect(allowed).toBe(true);
    }
  });

  it('should return false when limit is exceeded', () => {
    const ip = '192.168.1.100';
    
    for (let i = 0; i < 100; i++) {
      rateLimiter.checkLimit(ip);
    }
    
    const allowed = rateLimiter.checkLimit(ip);
    expect(allowed).toBe(false);
  });

  it('should track different IPs separately', () => {
    const ip1 = '192.168.1.100';
    const ip2 = '192.168.1.101';
    
    for (let i = 0; i < 100; i++) {
      rateLimiter.checkLimit(ip1);
    }
    
    expect(rateLimiter.checkLimit(ip1)).toBe(false);
    expect(rateLimiter.checkLimit(ip2)).toBe(true);
  });

  it('should reset limit after 15 minutes', () => {
    const ip = '192.168.1.100';
    
    for (let i = 0; i < 100; i++) {
      rateLimiter.checkLimit(ip);
    }
    
    expect(rateLimiter.checkLimit(ip)).toBe(false);
    
    vi.advanceTimersByTime(15 * 60 * 1000);
    
    expect(rateLimiter.checkLimit(ip)).toBe(true);
  });

  it('should not reset if time has not passed', () => {
    const ip = '192.168.1.100';
    
    for (let i = 0; i < 100; i++) {
      rateLimiter.checkLimit(ip);
    }
    
    expect(rateLimiter.checkLimit(ip)).toBe(false);
    
    vi.advanceTimersByTime(14 * 60 * 1000);
    
    expect(rateLimiter.checkLimit(ip)).toBe(false);
  });

  it('should handle cleanup of old entries', () => {
    const ip1 = '192.168.1.100';
    const ip2 = '192.168.1.101';
    
    rateLimiter.checkLimit(ip1);
    
    vi.advanceTimersByTime(16 * 60 * 1000);
    
    rateLimiter.checkLimit(ip2);
    
    expect(rateLimiter.checkLimit(ip1)).toBe(true);
  });

  it('should count requests correctly within time window', () => {
    const ip = '192.168.1.100';
    
    for (let i = 0; i < 50; i++) {
      expect(rateLimiter.checkLimit(ip)).toBe(true);
    }
    
    vi.advanceTimersByTime(5 * 60 * 1000);
    
    for (let i = 0; i < 50; i++) {
      expect(rateLimiter.checkLimit(ip)).toBe(true);
    }
    
    expect(rateLimiter.checkLimit(ip)).toBe(false);
  });

  it('should handle multiple time windows correctly', () => {
    const ip = '192.168.1.100';
    
    for (let i = 0; i < 100; i++) {
      rateLimiter.checkLimit(ip);
    }
    expect(rateLimiter.checkLimit(ip)).toBe(false);
    
    vi.advanceTimersByTime(15 * 60 * 1000);
    
    for (let i = 0; i < 100; i++) {
      expect(rateLimiter.checkLimit(ip)).toBe(true);
    }
    expect(rateLimiter.checkLimit(ip)).toBe(false);
    
    vi.advanceTimersByTime(15 * 60 * 1000);
    
    expect(rateLimiter.checkLimit(ip)).toBe(true);
  });

  it('should handle IPv6 addresses', () => {
    const ipv6 = '2001:0db8:85a3:0000:0000:8a2e:0370:7334';
    
    for (let i = 0; i < 100; i++) {
      expect(rateLimiter.checkLimit(ipv6)).toBe(true);
    }
    
    expect(rateLimiter.checkLimit(ipv6)).toBe(false);
  });

  it('should handle localhost addresses', () => {
    const localhost = '127.0.0.1';
    const localhostV6 = '::1';
    
    for (let i = 0; i < 100; i++) {
      expect(rateLimiter.checkLimit(localhost)).toBe(true);
    }
    expect(rateLimiter.checkLimit(localhost)).toBe(false);
    
    for (let i = 0; i < 100; i++) {
      expect(rateLimiter.checkLimit(localhostV6)).toBe(true);
    }
    expect(rateLimiter.checkLimit(localhostV6)).toBe(false);
  });
});