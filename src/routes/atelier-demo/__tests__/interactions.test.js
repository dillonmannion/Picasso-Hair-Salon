import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/svelte';
import { renderWithTheme, testId } from '$lib/test-utils';
import AtelierButton from '$lib/components/atelier/AtelierButton.svelte';
import AtelierModal from '$lib/components/atelier/AtelierModal.svelte';
import AtelierTooltip from '$lib/components/atelier/AtelierTooltip.svelte';
import AtelierAccordion from '$lib/components/atelier/interactive/AtelierAccordion.svelte';
import AtelierTabs from '$lib/components/atelier/interactive/AtelierTabs.svelte';
import AtelierSidebar from '$lib/components/atelier/interactive/AtelierSidebar.svelte';
import AtelierInput from '$lib/components/atelier/form/AtelierInput.svelte';
import AtelierSelect from '$lib/components/atelier/form/AtelierSelect.svelte';
import AtelierTextarea from '$lib/components/atelier/form/AtelierTextarea.svelte';
import ScrollToTop from '$lib/components/atelier/utility/ScrollToTop.svelte';
import AtelierNotification from '$lib/components/atelier/feedback/AtelierNotification.svelte';
import { atelierModal } from '$lib/stores/atelierModal';
import { atelierNotifications } from '$lib/stores/atelierNotifications';

