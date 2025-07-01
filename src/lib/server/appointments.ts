import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';
import { error } from '@sveltejs/kit';
import { APPOINTMENT_ERRORS, ADMIN_ERRORS } from '$lib/constants/errors';

type Tables = Database['public']['Tables'];
type Appointment = Tables['appointments']['Row'];
type Service = Tables['services']['Row'];
type Stylist = Tables['stylists']['Row'];
type User = Tables['users']['Row'];

// Appointment status constants
export const APPOINTMENT_STATUS = {
	PENDING: 'pending',
	CONFIRMED: 'confirmed',
	CANCELLED: 'cancelled',
	COMPLETED: 'completed'
} as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUS)[keyof typeof APPOINTMENT_STATUS];

// Appointment with related data
export interface AppointmentWithDetails extends Appointment {
	service: Service | null;
	stylist: Stylist | null;
	user: User | null;
}

/**
 * Validates if an appointment can be cancelled based on 24-hour rule
 */
export function canCancelAppointment(appointmentDate: string, appointmentTime: string): boolean {
	const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
	const now = new Date();
	const hoursUntilAppointment = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

	// Must be at least 24 hours before appointment
	return hoursUntilAppointment >= 24;
}

/**
 * Validates if a date/time is in the future
 */
export function isValidAppointmentDateTime(date: string, time: string): boolean {
	const appointmentDateTime = new Date(`${date}T${time}`);
	const now = new Date();
	return appointmentDateTime > now;
}

/**
 * Validates appointment status transitions
 */
export function isValidStatusTransition(
	currentStatus: AppointmentStatus,
	newStatus: AppointmentStatus
): boolean {
	// Define valid transitions
	const validTransitions: Record<AppointmentStatus, AppointmentStatus[]> = {
		[APPOINTMENT_STATUS.PENDING]: [APPOINTMENT_STATUS.CONFIRMED, APPOINTMENT_STATUS.CANCELLED],
		[APPOINTMENT_STATUS.CONFIRMED]: [APPOINTMENT_STATUS.COMPLETED, APPOINTMENT_STATUS.CANCELLED],
		[APPOINTMENT_STATUS.CANCELLED]: [
			APPOINTMENT_STATUS.PENDING // Admin can reactivate
		],
		[APPOINTMENT_STATUS.COMPLETED]: [] // No transitions from completed
	};

	return validTransitions[currentStatus]?.includes(newStatus) ?? false;
}

/**
 * Get all appointments for a specific user
 */
export async function getUserAppointments(
	supabase: SupabaseClient<Database>,
	userId: string,
	status?: AppointmentStatus
): Promise<AppointmentWithDetails[]> {
	let query = supabase
		.from('appointments')
		.select(
			`
			*,
			service:services(*),
			stylist:stylists(*),
			user:users(*)
		`
		)
		.eq('user_id', userId)
		.order('appointment_date', { ascending: false })
		.order('appointment_time', { ascending: false });

	if (status) {
		query = query.eq('status', status);
	}

	const { data, error: dbError } = await query;

	if (dbError) {
		console.error('Error fetching user appointments:', dbError);
		error(500, APPOINTMENT_ERRORS.DATABASE_ERROR);
	}

	return data as AppointmentWithDetails[];
}

/**
 * Get all appointments (admin view) with optional filters
 */
export async function getAllAppointments(
	supabase: SupabaseClient<Database>,
	filters?: {
		status?: AppointmentStatus;
		stylistId?: string;
		startDate?: string;
		endDate?: string;
	}
): Promise<AppointmentWithDetails[]> {
	let query = supabase
		.from('appointments')
		.select(
			`
			*,
			service:services(*),
			stylist:stylists(*),
			user:users(*)
		`
		)
		.order('appointment_date', { ascending: false })
		.order('appointment_time', { ascending: false });

	if (filters?.status) {
		query = query.eq('status', filters.status);
	}

	if (filters?.stylistId) {
		query = query.eq('stylist_id', filters.stylistId);
	}

	if (filters?.startDate) {
		query = query.gte('appointment_date', filters.startDate);
	}

	if (filters?.endDate) {
		query = query.lte('appointment_date', filters.endDate);
	}

	const { data, error: dbError } = await query;

	if (dbError) {
		console.error('Error fetching all appointments:', dbError);
		error(500, APPOINTMENT_ERRORS.DATABASE_ERROR);
	}

	return data as AppointmentWithDetails[];
}

