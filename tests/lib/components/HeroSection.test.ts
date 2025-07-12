import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';

vi.mock('$lib/components/AnimatedElement.svelte', async () => {
  const AnimatedElementMock = await import('./__mocks__/AnimatedElement.svelte');
  return {
    default: AnimatedElementMock.default
  };
});

vi.mock('$lib/components/Button.svelte', async () => {
  const ButtonMock = await import('./__mocks__/Button.svelte');
  return {
    default: ButtonMock.default
  };
});

import HeroSection from '$lib/components/HeroSection.svelte';

describe('HeroSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display full-screen hero with background image', () => {
    const backgroundImage = '/images/hero-bg.jpg';
    
    render(HeroSection, {
      props: {
        backgroundImage,
        title: 'Welcome',
        subtitle: 'Experience luxury',
        ctaText: 'Book Now',
        ctaHref: '/booking'
      }
    });

    const heroSection = screen.getByRole('region', { name: /hero/i });
    expect(heroSection).toHaveClass('relative', 'h-screen', 'overflow-hidden');
    
    const bgImage = heroSection.querySelector('.absolute.inset-0 img');
    expect(bgImage).toHaveAttribute('src', backgroundImage);
    expect(bgImage).toHaveAttribute('alt', 'Hero background');
    expect(bgImage).toHaveClass('w-full', 'h-full', 'object-cover');
  });

  it('should render animated title, subtitle, and CTA button', () => {
    render(HeroSection, {
      props: {
        backgroundImage: '/images/hero.jpg',
        title: 'Picasso Hair Salon',
        subtitle: 'Where Art Meets Style',
        ctaText: 'Book Appointment',
        ctaHref: '/appointments'
      }
    });

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Picasso Hair Salon');
    expect(screen.getByText('Where Art Meets Style')).toBeInTheDocument();
    
    const ctaButton = screen.getByRole('link', { name: 'Book Appointment' });
    expect(ctaButton).toHaveAttribute('href', '/appointments');
  });

  it('should use AnimatedElement for staggered animations', () => {
    render(HeroSection, {
      props: {
        backgroundImage: '/images/hero.jpg',
        title: 'Test Title',
        subtitle: 'Test Subtitle',
        ctaText: 'Click Me',
        ctaHref: '#'
      }
    });

    const animatedElements = document.querySelectorAll('.animated-element');
    expect(animatedElements).toHaveLength(3); // title, subtitle, cta
  });

  it('should support parallax background effect', () => {
    render(HeroSection, {
      props: {
        backgroundImage: '/images/hero.jpg',
        title: 'Test',
        subtitle: 'Test',
        ctaText: 'Test',
        ctaHref: '#',
        parallax: true
      }
    });

    const bgContainer = screen.getByRole('region', { name: /hero/i })
      .querySelector('.absolute.inset-0');
    expect(bgContainer).toHaveAttribute('data-parallax', 'true');
  });

  it('should apply overlay gradient for text readability', () => {
    render(HeroSection, {
      props: {
        backgroundImage: '/images/hero.jpg',
        title: 'Test',
        subtitle: 'Test',
        ctaText: 'Test',
        ctaHref: '#'
      }
    });

    const overlay = screen.getByRole('region', { name: /hero/i })
      .querySelector('.absolute.inset-0.bg-gradient-to-b');
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveClass('from-black/30', 'to-black/60');
  });

  it('should center content and apply proper spacing', () => {
    render(HeroSection, {
      props: {
        backgroundImage: '/images/hero.jpg',
        title: 'Test Title',
        subtitle: 'Test Subtitle',
        ctaText: 'Test CTA',
        ctaHref: '#'
      }
    });

    const contentContainer = screen.getByRole('region', { name: /hero/i })
      .querySelector('.relative.h-full.flex');
    expect(contentContainer).toHaveClass('items-center', 'justify-center');
    
    const textContainer = contentContainer?.querySelector('.text-center');
    expect(textContainer).toHaveClass('text-white', 'px-4', 'md:px-8');
  });

  it('should handle optional parallax prop', () => {
    render(HeroSection, {
      props: {
        backgroundImage: '/images/hero.jpg',
        title: 'Test',
        subtitle: 'Test',
        ctaText: 'Test',
        ctaHref: '#'
      }
    });

    const bgContainer = screen.getByRole('region', { name: /hero/i })
      .querySelector('.absolute.inset-0');
    expect(bgContainer).not.toHaveAttribute('data-parallax');
  });

  it('should apply responsive text sizing', () => {
    render(HeroSection, {
      props: {
        backgroundImage: '/images/hero.jpg',
        title: 'Responsive Title',
        subtitle: 'Responsive Subtitle',
        ctaText: 'CTA',
        ctaHref: '#'
      }
    });

    const title = screen.getByRole('heading', { level: 1 });
    expect(title).toHaveClass('text-7xl', 'lg:text-8xl', 'xl:text-9xl');
    
    const subtitle = screen.getByRole('heading', { level: 3 });
    expect(subtitle).toHaveClass('text-3xl', 'lg:text-4xl');
  });
});