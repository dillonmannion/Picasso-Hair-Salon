import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import { svelteTesting } from '@testing-library/svelte/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [sveltekit(), svelteTesting()],
  
  test: {
    // Enable browser-like environment
    environment: 'jsdom',
    globals: true,
    
    // Global test setup
    setupFiles: ['./src/test/setup.ts'],
    
    // Include test files
    include: ['src/**/*.{test,spec}.{js,ts}', 'tests/**/*.{test,spec}.{js,ts}'],
    exclude: ['tests/e2e/**', 'e2e/**', 'node_modules/**', 'dist/**', '.svelte-kit/**'],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '.svelte-kit/',
        'build/',
        'dist/',
        'src/test/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/*.types.ts',
        '**/mockData/*',
        'src/hooks.client.ts',
        'src/hooks.server.ts',
        'src/app.html',
        '**/+*.ts',
        '**/+*.svelte',
        'playwright.config.ts',
        'vite.config.ts',
        'svelte.config.js'
      ],
      // Only include actual business logic files
      include: [
        'src/lib/**/*.{js,ts,svelte}',
        'src/routes/**/*.{js,ts,svelte}'
      ],
      // Remove thresholds for now - focus on getting started
      thresholds: {
        lines: 0,
        functions: 0,
        branches: 0,
        statements: 0
      }
    },
    
    // Mock configuration
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,
    
    // Path aliases
    alias: {
      '$lib': resolve('./src/lib'),
      '$components': resolve('./src/lib/components'),
      '$utils': resolve('./src/lib/utils'),
      '$stores': resolve('./src/lib/stores')
    }
  }
});