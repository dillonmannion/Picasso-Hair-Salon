import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import ImageOverlay from '$lib/components/ImageOverlay.svelte';

describe('ImageOverlay', () => {
  it('should render image with provided src and alt text', () => {
    render(ImageOverlay, {
      props: {
        src: '/test-image.jpg',
        alt: 'Test image'
      }
    });

    const image = screen.getByAltText('Test image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/test-image.jpg');
  });

  it('should apply image scaling classes on container hover', async () => {
    const { container } = render(ImageOverlay, {
      props: {
        src: '/test-image.jpg',
        alt: 'Test image'
      }
    });

    const overlayContainer = container.querySelector('.group');
    const image = screen.getByAltText('Test image');
    
    expect(overlayContainer).toBeInTheDocument();
    expect(image).toHaveClass('group-hover:scale-105');
    expect(image).toHaveClass('transition-transform');
    expect(image).toHaveClass('duration-500');
  });

  it('should show overlay with dark background on hover', () => {
    const { container } = render(ImageOverlay, {
      props: {
        src: '/test-image.jpg',
        alt: 'Test image'
      }
    });

    const overlay = container.querySelector('.absolute.inset-0');
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveClass('bg-black');
    expect(overlay).toHaveClass('bg-opacity-0');
    expect(overlay).toHaveClass('group-hover:bg-opacity-40');
    expect(overlay).toHaveClass('transition-opacity');
  });

  it('should show icon when provided and on hover', () => {
    render(ImageOverlay, {
      props: {
        src: '/test-image.jpg',
        alt: 'Test image',
        icon: '+'
      }
    });

    const iconElement = screen.getByText('+');
    expect(iconElement).toBeInTheDocument();
    expect(iconElement).toHaveClass('opacity-0');
    expect(iconElement).toHaveClass('group-hover:opacity-100');
    expect(iconElement).toHaveClass('transition-opacity');
  });

  it('should not show icon when not provided', () => {
    render(ImageOverlay, {
      props: {
        src: '/test-image.jpg',
        alt: 'Test image'
      }
    });

    const iconElement = screen.queryByTestId('overlay-icon');
    expect(iconElement).not.toBeInTheDocument();
  });

  it('should position icon in the center of overlay', () => {
    const { container } = render(ImageOverlay, {
      props: {
        src: '/test-image.jpg',
        alt: 'Test image',
        icon: '→'
      }
    });

    const iconContainer = container.querySelector('.absolute.inset-0.flex');
    expect(iconContainer).toHaveClass('items-center');
    expect(iconContainer).toHaveClass('justify-center');
  });

  it('should handle custom CSS classes', () => {
    const { container } = render(ImageOverlay, {
      props: {
        src: '/test-image.jpg',
        alt: 'Test image',
        class: 'custom-class rounded-lg'
      }
    });

    const overlayContainer = container.querySelector('.group');
    expect(overlayContainer).toHaveClass('custom-class');
    expect(overlayContainer).toHaveClass('rounded-lg');
  });

  it('should maintain aspect ratio with proper image styling', () => {
    render(ImageOverlay, {
      props: {
        src: '/test-image.jpg',
        alt: 'Test image'
      }
    });

    const image = screen.getByAltText('Test image');
    expect(image).toHaveClass('w-full');
    expect(image).toHaveClass('h-full');
    expect(image).toHaveClass('object-cover');
  });

  it('should handle loading state properly', () => {
    render(ImageOverlay, {
      props: {
        src: '/test-image.jpg',
        alt: 'Test image',
        loading: 'lazy'
      }
    });

    const image = screen.getByAltText('Test image');
    expect(image).toHaveAttribute('loading', 'lazy');
  });
});