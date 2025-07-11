import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Enable preprocessing for TypeScript, PostCSS, etc.
  preprocess: [vitePreprocess()],

  kit: {
    // Vercel adapter for deployment
    adapter: adapter({
      // Enable edge functions for better performance
      runtime: 'edge',

      // Configure regions for edge functions
      regions: ['iad1', 'sfo1', 'pdx1', 'cle1', 'gru1', 'hnd1', 'lhr1', 'syd1'],

      // Split routes for optimal performance
      split: true,
    }),

    // Alias configuration for cleaner imports
    alias: {
      $lib: 'src/lib',
      $lib$: 'src/lib',
      $types: 'src/types'
    },

    // CSP configuration for security
    csp: {
      mode: 'hash',
      directives: {
        'script-src': ['self', 'https://*.supabase.co'],
        'style-src': ['self', 'unsafe-inline'],
        'object-src': ['none'],
        'base-uri': ['self'],
        'frame-ancestors': ['none']
      },
    },

    // Service worker configuration
    serviceWorker: {
      register: false
    },

    // Environment variable prefix
    env: {
      publicPrefix: 'PUBLIC_',
      privatePrefix: '',
    },
  },

  // Compiler options for Svelte 5
  compilerOptions: {
    // Enable runes mode
    runes: true,

    // Development mode settings
    dev: process.env.NODE_ENV !== 'production',
  },
};

export default config;
