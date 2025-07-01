<!--
  @component Typography
  Atelier Design System Typography component for consistent text styling.
  
  @example
  ```svelte
  <Typography variant="hero" as="h1">
    Welcome to Atelier
  </Typography>
  ```
  
  @props {('hero'|'display'|'heading'|'body'|'caption')} [variant='body'] - Typography style variant
  @props {('h1'|'h2'|'h3'|'h4'|'h5'|'h6'|'p'|'span'|'div')} [as='p'] - HTML element to render
  @props {('serif'|'sans'|'display')} [font] - Font family override
  @props {('left'|'center'|'right')} [align='left'] - Text alignment
  @props {boolean} [gradient=false] - Apply gold gradient effect
  @props {string} [class] - Additional CSS classes
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'hero' | 'display' | 'heading' | 'body' | 'caption';
		as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
		font?: 'serif' | 'sans' | 'display';
		align?: 'left' | 'center' | 'right';
		gradient?: boolean;
		class?: string;
		children?: Snippet;
	}

	let {
		variant = 'body',
		as = 'p',
		font,
		align = 'left',
		gradient = false,
		class: className = '',
		children
	}: Props = $props();

	const variantClasses = {
		hero: 'text-6xl md:text-7xl lg:text-8xl font-light leading-[0.9] tracking-tight',
		display: 'text-4xl md:text-5xl lg:text-6xl font-light leading-tight tracking-tight',
		heading: 'text-2xl md:text-3xl lg:text-4xl font-medium leading-tight',
		body: 'text-base md:text-lg leading-relaxed',
		caption: 'text-sm md:text-base leading-relaxed'
	};

	const fontClasses = {
		serif: 'font-atelier-serif',
		sans: 'font-atelier-sans',
		display: 'font-atelier-display'
	};

	const alignClasses = {
		left: 'text-left',
		center: 'text-center',
		right: 'text-right'
	};

	const defaultFonts = {
		hero: 'display',
		display: 'display',
		heading: 'serif',
		body: 'sans',
		caption: 'sans'
	};

	const selectedFont = $derived(font || defaultFonts[variant]) as 'serif' | 'sans' | 'display';

	const typographyClass = $derived(
		`atelier-typography atelier-typography--${variant} ${variantClasses[variant]} ${
			fontClasses[selectedFont]
		} ${alignClasses[align]} ${gradient ? 'atelier-text-gradient-gold' : ''} ${className}`
	);

	const Element = as as keyof HTMLElementTagNameMap;
</script>

<svelte:element this={Element} class={typographyClass}>
	{@render children?.()}
</svelte:element>

<style>
	.atelier-typography {
		color: var(--atelier-foreground);
		transition: color var(--atelier-transition-base) ease;
	}

	.atelier-typography--hero,
	.atelier-typography--display {
		letter-spacing: -0.02em;
	}

	.atelier-typography--heading {
		letter-spacing: -0.01em;
	}

	.atelier-typography--caption {
		opacity: 0.8;
	}

	@media (prefers-reduced-motion: no-preference) {
		.atelier-text-gradient-gold {
			background-size: 200% auto;
			animation: atelier-shimmer 3s ease-in-out infinite;
		}
	}
</style>
