import { describe, it, expect } from 'vitest';
import {
  createMockProfile,
  createMockOAuthCallback,
  createMockButtonProps,
} from '$lib/test-utils/factories';
import { ProfileSchema, OAuthCallbackParamsSchema, ButtonPropsSchema } from '$lib/schemas';

describe('Test data factory behavior', () => {
  describe('createMockProfile', () => {
    it('should create valid profile with defaults', () => {
      const profile = createMockProfile();

      const result = ProfileSchema.safeParse(profile);
      expect(result.success).toBe(true);
    });

    it('should allow profile overrides', () => {
      const profile = createMockProfile({ username: 'custom_user' });

      expect(profile.username).toBe('custom_user');
      const result = ProfileSchema.safeParse(profile);
      expect(result.success).toBe(true);
    });

    it('should allow nullable field overrides', () => {
      const profile = createMockProfile({
        username: null,
        full_name: null,
        avatar_url: null,
      });

      expect(profile.username).toBeNull();
      expect(profile.full_name).toBeNull();
      expect(profile.avatar_url).toBeNull();
      const result = ProfileSchema.safeParse(profile);
      expect(result.success).toBe(true);
    });

    it('should preserve all schema fields in output', () => {
      const profile = createMockProfile();

      expect(profile).toHaveProperty('id');
      expect(profile).toHaveProperty('username');
      expect(profile).toHaveProperty('full_name');
      expect(profile).toHaveProperty('avatar_url');
      expect(profile).toHaveProperty('created_at');
      expect(profile).toHaveProperty('updated_at');
    });
  });

  describe('createMockOAuthCallback', () => {
    it('should create valid OAuth callback params with defaults', () => {
      const params = createMockOAuthCallback();

      const result = OAuthCallbackParamsSchema.safeParse(params);
      expect(result.success).toBe(true);
      expect(params.code).toBeDefined();
      expect(params.code.length).toBeGreaterThan(0);
    });

    it('should allow OAuth param overrides', () => {
      const params = createMockOAuthCallback({
        code: 'custom_auth_code',
        next: '/dashboard',
      });

      expect(params.code).toBe('custom_auth_code');
      expect(params.next).toBe('/dashboard');
      const result = OAuthCallbackParamsSchema.safeParse(params);
      expect(result.success).toBe(true);
    });

    it('should allow optional next param to be omitted', () => {
      const params = createMockOAuthCallback({ next: undefined });

      expect(params.next).toBeUndefined();
      const result = OAuthCallbackParamsSchema.safeParse(params);
      expect(result.success).toBe(true);
    });
  });

  describe('createMockButtonProps', () => {
    it('should create valid button props with defaults', () => {
      const props = createMockButtonProps();

      const result = ButtonPropsSchema.safeParse(props);
      expect(result.success).toBe(true);
      expect(props.variant).toBe('primary');
      expect(props.size).toBe('default');
    });

    it('should allow button prop overrides', () => {
      const props = createMockButtonProps({
        variant: 'ghost',
        size: 'large',
        disabled: true,
      });

      expect(props.variant).toBe('ghost');
      expect(props.size).toBe('large');
      expect(props.disabled).toBe(true);
      const result = ButtonPropsSchema.safeParse(props);
      expect(result.success).toBe(true);
    });

    it('should allow HTML button attributes through passthrough', () => {
      const props = createMockButtonProps({
        'aria-label': 'Submit form',
        type: 'submit',
      });

      expect(props['aria-label']).toBe('Submit form');
      expect(props.type).toBe('submit');
      const result = ButtonPropsSchema.safeParse(props);
      expect(result.success).toBe(true);
    });
  });
});
