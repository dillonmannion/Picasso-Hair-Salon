/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{svelte,ts,js}'],
	theme: {
		container: { center: true, padding: '1rem', screens: { xl: '1200px' } },
		extend: {
			colors: {
				paper: { 50: '#FBFBFA', 100: '#F3F3F1' },
				ink: { 900: '#141414', 700: '#2A2A2A', 500: '#5A5A5A' },
				line: '#E6E6E4',
				accent: { 400: '#B9A891' }
			},
			fontFamily: {
				display: ["'Cormorant Garamond'", 'serif'],
				sans: ['Inter', 'system-ui', 'sans-serif']
			},
			letterSpacing: {
				wideish: '.08em',
				widerish: '.14em'
			},
			boxShadow: {
				polaroid: '0 10px 18px rgba(0,0,0,.08)'
			},
			rotate: { 2: '2deg', '-2': '-2deg' }
		}
	},
	plugins: [
		require('@tailwindcss/typography'),
		require('@tailwindcss/aspect-ratio'),
		require('@tailwindcss/forms')
	]
};
