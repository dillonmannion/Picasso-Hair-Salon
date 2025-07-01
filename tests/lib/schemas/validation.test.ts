import { describe, it, expect } from 'vitest';
import { ProfileSchema, OAuthCallbackParamsSchema, ButtonPropsSchema } from '$lib/schemas';

describe('Schema validation behavior', () => {
  describe('Profile validation', () => {
    it('should accept valid profile data', () => {
      const validProfile = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'johndoe',
        full_name: 'John Doe',
        avatar_url: 'https://example.com/avatar.jpg',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      const result = ProfileSchema.safeParse(validProfile);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.username).toBe('johndoe');
      }
    });

    it('should reject invalid username length', () => {
      const invalidProfile = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'ab', // Too short
        full_name: null,
        avatar_url: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      const result = ProfileSchema.safeParse(invalidProfile);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Username must be at least 3 characters');
      }
    });
  });

  describe('OAuth callback validation', () => {
    it('should accept valid callback params', () => {
      const validParams = {
        code: 'auth_code_123',
        next: '/dashboard'
      };

      const result = OAuthCallbackParamsSchema.safeParse(validParams);

      expect(result.success).toBe(true);
    });

    it('should reject missing code', () => {
      const invalidParams = {
        next: '/dashboard'
      };

      const result = OAuthCallbackParamsSchema.safeParse(invalidParams);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Authorization code is required');
      }
    });
  });
});