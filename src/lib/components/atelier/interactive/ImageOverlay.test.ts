import { describe, it, expect } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/svelte';
import ImageOverlay from './ImageOverlay.svelte';

describe('ImageOverlay', () => {
	const defaultProps = {
		src: '/test-image.jpg',
		alt: 'Test image',
		overlayContent: 'Overlay text content'
	};

	it('renders image with overlay content', () => {
		const { getByRole, getByText } = render(ImageOverlay, {
			props: defaultProps
		});

		const figure = getByRole('img');
		expect(figure).toHaveAttribute('aria-label', 'Test image');

		const img = figure.querySelector('img');
		expect(img).toHaveAttribute('src', '/test-image.jpg');
		expect(img).toHaveAttribute('alt', 'Test image');

		expect(getByText('Overlay text content')).toBeInTheDocument();
	});

	it('renders with different overlay styles', () => {
		const styles = ['fade', 'slide', 'zoom', 'blur'] as const;

		styles.forEach((overlayStyle) => {
			const { container } = render(ImageOverlay, {
				props: { ...defaultProps, overlayStyle }
			});

			const figure = container.querySelector('.atelier-image-overlay');
			expect(figure).toHaveClass(`atelier-image-overlay--${overlayStyle}`);
		});
	});

	it('positions overlay content correctly', () => {
		const positions = ['center', 'bottom', 'top'] as const;

		positions.forEach((overlayPosition) => {
			const { container } = render(ImageOverlay, {
				props: { ...defaultProps, overlayPosition }
			});

			const content = container.querySelector('.atelier-image-overlay__content');
			expect(content).toHaveClass(`atelier-image-overlay__content--${overlayPosition}`);
		});
	});

	it('applies custom aspect ratio', () => {
		const { container } = render(ImageOverlay, {
			props: {
				...defaultProps,
				aspectRatio: '4/3'
			}
		});

		const figure = container.querySelector('.atelier-image-overlay');
		expect(figure).toHaveStyle({ aspectRatio: '4/3' });
	});

	it('handles hover state', async () => {
		const { container } = render(ImageOverlay, {
			props: defaultProps
		});

		const figure = container.querySelector('.atelier-image-overlay');
		const overlay = container.querySelector('.atelier-image-overlay__overlay');

		expect(figure).not.toHaveClass('atelier-image-overlay--hovered');
		expect(overlay).toHaveAttribute('aria-hidden', 'true');

		await fireEvent.mouseEnter(figure!);
		expect(figure).toHaveClass('atelier-image-overlay--hovered');
		expect(overlay).toHaveAttribute('aria-hidden', 'false');

		await fireEvent.mouseLeave(figure!);
		expect(figure).not.toHaveClass('atelier-image-overlay--hovered');
		expect(overlay).toHaveAttribute('aria-hidden', 'true');
	});

	it('handles focus state', async () => {
		const { container } = render(ImageOverlay, {
			props: defaultProps
		});

		const figure = container.querySelector('.atelier-image-overlay');

		expect(figure).toHaveAttribute('tabindex', '0');
		expect(figure).not.toHaveClass('atelier-image-overlay--hovered');

		await fireEvent.focus(figure!);
		expect(figure).toHaveClass('atelier-image-overlay--hovered');

		await fireEvent.blur(figure!);
		expect(figure).not.toHaveClass('atelier-image-overlay--hovered');
	});

	it('renders snippet content', () => {
		const { getByText } = render(ImageOverlay, {
			props: {
				...defaultProps,
				overlayContent: () => '<div>Custom overlay content</div>'
			}
		});

		expect(getByText('Custom overlay content')).toBeInTheDocument();
	});

	it('handles image loading state', async () => {
		const { container } = render(ImageOverlay, {
			props: defaultProps
		});

		const figure = container.querySelector('.atelier-image-overlay');
		const img = container.querySelector('.atelier-image-overlay__image');

		expect(figure).not.toHaveClass('atelier-image-overlay--loaded');

		await fireEvent.load(img!);
		expect(figure).toHaveClass('atelier-image-overlay--loaded');
	});

	it('sets loading attribute on image', () => {
		const { container, rerender } = render(ImageOverlay, {
			props: { ...defaultProps, loading: 'lazy' }
		});

		let img = container.querySelector('.atelier-image-overlay__image');
		expect(img).toHaveAttribute('loading', 'lazy');

		rerender({ props: { ...defaultProps, loading: 'eager' } });
		img = container.querySelector('.atelier-image-overlay__image');
		expect(img).toHaveAttribute('loading', 'eager');
	});

	it('respects custom className', () => {
		const { container } = render(ImageOverlay, {
			props: {
				...defaultProps,
				class: 'custom-overlay-class'
			}
		});

		const figure = container.querySelector('.atelier-image-overlay');
		expect(figure).toHaveClass('custom-overlay-class');
		expect(figure).toHaveClass('atelier-image-overlay');
	});

	it('combines multiple classes correctly', () => {
		const { container } = render(ImageOverlay, {
			props: {
				...defaultProps,
				overlayStyle: 'zoom',
				class: 'my-custom-class'
			}
		});

		const figure = container.querySelector('.atelier-image-overlay');
		expect(figure).toHaveClass('atelier-image-overlay');
		expect(figure).toHaveClass('atelier-image-overlay--zoom');
		expect(figure).toHaveClass('my-custom-class');
	});

	it('handles empty overlay content', () => {
		const { container } = render(ImageOverlay, {
			props: {
				...defaultProps,
				overlayContent: ''
			}
		});

		const text = container.querySelector('.atelier-image-overlay__text');
		expect(text).toBeInTheDocument();
		expect(text?.textContent).toBe('');
	});

	it('maintains aspect ratio without distorting image', () => {
		const { container } = render(ImageOverlay, {
			props: {
				...defaultProps,
				aspectRatio: '1/1'
			}
		});

		const img = container.querySelector('.atelier-image-overlay__image');
		expect(img).toHaveStyle({ objectFit: 'cover' });
	});
});
