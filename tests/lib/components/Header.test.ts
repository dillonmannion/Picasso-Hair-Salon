import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Header from '$lib/components/Header.svelte';

describe('Header Component', () => {
  let mockScrollTo: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockScrollTo = vi.fn();
    window.scrollTo = mockScrollTo;
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 0
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render navigation header with default transparent background', () => {
    render(Header);
    
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('bg-transparent');
    expect(header).not.toHaveClass('shadow-md');
  });

  it('should apply background and shadow when scrolled', async () => {
    render(Header);
    
    const header = screen.getByRole('banner');
    
    // Simulate scroll
    Object.defineProperty(window, 'scrollY', { value: 100, configurable: true });
    window.dispatchEvent(new Event('scroll'));
    
    // Wait for Svelte to update
    await new Promise(resolve => setTimeout(resolve, 10));
    
    expect(header).toHaveClass('bg-atelier-cream');
    expect(header).toHaveClass('shadow-md');
  });

  it('should render navigation items', () => {
    const navItems = [
      { label: 'Services', href: '#services' },
      { label: 'Gallery', href: '#gallery' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' }
    ];
    
    render(Header, { props: { navItems } });
    
    const desktopNav = screen.getByRole('navigation', { name: /desktop/i });
    
    navItems.forEach(item => {
      const link = desktopNav.querySelector(`a[href="${item.href}"]`);
      expect(link).toBeInTheDocument();
      expect(link).toHaveTextContent(item.label);
    });
  });

  it('should show mobile menu button on mobile', () => {
    render(Header);
    
    const header = screen.getByRole('banner');
    const menuButton = header.querySelector('button[aria-label="Menu"]');
    expect(menuButton).toBeInTheDocument();
    expect(menuButton).toHaveClass('md:hidden');
  });

  it('should toggle mobile menu visibility', async () => {
    const user = userEvent.setup();
    render(Header);
    
    const header = screen.getByRole('banner');
    const menuButton = header.querySelector('button[aria-label="Menu"]');
    const mobileMenu = screen.getByTestId('mobile-menu');
    
    // Initially hidden
    expect(mobileMenu).toHaveClass('translate-x-full');
    
    // Open menu
    await user.click(menuButton!);
    expect(mobileMenu).toHaveClass('translate-x-0');
    
    // Close menu
    await user.click(menuButton!);
    expect(mobileMenu).toHaveClass('translate-x-full');
  });

  it('should hide navigation items on desktop', () => {
    const navItems = [
      { label: 'Services', href: '#services' },
      { label: 'Gallery', href: '#gallery' }
    ];
    
    render(Header, { props: { navItems } });
    
    const desktopNav = screen.getByRole('navigation', { name: /desktop/i });
    expect(desktopNav).toHaveClass('hidden', 'md:block');
  });

  it('should render logo or brand name', () => {
    const brandName = 'Picasso Hair Salon';
    render(Header, { props: { brandName } });
    
    const brand = screen.getByText(brandName);
    expect(brand).toBeInTheDocument();
  });

  it('should apply transition classes for smooth styling changes', () => {
    render(Header);
    
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('transition-all');
    expect(header).toHaveClass('duration-300');
  });

  it('should maintain fixed position at top', () => {
    render(Header);
    
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('fixed');
    expect(header).toHaveClass('top-0');
    expect(header).toHaveClass('left-0');
    expect(header).toHaveClass('right-0');
  });

  it('should have proper z-index for layering', () => {
    render(Header);
    
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('z-50');
  });

  it('should close mobile menu when clicking outside', async () => {
    const user = userEvent.setup();
    render(Header);
    
    const header = screen.getByRole('banner');
    const menuButton = header.querySelector('button[aria-label="Menu"]');
    const mobileMenu = screen.getByTestId('mobile-menu');
    
    // Open menu
    await user.click(menuButton!);
    expect(mobileMenu).toHaveClass('translate-x-0');
    
    // Click outside (on overlay)
    const overlay = screen.getByTestId('mobile-menu-overlay');
    await user.click(overlay);
    expect(mobileMenu).toHaveClass('translate-x-full');
  });

  it('should render mobile navigation items in mobile menu', () => {
    const navItems = [
      { label: 'Services', href: '#services' },
      { label: 'Gallery', href: '#gallery' }
    ];
    
    render(Header, { props: { navItems } });
    
    const mobileMenu = screen.getByTestId('mobile-menu');
    
    navItems.forEach(item => {
      const links = screen.getAllByRole('link', { name: item.label });
      const mobileLink = links.find(link => mobileMenu.contains(link));
      expect(mobileLink).toBeInTheDocument();
    });
  });

  it('should handle scroll events efficiently', () => {
    const scrollSpy = vi.spyOn(window, 'addEventListener');
    const { unmount } = render(Header);
    
    // Should add scroll listener
    expect(scrollSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    
    // Should remove scroll listener on unmount
    const removeScrollSpy = vi.spyOn(window, 'removeEventListener');
    unmount();
    expect(removeScrollSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
  });
});