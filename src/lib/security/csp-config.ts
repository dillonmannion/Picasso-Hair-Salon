import { z } from 'zod';
import crypto from 'crypto';

const CSPDirectivesSchema = z.object({
  'default-src': z.array(z.string()).optional(),
  'script-src': z.array(z.string()).optional(),
  'style-src': z.array(z.string()).optional(),
  'img-src': z.array(z.string()).optional(),
  'font-src': z.array(z.string()).optional(),
  'connect-src': z.array(z.string()).optional(),
  'media-src': z.array(z.string()).optional(),
  'object-src': z.array(z.string()).optional(),
  'prefetch-src': z.array(z.string()).optional(),
  'child-src': z.array(z.string()).optional(),
  'frame-src': z.array(z.string()).optional(),
  'worker-src': z.array(z.string()).optional(),
  'frame-ancestors': z.array(z.string()).optional(),
  'form-action': z.array(z.string()).optional(),
  'base-uri': z.array(z.string()).optional(),
  'plugin-types': z.array(z.string()).optional(),
  'manifest-src': z.array(z.string()).optional(),
  'upgrade-insecure-requests': z.boolean().optional(),
  'block-all-mixed-content': z.boolean().optional()
});

export const CSPConfigSchema = z.object({
  directives: CSPDirectivesSchema
});

export type CSPDirectives = z.infer<typeof CSPDirectivesSchema>;
export type CSPConfig = z.infer<typeof CSPConfigSchema>;

const baseCSP: CSPDirectives = {
  'default-src': ["'self'"],
  'img-src': ["'self'", 'data:', 'https:'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"]
};

const freezeCSP = (directives: CSPDirectives): CSPDirectives => {
  const frozen: CSPDirectives = {};
  for (const [key, value] of Object.entries(directives)) {
    if (Array.isArray(value)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (frozen as any)[key] = Object.freeze([...value]);
    } else if (typeof value === 'boolean') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (frozen as any)[key] = value;
    }
  }
  return Object.freeze(frozen);
};

export const productionCSP: CSPDirectives = freezeCSP({
  ...baseCSP,
  'script-src': ["'self'"],
  'style-src': ["'self'", 'https://fonts.googleapis.com'],
  'connect-src': ["'self'"],
  'upgrade-insecure-requests': true
});

export const developmentCSP: CSPDirectives = freezeCSP({
  ...baseCSP,
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'connect-src': ["'self'", 'ws://localhost:*', 'http://localhost:*']
});

export function generateNonce(): string {
  return crypto.randomBytes(24).toString('base64');
}

export function createCSPHeader(directives: CSPDirectives): string {
  return Object.entries(directives)
    .map(([key, value]) => {
      if (typeof value === 'boolean') {
        return value ? key : null;
      }
      return Array.isArray(value) ? `${key} ${value.join(' ')}` : null;
    })
    .filter((directive): directive is string => directive !== null)
    .join('; ');
}

export function getCSPConfig(): CSPDirectives {
  return process.env.NODE_ENV === 'production' ? productionCSP : developmentCSP;
}

export function addNonceToDirectives(directives: CSPDirectives, nonce: string): CSPDirectives {
  const result = { ...directives };
  
  if (result['script-src']) {
    result['script-src'] = [...result['script-src'], `'nonce-${nonce}'`];
  }
  
  if (result['style-src']) {
    result['style-src'] = [...result['style-src'], `'nonce-${nonce}'`];
  }
  
  return result;
}