import { describe, it, expect } from 'vitest';
import { generateCSP, applyCSPHeaders } from '$lib/security/csp';

describe('CSP Configuration Handler', () => {
  describe('generateCSP', () => {
    it('should generate CSP directives with Supabase domains', () => {
      const csp = generateCSP();
      
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain('https://*.supabase.co');
      expect(csp).toContain('https://*.supabase.com');
    });

    it('should include script-src directives with self and unsafe-inline for development', () => {
      const csp = generateCSP({ isDevelopment: true });
      
      expect(csp).toContain("script-src 'self' 'unsafe-inline'");
      expect(csp).toContain('https://*.supabase.co');
    });

    it('should use strict script-src without unsafe-inline in production', () => {
      const csp = generateCSP({ isDevelopment: false });
      
      expect(csp).toContain("script-src 'self'");
      expect(csp).not.toContain('unsafe-inline');
    });

    it('should include style-src directives with unsafe-inline', () => {
      const csp = generateCSP();
      
      expect(csp).toContain("style-src 'self' 'unsafe-inline'");
      expect(csp).toContain('https://*.supabase.co');
    });

    it('should include img-src directives for self, data, and blob', () => {
      const csp = generateCSP();
      
      expect(csp).toContain("img-src 'self' data: blob:");
      expect(csp).toContain('https://*.supabase.co');
    });

    it('should include connect-src for API connections', () => {
      const csp = generateCSP();
      
      expect(csp).toContain("connect-src 'self'");
      expect(csp).toContain('https://*.supabase.co');
      expect(csp).toContain('wss://*.supabase.co');
    });

    it('should include font-src for self and data', () => {
      const csp = generateCSP();
      
      expect(csp).toContain("font-src 'self' data:");
    });

    it('should include frame-ancestors none for clickjacking protection', () => {
      const csp = generateCSP();
      
      expect(csp).toContain("frame-ancestors 'none'");
    });

    it('should include base-uri self', () => {
      const csp = generateCSP();
      
      expect(csp).toContain("base-uri 'self'");
    });

    it('should include form-action self', () => {
      const csp = generateCSP();
      
      expect(csp).toContain("form-action 'self'");
    });

    it('should separate directives with semicolons', () => {
      const csp = generateCSP();
      const directives = csp.split(';').map(d => d.trim()).filter(Boolean);
      
      expect(directives.length).toBeGreaterThan(5);
      expect(directives.every(d => d.includes(' '))).toBe(true);
    });
  });

  describe('applyCSPHeaders', () => {
    it('should set Content-Security-Policy header on response', () => {
      const headers = new Headers();
      const response = new Response(null, { headers });
      
      const updatedResponse = applyCSPHeaders(response);
      
      expect(updatedResponse.headers.has('Content-Security-Policy')).toBe(true);
    });

    it('should include all required CSP directives in header', () => {
      const headers = new Headers();
      const response = new Response(null, { headers });
      
      const updatedResponse = applyCSPHeaders(response);
      const csp = updatedResponse.headers.get('Content-Security-Policy');
      
      expect(csp).toBeTruthy();
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain('https://*.supabase.co');
      expect(csp).toContain("frame-ancestors 'none'");
    });

    it('should apply development CSP when isDevelopment is true', () => {
      const headers = new Headers();
      const response = new Response(null, { headers });
      
      const updatedResponse = applyCSPHeaders(response, { isDevelopment: true });
      const csp = updatedResponse.headers.get('Content-Security-Policy');
      
      expect(csp).toContain('unsafe-inline');
    });

    it('should apply production CSP when isDevelopment is false', () => {
      const headers = new Headers();
      const response = new Response(null, { headers });
      
      const updatedResponse = applyCSPHeaders(response, { isDevelopment: false });
      const csp = updatedResponse.headers.get('Content-Security-Policy');
      
      expect(csp).not.toContain('unsafe-inline');
    });

    it('should preserve existing response headers', () => {
      const headers = new Headers();
      headers.set('X-Custom-Header', 'test-value');
      headers.set('Content-Type', 'text/html');
      const response = new Response(null, { headers });
      
      const updatedResponse = applyCSPHeaders(response);
      
      expect(updatedResponse.headers.get('X-Custom-Header')).toBe('test-value');
      expect(updatedResponse.headers.get('Content-Type')).toBe('text/html');
      expect(updatedResponse.headers.has('Content-Security-Policy')).toBe(true);
    });

    it('should handle immutable response headers by cloning', () => {
      // Create a response with immutable headers (like from Response.redirect())
      const originalResponse = Response.redirect('https://example.com', 302);
      
      // This should not throw an error
      const updatedResponse = applyCSPHeaders(originalResponse);
      
      expect(updatedResponse).not.toBe(originalResponse);
      expect(updatedResponse.headers.has('Content-Security-Policy')).toBe(true);
      expect(updatedResponse.headers.get('Location')).toBe('https://example.com/');
    });
  });
});