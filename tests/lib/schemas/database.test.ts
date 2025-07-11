import { describe, it, expect } from 'vitest';
import {
  UserProfileSchema,
  ServiceSchema,
  BarberProfileSchema,
  CustomerProfileSchema,
  AppointmentSchema,
  AppointmentServiceSchema,
  type UserProfile,
  type Service,
} from '$lib/schemas/database';

describe('Database Schemas', () => {
  describe('UserProfileSchema', () => {
    it('should validate a complete user profile', () => {
      const validProfile = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'test@example.com',
        role: 'customer',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      };

      const result = UserProfileSchema.safeParse(validProfile);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('test@example.com');
        expect(result.data.role).toBe('customer');
      }
    });

    it('should reject invalid email formats', () => {
      const invalidProfile = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'not-an-email',
        role: 'customer',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      };

      const result = UserProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
    });

    it('should reject invalid roles', () => {
      const invalidProfile = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'test@example.com',
        role: 'invalid-role',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      };

      const result = UserProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
    });

    it('should reject non-UUID ids', () => {
      const invalidProfile = {
        id: 'not-a-uuid',
        email: 'test@example.com',
        role: 'customer',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      };

      const result = UserProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
    });
  });

  describe('ServiceSchema', () => {
    it('should validate a complete service', () => {
      const validService = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Haircut',
        description: 'Standard haircut service',
        price: 25.5,
        duration_minutes: 30,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      };

      const result = ServiceSchema.safeParse(validService);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Haircut');
        expect(result.data.price).toBe(25.5);
        expect(result.data.duration_minutes).toBe(30);
      }
    });

    it('should allow null description', () => {
      const serviceWithNullDescription = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Quick Trim',
        description: null,
        price: 15.0,
        duration_minutes: 15,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      };

      const result = ServiceSchema.safeParse(serviceWithNullDescription);
      expect(result.success).toBe(true);
    });

    it('should reject negative prices', () => {
      const invalidService = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Haircut',
        description: 'Standard haircut',
        price: -10,
        duration_minutes: 30,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      };

      const result = ServiceSchema.safeParse(invalidService);
      expect(result.success).toBe(false);
    });

    it('should reject zero or negative duration', () => {
      const invalidService = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Haircut',
        description: 'Standard haircut',
        price: 25.0,
        duration_minutes: 0,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      };

      const result = ServiceSchema.safeParse(invalidService);
      expect(result.success).toBe(false);
    });
  });

  describe('BarberProfileSchema', () => {
    it('should validate a complete barber profile', () => {
      const validBarber = {
        user_id: '550e8400-e29b-41d4-a716-446655440002',
        first_name: 'John',
        last_name: 'Doe',
        specialties: ['Haircut', 'Beard Trim'],
        working_hours: {
          monday: { start: '09:00', end: '17:00' },
          tuesday: { start: '09:00', end: '17:00' },
          wednesday: { start: '09:00', end: '17:00' },
          thursday: { start: '09:00', end: '17:00' },
          friday: { start: '09:00', end: '17:00' },
          saturday: { start: '10:00', end: '15:00' },
          sunday: null,
        },
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      };

      const result = BarberProfileSchema.safeParse(validBarber);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.first_name).toBe('John');
        expect(result.data.specialties).toContain('Haircut');
        expect(result.data.working_hours.monday?.start).toBe('09:00');
      }
    });

    it('should allow empty specialties array', () => {
      const barberNoSpecialties = {
        user_id: '550e8400-e29b-41d4-a716-446655440002',
        first_name: 'Jane',
        last_name: 'Smith',
        specialties: [],
        working_hours: {},
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      };

      const result = BarberProfileSchema.safeParse(barberNoSpecialties);
      expect(result.success).toBe(true);
    });

    it('should reject invalid time formats in working hours', () => {
      const invalidBarber = {
        user_id: '550e8400-e29b-41d4-a716-446655440002',
        first_name: 'John',
        last_name: 'Doe',
        specialties: [],
        working_hours: {
          monday: { start: '25:00', end: '17:00' },
        },
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      };

      const result = BarberProfileSchema.safeParse(invalidBarber);
      expect(result.success).toBe(false);
    });
  });

  describe('CustomerProfileSchema', () => {
    it('should validate a complete customer profile', () => {
      const validCustomer = {
        user_id: '550e8400-e29b-41d4-a716-446655440003',
        first_name: 'Alice',
        last_name: 'Johnson',
        phone: '+1234567890',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      };

      const result = CustomerProfileSchema.safeParse(validCustomer);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.first_name).toBe('Alice');
        expect(result.data.phone).toBe('+1234567890');
      }
    });

    it('should allow null phone number', () => {
      const customerNoPhone = {
        user_id: '550e8400-e29b-41d4-a716-446655440003',
        first_name: 'Bob',
        last_name: 'Williams',
        phone: null,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      };

      const result = CustomerProfileSchema.safeParse(customerNoPhone);
      expect(result.success).toBe(true);
    });
  });

  describe('AppointmentSchema', () => {
    it('should validate a complete appointment', () => {
      const validAppointment = {
        id: '550e8400-e29b-41d4-a716-446655440004',
        customer_id: '550e8400-e29b-41d4-a716-446655440003',
        barber_id: '550e8400-e29b-41d4-a716-446655440002',
        start_time: '2024-01-15T10:00:00.000Z',
        end_time: '2024-01-15T10:30:00.000Z',
        status: 'confirmed',
        total_price: 25.5,
        notes: 'Regular haircut',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      };

      const result = AppointmentSchema.safeParse(validAppointment);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('confirmed');
        expect(result.data.total_price).toBe(25.5);
      }
    });

    it('should allow null notes', () => {
      const appointmentNoNotes = {
        id: '550e8400-e29b-41d4-a716-446655440004',
        customer_id: '550e8400-e29b-41d4-a716-446655440003',
        barber_id: '550e8400-e29b-41d4-a716-446655440002',
        start_time: '2024-01-15T10:00:00.000Z',
        end_time: '2024-01-15T10:30:00.000Z',
        status: 'pending',
        total_price: 25.5,
        notes: null,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      };

      const result = AppointmentSchema.safeParse(appointmentNoNotes);
      expect(result.success).toBe(true);
    });

    it('should reject invalid status values', () => {
      const invalidAppointment = {
        id: '550e8400-e29b-41d4-a716-446655440004',
        customer_id: '550e8400-e29b-41d4-a716-446655440003',
        barber_id: '550e8400-e29b-41d4-a716-446655440002',
        start_time: '2024-01-15T10:00:00.000Z',
        end_time: '2024-01-15T10:30:00.000Z',
        status: 'invalid-status',
        total_price: 25.5,
        notes: null,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      };

      const result = AppointmentSchema.safeParse(invalidAppointment);
      expect(result.success).toBe(false);
    });

    it('should reject negative total price', () => {
      const invalidAppointment = {
        id: '550e8400-e29b-41d4-a716-446655440004',
        customer_id: '550e8400-e29b-41d4-a716-446655440003',
        barber_id: '550e8400-e29b-41d4-a716-446655440002',
        start_time: '2024-01-15T10:00:00.000Z',
        end_time: '2024-01-15T10:30:00.000Z',
        status: 'confirmed',
        total_price: -50,
        notes: null,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      };

      const result = AppointmentSchema.safeParse(invalidAppointment);
      expect(result.success).toBe(false);
    });
  });

  describe('AppointmentServiceSchema', () => {
    it('should validate appointment-service relationship', () => {
      const validRelation = {
        appointment_id: '550e8400-e29b-41d4-a716-446655440004',
        service_id: '550e8400-e29b-41d4-a716-446655440001',
        price: 25.5,
        created_at: '2024-01-01T00:00:00.000Z',
      };

      const result = AppointmentServiceSchema.safeParse(validRelation);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.price).toBe(25.5);
      }
    });

    it('should reject negative price in appointment service', () => {
      const invalidRelation = {
        appointment_id: '550e8400-e29b-41d4-a716-446655440004',
        service_id: '550e8400-e29b-41d4-a716-446655440001',
        price: -10,
        created_at: '2024-01-01T00:00:00.000Z',
      };

      const result = AppointmentServiceSchema.safeParse(invalidRelation);
      expect(result.success).toBe(false);
    });
  });

  describe('Type inference', () => {
    it('should provide correct TypeScript types', () => {
      const user: UserProfile = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'test@example.com',
        role: 'admin',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      };

      const service: Service = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Haircut',
        description: 'Standard haircut',
        price: 25.5,
        duration_minutes: 30,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      };

      expect(user.role).toBe('admin');
      expect(service.price).toBe(25.5);
    });
  });
});
