import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			images: {
				sizes: [640, 828, 1200, 1920, 3840],
				formats: ['image/avif', 'image/webp'],
				domains: ['picasso-hair-salon.vercel.app']
			}
		}),

		alias: {
			$components: 'src/lib/components',
			$ui: 'src/lib/components/ui',
			$custom: 'src/lib/components/custom'
		}
	}
};

export default config;
