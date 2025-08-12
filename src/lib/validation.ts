import { z } from 'zod';

// Service validation schema
export const ServiceSchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1, 'Service name is required'),
	category: z.string().min(1, 'Category is required'),
	price: z.number().positive('Price must be positive'),
	duration: z.number().int().positive('Duration must be a positive integer'),
	description: z.string().optional(),
	popular: z.boolean().default(false),
	created_at: z.string().datetime().optional(),
	updated_at: z.string().datetime().optional()
});

export type Service = z.infer<typeof ServiceSchema>;

// Stylist validation schema
export const StylistSchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1, 'Stylist name is required'),
	avatar_url: z.string().url().optional().nullable(),
	bio: z.string().optional().nullable(),
	specialties: z.array(z.string()).default([]),
	experience_years: z.number().int().min(0).optional().nullable(),
	rating: z.number().min(0).max(5).optional().nullable(),
	availability: z.record(z.array(z.string())).optional().nullable(),
	created_at: z.string().datetime().optional(),
	updated_at: z.string().datetime().optional()
});

export type Stylist = z.infer<typeof StylistSchema>;

// Appointment validation schema
export const AppointmentSchema = z.object({
	id: z.string().uuid(),
	user_id: z.string().uuid(),
	service_id: z.string().uuid(),
	stylist_id: z.string().uuid(),
	date: z.string().refine((val) => !isNaN(Date.parse(val)), {
		message: 'Invalid date format'
	}),
	time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
	duration: z.number().int().positive('Duration must be positive'),
	status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']),
	notes: z.string().optional().nullable(),
	total_price: z.number().positive('Price must be positive'),
	stripe_payment_id: z.string().optional().nullable(),
	created_at: z.string().datetime().optional(),
	updated_at: z.string().datetime().optional()
});

export type Appointment = z.infer<typeof AppointmentSchema>;

// Review validation schema
export const ReviewSchema = z.object({
	id: z.string().uuid(),
	appointment_id: z.string().uuid(),
	user_id: z.string().uuid(),
	stylist_id: z.string().uuid(),
	rating: z.number().int().min(1).max(5),
	comment: z.string().optional().nullable(),
	created_at: z.string().datetime().optional()
});

export type Review = z.infer<typeof ReviewSchema>;

// Gallery image validation schema
export const GalleryImageSchema = z.object({
	id: z.string().uuid(),
	url: z.string().url('Invalid image URL'),
	caption: z.string().optional().nullable(),
	category: z.string().optional().nullable(),
	stylist_id: z.string().uuid().optional().nullable(),
	created_at: z.string().datetime().optional()
});

export type GalleryImage = z.infer<typeof GalleryImageSchema>;

// User preferences schema
export const UserPreferencesSchema = z.object({
	theme: z.enum(['light', 'dark', 'system']).default('system'),
	language: z.enum(['en', 'es', 'zh-cmn']).default('en'),
	notifications: z
		.object({
			email: z.boolean().default(true),
			sms: z.boolean().default(false),
			push: z.boolean().default(false)
		})
		.default({})
});

export type UserPreferences = z.infer<typeof UserPreferencesSchema>;

// Booking form data schema
export const BookingFormSchema = z.object({
	serviceId: z.string().uuid('Please select a service'),
	stylistId: z.string().uuid('Please select a stylist'),
	date: z.string().refine((val) => !isNaN(Date.parse(val)), {
		message: 'Please select a valid date'
	}),
	time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please select a valid time'),
	notes: z.string().max(500, 'Notes must be less than 500 characters').optional()
});

export type BookingFormData = z.infer<typeof BookingFormSchema>;

// Contact form schema
export const ContactFormSchema = z.object({
	name: z.string().min(2, 'Name must be at least 2 characters'),
	email: z.string().email('Invalid email address'),
	subject: z.string().min(5, 'Subject must be at least 5 characters'),
	message: z
		.string()
		.min(10, 'Message must be at least 10 characters')
		.max(1000, 'Message must be less than 1000 characters')
});

export type ContactFormData = z.infer<typeof ContactFormSchema>;

// Time slot schema
export const TimeSlotSchema = z.object({
	time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
	available: z.boolean()
});

export type TimeSlot = z.infer<typeof TimeSlotSchema>;

// Validation helper functions
export function validateWithSchema<T>(
	schema: z.ZodSchema<T>,
	data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
	const result = schema.safeParse(data);
	if (result.success) {
		return { success: true, data: result.data };
	}
	return { success: false, errors: result.error };
}

export function getErrorMessage(error: z.ZodError): string {
	return error.errors.map((e) => e.message).join(', ');
}

// Type guard for validation results
export function isValidationSuccess<T>(
	result: ReturnType<typeof validateWithSchema>
): result is { success: true; data: T } {
	return result.success === true;
}
