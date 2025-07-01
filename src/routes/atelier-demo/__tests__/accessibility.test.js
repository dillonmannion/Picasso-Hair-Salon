import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/svelte';
import { axe, toHaveNoViolations } from 'jest-axe';
import { tick } from 'svelte';
import AtelierDemo from '../+page.svelte';

// Extend expect with axe matchers
expect.extend(toHaveNoViolations);

describe('Atelier Demo - Accessibility', () => {
	describe('ARIA Attributes', () => {
		it('should have proper ARIA labels on interactive elements', () => {
			const { getByRole, getAllByRole } = render(AtelierDemo);

			// Navigation
			expect(getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();

			// Buttons should have accessible names
			const buttons = getAllByRole('button');
			buttons.forEach((button) => {
				expect(button).toHaveAccessibleName();
			});

			// Links should have accessible names
			const links = getAllByRole('link');
			links.forEach((link) => {
				expect(link).toHaveAccessibleName();
			});
		});

		it('should have proper ARIA attributes on modal dialogs', async () => {
			const { getByRole, getByText } = render(AtelierDemo);

			// Open modal
			const openButton = getByText(/open modal/i);
			await fireEvent.click(openButton);
			await tick();

			const modal = getByRole('dialog');
			expect(modal).toHaveAttribute('aria-modal', 'true');
			expect(modal).toHaveAttribute('aria-labelledby');

			// Check modal title is properly connected
			const titleId = modal.getAttribute('aria-labelledby');
			const title = document.getElementById(titleId);
			expect(title).toBeInTheDocument();
		});

		it('should have proper ARIA attributes on form elements', () => {
			const { getByLabelText, getAllByRole } = render(AtelierDemo);

			// Input fields should be properly labeled
			const nameInput = getByLabelText(/name/i);
			expect(nameInput).toHaveAttribute('aria-required', 'true');
			expect(nameInput).toHaveAttribute('aria-invalid', 'false');

			// Error messages should be connected
			const emailInput = getByLabelText(/email/i);
			expect(emailInput).toHaveAttribute('aria-describedby');
		});

		it('should announce loading states', async () => {
			const { getByRole, getByText } = render(AtelierDemo);

			// Trigger loading state
			const loadButton = getByText(/load more/i);
			await fireEvent.click(loadButton);

			// Loading region should be announced
			const loadingRegion = getByRole('status');
			expect(loadingRegion).toHaveAttribute('aria-live', 'polite');
			expect(loadingRegion).toHaveAttribute('aria-busy', 'true');
		});
	});

	describe('Keyboard Navigation', () => {
		it('should support tab navigation through interactive elements', async () => {
			const { container } = render(AtelierDemo);

			const tabbableElements = container.querySelectorAll(
				'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
			);

			// First element should receive focus
			tabbableElements[0].focus();
			expect(document.activeElement).toBe(tabbableElements[0]);

			// Tab through elements
			for (let i = 1; i < Math.min(tabbableElements.length, 5); i++) {
				await fireEvent.keyDown(document.activeElement, { key: 'Tab' });
				expect(document.activeElement).toBe(tabbableElements[i]);
			}
		});

		it('should support keyboard navigation in tabs component', async () => {
			const { getAllByRole } = render(AtelierDemo);

			const tabs = getAllByRole('tab');
			const firstTab = tabs[0];
			const secondTab = tabs[1];

			// Focus first tab
			firstTab.focus();
			expect(document.activeElement).toBe(firstTab);

			// Arrow right to next tab
			await fireEvent.keyDown(firstTab, { key: 'ArrowRight' });
			expect(document.activeElement).toBe(secondTab);

			// Arrow left back to first tab
			await fireEvent.keyDown(secondTab, { key: 'ArrowLeft' });
			expect(document.activeElement).toBe(firstTab);

			// Enter/Space should activate tab
			await fireEvent.keyDown(secondTab, { key: 'Enter' });
			expect(secondTab).toHaveAttribute('aria-selected', 'true');
		});

		it('should trap focus in modal when open', async () => {
			const { getByRole, getByText } = render(AtelierDemo);

			// Open modal
			const openButton = getByText(/open modal/i);
			await fireEvent.click(openButton);
			await tick();

			const modal = getByRole('dialog');
			const modalElements = modal.querySelectorAll(
				'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
			);

			// Focus should be trapped within modal
			const firstElement = modalElements[0];
			const lastElement = modalElements[modalElements.length - 1];

			lastElement.focus();
			await fireEvent.keyDown(lastElement, { key: 'Tab' });
			expect(document.activeElement).toBe(firstElement);
		});

		it('should support escape key to close dialogs', async () => {
			const { getByRole, getByText, queryByRole } = render(AtelierDemo);

			// Open modal
			const openButton = getByText(/open modal/i);
			await fireEvent.click(openButton);
			await tick();

			expect(getByRole('dialog')).toBeInTheDocument();

			// Press escape
			await fireEvent.keyDown(document.body, { key: 'Escape' });
			await tick();

			expect(queryByRole('dialog')).not.toBeInTheDocument();
		});
	});

	describe('Screen Reader Support', () => {
		it('should have skip navigation link', () => {
			const { getByRole } = render(AtelierDemo);

			const skipLink = getByRole('link', { name: /skip to main content/i });
			expect(skipLink).toBeInTheDocument();
			expect(skipLink).toHaveAttribute('href', '#main');
		});

		it('should announce form validation errors', async () => {
			const { getByLabelText, getByRole } = render(AtelierDemo);

			const emailInput = getByLabelText(/email/i);
			const submitButton = getByRole('button', { name: /submit/i });

			// Submit invalid form
			await fireEvent.input(emailInput, { target: { value: 'invalid-email' } });
			await fireEvent.click(submitButton);
			await tick();

			// Error should be announced
			expect(emailInput).toHaveAttribute('aria-invalid', 'true');
			const errorId = emailInput.getAttribute('aria-describedby');
			const errorMessage = document.getElementById(errorId);
			expect(errorMessage).toHaveAttribute('role', 'alert');
		});

		it('should provide context for icon buttons', () => {
			const { container } = render(AtelierDemo);

			const iconButtons = container.querySelectorAll('button[data-icon-only="true"]');
			iconButtons.forEach((button) => {
				// Should have either aria-label or screen reader only text
				const hasAriaLabel = button.hasAttribute('aria-label');
				const hasSrText = button.querySelector('.sr-only');
				expect(hasAriaLabel || hasSrText).toBe(true);
			});
		});
	});

	describe('Automated Accessibility Checks', () => {
		it('should have no accessibility violations on initial load', async () => {
			const { container } = render(AtelierDemo);
			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});

		it('should have no violations with modal open', async () => {
			const { container, getByText } = render(AtelierDemo);

			// Open modal
			const openButton = getByText(/open modal/i);
			await fireEvent.click(openButton);
			await tick();

			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});

		it('should have no violations in dark mode', async () => {
			const { container, getByRole } = render(AtelierDemo);

			// Switch to dark mode
			const themeToggle = getByRole('button', { name: /toggle theme/i });
			await fireEvent.click(themeToggle);
			await tick();

			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});

		it('should maintain proper color contrast', async () => {
			const { container } = render(AtelierDemo);

			const results = await axe(container, {
				rules: {
					'color-contrast': { enabled: true }
				}
			});

			expect(results).toHaveNoViolations();
		});
	});

	describe('Focus Management', () => {
		it('should restore focus after closing modal', async () => {
			const { getByText, getByRole, queryByRole } = render(AtelierDemo);

			const openButton = getByText(/open modal/i);
			openButton.focus();

			// Open modal
			await fireEvent.click(openButton);
			await tick();

			// Close modal
			const closeButton = getByRole('button', { name: /close/i });
			await fireEvent.click(closeButton);
			await tick();

			// Focus should return to trigger
			expect(document.activeElement).toBe(openButton);
		});

		it('should have visible focus indicators', () => {
			const { container } = render(AtelierDemo);

			const focusableElements = container.querySelectorAll('a, button, input, select, textarea');

			focusableElements.forEach((element) => {
				element.focus();
				const styles = window.getComputedStyle(element);

				// Check for focus styles (outline or box-shadow)
				const hasOutline = styles.outlineWidth !== '0px';
				const hasBoxShadow = styles.boxShadow !== 'none';
				expect(hasOutline || hasBoxShadow).toBe(true);
			});
		});
	});

	describe('Semantic HTML', () => {
		it('should use proper heading hierarchy', () => {
			const { container } = render(AtelierDemo);

			const headings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'));
			let lastLevel = 0;

			headings.forEach((heading) => {
				const level = parseInt(heading.tagName[1]);
				// Should not skip heading levels
				expect(level).toBeLessThanOrEqual(lastLevel + 1);
				lastLevel = level;
			});
		});

		it('should use semantic landmarks', () => {
			const { container } = render(AtelierDemo);

			expect(container.querySelector('header')).toBeInTheDocument();
			expect(container.querySelector('main')).toBeInTheDocument();
			expect(container.querySelector('footer')).toBeInTheDocument();
		});
	});
});
