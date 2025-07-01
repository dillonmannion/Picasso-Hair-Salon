import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { currentUser, setUser, clearUser } from './auth';
import type { User } from '@supabase/supabase-js';

describe('Auth Store', () => {
  beforeEach(() => {
    clearUser();
  });

  it('should initialize with null user', () => {
    expect(get(currentUser)).toBeNull();
  });

  it('should set OAuth user correctly', () => {
    const oauthUser: Partial<User> = {
      id: 'google-oauth-123',
      email: 'user@gmail.com',
      app_metadata: {
        provider: 'google',
        providers: ['google']
      },
      user_metadata: {
        avatar_url: 'https://lh3.googleusercontent.com/...',
        email: 'user@gmail.com',
        email_verified: true,
        full_name: 'Test User',
        iss: 'https://accounts.google.com',
        name: 'Test User',
        picture: 'https://lh3.googleusercontent.com/...',
        provider_id: '1234567890',
        sub: '1234567890'
      },
      created_at: new Date().toISOString()
    };

    setUser(oauthUser as User);
    expect(get(currentUser)).toEqual(oauthUser);
  });

  it('should handle OAuth user without email', () => {
    const oauthUser: Partial<User> = {
      id: 'oauth-no-email-123',
      app_metadata: {
        provider: 'google',
        providers: ['google']
      },
      user_metadata: {
        name: 'Test User',
        provider_id: '1234567890'
      },
      created_at: new Date().toISOString()
    };

    setUser(oauthUser as User);
    const storedUser = get(currentUser);
    expect(storedUser).toEqual(oauthUser);
    expect(storedUser?.email).toBeUndefined();
  });

  it('should clear user on logout', () => {
    const oauthUser: Partial<User> = {
      id: 'google-oauth-123',
      email: 'user@gmail.com',
      app_metadata: {
        provider: 'google'
      }
    };

    setUser(oauthUser as User);
    expect(get(currentUser)).toEqual(oauthUser);
    
    clearUser();
    expect(get(currentUser)).toBeNull();
  });

  it('should update user data when re-authenticating', () => {
    const initialUser: Partial<User> = {
      id: 'google-oauth-123',
      email: 'user@gmail.com',
      user_metadata: {
        name: 'Initial Name'
      }
    };

    const updatedUser: Partial<User> = {
      id: 'google-oauth-123',
      email: 'user@gmail.com',
      user_metadata: {
        name: 'Updated Name',
        avatar_url: 'https://new-avatar.com/image.jpg'
      }
    };

    setUser(initialUser as User);
    expect(get(currentUser)?.user_metadata?.name).toBe('Initial Name');

    setUser(updatedUser as User);
    expect(get(currentUser)?.user_metadata?.name).toBe('Updated Name');
    expect(get(currentUser)?.user_metadata?.avatar_url).toBe('https://new-avatar.com/image.jpg');
  });
});