import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import TextHoverHighlight from './TextHoverHighlight.svelte';

describe('TextHoverHighlight', () => {
	const defaultProps = {
		text: 'Hover over me'
	};

	it('renders text content', () => {
		const { getByText } = render(TextHoverHighlight, {
			props: defaultProps
		});

		expect(getByText('Hover over me')).toBeInTheDocument();
	});

	it('renders with default span tag', () => {
		const { container } = render(TextHoverHighlight, {
			props: defaultProps
		});

		const element = container.querySelector('span.atelier-text-highlight');
		expect(element).toBeInTheDocument();
		expect(element?.textContent).toBe('Hover over me');
	});

	it('renders with different HTML tags', () => {
		const tags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;

		tags.forEach((tag) => {
			const { container } = render(TextHoverHighlight, {
				props: { ...defaultProps, tag }
			});

			const element = container.querySelector(`${tag}.atelier-text-highlight`);
			expect(element).toBeInTheDocument();
		});
	});

	it('applies different animation styles', () => {
		const styles = ['underline', 'background', 'glow', 'gradient'] as const;

		styles.forEach((animationStyle) => {
			const { container } = render(TextHoverHighlight, {
				props: { ...defaultProps, animationStyle }
			});

			const element = container.querySelector('.atelier-text-highlight');
			expect(element).toHaveClass(`atelier-text-highlight--${animationStyle}`);
		});
	});

	it('applies custom highlight color', () => {
		const { container } = render(TextHoverHighlight, {
			props: {
				...defaultProps,
				highlightColor: '#ff6b6b'
			}
		});

		const element = container.querySelector('.atelier-text-highlight');
		expect(element).toHaveStyle({ '--atelier-highlight-color': '#ff6b6b' });
	});

	it('uses default highlight color when not specified', () => {
		const { container } = render(TextHoverHighlight, {
			props: defaultProps
		});

		const element = container.querySelector('.atelier-text-highlight');
		expect(element).toHaveStyle({
			'--atelier-highlight-color': 'var(--atelier-primary, #3b82f6)'
		});
	});

	it('respects custom className', () => {
		const { container } = render(TextHoverHighlight, {
			props: {
				...defaultProps,
				class: 'custom-text-class'
			}
		});

		const element = container.querySelector('.atelier-text-highlight');
		expect(element).toHaveClass('custom-text-class');
		expect(element).toHaveClass('atelier-text-highlight');
	});

	it('combines animation class with custom class', () => {
		const { container } = render(TextHoverHighlight, {
			props: {
				...defaultProps,
				animationStyle: 'glow',
				class: 'my-custom-class'
			}
		});

		const element = container.querySelector('.atelier-text-highlight');
		expect(element).toHaveClass('atelier-text-highlight');
		expect(element).toHaveClass('atelier-text-highlight--glow');
		expect(element).toHaveClass('my-custom-class');
	});

	it('maintains proper structure for gradient animation', () => {
		const { container } = render(TextHoverHighlight, {
			props: {
				...defaultProps,
				animationStyle: 'gradient'
			}
		});

		const element = container.querySelector('.atelier-text-highlight--gradient');
		expect(element).toBeInTheDocument();
		// Gradient style requires specific CSS properties that are applied via styles
	});

	it('renders empty text', () => {
		const { container } = render(TextHoverHighlight, {
			props: {
				text: ''
			}
		});

		const element = container.querySelector('.atelier-text-highlight');
		expect(element).toBeInTheDocument();
		expect(element?.textContent).toBe('');
	});

	it('handles long text content', () => {
		const longText =
			'This is a very long text that should still be rendered properly within the component';
		const { getByText } = render(TextHoverHighlight, {
			props: {
				text: longText
			}
		});

		expect(getByText(longText)).toBeInTheDocument();
	});

	it('hover interaction preserves text content', async () => {
		const { container, getByText } = render(TextHoverHighlight, {
			props: defaultProps
		});

		const element = container.querySelector('.atelier-text-highlight');
		expect(element).toBeInTheDocument();

		// Hover should not change the text content
		await fireEvent.mouseEnter(element!);
		expect(getByText('Hover over me')).toBeInTheDocument();

		await fireEvent.mouseLeave(element!);
		expect(getByText('Hover over me')).toBeInTheDocument();
	});
});
