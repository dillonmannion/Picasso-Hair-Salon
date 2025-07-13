import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import Page from '../../src/routes/+page.svelte';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../src/types/database.types';

// Create a mock Supabase client
const mockSupabaseClient = {
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    onAuthStateChange: vi.fn().mockReturnValue({ subscription: { unsubscribe: vi.fn() } })
  },
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: [], error: null })
    })
  })
} as unknown as SupabaseClient<Database>;

describe('Landing Page', () => {
  const mockPageData = {
    user: null,
    session: null,
    supabase: mockSupabaseClient
  };

  beforeEach(() => {
    // Mock IntersectionObserver
    const mockIntersectionObserver = vi.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    });
    window.IntersectionObserver = mockIntersectionObserver;
  });

  it('renders complete landing page with hero section', async () => {
    render(Page, { 
      props: { 
        data: mockPageData 
      } 
    });

    // Hero section elements
    const heroSection = screen.getByRole('region', { name: /hero section/i });
    expect(heroSection).toBeInTheDocument();
    
    const heroTitle = screen.getByRole('heading', { level: 1 });
    expect(heroTitle).toHaveTextContent('Picasso Hair Salon');
    
    const heroSubtitle = screen.getByText(/where artistry meets elegance/i);
    expect(heroSubtitle).toBeInTheDocument();
    
    const ctaButton = screen.getByRole('button', { name: /book your experience/i });
    expect(ctaButton).toBeInTheDocument();
    expect(ctaButton).toHaveAttribute('href', '#services');
  });

  it('renders service grid section', async () => {
    render(Page, { 
      props: { 
        data: mockPageData 
      } 
    });

    const servicesSection = screen.getByRole('region', { name: /services/i });
    expect(servicesSection).toBeInTheDocument();
    
    const servicesTitle = screen.getByRole('heading', { name: /our services/i });
    expect(servicesTitle).toBeInTheDocument();
    
    // Should render at least one service
    const serviceCards = screen.getAllByRole('article');
    expect(serviceCards.length).toBeGreaterThan(0);
  });

  it('renders gallery section', async () => {
    render(Page, { 
      props: { 
        data: mockPageData 
      } 
    });

    const gallerySections = screen.getAllByRole('region', { name: /gallery/i });
    expect(gallerySections.length).toBeGreaterThan(0);
    
    const galleryTitle = screen.getByRole('heading', { name: /our work/i });
    expect(galleryTitle).toBeInTheDocument();
    
    // Should render gallery images
    const galleryImages = screen.getAllByRole('img');
    const gallerySpecificImages = galleryImages.filter(img => 
      img.getAttribute('alt')?.includes('Gallery image')
    );
    expect(gallerySpecificImages.length).toBeGreaterThan(0);
  });

  it('renders navigation header', async () => {
    render(Page, { 
      props: { 
        data: mockPageData 
      } 
    });

    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
    
    const logo = screen.getByRole('link', { name: /picasso hair salon/i });
    expect(logo).toHaveAttribute('href', '/');
    
    // Navigation links in desktop nav
    screen.getByRole('navigation', { name: /desktop navigation/i });
    
    const servicesLinks = screen.getAllByRole('link', { name: /services/i });
    expect(servicesLinks.length).toBeGreaterThan(0);
    expect(servicesLinks[0]).toHaveAttribute('href', '#services');
    
    const galleryLinks = screen.getAllByRole('link', { name: /gallery/i });
    expect(galleryLinks.length).toBeGreaterThan(0);
    expect(galleryLinks[0]).toHaveAttribute('href', '#gallery');
    
    const contactLinks = screen.getAllByRole('link', { name: /contact/i });
    expect(contactLinks.length).toBeGreaterThan(0);
    expect(contactLinks[0]).toHaveAttribute('href', '#contact');
  });

  it('ensures smooth scrolling between sections', async () => {
    render(Page, { 
      props: { 
        data: mockPageData 
      } 
    });
    
    // Mock scrollIntoView
    const mockScrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = mockScrollIntoView;

    const servicesLinks = screen.getAllByRole('link', { name: /services/i });
    servicesLinks[0].click();
    
    await tick();
    
    expect(mockScrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth'
    });
  });

  it('maintains responsive design', async () => {
    render(Page, { 
      props: { 
        data: mockPageData 
      } 
    });

    const container = screen.getByTestId('page-container');
    expect(container).toHaveClass('min-h-screen');
    
    // Check that sections use Container component for responsive padding
    const containers = screen.getAllByTestId('container');
    expect(containers.length).toBeGreaterThan(0);
  });

  it('integrates all components with proper data flow', async () => {
    render(Page, { 
      props: { 
        data: mockPageData 
      } 
    });

    // Verify AnimatedElement is used for animations
    const animatedElements = screen.getAllByTestId('animated-element');
    expect(animatedElements.length).toBeGreaterThan(0);

    // Verify Typography component is used for headings
    const typographyElements = screen.getAllByTestId('typography');
    expect(typographyElements.length).toBeGreaterThan(0);

    // Verify proper component structure
    const heroSection = screen.getByTestId('hero-section');
    expect(heroSection).toBeInTheDocument();
    
    const serviceGrid = screen.getByTestId('service-grid');
    expect(serviceGrid).toBeInTheDocument();
    
    const gallery = screen.getByTestId('masonry-gallery');
    expect(gallery).toBeInTheDocument();
  });

  it('includes scroll to top functionality', async () => {
    render(Page, { 
      props: { 
        data: mockPageData 
      } 
    });

    // Scroll to top component should be present (initially hidden)
    let scrollToTop = screen.queryByTestId('scroll-to-top');
    expect(scrollToTop).not.toBeInTheDocument();
    
    // Simulate scroll to make it visible
    window.scrollY = 400;
    window.dispatchEvent(new Event('scroll'));
    
    // Wait a bit for the throttled scroll handler
    await new Promise(resolve => setTimeout(resolve, 20));
    
    scrollToTop = screen.queryByTestId('scroll-to-top');
    expect(scrollToTop).toBeInTheDocument();
  });
});