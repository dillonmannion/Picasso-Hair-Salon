import { z } from 'zod';

export class AppError extends Error {
  status: number;
  [key: string]: unknown;

  constructor(status: number, message: string, additionalProperties?: Record<string, unknown>) {
    super(message);
    this.name = 'AppError';
    this.status = status;

    if (additionalProperties) {
      Object.assign(this, additionalProperties);
    }
  }
}

export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};

export const handleError = (error: unknown): AppError => {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof z.ZodError) {
    return new AppError(400, 'Validation error', {
      errors: error.errors,
    });
  }

  if (error instanceof Error) {
    return new AppError(500, 'Internal server error', {
      originalMessage: error.message,
    });
  }

  return new AppError(500, 'Internal server error');
};