/**
 * Get a single appointment by ID
 */
export async function getAppointmentById(
	supabase: SupabaseClient<Database>,
	appointmentId: string
): Promise<AppointmentWithDetails | null> {
	const { data, error: dbError } = await supabase
		.from('appointments')
		.select(
			`
			*,
			service:services(*),
			stylist:stylists(*),
			user:users(*)
		`
		)
		.eq('id', appointmentId)
		.single();

	if (dbError) {
		if (dbError.code === 'PGRST116') {
			return null; // Not found
		}
		console.error('Error fetching appointment:', dbError);
		error(500, APPOINTMENT_ERRORS.DATABASE_ERROR);
	}

	return data as AppointmentWithDetails;
}

/**
 * Cancel an appointment with validation
 */
export async function cancelAppointment(
	supabase: SupabaseClient<Database>,
	appointmentId: string,
	userId?: string
): Promise<{ success: boolean; error?: string }> {
	// First, fetch the appointment to validate
	const appointment = await getAppointmentById(supabase, appointmentId);

	if (!appointment) {
		return { success: false, error: APPOINTMENT_ERRORS.APPOINTMENT_NOT_FOUND };
	}

	// Check if user owns the appointment (if userId provided)
	if (userId && appointment.user_id !== userId) {
		return { success: false, error: APPOINTMENT_ERRORS.NOT_YOUR_APPOINTMENT };
	}

	// Check if appointment can be cancelled
	if (appointment.status === APPOINTMENT_STATUS.CANCELLED) {
		return { success: false, error: APPOINTMENT_ERRORS.ALREADY_CANCELLED };
	}

	if (appointment.status === APPOINTMENT_STATUS.COMPLETED) {
		return { success: false, error: APPOINTMENT_ERRORS.CANNOT_CANCEL_COMPLETED };
	}

	// Check 24-hour rule
	if (!canCancelAppointment(appointment.appointment_date, appointment.appointment_time)) {
		return { success: false, error: APPOINTMENT_ERRORS.CANCELLATION_TOO_LATE };
	}

	// Update appointment status
	const { error: updateError } = await supabase
		.from('appointments')
		.update({ status: APPOINTMENT_STATUS.CANCELLED, updated_at: new Date().toISOString() })
		.eq('id', appointmentId);

	if (updateError) {
		console.error('Error cancelling appointment:', updateError);
		return { success: false, error: APPOINTMENT_ERRORS.DATABASE_ERROR };
	}

	return { success: true };
}

/**
 * Update appointment status (admin function)
 */
export async function updateAppointmentStatus(
	supabase: SupabaseClient<Database>,
	appointmentId: string,
	status: AppointmentStatus
): Promise<{ success: boolean; error?: string }> {
	// Validate status transition
	const appointment = await getAppointmentById(supabase, appointmentId);

	if (!appointment) {
		return { success: false, error: APPOINTMENT_ERRORS.APPOINTMENT_NOT_FOUND };
	}

	// Validate status transitions
	if (
		appointment.status === APPOINTMENT_STATUS.COMPLETED &&
		status !== APPOINTMENT_STATUS.COMPLETED
	) {
		return { success: false, error: APPOINTMENT_ERRORS.INVALID_STATUS_TRANSITION };
	}

	if (
		appointment.status === APPOINTMENT_STATUS.CANCELLED &&
		status === APPOINTMENT_STATUS.CONFIRMED
	) {
		// Check if the time slot is still available
		const isAvailable = await checkTimeSlotAvailability(
			supabase,
			appointment.stylist_id!,
			appointment.appointment_date,
			appointment.appointment_time,
			appointmentId
		);

		if (!isAvailable) {
			return { success: false, error: APPOINTMENT_ERRORS.TIME_SLOT_UNAVAILABLE };
		}
	}

	const { error: updateError } = await supabase
		.from('appointments')
		.update({ status, updated_at: new Date().toISOString() })
		.eq('id', appointmentId);

	if (updateError) {
		console.error('Error updating appointment status:', updateError);
		return { success: false, error: APPOINTMENT_ERRORS.DATABASE_ERROR };
	}

	return { success: true };
}

/**
 * Check if a time slot is available for a stylist
 */
