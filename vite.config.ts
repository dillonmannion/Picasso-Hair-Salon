import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide'
		})
	] as const,

	// CSS Performance: Enable threaded preprocessing (40% faster startup)
	css: {
		preprocessorMaxWorkers: true
	},

	// Dependency optimization for better performance
	optimizeDeps: {
		include: [
			'@supabase/supabase-js',
			'@supabase/ssr',
			'date-fns',
			'clsx',
			'tailwind-merge',
			'zod',
			'@internationalized/date'
		],
		// Better parallel processing - don't wait for crawler to finish
		holdUntilCrawlEnd: false
	},

	server: {
		// Simplified pnpm support - automatic detection works in most cases
		fs: {
			allow: ['..']
		},
		// Pre-warm only frequently accessed files for faster initial loads
		warmup: {
			clientFiles: ['./src/routes/+layout.svelte', './src/lib/supabaseClient.ts']
		},
		hmr: {
			overlay: true
		}
	},

	build: {
		target: 'esnext',
		minify: 'esbuild',
		// Better source maps for debugging
		sourcemap: false,
		// CSS code splitting for better loading performance
		cssCodeSplit: true
	},

	resolve: {
		alias: {
			$lib: './src/lib'
		}
	},

	test: {
		environment: 'jsdom',
		globals: true,
		setupFiles: ['./src/lib/test-utils/setup.js'],
		include: ['src/**/*.{test,spec}.{js,ts}'],
		coverage: {
			reporter: ['text', 'json', 'html'],
			exclude: [
				'node_modules/',
				'src/lib/test-utils/',
				'**/*.config.*',
				'**/__tests__/**'
			]
		},
		pool: 'forks',
		clearMocks: true,
		mockReset: true,
		restoreMocks: true
	}
});
