import { z } from 'zod';
import {
  UserIdSchema,
  ServiceIdSchema,
  ProfileIdSchema,
  AppointmentIdSchema,
  CustomerIdSchema,
  BarberIdSchema,
  createUserId,
  createServiceId,
  createStaffId,
  createAppointmentId,
  createCustomerId,
  createBarberId,
  createProfileId,
  isUserId,
  isServiceId,
  isStaffId,
  isAppointmentId,
  isCustomerId,
  isBarberId,
  isProfileId,
} from '$lib/types/branded';

export {
  UserIdSchema,
  ServiceIdSchema,
  ProfileIdSchema,
  AppointmentIdSchema,
  CustomerIdSchema,
  BarberIdSchema,
  createUserId,
  createServiceId,
  createStaffId,
  createAppointmentId,
  createCustomerId,
  createBarberId,
  createProfileId,
  isUserId,
  isServiceId,
  isStaffId,
  isAppointmentId,
  isCustomerId,
  isBarberId,
  isProfileId,
};

export const UuidSchema = z.string().uuid({
  message: 'Invalid UUID format',
});

export const DateTimeSchema = z.string().datetime({
  message: 'Invalid datetime format',
});

export const ProfileSchema = z
  .object({
    id: ProfileIdSchema,
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(20, 'Username must be at most 20 characters')
      .nullable(),
    full_name: z.string().max(100, 'Full name must be at most 100 characters').nullable(),
    avatar_url: z.string().url('Invalid avatar URL').nullable(),
    created_at: DateTimeSchema,
    updated_at: DateTimeSchema,
  })
  .strict();

export const OAuthCallbackParamsSchema = z
  .object({
    code: z
      .string({ required_error: 'Authorization code is required' })
      .min(1, 'Authorization code is required'),
    next: z.string().optional(),
  })
  .strict();

export const OAuthErrorParamsSchema = z
  .object({
    error: z.string().min(1, 'Error type is required'),
    error_code: z.string().optional(),
    error_description: z.string().optional(),
  })
  .strict();

export const ButtonVariantSchema = z.enum(['primary', 'secondary', 'danger']);
export const ButtonSizeSchema = z.enum(['small', 'medium', 'large']);

export const ButtonPropsSchema = z
  .object({
    variant: ButtonVariantSchema.optional().default('primary'),
    size: ButtonSizeSchema.optional().default('medium'),
    disabled: z.boolean().optional(),
    onclick: z.function().optional(),
    class: z.string().optional(),
  })
  .passthrough();

export const SupabaseErrorSchema = z
  .object({
    message: z.string(),
    status: z.number().optional(),
    code: z.string().optional(),
  })
  .strict();

export const UserSchema = z
  .object({
    id: UserIdSchema,
    email: z.string().email(),
    created_at: DateTimeSchema,
    updated_at: DateTimeSchema,
  })
  .strict();

export const BarberProfileSchema = z
  .object({
    user_id: UserIdSchema,
    bio: z.string().nullable(),
    specialties: z.array(z.string()),
    availability: z.record(z.array(z.string())),
  })
  .strict();

export const CustomerProfileSchema = z
  .object({
    user_id: UserIdSchema,
    preferences: z.record(z.string()).nullable(),
    notes: z.string().nullable(),
  })
  .strict();

export const ServiceSchema = z
  .object({
    id: ServiceIdSchema,
    name: z.string(),
    description: z.string().nullable(),
    duration: z.number(),
    price: z.number(),
    category: z.string(),
  })
  .strict();

export const AppointmentSchema = z
  .object({
    id: AppointmentIdSchema,
    customer_id: CustomerIdSchema,
    barber_id: BarberIdSchema,
    scheduled_at: DateTimeSchema,
    duration: z.number(),
    status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']),
    total_price: z.number(),
    created_at: DateTimeSchema,
    updated_at: DateTimeSchema,
  })
  .strict();

export const AppointmentServiceSchema = z
  .object({
    appointment_id: AppointmentIdSchema,
    service_id: ServiceIdSchema,
    quantity: z.number(),
    price: z.number(),
  })
  .strict();

export type Profile = z.infer<typeof ProfileSchema>;
export type OAuthCallbackParams = z.infer<typeof OAuthCallbackParamsSchema>;
export type OAuthErrorParams = z.infer<typeof OAuthErrorParamsSchema>;
export type ButtonProps = z.infer<typeof ButtonPropsSchema>;
export type SupabaseError = z.infer<typeof SupabaseErrorSchema>;
export type User = z.infer<typeof UserSchema>;
export type BarberProfile = z.infer<typeof BarberProfileSchema>;
export type CustomerProfile = z.infer<typeof CustomerProfileSchema>;
export type Service = z.infer<typeof ServiceSchema>;
export type Appointment = z.infer<typeof AppointmentSchema>;
export type AppointmentService = z.infer<typeof AppointmentServiceSchema>;
