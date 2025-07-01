import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Enable preprocessing for TypeScript, PostCSS, etc.
  preprocess: vitePreprocess(),

  kit: {
    // Vercel adapter for deployment
    adapter: adapter({
      // Enable edge functions for better performance
      runtime: 'edge',
      
      // Configure regions for edge functions
      regions: ['iad1'],
      
      // Split routes for optimal performance
      split: true
    }),
    
    // Alias configuration for cleaner imports
    alias: {
      $components: 'src/lib/components',
      $lib: 'src/lib',
      $utils: 'src/lib/utils',
      $stores: 'src/lib/stores',
      $types: 'src/types'
    },
    
    // CSP configuration for security
    csp: {
      mode: 'auto',
      directives: {
        'script-src': ['self', 'unsafe-inline'],
        'style-src': ['self', 'unsafe-inline']
      }
    },
    
    // Environment variable prefix
    env: {
      publicPrefix: 'PUBLIC_',
      privatePrefix: ''
    }
  },
  
  // Compiler options for Svelte 5
  compilerOptions: {
    // Enable runes mode
    runes: true,
    
    // Development mode settings
    dev: process.env.NODE_ENV !== 'production'
  }
};

export default config;