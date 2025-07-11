import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { UserConfig } from 'vite';

// Mock the vite config environment
vi.mock('vite', () => ({
  defineConfig: (config: UserConfig) => config,
}));

// Mock SvelteKit plugin
vi.mock('@sveltejs/kit/vite', () => ({
  sveltekit: () => ({ name: 'vite:sveltekit' }),
}));

describe('Vite build configuration', () => {
  let viteConfig: UserConfig;

  beforeEach(async () => {
    // Clear module cache to ensure fresh import
    vi.resetModules();

    // Import the config - this will fail initially since file doesn't exist
    const configModule = await import('../../vite.config.js');
    viteConfig = configModule.default;
  });

  it('should configure manual chunks for vendor libraries', () => {
    expect(viteConfig.build).toBeDefined();
    expect(viteConfig.build?.rollupOptions).toBeDefined();
    expect(viteConfig.build?.rollupOptions?.output).toBeDefined();

    const output = viteConfig.build?.rollupOptions?.output;
    if (Array.isArray(output)) {
      throw new Error('Output should not be an array');
    }

    expect(output?.manualChunks).toBeDefined();
    expect(typeof output?.manualChunks).toBe('function');

    // Test vendor chunking logic
    const manualChunks = output?.manualChunks as (id: string) => string | undefined;

    // Supabase libraries should be in supabase chunk
    expect(manualChunks('/node_modules/@supabase/supabase-js/index.js')).toBe('supabase');
    expect(manualChunks('/node_modules/@supabase/ssr/index.js')).toBe('supabase');

    // Zod should be in its own chunk
    expect(manualChunks('/node_modules/zod/index.js')).toBe('zod');

    // Other vendor libraries should be in vendor chunk
    expect(manualChunks('/node_modules/some-other-lib/index.js')).toBe('vendor');

    // Non-vendor code should not be chunked
    expect(manualChunks('/src/lib/utils.js')).toBeUndefined();
  });

  it('should enable CSS code splitting', () => {
    expect(viteConfig.build?.cssCodeSplit).toBe(true);
  });

  it('should optimize dependency handling', () => {
    expect(viteConfig.optimizeDeps).toBeDefined();
    expect(viteConfig.optimizeDeps?.include).toBeDefined();
    expect(Array.isArray(viteConfig.optimizeDeps?.include)).toBe(true);

    // Should include commonly used dependencies
    const includes = viteConfig.optimizeDeps?.include || [];
    expect(includes).toContain('@supabase/supabase-js');
    expect(includes).toContain('@supabase/ssr');
    expect(includes).toContain('zod');
  });

  it('should set appropriate chunk size warning limit', () => {
    expect(viteConfig.build?.chunkSizeWarningLimit).toBe(500);
  });

  it('should configure CSS minification', () => {
    expect(viteConfig.build?.cssMinify).toBe('esbuild');
  });

  it('should have SvelteKit plugin configured', () => {
    expect(viteConfig.plugins).toBeDefined();
    expect(Array.isArray(viteConfig.plugins)).toBe(true);

    const hasSkPlugin = viteConfig.plugins?.some(
      (plugin) =>
        plugin && typeof plugin === 'object' && 'name' in plugin && plugin.name === 'vite:sveltekit'
    );
    expect(hasSkPlugin).toBe(true);
  });
});
