import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import ProfileManager from '$lib/components/ProfileManager.svelte';
import { createMockProfile } from '$lib/test-utils/factories';
import { ProfileSchema } from '$lib/schemas';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn()
      }))
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    }))
  }))
};

describe('ProfileManager behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display loading state while fetching profile', () => {
    const profile = createMockProfile();
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          single: vi.fn().mockReturnValueOnce(
            new Promise(() => {}) // Never resolves to keep loading
          )
        })
      })
    });

    render(ProfileManager, {
      props: {
        userId: profile.id,
        supabase: mockSupabase
      }
    });

    expect(screen.getByText('Loading profile...')).toBeInTheDocument();
  });

  it('should display profile data when loaded successfully', async () => {
    const profile = createMockProfile({
      username: 'johndoe',
      full_name: 'John Doe'
    });

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          single: vi.fn().mockResolvedValueOnce({
            data: profile,
            error: null
          })
        })
      })
    });

    render(ProfileManager, {
      props: {
        userId: profile.id,
        supabase: mockSupabase
      }
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('johndoe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    });
  });

  it('should display error when profile fetch fails', async () => {
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          single: vi.fn().mockResolvedValueOnce({
            data: null,
            error: { message: 'Profile not found' }
          })
        })
      })
    });

    render(ProfileManager, {
      props: {
        userId: 'invalid-id',
        supabase: mockSupabase
      }
    });

    await waitFor(() => {
      expect(screen.getByText('Error loading profile: Profile not found')).toBeInTheDocument();
    });
  });

  it('should allow editing profile fields', async () => {
    const user = userEvent.setup();
    const profile = createMockProfile({
      username: 'johndoe',
      full_name: 'John Doe'
    });

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          single: vi.fn().mockResolvedValueOnce({
            data: profile,
            error: null
          })
        })
      })
    });

    render(ProfileManager, {
      props: {
        userId: profile.id,
        supabase: mockSupabase
      }
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('johndoe')).toBeInTheDocument();
    });

    const usernameInput = screen.getByLabelText('Username');
    await user.clear(usernameInput);
    await user.type(usernameInput, 'newusername');

    expect(usernameInput).toHaveValue('newusername');
  });

  it('should validate profile data with schema before saving', async () => {
    const user = userEvent.setup();
    const profile = createMockProfile({
      username: 'johndoe'
    });

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          single: vi.fn().mockResolvedValueOnce({
            data: profile,
            error: null
          })
        })
      })
    });

    render(ProfileManager, {
      props: {
        userId: profile.id,
        supabase: mockSupabase
      }
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('johndoe')).toBeInTheDocument();
    });

    const usernameInput = screen.getByLabelText('Username');
    await user.clear(usernameInput);
    await user.type(usernameInput, 'ab'); // Too short

    const saveButton = screen.getByRole('button', { name: 'Save Profile' });
    await user.click(saveButton);

    expect(screen.getByText('Username must be at least 3 characters')).toBeInTheDocument();
    expect(mockSupabase.from).toHaveBeenCalledTimes(1); // Only the initial fetch
  });

  it('should save valid profile updates', async () => {
    const user = userEvent.setup();
    const profile = createMockProfile({
      username: 'johndoe',
      full_name: 'John Doe'
    });

    const updatedProfile = {
      ...profile,
      username: 'newusername',
      updated_at: new Date().toISOString()
    };

    mockSupabase.from
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({
              data: profile,
              error: null
            })
          })
        })
      })
      .mockReturnValueOnce({
        update: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            select: vi.fn().mockReturnValueOnce({
              single: vi.fn().mockResolvedValueOnce({
                data: updatedProfile,
                error: null
              })
            })
          })
        })
      });

    render(ProfileManager, {
      props: {
        userId: profile.id,
        supabase: mockSupabase
      }
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('johndoe')).toBeInTheDocument();
    });

    const usernameInput = screen.getByLabelText('Username');
    await user.clear(usernameInput);
    await user.type(usernameInput, 'newusername');

    const saveButton = screen.getByRole('button', { name: 'Save Profile' });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
    });

    expect(mockSupabase.from).toHaveBeenCalledTimes(2);
    expect(mockSupabase.from).toHaveBeenLastCalledWith('profiles');
  });

  it('should show save button only when form is dirty', async () => {
    const user = userEvent.setup();
    const profile = createMockProfile();

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          single: vi.fn().mockResolvedValueOnce({
            data: profile,
            error: null
          })
        })
      })
    });

    render(ProfileManager, {
      props: {
        userId: profile.id,
        supabase: mockSupabase
      }
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue(profile.username!)).toBeInTheDocument();
    });

    // Save button should be disabled initially
    const saveButton = screen.getByRole('button', { name: 'Save Profile' });
    expect(saveButton).toBeDisabled();

    // Type something to make form dirty
    const usernameInput = screen.getByLabelText('Username');
    await user.type(usernameInput, '123');

    // Save button should now be enabled
    expect(saveButton).not.toBeDisabled();
  });

  it('should handle null values in profile fields', async () => {
    const profile = createMockProfile({
      username: 'johndoe',
      full_name: null,
      avatar_url: null
    });

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          single: vi.fn().mockResolvedValueOnce({
            data: profile,
            error: null
          })
        })
      })
    });

    render(ProfileManager, {
      props: {
        userId: profile.id,
        supabase: mockSupabase
      }
    });

    await waitFor(() => {
      const fullNameInput = screen.getByLabelText('Full Name');
      expect(fullNameInput).toHaveValue('');
    });
  });
});