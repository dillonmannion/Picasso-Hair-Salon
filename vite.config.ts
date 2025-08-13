import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide'
		})
	],

	// Simplified configuration - removed redundant options
	optimizeDeps: {
		include: ['@supabase/supabase-js', '@supabase/ssr', 'date-fns', 'clsx', 'tailwind-merge']
	},

	server: {
		fs: {
			allow: ['..']
		},
		warmup: {
			clientFiles: ['./src/routes/+layout.svelte']
		}
	}
});
