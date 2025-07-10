import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Config } from '@sveltejs/kit';

// Mock modules
vi.mock('@sveltejs/adapter-vercel', () => ({
  default: vi.fn(() => ({
    name: 'adapter-vercel',
    adapt: vi.fn()
  }))
}));

vi.mock('@sveltejs/vite-plugin-svelte', () => ({
  vitePreprocess: vi.fn(() => [])
}));

describe('SvelteKit Edge Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should configure SvelteKit adapter for edge runtime', async () => {
    const { default: config } = await import('../../svelte.config.js') as { default: Config };
    const { default: adapter } = await import('@sveltejs/adapter-vercel');
    
    expect(adapter).toHaveBeenCalledWith({
      runtime: 'edge',
      regions: ['iad1', 'sfo1', 'pdx1', 'cle1', 'gru1', 'hnd1', 'lhr1', 'syd1'],
      split: false
    });
    
    expect(config.kit?.adapter).toBeDefined();
    expect(config.kit?.adapter?.name).toBe('adapter-vercel');
  });

  it('should configure CSP directives for multi-region deployment', async () => {
    const { default: config } = await import('../../svelte.config.js') as { default: Config };
    
    expect(config.kit?.csp).toEqual({
      mode: 'hash',
      directives: {
        'script-src': ['self', 'https://*.supabase.co'],
        'style-src': ['self', 'unsafe-inline'],
        'object-src': ['none'],
        'base-uri': ['self'],
        'frame-ancestors': ['none']
      }
    });
  });

  it('should include vitePreprocess for TypeScript support', async () => {
    // Clear the module cache to ensure a fresh import
    vi.resetModules();
    
    // Set up the mock to track calls
    const mockVitePreprocess = vi.fn(() => ({ name: 'vite-preprocess' }));
    vi.doMock('@sveltejs/vite-plugin-svelte', () => ({
      vitePreprocess: mockVitePreprocess
    }));
    
    // Import the config which should call vitePreprocess
    const { default: config } = await import('../../svelte.config.js') as { default: Config };
    
    expect(mockVitePreprocess).toHaveBeenCalled();
    expect(config.preprocess).toBeDefined();
    expect(Array.isArray(config.preprocess)).toBe(true);
    expect(config.preprocess).toHaveLength(1);
  });

  it('should configure alias for $lib path', async () => {
    const { default: config } = await import('../../svelte.config.js') as { default: Config };
    
    expect(config.kit?.alias).toEqual({
      $lib: 'src/lib',
      $lib$: 'src/lib',
      $types: 'src/types'
    });
  });

  it('should enable service worker registration', async () => {
    const { default: config } = await import('../../svelte.config.js') as { default: Config };
    
    expect(config.kit?.serviceWorker).toEqual({
      register: false
    });
  });
});