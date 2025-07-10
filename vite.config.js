import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],

  // Test configuration
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
  },

  // Server configuration
  server: {
    port: 5173,
    strictPort: true,
    host: true,
  },

  // Build optimization
  build: {
    // Improve build performance
    reportCompressedSize: false,

    // Code splitting strategy
    rollupOptions: {
      output: {
        manualChunks: {
          svelte: ['svelte'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },

  // Define global constants
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
});
