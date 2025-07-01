import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';

// Use vi.hoisted to define mocks that can be referenced inside vi.mock
const mocks = vi.hoisted(() => {
  return {
    goto: vi.fn(),
    signInWithOAuth: vi.fn(),
    supabase: {
      auth: {
        signInWithOAuth: vi.fn()
      }
    }
  };
});

// Mock $app/navigation
vi.mock('$app/navigation', () => ({
  goto: mocks.goto
}));

// Mock the Supabase client
vi.mock('$lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithOAuth: mocks.signInWithOAuth
    }
  }
}));

// Import component after mocks are set up
import LoginPage from '../../../../src/routes/auth/login/+page.svelte';

// Import supabase to get the mocked instance
import { supabase } from '$lib/supabase';

// Create mock data that matches PageData type
const mockPageData = {
  supabase: supabase as any,
  session: null,
  user: null
};

describe('OAuth Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render Google sign-in button', () => {
    render(LoginPage, {
      props: {
        data: mockPageData,
        form: null
      }
    });

    const googleButton = screen.getByRole('button', { name: /sign in with google/i });
    expect(googleButton).toBeTruthy();
  });

  it('should display only one authentication button', () => {
    render(LoginPage, {
      props: {
        data: mockPageData,
        form: null
      }
    });

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(1);
  });

  it('should not display email or password inputs', () => {
    render(LoginPage, {
      props: {
        data: mockPageData,
        form: null
      }
    });

    const emailInput = screen.queryByLabelText(/email/i);
    const passwordInput = screen.queryByLabelText(/password/i);
    
    expect(emailInput).toBeNull();
    expect(passwordInput).toBeNull();
  });

  it('should display error message when form has error', () => {
    render(LoginPage, {
      props: {
        data: {
          ...mockPageData,
          error: 'Authentication failed. Please try again.'
        },
        form: null
      }
    });

    const errorMessage = screen.getByText('Authentication failed. Please try again.');
    expect(errorMessage).toBeTruthy();
  });

  it('should call signInWithOAuth when Google button is clicked', async () => {
    mocks.signInWithOAuth.mockResolvedValueOnce({
      data: { url: 'https://accounts.google.com/oauth/authorize?...' },
      error: null
    });

    render(LoginPage, {
      props: {
        data: mockPageData,
        form: null
      }
    });

    const googleButton = screen.getByRole('button', { name: /sign in with google/i });
    await googleButton.click();

    expect(mocks.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: expect.stringContaining('/auth/callback')
      }
    });
  });

  it('should display loading state while authenticating', async () => {
    // Create a promise we can control
    let resolveAuth: (value: any) => void;
    const authPromise = new Promise((resolve) => {
      resolveAuth = resolve;
    });
    
    mocks.signInWithOAuth.mockReturnValueOnce(authPromise);

    const { component } = render(LoginPage, {
      props: {
        data: mockPageData,
        form: null
      }
    });

    // Get button initially
    const googleButton = screen.getByRole('button', { name: /sign in with google/i });
    await googleButton.click();

    // Check button shows loading text and is disabled
    const loadingButton = screen.getByRole('button', { name: /signing in/i });
    expect(loadingButton).toBeTruthy();
    expect(loadingButton).toHaveProperty('disabled', true);

    // Resolve the auth promise with an error to test the button re-enables
    resolveAuth!({
      data: null,
      error: new Error('Test error')
    });

    await vi.waitFor(() => {
      // Button should show normal text again
      const normalButton = screen.getByRole('button', { name: /sign in with google/i });
      expect(normalButton).toBeTruthy();
      expect(normalButton).toHaveProperty('disabled', false);
      
      // Error should be displayed
      const errorMessage = screen.getByText(/Test error/i);
      expect(errorMessage).toBeTruthy();
    });
  });

  it('should handle OAuth errors gracefully', async () => {
    mocks.signInWithOAuth.mockResolvedValueOnce({
      data: null,
      error: new Error('OAuth configuration error')
    });

    const { component } = render(LoginPage, {
      props: {
        data: mockPageData,
        form: null
      }
    });

    const googleButton = screen.getByRole('button', { name: /sign in with google/i });
    await googleButton.click();

    await vi.waitFor(() => {
      const errorMessage = screen.getByText(/OAuth configuration error/i);
      expect(errorMessage).toBeTruthy();
    });
  });
});