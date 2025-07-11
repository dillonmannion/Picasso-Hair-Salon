import { z } from 'zod';

const TimestampSchema = z.string().datetime();
const UuidSchema = z.string().uuid();
const TimeSchema = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/);
const EmailSchema = z.string().email();
const NameSchema = z.string().min(1).max(100);
const PhoneSchema = z.string().nullable();
const PriceSchema = z.number().nonnegative().multipleOf(0.01);
const DurationMinutesSchema = z.number().int().positive().max(480);

const TimestampFieldsSchema = z.object({
  created_at: TimestampSchema,
  updated_at: TimestampSchema,
});

const UserRoleSchema = z.enum(['admin', 'barber', 'customer']);
const AppointmentStatusSchema = z.enum(['pending', 'confirmed', 'completed', 'cancelled']);

export const UserProfileSchema = TimestampFieldsSchema.extend({
  id: UuidSchema,
  email: EmailSchema,
  role: UserRoleSchema,
});

export const ServiceSchema = TimestampFieldsSchema.extend({
  id: UuidSchema,
  name: NameSchema,
  description: z.string().max(500).nullable(),
  price: PriceSchema,
  duration_minutes: DurationMinutesSchema,
});

const WorkingHoursSchema = z.object({
  start: TimeSchema,
  end: TimeSchema,
});

const WeeklyScheduleSchema = z.record(z.string(), WorkingHoursSchema.nullable());

export const BarberProfileSchema = TimestampFieldsSchema.extend({
  user_id: UuidSchema,
  first_name: NameSchema,
  last_name: NameSchema,
  specialties: z.array(z.string().max(100)),
  working_hours: WeeklyScheduleSchema,
});

export const CustomerProfileSchema = TimestampFieldsSchema.extend({
  user_id: UuidSchema,
  first_name: NameSchema,
  last_name: NameSchema,
  phone: PhoneSchema,
});

export const AppointmentSchema = TimestampFieldsSchema.extend({
  id: UuidSchema,
  customer_id: UuidSchema,
  barber_id: UuidSchema,
  start_time: TimestampSchema,
  end_time: TimestampSchema,
  status: AppointmentStatusSchema,
  total_price: PriceSchema,
  notes: z.string().max(1000).nullable(),
});

export const AppointmentServiceSchema = z.object({
  appointment_id: UuidSchema,
  service_id: UuidSchema,
  price: PriceSchema,
  created_at: TimestampSchema,
});

export type UserProfile = z.infer<typeof UserProfileSchema>;
export type Service = z.infer<typeof ServiceSchema>;
export type BarberProfile = z.infer<typeof BarberProfileSchema>;
export type CustomerProfile = z.infer<typeof CustomerProfileSchema>;
export type Appointment = z.infer<typeof AppointmentSchema>;
export type AppointmentService = z.infer<typeof AppointmentServiceSchema>;
