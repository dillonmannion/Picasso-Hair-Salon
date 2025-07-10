import { describe, it, expect, vi } from 'vitest';
import {
  validateSingleResult,
  validateArrayResult,
  validateInsertResult,
  validateUpdateResult,
  validateDeleteResult,
  createValidatedQuery
} from '../../../src/lib/db/validators';
import {
  UserProfileSchema,
  ServiceSchema,
  AppointmentSchema
} from '../../../src/lib/schemas/database';
import { UserSchema } from '../../../src/lib/schemas/auth';

describe('Database Query Validators', () => {
  describe('validateSingleResult', () => {
    it('should validate and return a single result when data matches schema', () => {
      const mockData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        role: 'customer' as const,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      };

      const result = validateSingleResult(mockData, UserSchema);
      
      expect(result).toEqual(mockData);
    });

    it('should throw validation error when data does not match schema', () => {
      const mockData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'invalid-email', // Invalid email format
        role: 'invalid-role', // Invalid role
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      };

      expect(() => validateSingleResult(mockData, UserSchema)).toThrow();
    });

    it('should throw error when result is null', () => {
      expect(() => validateSingleResult(null, UserSchema)).toThrow('No data found');
    });

    it('should throw error when result is undefined', () => {
      expect(() => validateSingleResult(undefined, UserSchema)).toThrow('No data found');
    });
  });

  describe('validateArrayResult', () => {
    it('should validate and return array of results when all items match schema', () => {
      const mockData = [
        {
          id: '123e4567-e89b-12d3-a456-426614174001',
          name: 'Haircut',
          description: 'Professional haircut service',
          price: 30,
          duration_minutes: 30,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z'
        },
        {
          id: '123e4567-e89b-12d3-a456-426614174002',
          name: 'Hair Color',
          description: 'Hair coloring service',
          price: 80,
          duration_minutes: 120,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z'
        }
      ];

      const result = validateArrayResult(mockData, ServiceSchema);
      
      expect(result).toEqual(mockData);
      expect(result).toHaveLength(2);
    });

    it('should throw validation error when any item does not match schema', () => {
      const mockData = [
        {
          id: '123e4567-e89b-12d3-a456-426614174001',
          name: 'Haircut',
          description: 'Professional haircut service',
          price: 30,
          duration_minutes: 30,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z'
        },
        {
          id: '123e4567-e89b-12d3-a456-426614174002',
          name: 'Hair Color',
          description: 'Hair coloring service',
          price: -10, // Invalid negative price
          duration_minutes: 120,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z'
        }
      ];

      expect(() => validateArrayResult(mockData, ServiceSchema)).toThrow();
    });

    it('should return empty array when result is null', () => {
      const result = validateArrayResult(null, ServiceSchema);
      expect(result).toEqual([]);
    });

    it('should return empty array when result is undefined', () => {
      const result = validateArrayResult(undefined, ServiceSchema);
      expect(result).toEqual([]);
    });

    it('should return empty array when result is an empty array', () => {
      const result = validateArrayResult([], ServiceSchema);
      expect(result).toEqual([]);
    });
  });

  describe('validateInsertResult', () => {
    it('should validate and return inserted data when it matches schema', () => {
      const mockData = {
        id: '123e4567-e89b-12d3-a456-426614174003',
        customer_id: '123e4567-e89b-12d3-a456-426614174004',
        barber_id: '123e4567-e89b-12d3-a456-426614174005',
        start_time: '2023-12-01T10:00:00Z',
        end_time: '2023-12-01T11:00:00Z',
        status: 'confirmed' as const,
        total_price: 30,
        notes: 'First time customer',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      };

      const result = validateInsertResult(mockData, AppointmentSchema);
      
      expect(result).toEqual(mockData);
    });

    it('should throw validation error when inserted data does not match schema', () => {
      const mockData = {
        id: '123e4567-e89b-12d3-a456-426614174003',
        customer_id: '123e4567-e89b-12d3-a456-426614174004',
        barber_id: '123e4567-e89b-12d3-a456-426614174005',
        start_time: '2023-12-01T10:00:00Z',
        end_time: '2023-12-01T09:00:00Z', // End time before start time (business logic validation would catch this)
        status: 'invalid-status', // Invalid status
        total_price: 30,
        notes: 'First time customer',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      };

      expect(() => validateInsertResult(mockData, AppointmentSchema)).toThrow();
    });

    it('should throw error when insert result is null', () => {
      expect(() => validateInsertResult(null, AppointmentSchema)).toThrow('Insert operation returned no data');
    });
  });

  describe('validateUpdateResult', () => {
    it('should validate and return updated data when it matches schema', () => {
      const mockData = {
        id: '123e4567-e89b-12d3-a456-426614174006',
        email: 'updated@example.com',
        role: 'admin' as const,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-02T00:00:00Z'
      };

      const result = validateUpdateResult(mockData, UserProfileSchema);
      
      expect(result).toEqual(mockData);
    });

    it('should throw validation error when updated data does not match schema', () => {
      const mockData = {
        id: '123e4567-e89b-12d3-a456-426614174006',
        email: 'invalid-email', // Invalid email
        role: 'invalid-role' as unknown as 'admin', // Invalid role
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-02T00:00:00Z'
      };

      expect(() => validateUpdateResult(mockData, UserProfileSchema)).toThrow();
    });

    it('should throw error when update result is null', () => {
      expect(() => validateUpdateResult(null, UserProfileSchema)).toThrow('Update operation returned no data');
    });
  });

  describe('validateDeleteResult', () => {
    it('should validate and return deleted data when it matches schema', () => {
      const mockData = {
        id: '123e4567-e89b-12d3-a456-426614174007',
        name: 'Deleted Service',
        description: 'This service was deleted',
        price: 50,
        duration_minutes: 60,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-02T00:00:00Z'
      };

      const result = validateDeleteResult(mockData, ServiceSchema);
      
      expect(result).toEqual(mockData);
    });

    it('should throw validation error when deleted data does not match schema', () => {
      const mockData = {
        id: '123e4567-e89b-12d3-a456-426614174007',
        name: 'Deleted Service',
        // Missing required fields
        price: 50,
        duration_minutes: 60,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-02T00:00:00Z'
      };

      expect(() => validateDeleteResult(mockData, ServiceSchema)).toThrow();
    });

    it('should throw error when delete result is null', () => {
      expect(() => validateDeleteResult(null, ServiceSchema)).toThrow('Delete operation returned no data');
    });
  });

  describe('createValidatedQuery', () => {
    it('should create a validated query wrapper that validates successful responses', async () => {
      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'test@example.com',
            role: 'customer',
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z'
          },
          error: null
        })
      };

      const validatedQuery = createValidatedQuery(
        mockQueryBuilder.select().eq('id', '123e4567-e89b-12d3-a456-426614174000').single(),
        UserSchema,
        'single'
      );

      const result = await validatedQuery;
      
      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
      expect(result.data?.email).toBe('test@example.com');
    });

    it('should pass through Supabase errors without validation', async () => {
      const mockError = {
        message: 'Database error',
        code: 'PGRST116',
        details: 'No rows found',
        hint: null
      };

      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: mockError
        })
      };

      const validatedQuery = createValidatedQuery(
        mockQueryBuilder.select().eq('id', 'nonexistent').single(),
        UserSchema,
        'single'
      );

      const result = await validatedQuery;
      
      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
    });

    it('should convert validation errors to Supabase error format', async () => {
      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'invalid-email', // Invalid format
            role: 'customer',
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z'
          },
          error: null
        })
      };

      const validatedQuery = createValidatedQuery(
        mockQueryBuilder.select().insert({}).single(),
        UserSchema,
        'insert'
      );

      const result = await validatedQuery;
      
      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('Validation error');
    });

    it('should handle array results with validation', async () => {
      const mockData = [
        {
          id: '123e4567-e89b-12d3-a456-426614174001',
          name: 'Haircut',
          description: 'Professional haircut',
          price: 30,
          duration_minutes: 30,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z'
        },
        {
          id: '123e4567-e89b-12d3-a456-426614174002',
          name: 'Shampoo',
          description: 'Hair wash and conditioning',
          price: 15,
          duration_minutes: 15,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z'
        }
      ];

      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        mockResolvedValue: vi.fn().mockResolvedValue({
          data: mockData,
          error: null
        })
      };

      // Create a thenable mock
      const thenableMock = {
        then: mockQueryBuilder.mockResolvedValue({
          data: mockData,
          error: null
        }).then.bind(mockQueryBuilder.mockResolvedValue({
          data: mockData,
          error: null
        }))
      };

      const validatedQuery = createValidatedQuery(
        thenableMock as Promise<{ data: unknown; error: null }>,
        ServiceSchema,
        'array'
      );

      const result = await validatedQuery;
      
      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(2);
      expect(result.data?.[0].name).toBe('Haircut');
    });

    it('should handle update operations with validation', async () => {
      const mockQueryBuilder = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: '123e4567-e89b-12d3-a456-426614174003',
            customer_id: '123e4567-e89b-12d3-a456-426614174004',
            barber_id: '123e4567-e89b-12d3-a456-426614174005',
            start_time: '2023-12-01T14:00:00Z',
            end_time: '2023-12-01T15:00:00Z',
            status: 'confirmed',
            total_price: 30,
            notes: 'Rescheduled appointment',
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-02T00:00:00Z'
          },
          error: null
        })
      };

      const validatedQuery = createValidatedQuery(
        mockQueryBuilder.update({ start_time: '2023-12-01T14:00:00Z' }).eq('id', '123e4567-e89b-12d3-a456-426614174003').single(),
        AppointmentSchema,
        'update'
      );

      const result = await validatedQuery;
      
      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
      expect(result.data?.start_time).toBe('2023-12-01T14:00:00Z');
    });

    it('should handle delete operations with validation', async () => {
      const mockQueryBuilder = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: '123e4567-e89b-12d3-a456-426614174007',
            name: 'Discontinued Service',
            description: 'This service is no longer available',
            price: 100,
            duration_minutes: 90,
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-03T00:00:00Z'
          },
          error: null
        })
      };

      const validatedQuery = createValidatedQuery(
        mockQueryBuilder.delete().eq('id', '123e4567-e89b-12d3-a456-426614174007').single(),
        ServiceSchema,
        'delete'
      );

      const result = await validatedQuery;
      
      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
      expect(result.data?.name).toBe('Discontinued Service');
    });
  });
});