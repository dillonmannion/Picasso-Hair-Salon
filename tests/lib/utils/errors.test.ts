import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { AppError, handleError, isAppError } from '$lib/utils/errors';

describe('Error Handling Utilities', () => {
  describe('AppError', () => {
    it('should create an error with status code and message', () => {
      const error = new AppError(404, 'Resource not found');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.status).toBe(404);
      expect(error.message).toBe('Resource not found');
    });

    it('should create an error with additional properties', () => {
      const error = new AppError(400, 'Validation failed', {
        code: 'VALIDATION_ERROR',
        field: 'email',
      });

      expect(error.status).toBe(400);
      expect(error.message).toBe('Validation failed');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.field).toBe('email');
    });

    it('should have a name property set to AppError', () => {
      const error = new AppError(500, 'Internal error');
      expect(error.name).toBe('AppError');
    });
  });

  describe('isAppError', () => {
    it('should return true for AppError instances', () => {
      const error = new AppError(400, 'Bad request');
      expect(isAppError(error)).toBe(true);
    });

    it('should return false for regular Error instances', () => {
      const error = new Error('Regular error');
      expect(isAppError(error)).toBe(false);
    });

    it('should return false for non-error values', () => {
      expect(isAppError(null)).toBe(false);
      expect(isAppError(undefined)).toBe(false);
      expect(isAppError('string')).toBe(false);
      expect(isAppError(123)).toBe(false);
      expect(isAppError({})).toBe(false);
    });
  });

  describe('handleError', () => {
    it('should properly categorize Zod validation errors as 400', () => {
      const schema = z.object({
        email: z.string().email(),
        age: z.number().positive(),
      });

      try {
        schema.parse({ email: 'invalid', age: -5 });
      } catch (error) {
        const appError = handleError(error);

        expect(appError).toBeInstanceOf(AppError);
        expect(appError.status).toBe(400);
        expect(appError.message).toContain('Validation error');
        expect(appError.errors).toBeDefined();
        expect(Array.isArray(appError.errors)).toBe(true);
        expect((appError.errors as unknown[]).length).toBeGreaterThan(0);
      }
    });

    it('should return AppError instances unchanged', () => {
      const originalError = new AppError(403, 'Forbidden', { code: 'FORBIDDEN' });
      const handledError = handleError(originalError);

      expect(handledError).toBe(originalError);
      expect(handledError.status).toBe(403);
      expect(handledError.message).toBe('Forbidden');
      expect(handledError.code).toBe('FORBIDDEN');
    });

    it('should convert unknown errors to 500 status', () => {
      const unknownError = new Error('Something went wrong');
      const appError = handleError(unknownError);

      expect(appError).toBeInstanceOf(AppError);
      expect(appError.status).toBe(500);
      expect(appError.message).toBe('Internal server error');
      expect(appError.originalMessage).toBe('Something went wrong');
    });

    it('should handle non-Error objects as 500 status', () => {
      const appError = handleError('string error');

      expect(appError).toBeInstanceOf(AppError);
      expect(appError.status).toBe(500);
      expect(appError.message).toBe('Internal server error');
    });

    it('should handle null and undefined as 500 status', () => {
      const nullError = handleError(null);
      const undefinedError = handleError(undefined);

      expect(nullError).toBeInstanceOf(AppError);
      expect(nullError.status).toBe(500);
      expect(undefinedError).toBeInstanceOf(AppError);
      expect(undefinedError.status).toBe(500);
    });

    it('should extract Zod error details properly', () => {
      const schema = z.object({
        username: z.string().min(3),
        email: z.string().email(),
      });

      try {
        schema.parse({ username: 'ab', email: 'not-an-email' });
      } catch (error) {
        const appError = handleError(error);

        expect(appError.errors as z.ZodIssue[]).toHaveLength(2);
        expect(appError.errors as z.ZodIssue[]).toContainEqual(
          expect.objectContaining({
            path: ['username'],
            message: expect.stringContaining('at least 3'),
          })
        );
        expect(appError.errors as z.ZodIssue[]).toContainEqual(
          expect.objectContaining({
            path: ['email'],
            message: expect.stringContaining('email'),
          })
        );
      }
    });
  });
});
