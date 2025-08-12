import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';
import { error } from '@sveltejs/kit';

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
		error(500, 'Failed to fetch appointments');
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
		error(500, 'Failed to fetch appointments');
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
		error(500, 'Failed to fetch appointment');
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
		return { success: false, error: 'Appointment not found' };
	}

	// Check if user owns the appointment (if userId provided)
	if (userId && appointment.user_id !== userId) {
		return { success: false, error: 'Unauthorized to cancel this appointment' };
	}

	// Check if appointment can be cancelled
	if (appointment.status === APPOINTMENT_STATUS.CANCELLED) {
		return { success: false, error: 'Appointment is already cancelled' };
	}

	if (appointment.status === APPOINTMENT_STATUS.COMPLETED) {
		return { success: false, error: 'Cannot cancel a completed appointment' };
	}

	// Check 24-hour rule
	if (!canCancelAppointment(appointment.appointment_date, appointment.appointment_time)) {
		return { success: false, error: 'Appointments must be cancelled at least 24 hours in advance' };
	}

	// Update appointment status
	const { error: updateError } = await supabase
		.from('appointments')
		.update({ status: APPOINTMENT_STATUS.CANCELLED, updated_at: new Date().toISOString() })
		.eq('id', appointmentId);

	if (updateError) {
		console.error('Error cancelling appointment:', updateError);
		return { success: false, error: 'Failed to cancel appointment' };
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
		return { success: false, error: 'Appointment not found' };
	}

	// Validate status transitions
	if (
		appointment.status === APPOINTMENT_STATUS.COMPLETED &&
		status !== APPOINTMENT_STATUS.COMPLETED
	) {
		return { success: false, error: 'Cannot change status of a completed appointment' };
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
			return { success: false, error: 'Time slot is no longer available' };
		}
	}

	const { error: updateError } = await supabase
		.from('appointments')
		.update({ status, updated_at: new Date().toISOString() })
		.eq('id', appointmentId);

	if (updateError) {
		console.error('Error updating appointment status:', updateError);
		return { success: false, error: 'Failed to update appointment status' };
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
		return { success: false, error: 'Appointment not found' };
	}

	// Check if user owns the appointment (if userId provided)
	if (userId && appointment.user_id !== userId) {
		return { success: false, error: 'Unauthorized to reschedule this appointment' };
	}

	// Check if appointment can be rescheduled
	if (appointment.status === APPOINTMENT_STATUS.CANCELLED) {
		return { success: false, error: 'Cannot reschedule a cancelled appointment' };
	}

	if (appointment.status === APPOINTMENT_STATUS.COMPLETED) {
		return { success: false, error: 'Cannot reschedule a completed appointment' };
	}

	// Check 24-hour rule for current appointment
	if (!canCancelAppointment(appointment.appointment_date, appointment.appointment_time)) {
		return {
			success: false,
			error: 'Appointments must be rescheduled at least 24 hours in advance'
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
		return { success: false, error: 'Selected time slot is not available' };
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
		return { success: false, error: 'Failed to reschedule appointment' };
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
		error(500, 'Failed to fetch appointment statistics');
	}

	const today = new Date().toISOString().split('T')[0];
	const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

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
			today &&
			weekFromNow &&
			appointment.appointment_date >= today &&
			appointment.appointment_date <= weekFromNow
		) {
			stats.weekCount++;
		}
	});

	return stats;
}
