import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import TextHoverHighlight from '$lib/components/TextHoverHighlight.svelte';

describe('TextHoverHighlight', () => {
  it('should render link with provided text and href', () => {
    render(TextHoverHighlight, {
      props: {
        href: '/services',
        text: 'Our Services'
      }
    });

    const link = screen.getByRole('link', { name: 'Our Services' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/services');
  });

  it('should apply base styles for link', () => {
    render(TextHoverHighlight, {
      props: {
        href: '/about',
        text: 'About Us'
      }
    });

    const link = screen.getByRole('link', { name: 'About Us' });
    expect(link).toHaveClass('relative', 'inline-block', 'text-atelier-gold');
  });

  it('should render underline element', () => {
    const { container } = render(TextHoverHighlight, {
      props: {
        href: '/contact',
        text: 'Contact'
      }
    });

    const underline = container.querySelector('.absolute.bottom-0.left-0.h-0\\.5.bg-atelier-gold');
    expect(underline).toBeInTheDocument();
  });

  it('should apply hover transition styles', () => {
    const { container } = render(TextHoverHighlight, {
      props: {
        href: '/gallery',
        text: 'Gallery'
      }
    });

    const underline = container.querySelector('.absolute.bottom-0.left-0.h-0\\.5.bg-atelier-gold');
    expect(underline).toHaveClass('transition-all', 'duration-300');
  });

  it('should change text color on hover', async () => {
    const user = userEvent.setup();
    render(TextHoverHighlight, {
      props: {
        href: '/booking',
        text: 'Book Now'
      }
    });

    const link = screen.getByRole('link', { name: 'Book Now' });
    
    await user.hover(link);
    expect(link).toHaveClass('hover:text-atelier-gold-dark');
  });

  it('should animate underline width on hover', async () => {
    const user = userEvent.setup();
    const { container } = render(TextHoverHighlight, {
      props: {
        href: '/pricing',
        text: 'Pricing'
      }
    });

    const link = screen.getByRole('link', { name: 'Pricing' });
    const underline = container.querySelector('.absolute.bottom-0.left-0.h-0\\.5.bg-atelier-gold');
    
    expect(underline).toHaveClass('w-0');
    
    await user.hover(link);
    expect(underline).toHaveClass('group-hover:w-full');
  });

  it('should maintain proper focus states for accessibility', () => {
    render(TextHoverHighlight, {
      props: {
        href: '/team',
        text: 'Our Team'
      }
    });

    const link = screen.getByRole('link', { name: 'Our Team' });
    expect(link).toHaveClass('focus:outline-none', 'focus-visible:ring-2', 'focus-visible:ring-atelier-gold');
  });

  it('should accept and apply custom CSS classes', () => {
    render(TextHoverHighlight, {
      props: {
        href: '/specials',
        text: 'Special Offers',
        class: 'text-lg font-bold'
      }
    });

    const link = screen.getByRole('link', { name: 'Special Offers' });
    expect(link).toHaveClass('text-lg', 'font-bold');
  });

  it('should preserve all accessibility attributes', () => {
    render(TextHoverHighlight, {
      props: {
        href: '/services',
        text: 'Services',
        'aria-label': 'View our services',
        'aria-describedby': 'services-description'
      }
    });

    const link = screen.getByRole('link', { name: 'View our services' });
    expect(link).toHaveAttribute('aria-describedby', 'services-description');
  });

  it('should handle external links with proper attributes', () => {
    render(TextHoverHighlight, {
      props: {
        href: 'https://example.com',
        text: 'External Link',
        target: '_blank',
        rel: 'noopener noreferrer'
      }
    });

    const link = screen.getByRole('link', { name: 'External Link' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});