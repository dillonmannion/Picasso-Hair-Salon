import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { mergeConfig } from 'vite';
import viteConfig from './vite.config';

export default mergeConfig(
	viteConfig,
	defineConfig({
		test: {
			// Pool configuration optimized for performance and stability
			pool: 'threads',
			poolOptions: {
				threads: {
					useAtomics: true, // Better thread synchronization
					minThreads: 1,
					maxThreads: 4,
					// Memory management for better resource usage
					memoryLimit: '512MB'
				}
			},

			// Multi-project setup for better test organization
			projects: [
				{
					plugins: [sveltekit()],
					test: {
						name: 'client',
						environment: 'jsdom',
						clearMocks: true,
						// Svelte component tests
						include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
						exclude: ['src/lib/server/**'],
						setupFiles: ['./vitest-setup-client.ts'],
						// Better isolation for component tests
						isolate: true
					},
					define: {
						// Ensure Svelte runs in browser mode for client tests
						'process.env.NODE_ENV': '"test"'
					},
					resolve: {
						conditions: ['browser']
					}
				},
				{
					test: {
						name: 'server',
						environment: 'node',
						// Server-side and utility tests
						include: ['src/**/*.{test,spec}.{js,ts}'],
						exclude: ['src/**/*.svelte.{test,spec}.{js,ts}'],
						// Can disable isolation for server tests if no side effects
						isolate: false
					}
				}
			],

			// Enhanced coverage with latest performance features
			coverage: {
				provider: 'v8',
				reporter: ['text', 'json', 'html'],
				include: ['src/**/*.{js,ts,svelte}'],
				exclude: ['src/**/*.{test,spec}.{js,ts}', 'src/lib/paraglide/**', 'src/app.html'],
				// Experimental: Better performance and alignment with Istanbul
				experimentalAstAwareRemapping: true,
				thresholds: {
					global: {
						branches: 80,
						functions: 80,
						lines: 80,
						statements: 80
					}
				}
			},

			// Performance and debugging settings
			reporters: ['verbose'],
			testTimeout: 10000,
			hookTimeout: 10000,
			fileParallelism: true,
			slowTestThreshold: 1000, // Mark tests over 1s as slow

			// Enhanced dependency optimization
			deps: {
				optimizer: {
					web: {
						enabled: true,
						include: [
							'@testing-library/svelte',
							'@testing-library/jest-dom',
							'jsdom',
							'@supabase/supabase-js'
						]
					}
				}
			},

			// Better error handling and debugging
			includeTaskLocation: true, // Better debugging with test locations
			sequence: {
				setupFiles: 'list' // Run setup files sequentially for predictability
			}
		}
	})
);
