import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import MasonryGallery from '$lib/components/MasonryGallery.svelte';

const mockImages = [
  { src: '/image1.jpg', alt: 'Hair style 1' },
  { src: '/image2.jpg', alt: 'Hair style 2' },
  { src: '/image3.jpg', alt: 'Hair style 3' },
  { src: '/image4.jpg', alt: 'Hair style 4' },
  { src: '/image5.jpg', alt: 'Hair style 5' },
  { src: '/image6.jpg', alt: 'Hair style 6' },
];

describe('MasonryGallery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays images in masonry layout with dynamic column distribution', () => {
    render(MasonryGallery, { props: { images: mockImages } });
    
    const gallery = screen.getByRole('region', { name: /gallery/i });
    expect(gallery).toBeInTheDocument();
    
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(6);
    
    images.forEach((img, index) => {
      expect(img).toHaveAttribute('src', mockImages[index].src);
      expect(img).toHaveAttribute('alt', mockImages[index].alt);
    });
    
    const container = gallery.querySelector('.masonry-container');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('columns-2', 'md:columns-3', 'lg:columns-4');
  });

  it('adjusts columns based on viewport width', async () => {
    render(MasonryGallery, { props: { images: mockImages } });
    
    const gallery = screen.getByRole('region', { name: /gallery/i });
    const container = gallery.querySelector('.masonry-container');
    
    expect(container).toHaveClass('columns-2');
    expect(container).toHaveClass('md:columns-3');
    expect(container).toHaveClass('lg:columns-4');
  });

  it('applies hover effects to images', async () => {
    render(MasonryGallery, { props: { images: mockImages } });
    
    const imageWrappers = screen.getAllByRole('img').map(img => img.parentElement);
    
    imageWrappers.forEach(wrapper => {
      expect(wrapper).toHaveClass('group');
      expect(wrapper).toHaveClass('hover:scale-105');
      expect(wrapper).toHaveClass('hover:shadow-lg');
    });
  });

  it('ensures proper image aspect ratios', () => {
    render(MasonryGallery, { props: { images: mockImages } });
    
    const images = screen.getAllByRole('img');
    
    images.forEach(img => {
      expect(img).toHaveClass('w-full');
      expect(img).toHaveClass('h-auto');
      expect(img.parentElement).toHaveClass('overflow-hidden');
    });
  });

  it('supports custom CSS classes', () => {
    const customClass = 'custom-gallery-class';
    render(MasonryGallery, { props: { images: mockImages, class: customClass } });
    
    const gallery = screen.getByRole('region', { name: /gallery/i });
    expect(gallery).toHaveClass(customClass);
  });

  it('handles empty image array gracefully', () => {
    render(MasonryGallery, { props: { images: [] } });
    
    const gallery = screen.getByRole('region', { name: /gallery/i });
    expect(gallery).toBeInTheDocument();
    
    const images = screen.queryAllByRole('img');
    expect(images).toHaveLength(0);
  });

  it('applies proper spacing between images', () => {
    render(MasonryGallery, { props: { images: mockImages } });
    
    const container = screen.getByRole('region', { name: /gallery/i }).querySelector('.masonry-container');
    expect(container).toHaveClass('gap-4');
    
    const imageWrappers = screen.getAllByRole('img').map(img => img.parentElement);
    imageWrappers.forEach(wrapper => {
      expect(wrapper).toHaveClass('mb-4');
    });
  });

  it('maintains break-inside-avoid for proper masonry layout', () => {
    render(MasonryGallery, { props: { images: mockImages } });
    
    const imageWrappers = screen.getAllByRole('img').map(img => img.parentElement);
    imageWrappers.forEach(wrapper => {
      expect(wrapper).toHaveClass('break-inside-avoid');
    });
  });
});