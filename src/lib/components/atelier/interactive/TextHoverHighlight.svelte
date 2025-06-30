<script lang="ts">
	interface Props {
		text: string;
		highlightColor?: string;
		animationStyle?: 'underline' | 'background' | 'glow' | 'gradient';
		tag?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
		class?: string;
	}

	let {
		text,
		highlightColor = 'var(--atelier-primary, #3b82f6)',
		animationStyle = 'underline',
		tag = 'span',
		class: className = ''
	}: Props = $props();

	const animationClasses = {
		underline: 'atelier-text-highlight--underline',
		background: 'atelier-text-highlight--background',
		glow: 'atelier-text-highlight--glow',
		gradient: 'atelier-text-highlight--gradient'
	};
</script>

<svelte:element
	this={tag}
	class="atelier-text-highlight {animationClasses[animationStyle]} {className}"
	style:--atelier-highlight-color={highlightColor}
>
	{text}
</svelte:element>

<style>
	.atelier-text-highlight {
		position: relative;
		display: inline-block;
		cursor: default;
		transition: color 0.3s ease;
		color: var(--atelier-text-primary, #1a1a1a);

		@media (prefers-color-scheme: dark) {
			color: var(--atelier-text-primary-dark, #f5f5f5);
		}
	}

	/* Underline animation */
	.atelier-text-highlight--underline {
		&::after {
			content: '';
			position: absolute;
			bottom: -2px;
			left: 0;
			width: 0;
			height: 2px;
			background: var(--atelier-highlight-color);
			transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
			transform-origin: left center;
		}

		&:hover::after {
			width: 100%;
		}
	}

	/* Background animation */
	.atelier-text-highlight--background {
		padding: 0.125em 0.25em;
		margin: -0.125em -0.25em;
		border-radius: 0.25em;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

		&:hover {
			background: var(--atelier-highlight-color);
			color: white;
			transform: scale(1.05);
			box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

			@media (prefers-color-scheme: dark) {
				box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
			}
		}
	}

	/* Glow animation */
	.atelier-text-highlight--glow {
		transition: all 0.3s ease;

		&:hover {
			color: var(--atelier-highlight-color);
			text-shadow:
				0 0 8px var(--atelier-highlight-color),
				0 0 16px var(--atelier-highlight-color),
				0 0 24px var(--atelier-highlight-color);
			transform: translateY(-1px);
		}
	}

	/* Gradient animation */
	.atelier-text-highlight--gradient {
		background: linear-gradient(
			to right,
			var(--atelier-highlight-color) 0%,
			var(--atelier-highlight-color) 50%,
			currentColor 50%,
			currentColor 100%
		);
		background-size: 200% 100%;
		background-position: 100% 0;
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		transition: background-position 0.3s cubic-bezier(0.4, 0, 0.2, 1);

		&:hover {
			background-position: 0 0;
		}

		/* Fallback for browsers that don't support background-clip: text */
		@supports not (-webkit-background-clip: text) {
			background: none;
			-webkit-text-fill-color: currentColor;

			&:hover {
				color: var(--atelier-highlight-color);
			}
		}
	}

	/* Reduced motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.atelier-text-highlight {
			transition: none;

			&::after {
				transition: none;
			}

			&:hover {
				transform: none;
				text-shadow: none;
			}
		}

		.atelier-text-highlight--underline:hover::after {
			width: 100%;
		}

		.atelier-text-highlight--gradient {
			background-position: 0 0;
		}
	}

	/* Typography variations */
	h1.atelier-text-highlight,
	h2.atelier-text-highlight,
	h3.atelier-text-highlight {
		font-weight: inherit;
		line-height: inherit;
		margin: 0;
	}

	p.atelier-text-highlight {
		margin: 0;
		line-height: inherit;
	}
</style>
