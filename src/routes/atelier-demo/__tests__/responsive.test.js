import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/svelte';
import { tick } from 'svelte';
import AtelierDemo from '../+page.svelte';
import { createViewportUtils } from '$lib/test-utils/viewport';

describe('Atelier Demo - Responsive Behavior', () => {
	let viewport;

	beforeEach(() => {
		viewport = createViewportUtils();
		viewport.reset();
	});

	describe('Mobile Navigation', () => {
		beforeEach(() => {
			viewport.set('mobile');
		});

		it('should show mobile menu toggle on small screens', async () => {
			const { getByRole, queryByRole } = render(AtelierDemo);
			
			// Mobile menu toggle should be visible
			const menuToggle = getByRole('button', { name: /menu/i });
			expect(menuToggle).toBeVisible();
			
			// Desktop navigation should be hidden
			const desktopNav = queryByRole('navigation', { name: /main navigation/i });
			expect(desktopNav).toBeNull();
		});

		it('should toggle mobile menu on button click', async () => {
			const { getByRole, queryByRole } = render(AtelierDemo);
			
			const menuToggle = getByRole('button', { name: /menu/i });
			
			// Menu should be closed initially
			expect(queryByRole('navigation', { name: /mobile navigation/i })).toBeNull();
			
			// Open menu
			await fireEvent.click(menuToggle);
			await tick();
			
			const mobileNav = getByRole('navigation', { name: /mobile navigation/i });
			expect(mobileNav).toBeVisible();
			
			// Close menu
			await fireEvent.click(menuToggle);
			await tick();
			
			expect(queryByRole('navigation', { name: /mobile navigation/i })).toBeNull();
		});

		it('should close mobile menu when clicking outside', async () => {
			const { getByRole, queryByRole, container } = render(AtelierDemo);
			
			const menuToggle = getByRole('button', { name: /menu/i });
			
			// Open menu
			await fireEvent.click(menuToggle);
			await tick();
			
			expect(getByRole('navigation', { name: /mobile navigation/i })).toBeVisible();
			
			// Click outside
			await fireEvent.click(container.querySelector('main'));
			await tick();
			
			expect(queryByRole('navigation', { name: /mobile navigation/i })).toBeNull();
		});
	});

	describe('Component Layout Changes', () => {
		it('should stack cards vertically on mobile', async () => {
			viewport.set('mobile');
			const { container } = render(AtelierDemo);
			
			const serviceGrid = container.querySelector('[data-testid="service-grid"]');
			expect(serviceGrid).toHaveClass('grid-cols-1');
		});

		it('should show 2 columns on tablet', async () => {
			viewport.set('tablet');
			const { container } = render(AtelierDemo);
			
			const serviceGrid = container.querySelector('[data-testid="service-grid"]');
			expect(serviceGrid).toHaveClass('md:grid-cols-2');
		});

		it('should show 3 columns on desktop', async () => {
			viewport.set('desktop');
			const { container } = render(AtelierDemo);
			
			const serviceGrid = container.querySelector('[data-testid="service-grid"]');
			expect(serviceGrid).toHaveClass('lg:grid-cols-3');
		});

		it('should adjust gallery layout based on viewport', async () => {
			const { container } = render(AtelierDemo);
			
			// Mobile: Single column
			viewport.set('mobile');
			await tick();
			const gallery = container.querySelector('[data-testid="masonry-gallery"]');
			expect(gallery).toHaveClass('columns-1');
			
			// Tablet: Two columns
			viewport.set('tablet');
			await tick();
			expect(gallery).toHaveClass('md:columns-2');
			
			// Desktop: Three columns
			viewport.set('desktop');
			await tick();
			expect(gallery).toHaveClass('lg:columns-3');
		});
	});

	describe('Touch Interactions', () => {
		beforeEach(() => {
			viewport.set('mobile');
		});

		it('should handle swipe gestures on gallery images', async () => {
			const { container, getByAltText } = render(AtelierDemo);
			
			const firstImage = getByAltText(/gallery image 1/i);
			
			// Simulate swipe left
			await fireEvent.touchStart(firstImage, {
				touches: [{ clientX: 300, clientY: 200 }]
			});
			
			await fireEvent.touchMove(firstImage, {
				touches: [{ clientX: 100, clientY: 200 }]
			});
			
			await fireEvent.touchEnd(firstImage);
			await tick();
			
			// Should navigate to next image
			const modal = container.querySelector('[role="dialog"]');
			expect(modal).toBeVisible();
			expect(getByAltText(/gallery image 2/i)).toBeVisible();
		});

		it('should show touch-optimized controls', async () => {
			const { container } = render(AtelierDemo);
			
			// Touch-friendly button sizes
			const buttons = container.querySelectorAll('button');
			buttons.forEach(button => {
				const styles = window.getComputedStyle(button);
				const minSize = parseInt(styles.minHeight) || parseInt(styles.height);
				expect(minSize).toBeGreaterThanOrEqual(44); // iOS touch target minimum
			});
		});
	});

	describe('Viewport-based Visibility', () => {
		it('should hide sidebar on mobile', async () => {
			viewport.set('mobile');
			const { queryByRole } = render(AtelierDemo);
			
			const sidebar = queryByRole('complementary', { name: /sidebar/i });
			expect(sidebar).toBeNull();
		});

		it('should show sidebar on desktop', async () => {
			viewport.set('desktop');
			const { getByRole } = render(AtelierDemo);
			
			const sidebar = getByRole('complementary', { name: /sidebar/i });
			expect(sidebar).toBeVisible();
		});

		it('should adjust hero section for mobile', async () => {
			viewport.set('mobile');
			const { container } = render(AtelierDemo);
			
			const heroSection = container.querySelector('[data-testid="hero-section"]');
			const heroText = heroSection.querySelector('h1');
			
			// Check for mobile-optimized font sizes
			expect(heroText).toHaveClass('text-4xl', 'md:text-6xl');
		});

		it('should handle responsive tables', async () => {
			const { container } = render(AtelierDemo);
			
			// Desktop: Regular table
			viewport.set('desktop');
			await tick();
			const table = container.querySelector('[data-testid="data-table"]');
			expect(table.tagName).toBe('TABLE');
			
			// Mobile: Card-based layout
			viewport.set('mobile');
			await tick();
			const mobileCards = container.querySelectorAll('[data-testid="mobile-table-card"]');
			expect(mobileCards.length).toBeGreaterThan(0);
		});
	});

	describe('Responsive Images', () => {
		it('should load appropriate image sizes', async () => {
			const { container } = render(AtelierDemo);
			
			// Mobile
			viewport.set('mobile');
			await tick();
			const mobileImages = container.querySelectorAll('img[srcset]');
			mobileImages.forEach(img => {
				expect(img.getAttribute('sizes')).toContain('(max-width: 640px)');
			});
			
			// Desktop
			viewport.set('desktop');
			await tick();
			const desktopImages = container.querySelectorAll('img[srcset]');
			desktopImages.forEach(img => {
				expect(img.getAttribute('sizes')).toContain('(min-width: 1024px)');
			});
		});
	});

	describe('Responsive Typography', () => {
		it('should adjust font sizes for readability', async () => {
			const { container } = render(AtelierDemo);
			
			// Check heading scales
			viewport.set('mobile');
			await tick();
			const mobileHeading = container.querySelector('h1');
			expect(mobileHeading).toHaveClass('text-4xl');
			
			viewport.set('desktop');
			await tick();
			const desktopHeading = container.querySelector('h1');
			expect(desktopHeading).toHaveClass('md:text-6xl');
		});

		it('should maintain readable line lengths', async () => {
			viewport.set('desktop');
			const { container } = render(AtelierDemo);
			
			const textContainers = container.querySelectorAll('[data-testid="text-content"]');
			textContainers.forEach(element => {
				expect(element).toHaveClass('max-w-prose');
			});
		});
	});
});