import type { QueryError } from '@supabase/supabase-js';
import { z } from 'zod';

const assertDataExists = (data: unknown, operation: string): void => {
  if (data === null || data === undefined) {
    throw new Error(
      operation === 'single' 
        ? 'No data found' 
        : `${operation.charAt(0).toUpperCase() + operation.slice(1)} operation returned no data`
    );
  }
};

export const validateSingleResult = <T>(
  data: unknown,
  schema: z.ZodSchema<T>
): T => {
  assertDataExists(data, 'single');
  return schema.parse(data);
};

export const validateArrayResult = <T>(
  data: unknown,
  schema: z.ZodSchema<T>
): T[] => {
  if (data === null || data === undefined) {
    return [];
  }
  
  if (!Array.isArray(data)) {
    throw new Error('Expected array but got ' + typeof data);
  }
  
  return z.array(schema).parse(data);
};

const validateOperationResult = <T>(
  data: unknown,
  schema: z.ZodSchema<T>,
  operation: 'insert' | 'update' | 'delete'
): T => {
  assertDataExists(data, operation);
  return schema.parse(data);
};

export const validateInsertResult = <T>(
  data: unknown,
  schema: z.ZodSchema<T>
): T => validateOperationResult(data, schema, 'insert');

export const validateUpdateResult = <T>(
  data: unknown,
  schema: z.ZodSchema<T>
): T => validateOperationResult(data, schema, 'update');

export const validateDeleteResult = <T>(
  data: unknown,
  schema: z.ZodSchema<T>
): T => validateOperationResult(data, schema, 'delete');

type QueryResult<T> = {
  data: T | null;
  error: QueryError | null;
};

type ValidatedQueryResult<T> = {
  data: T | null;
  error: {
    message: string;
    code?: string;
    details?: string;
    hint?: string | null;
  } | null;
};

type OperationType = 'single' | 'array' | 'insert' | 'update' | 'delete';

const operationValidators = {
  single: validateSingleResult,
  array: validateArrayResult,
  insert: validateInsertResult,
  update: validateUpdateResult,
  delete: validateDeleteResult
} as const;

const formatZodError = (error: z.ZodError): {
  message: string;
  code: string;
  details: string;
  hint: null;
} => ({
  message: 'Validation error: ' + error.errors.map(e => e.message).join(', '),
  code: 'VALIDATION_ERROR',
  details: JSON.stringify(error.errors),
  hint: null
});

const formatUnknownError = (error: unknown): {
  message: string;
  code: string;
  details: undefined;
  hint: null;
} => ({
  message: error instanceof Error ? error.message : 'Unknown error',
  code: 'UNKNOWN_ERROR',
  details: undefined,
  hint: null
});

type QueryResultByOperation<T, O extends OperationType> = O extends 'array' 
  ? ValidatedQueryResult<T[]>
  : ValidatedQueryResult<T>;

export function createValidatedQuery<T, O extends OperationType>(
  query: Promise<QueryResult<unknown>>,
  schema: z.ZodSchema<T>,
  operation: O
): Promise<QueryResultByOperation<T, O>> {
  return query.then((result) => {
    if (result.error) {
      return {
        data: null,
        error: result.error
      };
    }

    try {
      const validator = operationValidators[operation];
      const validatedData = validator(result.data, schema);
      
      return {
        data: validatedData,
        error: null
      };
    } catch (error) {
      const formattedError = error instanceof z.ZodError 
        ? formatZodError(error) 
        : formatUnknownError(error);
      
      return {
        data: null,
        error: formattedError
      };
    }
  }) as Promise<QueryResultByOperation<T, O>>;
}