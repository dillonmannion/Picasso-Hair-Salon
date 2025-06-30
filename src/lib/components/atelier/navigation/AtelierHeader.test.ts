import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/svelte';
import AtelierHeader from './AtelierHeader.svelte';

describe('AtelierHeader', () => {
	beforeEach(() => {
		window.scrollY = 0;
		vi.useFakeTimers();
	});

	afterEach(() => {
		cleanup();
		vi.clearAllTimers();
		vi.useRealTimers();
	});

	const defaultMenuItems = [
		{ label: 'Home', href: '/' },
		{ label: 'Services', href: '/services' },
		{ label: 'About', href: '/about' },
		{ label: 'Contact', href: '/contact' }
	];

	it('renders logo and menu items', () => {
		const { getByText, getByLabelText } = render(AtelierHeader, {
			props: {
				logo: 'Atelier',
				menuItems: defaultMenuItems
			}
		});

		expect(getByText('Atelier')).toBeInTheDocument();
		expect(getByText('Services')).toBeInTheDocument();
		expect(getByText('About')).toBeInTheDocument();
		expect(getByLabelText('Main navigation')).toBeInTheDocument();
	});

	it('applies sticky class when sticky prop is true', () => {
		const { container } = render(AtelierHeader, {
			props: {
				sticky: true,
				menuItems: defaultMenuItems
			}
		});

		const header = container.querySelector('.atelier-header');
		expect(header).toHaveClass('atelier-header--sticky');
	});

	it('hides header on scroll down when hideOnScroll is true', async () => {
		const { container } = render(AtelierHeader, {
			props: {
				hideOnScroll: true,
				menuItems: defaultMenuItems
			}
		});

		const header = container.querySelector('.atelier-header');

		// Simulate scroll down
		window.scrollY = 150;
		window.dispatchEvent(new Event('scroll'));
		vi.runOnlyPendingTimers();
		await vi.waitFor(() => {
			expect(header).not.toHaveClass('atelier-header--hidden');
		});

		// Scroll down more
		window.scrollY = 200;
		window.dispatchEvent(new Event('scroll'));
		vi.runOnlyPendingTimers();

		await vi.waitFor(() => {
			expect(header).toHaveClass('atelier-header--hidden');
		});
	});

	it('applies blur effect on scroll when blurOnScroll is true', async () => {
		const { container } = render(AtelierHeader, {
			props: {
				blurOnScroll: true,
				menuItems: defaultMenuItems
			}
		});

		const header = container.querySelector('.atelier-header');

		// Simulate scroll
		window.scrollY = 30;
		window.dispatchEvent(new Event('scroll'));
		vi.runOnlyPendingTimers();

		await vi.waitFor(() => {
			expect(header).toHaveClass('atelier-header--blur');
			expect(header).toHaveClass('atelier-header--scrolled');
		});
	});

	it('toggles mobile menu on button click', async () => {
		const { getByLabelText, container } = render(AtelierHeader, {
			props: {
				menuItems: defaultMenuItems
			}
		});

		const toggleButton = getByLabelText('Toggle navigation menu');
		const mobileMenu = container.querySelector('.atelier-header__mobile-menu');

		expect(mobileMenu).not.toHaveClass('atelier-header__mobile-menu--open');

		await fireEvent.click(toggleButton);
		expect(mobileMenu).toHaveClass('atelier-header__mobile-menu--open');
		expect(toggleButton).toHaveAttribute('aria-expanded', 'true');

		await fireEvent.click(toggleButton);
		expect(mobileMenu).not.toHaveClass('atelier-header__mobile-menu--open');
		expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
	});

	it('closes mobile menu when clicking a menu link', async () => {
		const { getByLabelText, getAllByText, container } = render(AtelierHeader, {
			props: {
				menuItems: defaultMenuItems
			}
		});

		const toggleButton = getByLabelText('Toggle navigation menu');
		await fireEvent.click(toggleButton);

		const mobileMenu = container.querySelector('.atelier-header__mobile-menu');
		expect(mobileMenu).toHaveClass('atelier-header__mobile-menu--open');

		// Click on a menu link (there are two instances - desktop and mobile)
		const serviceLinks = getAllByText('Services');
		await fireEvent.click(serviceLinks[1]); // Click mobile version

		expect(mobileMenu).not.toHaveClass('atelier-header__mobile-menu--open');
	});

	it('renders custom logo snippet', () => {
		const { getByText } = render(AtelierHeader, {
			props: {
				logo: () => '<div>Custom Logo</div>',
				menuItems: defaultMenuItems
			}
		});

		expect(getByText('Custom Logo')).toBeInTheDocument();
	});

	it('respects custom className', () => {
		const { container } = render(AtelierHeader, {
			props: {
				class: 'custom-header-class',
				menuItems: defaultMenuItems
			}
		});

		const header = container.querySelector('.atelier-header');
		expect(header).toHaveClass('custom-header-class');
	});

	it('handles empty menu items', () => {
		const { container } = render(AtelierHeader, {
			props: {
				logo: 'Atelier',
				menuItems: []
			}
		});

		const menuList = container.querySelector('.atelier-header__menu');
		expect(menuList?.children).toHaveLength(0);
	});

	it('sets correct ARIA attributes', () => {
		const { getByLabelText, container } = render(AtelierHeader, {
			props: {
				menuItems: defaultMenuItems
			}
		});

		const nav = getByLabelText('Main navigation');
		expect(nav).toBeInTheDocument();

		const toggleButton = getByLabelText('Toggle navigation menu');
		expect(toggleButton).toHaveAttribute('aria-expanded', 'false');

		const mobileMenu = container.querySelector('.atelier-header__mobile-menu');
		expect(mobileMenu).toHaveAttribute('aria-hidden', 'true');
	});
});
