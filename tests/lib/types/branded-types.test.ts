import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import type { UserId, ServiceId, StaffId } from '$lib/types/branded';
import {
  createUserId,
  createServiceId,
  createStaffId,
  isUserId,
  isServiceId,
  isStaffId,
  UserIdSchema,
  ServiceIdSchema,
  StaffIdSchema
} from '$lib/types/branded';

describe('Branded Types', () => {
  describe('UserId', () => {
    it('should create a valid UserId from string', () => {
      const id = 'user_123';
      const userId = createUserId(id);
      
      expect(userId).toBe(id);
      expect(isUserId(userId)).toBe(true);
    });

    it('should validate UserId with schema', () => {
      const inputString = 'user_456';
      const result = UserIdSchema.safeParse(inputString);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(inputString);
        expect(isUserId(result.data)).toBe(true);
      }
    });

    it('should type guard strings as UserId', () => {
      const regularString = 'user_789';
      expect(isUserId(regularString)).toBe(true);
      expect(isUserId(123)).toBe(false);
      expect(isUserId(null)).toBe(false);
      expect(isUserId(undefined)).toBe(false);
    });

    it('should reject invalid input with schema', () => {
      const invalidInput = 123;
      const result = UserIdSchema.safeParse(invalidInput);
      
      expect(result.success).toBe(false);
    });

    it('should maintain type safety in function parameters', () => {
      const processUser = (id: UserId): string => {
        return `Processing user: ${id}`;
      };

      const userId = createUserId('user_123');
      const result = processUser(userId);
      
      expect(result).toBe('Processing user: user_123');
      
      // This would cause a TypeScript error if uncommented:
      // processUser('user_123'); // Error: string is not assignable to UserId
    });
  });

  describe('ServiceId', () => {
    it('should create a valid ServiceId from string', () => {
      const id = 'service_abc';
      const serviceId = createServiceId(id);
      
      expect(serviceId).toBe(id);
      expect(isServiceId(serviceId)).toBe(true);
    });

    it('should validate ServiceId with schema', () => {
      const inputString = 'service_def';
      const result = ServiceIdSchema.safeParse(inputString);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(inputString);
        expect(isServiceId(result.data)).toBe(true);
      }
    });

    it('should type guard strings as ServiceId', () => {
      const regularString = 'service_ghi';
      expect(isServiceId(regularString)).toBe(true);
      expect(isServiceId(123)).toBe(false);
      expect(isServiceId(null)).toBe(false);
      expect(isServiceId(undefined)).toBe(false);
    });

    it('should validate string input with schema', () => {
      const regularString = 'service_ghi';
      const result = ServiceIdSchema.safeParse(regularString);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(regularString);
      }
    });

    it('should not allow cross-assignment between branded types', () => {
      const serviceId = createServiceId('service_abc');
      
      // Type assertions to verify types are distinct
      const processService = (id: ServiceId): string => {
        return `Processing service: ${id}`;
      };

      expect(processService(serviceId)).toBe('Processing service: service_abc');
      
      // This would cause a TypeScript error if uncommented:
      // const userId = createUserId('user_123');
      // processService(userId); // Error: UserId is not assignable to ServiceId
    });
  });

  describe('StaffId', () => {
    it('should create a valid StaffId from string', () => {
      const id = 'staff_xyz';
      const staffId = createStaffId(id);
      
      expect(staffId).toBe(id);
      expect(isStaffId(staffId)).toBe(true);
    });

    it('should validate StaffId with schema', () => {
      const inputString = 'staff_uvw';
      const result = StaffIdSchema.safeParse(inputString);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(inputString);
        expect(isStaffId(result.data)).toBe(true);
      }
    });

    it('should type guard strings as StaffId', () => {
      const regularString = 'staff_rst';
      expect(isStaffId(regularString)).toBe(true);
      expect(isStaffId(123)).toBe(false);
      expect(isStaffId(null)).toBe(false);
      expect(isStaffId(undefined)).toBe(false);
    });

    it('should validate string input with schema', () => {
      const regularString = 'staff_rst';
      const result = StaffIdSchema.safeParse(regularString);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(regularString);
      }
    });
  });

  describe('Type safety across branded types', () => {
    it('should enforce type safety in complex data structures', () => {
      type Appointment = {
        id: string;
        userId: UserId;
        serviceId: ServiceId;
        staffId: StaffId;
      };

      const createAppointment = (
        userId: UserId,
        serviceId: ServiceId,
        staffId: StaffId
      ): Appointment => {
        return {
          id: 'appt_123',
          userId,
          serviceId,
          staffId
        };
      };

      const user = createUserId('user_123');
      const service = createServiceId('service_abc');
      const staff = createStaffId('staff_xyz');

      const appointment = createAppointment(user, service, staff);
      
      expect(appointment.userId).toBe('user_123');
      expect(appointment.serviceId).toBe('service_abc');
      expect(appointment.staffId).toBe('staff_xyz');

      // Verify types are preserved
      expect(isUserId(appointment.userId)).toBe(true);
      expect(isServiceId(appointment.serviceId)).toBe(true);
      expect(isStaffId(appointment.staffId)).toBe(true);
    });

    it('should work with arrays and collections', () => {
      const userIds: UserId[] = [
        createUserId('user_1'),
        createUserId('user_2'),
        createUserId('user_3')
      ];

      const serviceIds: ServiceId[] = [
        createServiceId('service_a'),
        createServiceId('service_b')
      ];

      expect(userIds.every(isUserId)).toBe(true);
      expect(serviceIds.every(isServiceId)).toBe(true);
      
      // These collections are type-safe and cannot be mixed
      // userIds.push(createServiceId('service_c')); // TypeScript error
    });

    it('should integrate with Zod schemas for validation', () => {
      const AppointmentSchema = z.object({
        id: z.string(),
        userId: UserIdSchema,
        serviceId: ServiceIdSchema,
        staffId: StaffIdSchema,
        scheduledAt: z.string().datetime()
      });

      const validData = {
        id: 'appt_123',
        userId: createUserId('user_123'),
        serviceId: createServiceId('service_abc'),
        staffId: createStaffId('staff_xyz'),
        scheduledAt: '2024-01-01T10:00:00Z'
      };

      const result = AppointmentSchema.safeParse(validData);
      expect(result.success).toBe(true);

      const invalidData = {
        id: 'appt_456',
        userId: 'user_456', // Will be transformed to branded
        serviceId: 'service_def', // Will be transformed to branded
        staffId: 'staff_uvw', // Will be transformed to branded
        scheduledAt: '2024-01-01T11:00:00Z'
      };

      const invalidResult = AppointmentSchema.safeParse(invalidData);
      expect(invalidResult.success).toBe(true); // Schemas transform strings to branded types
      
      // Test with actual invalid data
      const actuallyInvalidData = {
        id: 'appt_789',
        userId: 123, // Not a string
        serviceId: null, // Not a string
        staffId: undefined, // Not a string
        scheduledAt: '2024-01-01T12:00:00Z'
      };
      
      const actuallyInvalidResult = AppointmentSchema.safeParse(actuallyInvalidData);
      expect(actuallyInvalidResult.success).toBe(false);
    });
  });
});