export async function checkTimeSlotAvailability(
	supabase: SupabaseClient<Database>,
	stylistId: string,
	date: string,
	time: string,
	excludeAppointmentId?: string
): Promise<boolean> {
	let query = supabase
		.from('appointments')
		.select('id')
		.eq('stylist_id', stylistId)
		.eq('appointment_date', date)
		.eq('appointment_time', time)
		.in('status', [APPOINTMENT_STATUS.PENDING, APPOINTMENT_STATUS.CONFIRMED]);

	if (excludeAppointmentId) {
		query = query.neq('id', excludeAppointmentId);
	}

	const { data, error: dbError } = await query;

	if (dbError) {
		console.error('Error checking availability:', dbError);
		return false;
	}

	return data.length === 0;
}

/**
 * Reschedule an appointment
 */
export async function rescheduleAppointment(
	supabase: SupabaseClient<Database>,
	appointmentId: string,
	newDate: string,
	newTime: string,
	userId?: string
): Promise<{ success: boolean; error?: string }> {
	const appointment = await getAppointmentById(supabase, appointmentId);

	if (!appointment) {
		return { success: false, error: APPOINTMENT_ERRORS.APPOINTMENT_NOT_FOUND };
	}

	// Check if user owns the appointment (if userId provided)
	if (userId && appointment.user_id !== userId) {
		return { success: false, error: APPOINTMENT_ERRORS.NOT_YOUR_APPOINTMENT };
	}

	// Check if appointment can be rescheduled
	if (appointment.status === APPOINTMENT_STATUS.CANCELLED) {
		return { success: false, error: APPOINTMENT_ERRORS.APPOINTMENT_NOT_PENDING };
	}

	if (appointment.status === APPOINTMENT_STATUS.COMPLETED) {
		return { success: false, error: APPOINTMENT_ERRORS.APPOINTMENT_NOT_PENDING };
	}

	// Check 24-hour rule for current appointment
	if (!canCancelAppointment(appointment.appointment_date, appointment.appointment_time)) {
		return {
			success: false,
			error: APPOINTMENT_ERRORS.CANCELLATION_TOO_LATE
		};
	}

	// Check if new time slot is available
	const isAvailable = await checkTimeSlotAvailability(
		supabase,
		appointment.stylist_id!,
		newDate,
		newTime
	);

	if (!isAvailable) {
		return { success: false, error: APPOINTMENT_ERRORS.TIME_SLOT_UNAVAILABLE };
	}

	// Update appointment
	const { error: updateError } = await supabase
		.from('appointments')
		.update({
			appointment_date: newDate,
			appointment_time: newTime,
			updated_at: new Date().toISOString()
		})
		.eq('id', appointmentId);

	if (updateError) {
		console.error('Error rescheduling appointment:', updateError);
		return { success: false, error: APPOINTMENT_ERRORS.DATABASE_ERROR };
	}

	return { success: true };
}

/**
 * Get appointment statistics for admin dashboard
 */
export async function getAppointmentStats(
	supabase: SupabaseClient<Database>,
	startDate?: string,
	endDate?: string
): Promise<{
	total: number;
	byStatus: Record<AppointmentStatus, number>;
	todayCount: number;
	weekCount: number;
}> {
	let query = supabase.from('appointments').select('id, status, appointment_date');

	if (startDate) {
		query = query.gte('appointment_date', startDate);
	}

	if (endDate) {
		query = query.lte('appointment_date', endDate);
	}

	const { data, error: dbError } = await query;

	if (dbError) {
		console.error('Error fetching appointment stats:', dbError);
		error(500, APPOINTMENT_ERRORS.DATABASE_ERROR);
	}

	const today = new Date().toISOString().split('T')[0]!;
	const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]!;

	const stats = {
		total: data.length,
		byStatus: {
			[APPOINTMENT_STATUS.PENDING]: 0,
			[APPOINTMENT_STATUS.CONFIRMED]: 0,
			[APPOINTMENT_STATUS.CANCELLED]: 0,
			[APPOINTMENT_STATUS.COMPLETED]: 0
		},
		todayCount: 0,
		weekCount: 0
	};

	data.forEach((appointment) => {
		// Count by status
		if (appointment.status in stats.byStatus) {
			stats.byStatus[appointment.status as AppointmentStatus]++;
		}

		// Count today's appointments
		if (appointment.appointment_date === today) {
			stats.todayCount++;
		}

		// Count week's appointments
		if (
			appointment.appointment_date &&
			appointment.appointment_date >= today &&
			appointment.appointment_date <= weekFromNow
		) {
			stats.weekCount++;
		}
	});

	return stats;
}

