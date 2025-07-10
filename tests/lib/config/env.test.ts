import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Environment Variable Validation', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
    // Clear all env vars for clean slate
    Object.keys(process.env).forEach((key) => {
      delete process.env[key];
    });
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
    // Clear module cache to force re-evaluation
    vi.resetModules();
  });

  describe('validateEnv', () => {
    it('should validate and return environment variables when all required vars are present', async () => {
      // Arrange
      process.env.PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key-1234567890';
      process.env.SUPABASE_SERVICE_KEY = 'test-service-key-1234567890';
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
      process.env.NODE_ENV = 'test';

      // Act
      const { validateEnv } = await import('$lib/config/env');
      const env = validateEnv();

      // Assert
      expect(env).toEqual({
        PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
        PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key-1234567890',
        SUPABASE_SERVICE_KEY: 'test-service-key-1234567890',
        DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
        NODE_ENV: 'test',
      });
    });

    it('should throw clear error when PUBLIC_SUPABASE_URL is missing', async () => {
      // Arrange
      process.env.PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      process.env.SUPABASE_SERVICE_KEY = 'test-service-key';
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
      process.env.NODE_ENV = 'test';

      // Act & Assert
      try {
        await import('$lib/config/env');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('Environment validation failed');
        expect((error as Error).message).toContain('PUBLIC_SUPABASE_URL');
      }
    });

    it('should throw clear error when PUBLIC_SUPABASE_URL is invalid URL', async () => {
      // Arrange
      process.env.PUBLIC_SUPABASE_URL = 'not-a-valid-url';
      process.env.PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      process.env.SUPABASE_SERVICE_KEY = 'test-service-key';
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
      process.env.NODE_ENV = 'test';

      // Act & Assert
      try {
        await import('$lib/config/env');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('Environment validation failed');
        expect((error as Error).message).toContain('PUBLIC_SUPABASE_URL');
        expect((error as Error).message).toContain('Invalid url');
      }
    });

    it('should throw clear error when PUBLIC_SUPABASE_ANON_KEY is missing', async () => {
      // Arrange
      process.env.PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_SERVICE_KEY = 'test-service-key';
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
      process.env.NODE_ENV = 'test';

      // Act & Assert
      try {
        await import('$lib/config/env');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('Environment validation failed');
        expect((error as Error).message).toContain('PUBLIC_SUPABASE_ANON_KEY');
      }
    });

    it('should throw clear error when NODE_ENV has invalid value', async () => {
      // Arrange
      process.env.PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      process.env.SUPABASE_SERVICE_KEY = 'test-service-key';
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
      process.env.NODE_ENV = 'invalid-env';

      // Act & Assert
      try {
        await import('$lib/config/env');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('Environment validation failed');
        expect((error as Error).message).toContain('NODE_ENV');
      }
    });

    it('should throw with multiple validation errors when multiple vars are invalid', async () => {
      // Arrange - missing both required vars
      process.env.NODE_ENV = 'invalid';
      process.env.DATABASE_URL = 'not-a-database-url';

      // Act & Assert
      try {
        await import('$lib/config/env');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('Environment validation failed');
        // Should mention multiple missing fields
        expect((error as Error).message).toMatch(/PUBLIC_SUPABASE_URL.*PUBLIC_SUPABASE_ANON_KEY/s);
      }
    });
  });

  describe('env export', () => {
    it('should export validated environment object when imported', async () => {
      // Arrange
      process.env.PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key-1234567890';
      process.env.SUPABASE_SERVICE_KEY = 'test-service-key-1234567890';
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
      process.env.NODE_ENV = 'test';

      // Act
      const { env } = await import('$lib/config/env');

      // Assert
      expect(env).toEqual({
        PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
        PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key-1234567890',
        SUPABASE_SERVICE_KEY: 'test-service-key-1234567890',
        DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
        NODE_ENV: 'test',
      });
    });

    it('should throw on import when environment is invalid', async () => {
      // Arrange - no env vars set

      // Act & Assert
      await expect(import('$lib/config/env')).rejects.toThrow('Environment validation failed');
    });
  });

  describe('EnvSchema export', () => {
    it('should export the Zod schema for external use', async () => {
      // Arrange
      process.env.PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      process.env.SUPABASE_SERVICE_KEY = 'test-service-key';
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
      process.env.NODE_ENV = 'test';

      // Act
      const { EnvSchema } = await import('$lib/config/env');
      const parsed = EnvSchema.parse(process.env);

      // Assert
      expect(parsed).toMatchObject({
        PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
        NODE_ENV: 'test',
      });
    });
  });
});
