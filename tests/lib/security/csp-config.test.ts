import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { CSPDirectives, CSPConfig } from '../../../src/lib/security/csp-config';

describe('CSP Configuration Consolidator', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...OLD_ENV };
  });

  it('should export production CSP configuration', async () => {
    process.env.NODE_ENV = 'production';

    const { productionCSP } = await import('../../../src/lib/security/csp-config');

    expect(productionCSP).toBeDefined();
    expect(productionCSP['default-src']).toEqual(["'self'"]);
    expect(productionCSP['script-src']).toContain("'self'");
    expect(productionCSP['style-src']).toContain("'self'");
    expect(productionCSP['img-src']).toContain("'self'");
    expect(productionCSP['font-src']).toContain("'self'");
    expect(productionCSP['connect-src']).toContain("'self'");
    expect(productionCSP['object-src']).toEqual(["'none'"]);
    expect(productionCSP['base-uri']).toEqual(["'self'"]);
    expect(productionCSP['form-action']).toEqual(["'self'"]);
    expect(productionCSP['frame-ancestors']).toEqual(["'none'"]);
    expect(productionCSP['upgrade-insecure-requests']).toBe(true);
  });

  it('should export development CSP configuration with unsafe-inline', async () => {
    process.env.NODE_ENV = 'development';

    const { developmentCSP } = await import('../../../src/lib/security/csp-config');

    expect(developmentCSP).toBeDefined();
    expect(developmentCSP['default-src']).toEqual(["'self'"]);
    expect(developmentCSP['script-src']).toContain("'self'");
    expect(developmentCSP['script-src']).toContain("'unsafe-inline'");
    expect(developmentCSP['script-src']).toContain("'unsafe-eval'");
    expect(developmentCSP['style-src']).toContain("'self'");
    expect(developmentCSP['style-src']).toContain("'unsafe-inline'");
    expect(developmentCSP['connect-src']).toContain('ws://localhost:*');
    expect(developmentCSP['connect-src']).toContain('http://localhost:*');
  });

  it('should generate cryptographically secure nonces', async () => {
    const { generateNonce } = await import('../../../src/lib/security/csp-config');

    const nonce1 = generateNonce();
    const nonce2 = generateNonce();

    expect(nonce1).toMatch(/^[A-Za-z0-9+/]{32}$/);
    expect(nonce2).toMatch(/^[A-Za-z0-9+/]{32}$/);
    expect(nonce1).not.toBe(nonce2);
  });

  it('should create CSP header string from directives', async () => {
    const { createCSPHeader } = await import('../../../src/lib/security/csp-config');

    const directives: CSPDirectives = {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'nonce-abc123'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'upgrade-insecure-requests': true,
    };

    const header = createCSPHeader(directives);

    expect(header).toBe(
      "default-src 'self'; script-src 'self' 'nonce-abc123'; style-src 'self' 'unsafe-inline'; upgrade-insecure-requests"
    );
  });

  it('should handle boolean CSP directives correctly', async () => {
    const { createCSPHeader } = await import('../../../src/lib/security/csp-config');

    const directives: CSPDirectives = {
      'upgrade-insecure-requests': true,
      'block-all-mixed-content': true,
    };

    const header = createCSPHeader(directives);

    expect(header).toBe('upgrade-insecure-requests; block-all-mixed-content');
  });

  it('should export getCSPConfig function that returns appropriate config', async () => {
    const { getCSPConfig } = await import('../../../src/lib/security/csp-config');

    process.env.NODE_ENV = 'production';
    const prodConfig = getCSPConfig();
    expect(prodConfig['script-src']).not.toContain("'unsafe-inline'");

    process.env.NODE_ENV = 'development';
    const devConfig = getCSPConfig();
    expect(devConfig['script-src']).toContain("'unsafe-inline'");
  });

  it('should add nonce to script-src and style-src directives', async () => {
    const { addNonceToDirectives } = await import('../../../src/lib/security/csp-config');

    const directives: CSPDirectives = {
      'default-src': ["'self'"],
      'script-src': ["'self'"],
      'style-src': ["'self'"],
    };

    const nonce = 'test-nonce-123';
    const result = addNonceToDirectives(directives, nonce);

    expect(result['script-src']).toContain("'self'");
    expect(result['script-src']).toContain(`'nonce-${nonce}'`);
    expect(result['style-src']).toContain("'self'");
    expect(result['style-src']).toContain(`'nonce-${nonce}'`);
    expect(result['default-src']).toEqual(["'self'"]);
  });

  it('should validate CSP configuration against Zod schema', async () => {
    const { CSPConfigSchema } = await import('../../../src/lib/security/csp-config');

    const validConfig: CSPConfig = {
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'nonce-abc123'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:', 'https:'],
        'font-src': ["'self'"],
        'connect-src': ["'self'"],
        'object-src': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"],
        'frame-ancestors': ["'none'"],
        'upgrade-insecure-requests': true,
      },
    };

    const result = CSPConfigSchema.safeParse(validConfig);
    expect(result.success).toBe(true);
  });

  it('should reject invalid CSP configuration', async () => {
    const { CSPConfigSchema } = await import('../../../src/lib/security/csp-config');

    const invalidConfig = {
      directives: {
        'default-src': 'self', // Should be an array
        'invalid-directive': ["'self'"],
      },
    };

    const result = CSPConfigSchema.safeParse(invalidConfig);
    expect(result.success).toBe(false);
  });

  it('should support common external resources in production CSP', async () => {
    process.env.NODE_ENV = 'production';

    const { productionCSP } = await import('../../../src/lib/security/csp-config');

    // Should allow common CDNs and services
    expect(productionCSP['font-src']).toContain('https://fonts.gstatic.com');
    expect(productionCSP['style-src']).toContain('https://fonts.googleapis.com');
    expect(productionCSP['img-src']).toContain('data:');
    expect(productionCSP['img-src']).toContain('https:');
  });

  it('should create immutable CSP objects', async () => {
    const { productionCSP, developmentCSP } = await import('../../../src/lib/security/csp-config');

    // Test that the objects are frozen
    expect(Object.isFrozen(productionCSP)).toBe(true);
    expect(Object.isFrozen(developmentCSP)).toBe(true);

    // Test that arrays within the objects are also frozen
    if (productionCSP['default-src']) {
      expect(Object.isFrozen(productionCSP['default-src'])).toBe(true);
    }
    if (developmentCSP['script-src']) {
      expect(Object.isFrozen(developmentCSP['script-src'])).toBe(true);
    }

    // Test that attempting to modify the object itself doesn't change values
    const originalDefaultSrc = productionCSP['default-src'];
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (productionCSP as any)['default-src'] = ["'none'"];
    } catch {
      // Expected in strict mode
    }
    expect(productionCSP['default-src']).toBe(originalDefaultSrc);
  });
});