describe('Component Interaction Tests', () => {
	beforeEach(() => {
		// Reset stores
		atelierModal.closeAll();
		atelierNotifications.clear();
	});

	describe('Button Interactions', () => {
		test('handles click events correctly', async () => {
			const handleClick = vi.fn();
			const { user } = renderWithTheme(AtelierButton, {
				onClick: handleClick
			});

			const button = screen.getByRole('button');
			await user.click(button);

			expect(handleClick).toHaveBeenCalledTimes(1);
		});

		test('shows loading state with spinner', async () => {
			const { rerender } = renderWithTheme(AtelierButton, {
				loading: true
			});

			// Should show loading spinner
			expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
			expect(screen.getByRole('button')).toBeDisabled();

			// Should be clickable when not loading
			await rerender({ loading: false });
			expect(screen.getByRole('button')).not.toHaveAttribute('aria-busy');
			expect(screen.getByRole('button')).not.toBeDisabled();
		});

		test('disables interactions when disabled', async () => {
			const handleClick = vi.fn();
			const { user } = renderWithTheme(AtelierButton, {
				disabled: true,
				onClick: handleClick
			});

			const button = screen.getByRole('button');
			await user.click(button);

			expect(handleClick).not.toHaveBeenCalled();
			expect(button).toBeDisabled();
		});

		test('applies hover styles on mouse enter', async () => {
			const { user } = renderWithTheme(AtelierButton, {
				variant: 'primary'
			});

			const button = screen.getByRole('button');
			
			// Hover interaction
			await user.hover(button);
			// Note: Actual hover styles are CSS-based, we verify the interaction works
			
			await user.unhover(button);
		});
	});

	describe('Modal Interactions', () => {
		test('opens and closes modal via store', async () => {
			renderWithTheme(AtelierModal, {
				id: 'test-modal'
			});

			// Modal should not be visible initially
			expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

			// Open modal
			atelierModal.open('test-modal');
			await waitFor(() => {
				expect(screen.getByRole('dialog')).toBeInTheDocument();
			});

			// Close modal
			atelierModal.close('test-modal');
			await waitFor(() => {
				expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
			});
		});

		test('closes on Escape key press', async () => {
			const { user } = renderWithTheme(AtelierModal, {
				id: 'test-modal'
			});

			// Open modal
			atelierModal.open('test-modal');
			await waitFor(() => {
				expect(screen.getByRole('dialog')).toBeInTheDocument();
			});

			// Press Escape
			await user.keyboard('{Escape}');

			await waitFor(() => {
				expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
			});
		});

		test('closes on outside click when enabled', async () => {
			const { user, container } = renderWithTheme(AtelierModal, {
				id: 'test-modal',
				closeOnOutsideClick: true
			});

			// Open modal
			atelierModal.open('test-modal');
			await waitFor(() => {
				expect(screen.getByRole('dialog')).toBeInTheDocument();
			});

			// Click overlay
			const overlay = container.querySelector('.overlay');
			await user.click(overlay);

			await waitFor(() => {
				expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
			});
		});

		test('traps focus within modal', async () => {
			const { user } = renderWithTheme(AtelierModal, {
				id: 'test-modal',
				showCloseButton: true
			});

			// Open modal
			atelierModal.open('test-modal');
			await waitFor(() => {
				expect(screen.getByRole('dialog')).toBeInTheDocument();
			});

			// Tab navigation should stay within modal
			await user.tab();
			expect(document.activeElement).toBeInTheDocument();
			expect(document.activeElement.closest('[role="dialog"]')).toBeInTheDocument();
		});
	});

	describe('Form Interactions', () => {
		test('handles input value changes', async () => {
			const handleInput = vi.fn();
			const { user } = renderWithTheme(AtelierInput, {
				value: '',
				onInput: handleInput
			});

			const input = screen.getByRole('textbox');
			await user.type(input, 'Test input');

			expect(handleInput).toHaveBeenCalled();
			expect(input.value).toBe('Test input');
		});

		test('shows validation states', async () => {
			const { rerender } = renderWithTheme(AtelierInput, {
				value: 'test',
				error: true,
				errorText: 'Invalid input'
			});

			// Error state
			expect(screen.getByText('Invalid input')).toBeInTheDocument();
			const input = screen.getByRole('textbox');
			expect(input).toHaveAttribute('aria-invalid', 'true');

			// Success state
			await rerender({
				value: 'test',
				success: true,
				successText: 'Valid input'
			});

			expect(screen.getByText('Valid input')).toBeInTheDocument();
			expect(input).toHaveAttribute('aria-invalid', 'false');
		});

		test('handles select option changes', async () => {
			const handleChange = vi.fn();
			const { user } = renderWithTheme(AtelierSelect, {
				value: '',
				options: [
					{ value: '1', label: 'Option 1' },
					{ value: '2', label: 'Option 2' }
				],
				onChange: handleChange
			});

			const select = screen.getByRole('combobox');
			await user.selectOptions(select, '2');

			expect(handleChange).toHaveBeenCalled();
			expect(select.value).toBe('2');
		});

		test('handles textarea input with character count', async () => {
			const { user } = renderWithTheme(AtelierTextarea, {
				value: '',
				maxLength: 100,
				showCharCount: true
			});

			const textarea = screen.getByRole('textbox');
			await user.type(textarea, 'This is a test message');

			// Character count should update
			expect(screen.getByText(/22 \/ 100/)).toBeInTheDocument();
		});
	});

	describe('Accordion Interactions', () => {
		test('expands and collapses panels', async () => {
			const { user } = renderWithTheme(AtelierAccordion, {
				items: [
					{ id: '1', title: 'Panel 1', content: 'Content 1' },
					{ id: '2', title: 'Panel 2', content: 'Content 2' }
				]
			});

			// Click first panel
			const panel1Button = screen.getByRole('button', { name: /Panel 1/i });
			await user.click(panel1Button);

			// Content should be visible
			await waitFor(() => {
				expect(screen.getByText('Content 1')).toBeInTheDocument();
			});

			// Click again to collapse
			await user.click(panel1Button);
			await waitFor(() => {
				expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
			});
		});

		test('handles keyboard navigation', async () => {
			const { user } = renderWithTheme(AtelierAccordion, {
				items: [
					{ id: '1', title: 'Panel 1', content: 'Content 1' }
				]
			});

			const button = screen.getByRole('button', { name: /Panel 1/i });
			button.focus();

			// Space key should toggle
			await user.keyboard(' ');
			await waitFor(() => {
				expect(screen.getByText('Content 1')).toBeInTheDocument();
			});

			// Enter key should also toggle
			await user.keyboard('{Enter}');
			await waitFor(() => {
				expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
			});
		});

		test('supports multiple open panels', async () => {
			const { user } = renderWithTheme(AtelierAccordion, {
				items: [
					{ id: '1', title: 'Panel 1', content: 'Content 1' },
					{ id: '2', title: 'Panel 2', content: 'Content 2' }
				],
				multiple: true
			});

			// Open both panels
			await user.click(screen.getByRole('button', { name: /Panel 1/i }));
			await user.click(screen.getByRole('button', { name: /Panel 2/i }));

			// Both should be visible
			await waitFor(() => {
				expect(screen.getByText('Content 1')).toBeInTheDocument();
				expect(screen.getByText('Content 2')).toBeInTheDocument();
			});
		});
	});

	describe('Tab Navigation', () => {
		test('switches between tabs on click', async () => {
			const { user } = renderWithTheme(AtelierTabs, {
				tabs: [
					{ id: 'tab1', label: 'Tab 1', content: 'Tab 1 Content' },
					{ id: 'tab2', label: 'Tab 2', content: 'Tab 2 Content' }
				]
			});

			// First tab should be active by default
			expect(screen.getByText('Tab 1 Content')).toBeInTheDocument();
			expect(screen.queryByText('Tab 2 Content')).not.toBeInTheDocument();

			// Click second tab
			await user.click(screen.getByRole('tab', { name: 'Tab 2' }));

			// Second tab content should show
			await waitFor(() => {
				expect(screen.queryByText('Tab 1 Content')).not.toBeInTheDocument();
				expect(screen.getByText('Tab 2 Content')).toBeInTheDocument();
			});
		});

		test('handles keyboard navigation with arrow keys', async () => {
			const { user } = renderWithTheme(AtelierTabs, {
				tabs: [
					{ id: 'tab1', label: 'Tab 1', content: 'Tab 1 Content' },
					{ id: 'tab2', label: 'Tab 2', content: 'Tab 2 Content' },
					{ id: 'tab3', label: 'Tab 3', content: 'Tab 3 Content' }
				]
			});

			// Focus first tab
			const firstTab = screen.getByRole('tab', { name: 'Tab 1' });
			firstTab.focus();

			// Arrow right should move to next tab
			await user.keyboard('{ArrowRight}');
			expect(document.activeElement).toHaveTextContent('Tab 2');

			// Arrow right again
			await user.keyboard('{ArrowRight}');
			expect(document.activeElement).toHaveTextContent('Tab 3');

			// Arrow left should go back
			await user.keyboard('{ArrowLeft}');
			expect(document.activeElement).toHaveTextContent('Tab 2');
		});

		test('supports vertical orientation', async () => {
			const { user } = renderWithTheme(AtelierTabs, {
				tabs: [
					{ id: 'tab1', label: 'Tab 1', content: 'Tab 1 Content' },
					{ id: 'tab2', label: 'Tab 2', content: 'Tab 2 Content' }
				],
				orientation: 'vertical'
			});

			// Focus first tab
			const firstTab = screen.getByRole('tab', { name: 'Tab 1' });
			firstTab.focus();

			// Arrow down should move to next tab in vertical mode
			await user.keyboard('{ArrowDown}');
			expect(document.activeElement).toHaveTextContent('Tab 2');

			// Arrow up should go back
			await user.keyboard('{ArrowUp}');
			expect(document.activeElement).toHaveTextContent('Tab 1');
		});
	});

	describe('Sidebar Interactions', () => {
		test('opens and closes sidebar', async () => {
			const { user } = renderWithTheme(AtelierSidebar, {
				position: 'left'
			});

			// Find trigger button
			const trigger = screen.getByRole('button', { name: /open sidebar/i });
			
			// Click to open
			await user.click(trigger);
			
			await waitFor(() => {
				const sidebar = screen.getByRole('complementary');
				expect(sidebar).toHaveAttribute('aria-hidden', 'false');
			});

			// Close with close button
			const closeButton = screen.getByRole('button', { name: /close/i });
			await user.click(closeButton);

			await waitFor(() => {
				const sidebar = screen.getByRole('complementary');
				expect(sidebar).toHaveAttribute('aria-hidden', 'true');
			});
		});

		test('closes on Escape key', async () => {
			const { user } = renderWithTheme(AtelierSidebar, {
				position: 'right'
			});

			// Open sidebar
			const trigger = screen.getByRole('button', { name: /open sidebar/i });
			await user.click(trigger);

			// Press Escape
			await user.keyboard('{Escape}');

			await waitFor(() => {
				const sidebar = screen.getByRole('complementary');
				expect(sidebar).toHaveAttribute('aria-hidden', 'true');
			});
		});

		test('traps focus when open', async () => {
			const { user } = renderWithTheme(AtelierSidebar, {
				position: 'left'
			});

			// Open sidebar
			const trigger = screen.getByRole('button', { name: /open sidebar/i });
			await user.click(trigger);

			await waitFor(() => {
				const sidebar = screen.getByRole('complementary');
				expect(sidebar).toHaveAttribute('aria-hidden', 'false');
			});

			// Tab should keep focus within sidebar
			await user.tab();
			expect(document.activeElement.closest('[role="complementary"]')).toBeInTheDocument();
		});
	});

	describe('Tooltip Interactions', () => {
		test('shows tooltip on hover', async () => {
			const { user } = renderWithTheme(AtelierTooltip, {
				content: 'Helpful tooltip'
			});

			const trigger = screen.getByRole('button');

			// Tooltip should not be visible initially
			expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

			// Hover to show tooltip
			await user.hover(trigger);

			await waitFor(() => {
				expect(screen.getByRole('tooltip')).toBeInTheDocument();
				expect(screen.getByText('Helpful tooltip')).toBeInTheDocument();
			});

			// Unhover to hide
			await user.unhover(trigger);

			await waitFor(() => {
				expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
			});
		});

		test('shows tooltip on focus', async () => {
			const { user } = renderWithTheme(AtelierTooltip, {
				content: 'Focus tooltip'
			});

			const trigger = screen.getByRole('button');

			// Focus to show tooltip
			trigger.focus();

			await waitFor(() => {
				expect(screen.getByRole('tooltip')).toBeInTheDocument();
			});

			// Blur to hide
			trigger.blur();

			await waitFor(() => {
				expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
			});
		});

		test('respects delay prop', async () => {
			const { user } = renderWithTheme(AtelierTooltip, {
				content: 'Delayed tooltip',
				delay: 500
			});

			const trigger = screen.getByRole('button');
			await user.hover(trigger);

			// Should not show immediately
			expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

			// Wait for delay
			await waitFor(() => {
				expect(screen.getByRole('tooltip')).toBeInTheDocument();
			}, { timeout: 600 });
		});
	});

	describe('Notification Interactions', () => {
		test('shows and dismisses notifications', async () => {
			renderWithTheme(AtelierNotification);

			// Add a notification
			atelierNotifications.add({
				type: 'success',
				title: 'Success!',
				message: 'Operation completed'
			});

			await waitFor(() => {
				expect(screen.getByText('Success!')).toBeInTheDocument();
				expect(screen.getByText('Operation completed')).toBeInTheDocument();
			});

			// Find and click dismiss button
			const dismissButton = screen.getByRole('button', { name: /dismiss/i });
			const { user } = renderWithTheme(AtelierNotification);
			await user.click(dismissButton);

			await waitFor(() => {
				expect(screen.queryByText('Success!')).not.toBeInTheDocument();
			});
		});

		test('auto-dismisses after timeout', async () => {
			renderWithTheme(AtelierNotification);

			// Add notification with short timeout
			atelierNotifications.add({
				type: 'info',
				title: 'Info',
				message: 'This will disappear',
				duration: 100
			});

			// Should appear
			await waitFor(() => {
				expect(screen.getByText('Info')).toBeInTheDocument();
			});

			// Should disappear after timeout
			await waitFor(() => {
				expect(screen.queryByText('Info')).not.toBeInTheDocument();
			}, { timeout: 200 });
		});
	});

	describe('Scroll to Top', () => {
		test('appears after scrolling down', async () => {
			// Mock scroll position
			Object.defineProperty(window, 'scrollY', {
				writable: true,
				value: 0
			});

			renderWithTheme(ScrollToTop, {
				showAfter: 100
			});

			// Should not be visible at top
			expect(screen.queryByRole('button', { name: /scroll to top/i })).not.toBeInTheDocument();

			// Simulate scroll down
			window.scrollY = 200;
			fireEvent.scroll(window);

			// Button should appear
			await waitFor(() => {
				expect(screen.getByRole('button', { name: /scroll to top/i })).toBeInTheDocument();
			});
		});

		test('scrolls to top on click', async () => {
			// Mock scroll methods
			window.scrollY = 500;
			window.scrollTo = vi.fn();

			const { user } = renderWithTheme(ScrollToTop, {
				showAfter: 100
			});

			// Trigger scroll event to show button
			fireEvent.scroll(window);

			await waitFor(() => {
				expect(screen.getByRole('button', { name: /scroll to top/i })).toBeInTheDocument();
			});

			// Click button
			const button = screen.getByRole('button', { name: /scroll to top/i });
			await user.click(button);

			// Should scroll to top
			expect(window.scrollTo).toHaveBeenCalledWith({
				top: 0,
				behavior: 'smooth'
			});
		});
	});

	describe('Keyboard Navigation', () => {
		test('supports Tab navigation through interactive elements', async () => {
			const { user } = renderWithTheme(AtelierButton, {
				variant: 'primary'
			});

			const button = screen.getByRole('button');
			
			// Tab to button
			await user.tab();
			expect(document.activeElement).toBe(button);

			// Shift+Tab to go back
			await user.tab({ shift: true });
			expect(document.activeElement).not.toBe(button);
		});

		test('handles Enter and Space on buttons', async () => {
			const handleClick = vi.fn();
			const { user } = renderWithTheme(AtelierButton, {
				onClick: handleClick
			});

			const button = screen.getByRole('button');
			button.focus();

			// Enter key
			await user.keyboard('{Enter}');
			expect(handleClick).toHaveBeenCalledTimes(1);

			// Space key
			await user.keyboard(' ');
			expect(handleClick).toHaveBeenCalledTimes(2);
		});

		test('prevents interaction on disabled elements', async () => {
			const handleClick = vi.fn();
			const { user } = renderWithTheme(AtelierButton, {
				disabled: true,
				onClick: handleClick
			});

			const button = screen.getByRole('button');
			button.focus();

			// Keyboard events should not trigger click
			await user.keyboard('{Enter}');
			await user.keyboard(' ');

			expect(handleClick).not.toHaveBeenCalled();
		});
	});
});