/**
 * Create a new appointment with validation
 */
export async function createAppointment(
	supabase: SupabaseClient<Database>,
	data: {
		userId: string;
		serviceId: string;
		stylistId: string;
		appointmentDate: string;
		appointmentTime: string;
		notes?: string;
		totalPrice?: string;
	}
): Promise<{ success: boolean; appointmentId?: string; error?: string }> {
	// Validate date/time is in the future
	if (!isValidAppointmentDateTime(data.appointmentDate, data.appointmentTime)) {
		return { success: false, error: APPOINTMENT_ERRORS.PAST_DATE };
	}

	// Check if time slot is available
	const isAvailable = await checkTimeSlotAvailability(
		supabase,
		data.stylistId,
		data.appointmentDate,
		data.appointmentTime
	);

	if (!isAvailable) {
		return { success: false, error: APPOINTMENT_ERRORS.TIME_SLOT_UNAVAILABLE };
	}

	// Check for user double-booking
	const { data: existingAppointments, error: checkError } = await supabase
		.from('appointments')
		.select('id')
		.eq('user_id', data.userId)
		.eq('appointment_date', data.appointmentDate)
		.eq('appointment_time', data.appointmentTime)
		.in('status', [APPOINTMENT_STATUS.PENDING, APPOINTMENT_STATUS.CONFIRMED]);

	if (checkError) {
		console.error('Error checking for double booking:', checkError);
		return { success: false, error: APPOINTMENT_ERRORS.DATABASE_ERROR };
	}

	if (existingAppointments && existingAppointments.length > 0) {
		return { success: false, error: APPOINTMENT_ERRORS.DOUBLE_BOOKING };
	}

	// Create the appointment
	const { data: newAppointment, error: insertError } = await supabase
		.from('appointments')
		.insert({
			user_id: data.userId,
			service_id: data.serviceId,
			stylist_id: data.stylistId,
			appointment_date: data.appointmentDate,
			appointment_time: data.appointmentTime,
			status: APPOINTMENT_STATUS.PENDING,
			notes: data.notes,
			total_price: data.totalPrice
		})
		.select('id')
		.single();

	if (insertError) {
		console.error('Error creating appointment:', insertError);
		return { success: false, error: APPOINTMENT_ERRORS.DATABASE_ERROR };
	}

	return { success: true, appointmentId: newAppointment.id };
}

/**
 * Update appointment details (admin function)
 */
export async function updateAppointment(
	supabase: SupabaseClient<Database>,
	appointmentId: string,
	updates: {
		serviceId?: string;
		stylistId?: string;
		appointmentDate?: string;
		appointmentTime?: string;
		notes?: string;
		totalPrice?: string;
	}
): Promise<{ success: boolean; error?: string }> {
	const appointment = await getAppointmentById(supabase, appointmentId);

	if (!appointment) {
		return { success: false, error: APPOINTMENT_ERRORS.APPOINTMENT_NOT_FOUND };
	}

	// If changing date/time, validate it's in the future
	if (updates.appointmentDate || updates.appointmentTime) {
		const newDate = updates.appointmentDate || appointment.appointment_date;
		const newTime = updates.appointmentTime || appointment.appointment_time;

		if (!isValidAppointmentDateTime(newDate, newTime)) {
			return { success: false, error: APPOINTMENT_ERRORS.PAST_DATE };
		}

		// Check availability if changing stylist or time
		if (
			updates.stylistId !== appointment.stylist_id ||
			updates.appointmentDate !== appointment.appointment_date ||
			updates.appointmentTime !== appointment.appointment_time
		) {
			const isAvailable = await checkTimeSlotAvailability(
				supabase,
				updates.stylistId || appointment.stylist_id!,
				newDate,
				newTime,
				appointmentId
			);

			if (!isAvailable) {
				return { success: false, error: APPOINTMENT_ERRORS.TIME_SLOT_UNAVAILABLE };
			}
		}
	}

	// Perform the update
	const { error: updateError } = await supabase
		.from('appointments')
		.update({
			...updates,
			updated_at: new Date().toISOString()
		})
		.eq('id', appointmentId);

	if (updateError) {
		console.error('Error updating appointment:', updateError);
		return { success: false, error: APPOINTMENT_ERRORS.DATABASE_ERROR };
	}

	return { success: true };
}
