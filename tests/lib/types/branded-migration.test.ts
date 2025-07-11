import { describe, it, expect } from 'vitest';
import type { 
  AppointmentId
} from '$lib/types/branded';
import { 
  isUserId,
  isServiceId
} from '$lib/types/branded';
import {
  ProfileSchema,
  BarberProfileSchema,
  CustomerProfileSchema,
  AppointmentSchema,
  AppointmentServiceSchema,
  ServiceSchema,
  UserSchema,
  AppointmentIdSchema,
  CustomerIdSchema,
  BarberIdSchema,
  ProfileIdSchema,
  createAppointmentId,
  createCustomerId,
  createBarberId,
  createProfileId,
  isAppointmentId,
  isCustomerId,
  isBarberId,
  isProfileId
} from '$lib/schemas/index';

describe('Branded Types Migration', () => {
  describe('New Branded Types', () => {
    it('should export AppointmentId branded type and helpers', () => {
      const id = 'appt_123';
      const appointmentId = createAppointmentId(id);
      
      expect(appointmentId).toBe(id);
      expect(isAppointmentId(appointmentId)).toBe(true);
      expect(isAppointmentId('regular_string')).toBe(true); // All strings pass
      expect(isAppointmentId(123)).toBe(false);
    });

    it('should export CustomerId branded type and helpers', () => {
      const id = 'cust_456';
      const customerId = createCustomerId(id);
      
      expect(customerId).toBe(id);
      expect(isCustomerId(customerId)).toBe(true);
      expect(isCustomerId('regular_string')).toBe(true); // All strings pass
      expect(isCustomerId(null)).toBe(false);
    });

    it('should export BarberId branded type and helpers', () => {
      const id = 'barber_789';
      const barberId = createBarberId(id);
      
      expect(barberId).toBe(id);
      expect(isBarberId(barberId)).toBe(true);
      expect(isBarberId('regular_string')).toBe(true); // All strings pass
      expect(isBarberId(undefined)).toBe(false);
    });

    it('should export ProfileId branded type and helpers', () => {
      const id = 'prof_abc';
      const profileId = createProfileId(id);
      
      expect(profileId).toBe(id);
      expect(isProfileId(profileId)).toBe(true);
      expect(isProfileId('regular_string')).toBe(true); // All strings pass
      expect(isProfileId({})).toBe(false);
    });

    it('should export schemas for new branded types', () => {
      expect(AppointmentIdSchema).toBeDefined();
      expect(CustomerIdSchema).toBeDefined();
      expect(BarberIdSchema).toBeDefined();
      expect(ProfileIdSchema).toBeDefined();

      // Test schema validation
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      const appointmentResult = AppointmentIdSchema.safeParse(validUuid);
      expect(appointmentResult.success).toBe(true);
      if (appointmentResult.success) {
        expect(isAppointmentId(appointmentResult.data)).toBe(true);
      }

      const invalidResult = AppointmentIdSchema.safeParse(123);
      expect(invalidResult.success).toBe(false);
      
      const invalidUuidResult = AppointmentIdSchema.safeParse('not-a-uuid');
      expect(invalidUuidResult.success).toBe(false);
    });
  });

  describe('ProfileSchema Migration', () => {
    it('should use ProfileId branded type for id field', () => {
      const validProfile = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        username: 'johndoe',
        full_name: 'John Doe',
        avatar_url: 'https://example.com/avatar.jpg',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      const result = ProfileSchema.safeParse(validProfile);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(isProfileId(result.data.id)).toBe(true);
      }
    });
  });

  describe('UserSchema Migration', () => {
    it('should use UserId branded type for id field', () => {
      const validUser = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        email: 'user@example.com',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      const result = UserSchema.safeParse(validUser);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(isUserId(result.data.id)).toBe(true);
      }
    });
  });

  describe('BarberProfileSchema Migration', () => {
    it('should use UserId branded type for user_id field', () => {
      const validBarber = {
        user_id: '550e8400-e29b-41d4-a716-446655440002',
        bio: 'Expert barber with 10 years experience',
        specialties: ['Fades', 'Beard Trim'],
        availability: { monday: ['09:00', '17:00'] }
      };

      const result = BarberProfileSchema.safeParse(validBarber);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(isUserId(result.data.user_id)).toBe(true);
      }
    });
  });

  describe('CustomerProfileSchema Migration', () => {
    it('should use UserId branded type for user_id field', () => {
      const validCustomer = {
        user_id: '550e8400-e29b-41d4-a716-446655440003',
        preferences: { style: 'Modern', length: 'Short' },
        notes: 'Prefers appointments on weekends'
      };

      const result = CustomerProfileSchema.safeParse(validCustomer);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(isUserId(result.data.user_id)).toBe(true);
      }
    });
  });

  describe('ServiceSchema Migration', () => {
    it('should use ServiceId branded type for id field', () => {
      const validService = {
        id: '550e8400-e29b-41d4-a716-446655440004',
        name: 'Haircut',
        description: 'Professional haircut service',
        duration: 30,
        price: 25.00,
        category: 'Hair'
      };

      const result = ServiceSchema.safeParse(validService);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(isServiceId(result.data.id)).toBe(true);
      }
    });
  });

  describe('AppointmentSchema Migration', () => {
    it('should use branded types for all ID fields', () => {
      const validAppointment = {
        id: '550e8400-e29b-41d4-a716-446655440005',
        customer_id: '550e8400-e29b-41d4-a716-446655440006',
        barber_id: '550e8400-e29b-41d4-a716-446655440007',
        scheduled_at: '2024-01-15T10:00:00Z',
        duration: 60,
        status: 'confirmed' as const,
        total_price: 50.00,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      const result = AppointmentSchema.safeParse(validAppointment);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(isAppointmentId(result.data.id)).toBe(true);
        expect(isCustomerId(result.data.customer_id)).toBe(true);
        expect(isBarberId(result.data.barber_id)).toBe(true);
      }
    });
  });

  describe('AppointmentServiceSchema Migration', () => {
    it('should use branded types for appointment_id and service_id fields', () => {
      const validAppointmentService = {
        appointment_id: '550e8400-e29b-41d4-a716-446655440008',
        service_id: '550e8400-e29b-41d4-a716-446655440009',
        quantity: 1,
        price: 25.00
      };

      const result = AppointmentServiceSchema.safeParse(validAppointmentService);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(isAppointmentId(result.data.appointment_id)).toBe(true);
        expect(isServiceId(result.data.service_id)).toBe(true);
      }
    });
  });

  describe('Type Safety', () => {
    it('should maintain type safety with branded types', () => {
      const appointment = {
        id: createAppointmentId('550e8400-e29b-41d4-a716-446655440010'),
        customer_id: createCustomerId('550e8400-e29b-41d4-a716-446655440011'),
        barber_id: createBarberId('550e8400-e29b-41d4-a716-446655440012'),
        scheduled_at: '2024-01-15T10:00:00Z',
        duration: 60,
        status: 'confirmed' as const,
        total_price: 50.00,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      const result = AppointmentSchema.safeParse(appointment);
      expect(result.success).toBe(true);

      // Type checking (would fail at compile time if types were wrong)
      const processAppointment = (appointmentId: AppointmentId): string => {
        return `Processing appointment: ${appointmentId}`;
      };

      if (result.success) {
        expect(processAppointment(result.data.id)).toBe('Processing appointment: 550e8400-e29b-41d4-a716-446655440010');
      }
    });

    it('should transform plain strings to branded types through schemas', () => {
      const plainData = {
        appointment_id: '550e8400-e29b-41d4-a716-446655440020',
        service_id: '550e8400-e29b-41d4-a716-446655440021',
        quantity: 2,
        price: 30.00
      };

      const result = AppointmentServiceSchema.safeParse(plainData);
      expect(result.success).toBe(true);
      
      if (result.success) {
        // The schemas should transform plain strings to branded types
        expect(isAppointmentId(result.data.appointment_id)).toBe(true);
        expect(isServiceId(result.data.service_id)).toBe(true);
      }
    });
  });
});