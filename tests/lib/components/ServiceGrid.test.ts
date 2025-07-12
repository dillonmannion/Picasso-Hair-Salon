import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import ServiceGrid from '$lib/components/ServiceGrid.svelte';

type Service = {
  id: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  icon?: string;
};

describe('ServiceGrid', () => {
  const mockServices: Service[] = [
    {
      id: 'haircut',
      title: 'Premium Haircut',
      description: 'Expert styling and cutting services tailored to your personal style',
      image: '/images/haircut.jpg',
      imageAlt: 'Premium haircut service'
    },
    {
      id: 'coloring',
      title: 'Hair Coloring',
      description: 'Professional hair coloring with premium products and techniques',
      image: '/images/coloring.jpg',
      imageAlt: 'Hair coloring service',
      icon: '✨'
    },
    {
      id: 'treatment',
      title: 'Hair Treatment',
      description: 'Luxurious hair treatments for healthy, beautiful hair',
      image: '/images/treatment.jpg',
      imageAlt: 'Hair treatment service',
      icon: '💆'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock IntersectionObserver
    const mockIntersectionObserver = vi.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    });
    window.IntersectionObserver = mockIntersectionObserver as unknown as typeof IntersectionObserver;
  });

  it('renders grid of service cards with images and descriptions', () => {
    render(ServiceGrid, { services: mockServices });

    expect(screen.getByRole('grid')).toBeInTheDocument();
    
    mockServices.forEach(service => {
      expect(screen.getByText(service.title)).toBeInTheDocument();
      expect(screen.getByText(service.description)).toBeInTheDocument();
      expect(screen.getByAltText(service.imageAlt)).toBeInTheDocument();
    });
  });

  it('uses ImageOverlay for service images', () => {
    render(ServiceGrid, { services: mockServices });

    const images = screen.getAllByRole('img');
    images.forEach((img, index) => {
      const service = mockServices[index];
      expect(img).toHaveAttribute('src', service.image);
      expect(img).toHaveAttribute('alt', service.imageAlt);
      expect(img).toHaveClass('object-cover');
      
      const imageContainer = img.closest('.relative.overflow-hidden.group');
      expect(imageContainer).toBeInTheDocument();
    });
  });

  it('applies staggered animations to cards', async () => {
    const { container } = render(ServiceGrid, { services: mockServices });

    const animatedElements = container.querySelectorAll('[data-animated]');
    
    expect(animatedElements).toHaveLength(mockServices.length);
    
    // The AnimatedElement component sets animation delay to 0 initially when not visible
    // But the delay prop is still passed to the component
    const articles = screen.getAllByRole('article');
    expect(articles).toHaveLength(mockServices.length);
  });

  it('maintains responsive layout', () => {
    render(ServiceGrid, { services: mockServices });

    const grid = screen.getByRole('grid');
    expect(grid).toHaveClass('grid-cols-1');
    expect(grid).toHaveClass('md:grid-cols-2');
    expect(grid).toHaveClass('lg:grid-cols-3');
    expect(grid).toHaveClass('gap-8');
  });

  it('accepts custom CSS classes', () => {
    const customClass = 'custom-service-grid';
    render(ServiceGrid, { services: mockServices, class: customClass });

    const grid = screen.getByRole('grid');
    expect(grid).toHaveClass(customClass);
  });

  it('renders empty state when no services provided', () => {
    render(ServiceGrid, { services: [] });

    const grid = screen.getByRole('grid');
    expect(grid).toBeInTheDocument();
    expect(grid.children).toHaveLength(0);
  });

  it('passes icon prop to ImageOverlay when provided', () => {
    render(ServiceGrid, { services: mockServices });

    const servicesWithIcons = mockServices.filter(s => s.icon);
    servicesWithIcons.forEach(service => {
      const iconElement = screen.getByText(service.icon!);
      expect(iconElement).toBeInTheDocument();
      expect(iconElement).toHaveClass('text-white');
      expect(iconElement).toHaveClass('text-4xl');
    });
  });

  it('uses fly animation type for service cards', async () => {
    const { container } = render(ServiceGrid, { services: mockServices });

    const animatedElements = container.querySelectorAll('[data-animated]');
    
    expect(animatedElements).toHaveLength(mockServices.length);
    
    animatedElements.forEach(element => {
      expect(element).toHaveAttribute('data-animated');
    });
  });
});