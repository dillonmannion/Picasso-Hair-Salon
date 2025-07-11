import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

const VENDOR_CHUNK_MAPPING = {
  '@supabase': 'supabase',
  zod: 'zod',
};

const DEPENDENCY_PRE_BUNDLE_LIST = ['@supabase/supabase-js', '@supabase/ssr', 'zod'];

/**
 * @param {string} id
 * @returns {string | undefined}
 */
const determineChunkId = (id) => {
  if (!id.includes('node_modules')) {
    return undefined;
  }

  for (const [pattern, chunkName] of Object.entries(VENDOR_CHUNK_MAPPING)) {
    if (id.includes(pattern)) {
      return chunkName;
    }
  }

  return 'vendor';
};

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],

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

    // CSS code splitting enabled for better caching
    cssCodeSplit: true,

    // Chunk size warning limit (500kb)
    chunkSizeWarningLimit: 500,

    // CSS minification using esbuild for performance
    cssMinify: 'esbuild',

    // Code splitting strategy for vendor libraries
    rollupOptions: {
      output: {
        manualChunks: determineChunkId,
      },
    },
  },

  // Dependency optimization for faster dev startup
  optimizeDeps: {
    include: DEPENDENCY_PRE_BUNDLE_LIST,
  },

  // Define global constants
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
});
