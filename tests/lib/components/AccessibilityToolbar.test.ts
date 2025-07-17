import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import AccessibilityToolbar from '$lib/components/AccessibilityToolbar.svelte';

describe('AccessibilityToolbar', () => {
  let mockLocalStorage: { [key: string]: string } = {};

  beforeEach(() => {
    mockLocalStorage = {};
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => mockLocalStorage[key] || null);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
      mockLocalStorage[key] = value;
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key) => {
      delete mockLocalStorage[key];
    });
    
    // Reset document body classes
    document.body.className = '';
    document.documentElement.style.fontSize = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render accessibility controls', () => {
    render(AccessibilityToolbar);

    expect(screen.getByLabelText('Increase font size')).toBeInTheDocument();
    expect(screen.getByLabelText('Decrease font size')).toBeInTheDocument();
    expect(screen.getByLabelText('Toggle high contrast')).toBeInTheDocument();
    expect(screen.getByLabelText('Toggle link underlines')).toBeInTheDocument();
    expect(screen.getByLabelText('Reset accessibility settings')).toBeInTheDocument();
  });

  describe('Font Size Controls', () => {
    it('should increase font size when increase button is clicked', async () => {
      const user = userEvent.setup();
      render(AccessibilityToolbar);

      const increaseButton = screen.getByLabelText('Increase font size');
      await user.click(increaseButton);

      expect(document.documentElement.style.fontSize).toBe('112.5%');
      expect(localStorage.setItem).toHaveBeenCalledWith('a11y-font-size', '112.5');
    });

    it('should decrease font size when decrease button is clicked', async () => {
      const user = userEvent.setup();
      render(AccessibilityToolbar);

      const decreaseButton = screen.getByLabelText('Decrease font size');
      await user.click(decreaseButton);

      expect(document.documentElement.style.fontSize).toBe('87.5%');
      expect(localStorage.setItem).toHaveBeenCalledWith('a11y-font-size', '87.5');
    });

    it('should not increase font size beyond maximum', async () => {
      const user = userEvent.setup();
      mockLocalStorage['a11y-font-size'] = '150';
      render(AccessibilityToolbar);

      const increaseButton = screen.getByLabelText('Increase font size');
      await user.click(increaseButton);

      expect(document.documentElement.style.fontSize).toBe('150%');
    });

    it('should not decrease font size below minimum', async () => {
      const user = userEvent.setup();
      mockLocalStorage['a11y-font-size'] = '75';
      render(AccessibilityToolbar);

      const decreaseButton = screen.getByLabelText('Decrease font size');
      await user.click(decreaseButton);

      expect(document.documentElement.style.fontSize).toBe('75%');
    });
  });

  describe('High Contrast Mode', () => {
    it('should toggle high contrast mode when button is clicked', async () => {
      const user = userEvent.setup();
      render(AccessibilityToolbar);

      const contrastButton = screen.getByLabelText('Toggle high contrast');
      
      // Enable high contrast
      await user.click(contrastButton);
      expect(document.body.classList.contains('high-contrast')).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith('a11y-high-contrast', 'true');
      
      // Disable high contrast
      await user.click(contrastButton);
      expect(document.body.classList.contains('high-contrast')).toBe(false);
      expect(localStorage.removeItem).toHaveBeenCalledWith('a11y-high-contrast');
    });

    it('should show active state when high contrast is enabled', async () => {
      const user = userEvent.setup();
      render(AccessibilityToolbar);

      const contrastButton = screen.getByLabelText('Toggle high contrast');
      await user.click(contrastButton);

      expect(contrastButton).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Link Underlines', () => {
    it('should toggle link underlines when button is clicked', async () => {
      const user = userEvent.setup();
      render(AccessibilityToolbar);

      const underlineButton = screen.getByLabelText('Toggle link underlines');
      
      // Enable link underlines
      await user.click(underlineButton);
      expect(document.body.classList.contains('always-underline-links')).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith('a11y-underline-links', 'true');
      
      // Disable link underlines
      await user.click(underlineButton);
      expect(document.body.classList.contains('always-underline-links')).toBe(false);
      expect(localStorage.removeItem).toHaveBeenCalledWith('a11y-underline-links');
    });

    it('should show active state when link underlines are enabled', async () => {
      const user = userEvent.setup();
      render(AccessibilityToolbar);

      const underlineButton = screen.getByLabelText('Toggle link underlines');
      await user.click(underlineButton);

      expect(underlineButton).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Reset Functionality', () => {
    it('should reset all settings when reset button is clicked', async () => {
      const user = userEvent.setup();
      
      // Set some preferences first
      mockLocalStorage['a11y-font-size'] = '125';
      mockLocalStorage['a11y-high-contrast'] = 'true';
      mockLocalStorage['a11y-underline-links'] = 'true';
      
      render(AccessibilityToolbar);
      
      // Apply settings
      document.documentElement.style.fontSize = '125%';
      document.body.classList.add('high-contrast', 'always-underline-links');

      const resetButton = screen.getByLabelText('Reset accessibility settings');
      await user.click(resetButton);

      // Check all settings are reset
      expect(document.documentElement.style.fontSize).toBe('');
      expect(document.body.classList.contains('high-contrast')).toBe(false);
      expect(document.body.classList.contains('always-underline-links')).toBe(false);
      
      // Check localStorage is cleared
      expect(localStorage.removeItem).toHaveBeenCalledWith('a11y-font-size');
      expect(localStorage.removeItem).toHaveBeenCalledWith('a11y-high-contrast');
      expect(localStorage.removeItem).toHaveBeenCalledWith('a11y-underline-links');
    });
  });

  describe('Persistence', () => {
    it('should load saved preferences on mount', () => {
      mockLocalStorage['a11y-font-size'] = '125';
      mockLocalStorage['a11y-high-contrast'] = 'true';
      mockLocalStorage['a11y-underline-links'] = 'true';

      render(AccessibilityToolbar);

      expect(document.documentElement.style.fontSize).toBe('125%');
      expect(document.body.classList.contains('high-contrast')).toBe(true);
      expect(document.body.classList.contains('always-underline-links')).toBe(true);
    });

    it('should show correct button states for saved preferences', () => {
      mockLocalStorage['a11y-high-contrast'] = 'true';
      mockLocalStorage['a11y-underline-links'] = 'true';

      render(AccessibilityToolbar);

      const contrastButton = screen.getByLabelText('Toggle high contrast');
      const underlineButton = screen.getByLabelText('Toggle link underlines');

      expect(contrastButton).toHaveAttribute('aria-pressed', 'true');
      expect(underlineButton).toHaveAttribute('aria-pressed', 'true');
    });
  });

  it('should be keyboard accessible', async () => {
    render(AccessibilityToolbar);

    const increaseButton = screen.getByLabelText('Increase font size');
    const decreaseButton = screen.getByLabelText('Decrease font size');
    const contrastButton = screen.getByLabelText('Toggle high contrast');
    const underlineButton = screen.getByLabelText('Toggle link underlines');
    const resetButton = screen.getByLabelText('Reset accessibility settings');

    // Check all buttons are focusable
    expect(increaseButton).toHaveAttribute('tabindex', '0');
    expect(decreaseButton).toHaveAttribute('tabindex', '0');
    expect(contrastButton).toHaveAttribute('tabindex', '0');
    expect(underlineButton).toHaveAttribute('tabindex', '0');
    expect(resetButton).toHaveAttribute('tabindex', '0');
  });

  it('should have appropriate ARIA labels and roles', () => {
    render(AccessibilityToolbar);

    const toolbar = screen.getByRole('toolbar', { name: 'Accessibility controls' });
    expect(toolbar).toBeInTheDocument();

    // Font size buttons should be in a group
    const fontSizeGroup = screen.getByRole('group', { name: 'Font size' });
    expect(fontSizeGroup).toBeInTheDocument();
  });
});