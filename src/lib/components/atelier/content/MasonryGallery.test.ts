import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, waitFor, cleanup } from '@testing-library/svelte';
import MasonryGallery from './MasonryGallery.svelte';

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
	observe: vi.fn(),
	unobserve: vi.fn(),
	disconnect: vi.fn()
});
window.IntersectionObserver = mockIntersectionObserver;

describe('MasonryGallery', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Set default window width
		Object.defineProperty(window, 'innerWidth', {
			writable: true,
			configurable: true,
			value: 1200
		});
	});

	afterEach(() => {
		cleanup();
	});

	const mockImages = [
		{
			id: '1',
			src: '/image1.jpg',
			alt: 'Image 1',
			width: 400,
			height: 300,
			caption: 'Beautiful sunset'
		},
		{
			id: '2',
			src: '/image2.jpg',
			alt: 'Image 2',
			width: 400,
			height: 500
		},
		{
			id: '3',
			src: '/image3.jpg',
			alt: 'Image 3',
			width: 400,
			height: 400,
			caption: 'City skyline'
		},
		{
			id: '4',
			src: '/image4.jpg',
			alt: 'Image 4'
		}
	];

	it('renders all images', () => {
		const { getAllByRole, getByLabelText } = render(MasonryGallery, {
			props: { images: mockImages }
		});

		const gallery = getByLabelText('Image gallery');
		expect(gallery).toBeInTheDocument();

		const images = getAllByRole('img');
		expect(images).toHaveLength(4);

		images.forEach((img, index) => {
			expect(img).toHaveAttribute('src', mockImages[index].src);
			expect(img).toHaveAttribute('alt', mockImages[index].alt);
		});
	});

	it('renders image captions when provided', () => {
		const { getByText, queryByText } = render(MasonryGallery, {
			props: { images: mockImages }
		});

		expect(getByText('Beautiful sunset')).toBeInTheDocument();
		expect(getByText('City skyline')).toBeInTheDocument();
		// Image 2 has no caption
		expect(queryByText('Image 2')).not.toBeInTheDocument();
	});

	it('distributes images across columns based on viewport', async () => {
		const { container } = render(MasonryGallery, {
			props: {
				images: mockImages,
				columns: { mobile: 1, tablet: 2, desktop: 3 }
			}
		});

		const columns = container.querySelectorAll('.atelier-gallery__column');
		expect(columns).toHaveLength(3); // Desktop view

		// Check that images are distributed
		const totalImages = Array.from(columns).reduce(
			(sum, col) => sum + col.querySelectorAll('.atelier-gallery__item').length,
			0
		);
		expect(totalImages).toBe(4);
	});

	it('updates column count on window resize', async () => {
		const { container } = render(MasonryGallery, {
			props: { images: mockImages }
		});

		// Initial desktop view
		let columns = container.querySelectorAll('.atelier-gallery__column');
		expect(columns).toHaveLength(3);

		// Resize to tablet
		window.innerWidth = 800;
		window.dispatchEvent(new Event('resize'));
		await waitFor(() => {
			columns = container.querySelectorAll('.atelier-gallery__column');
			expect(columns).toHaveLength(2);
		});

		// Resize to mobile
		window.innerWidth = 500;
		window.dispatchEvent(new Event('resize'));
		await waitFor(() => {
			columns = container.querySelectorAll('.atelier-gallery__column');
			expect(columns).toHaveLength(1);
		});
	});

	it('applies custom gap spacing', () => {
		const { container } = render(MasonryGallery, {
			props: { images: mockImages, gap: 24 }
		});

		const gallery = container.querySelector('.atelier-gallery');
		expect(gallery).toHaveStyle({ '--atelier-gallery-gap': '24px' });
	});

	it('makes images clickable when lightbox is enabled', () => {
		const { getAllByRole } = render(MasonryGallery, {
			props: { images: mockImages, lightboxEnabled: true }
		});

		const figures = getAllByRole('button');
		expect(figures).toHaveLength(4);

		figures.forEach((figure, index) => {
			expect(figure).toHaveAttribute('tabindex', '0');
			expect(figure).toHaveAttribute('data-lightbox', 'gallery');
			expect(figure).toHaveAttribute('data-src', mockImages[index].src);
			expect(figure).toHaveClass('atelier-gallery__item--clickable');
		});
	});

	it('dispatches custom event on image click when lightbox enabled', async () => {
		const { container, getAllByRole } = render(MasonryGallery, {
			props: { images: mockImages, lightboxEnabled: true }
		});

		const gallery = container.querySelector('.atelier-gallery');
		const eventHandler = vi.fn();
		gallery?.addEventListener('atelier:gallery:open', eventHandler);

		const firstImage = getAllByRole('button')[0];
		await fireEvent.click(firstImage);

		expect(eventHandler).toHaveBeenCalledTimes(1);
		expect(eventHandler.mock.calls[0][0].detail).toEqual({
			image: mockImages[0],
			images: mockImages
		});
	});

	it('handles keyboard navigation for lightbox', async () => {
		const { container, getAllByRole } = render(MasonryGallery, {
			props: { images: mockImages, lightboxEnabled: true }
		});

		const gallery = container.querySelector('.atelier-gallery');
		const eventHandler = vi.fn();
		gallery?.addEventListener('atelier:gallery:open', eventHandler);

		const firstImage = getAllByRole('button')[0];

		// Test Enter key
		await fireEvent.keyDown(firstImage, { key: 'Enter' });
		expect(eventHandler).toHaveBeenCalledTimes(1);

		// Test Space key
		await fireEvent.keyDown(firstImage, { key: ' ' });
		expect(eventHandler).toHaveBeenCalledTimes(2);
	});

	it('animates images on scroll when animateOnScroll is true', async () => {
		const observerCallback = mockIntersectionObserver.mock.calls[0][0];

		const { container } = render(MasonryGallery, {
			props: { images: mockImages, animateOnScroll: true }
		});

		const items = container.querySelectorAll('.atelier-gallery__item');

		// Initially not visible
		items.forEach((item) => {
			expect(item).not.toHaveClass('atelier-gallery__item--visible');
		});

		// Simulate intersection
		items[0].setAttribute('data-image-id', '1');
		observerCallback([{ isIntersecting: true, target: items[0] }]);

		await waitFor(() => {
			expect(items[0]).toHaveClass('atelier-gallery__item--visible');
		});
	});

	it('shows all images immediately when animateOnScroll is false', () => {
		const { container } = render(MasonryGallery, {
			props: { images: mockImages, animateOnScroll: false }
		});

		const items = container.querySelectorAll('.atelier-gallery__item');
		items.forEach((item) => {
			expect(item).toHaveClass('atelier-gallery__item--visible');
		});
	});

	it('tracks image loading state', async () => {
		const { container, getAllByRole } = render(MasonryGallery, {
			props: { images: mockImages }
		});

		const items = container.querySelectorAll('.atelier-gallery__item');
		const images = getAllByRole('img');

		// Initially not loaded
		items.forEach((item) => {
			expect(item).not.toHaveClass('atelier-gallery__item--loaded');
		});

		// Simulate image load
		await fireEvent.load(images[0]);
		expect(items[0]).toHaveClass('atelier-gallery__item--loaded');
	});

	it('respects custom className', () => {
		const { container } = render(MasonryGallery, {
			props: {
				images: mockImages,
				class: 'custom-gallery-class'
			}
		});

		const gallery = container.querySelector('.atelier-gallery');
		expect(gallery).toHaveClass('custom-gallery-class');
	});

	it('sets up IntersectionObserver correctly', () => {
		render(MasonryGallery, {
			props: { images: mockImages, animateOnScroll: true }
		});

		expect(mockIntersectionObserver).toHaveBeenCalledWith(expect.any(Function), {
			threshold: 0.1,
			rootMargin: '50px'
		});
		expect(mockIntersectionObserver().observe).toHaveBeenCalledTimes(4);
	});

	it('cleans up on unmount', () => {
		const { unmount } = render(MasonryGallery, {
			props: { images: mockImages }
		});

		const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

		unmount();

		expect(mockIntersectionObserver().disconnect).toHaveBeenCalled();
		expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
	});
});
