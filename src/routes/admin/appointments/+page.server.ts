import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import {
	getAllAppointments,
	updateAppointmentStatus,
	getAppointmentStats,
	type AppointmentStatus,
	APPOINTMENT_STATUS
} from '$lib/server/appointments';

export const load: PageServerLoad = async ({ locals, url }) => {
	const { supabase } = locals;

	// Get filter parameters from URL
	const status = url.searchParams.get('status') as AppointmentStatus | null;
	const stylistId = url.searchParams.get('stylist');
	const startDate = url.searchParams.get('startDate');
	const endDate = url.searchParams.get('endDate');

	// Build filters object
	const filters: Parameters<typeof getAllAppointments>[1] = {};
	if (status && Object.values(APPOINTMENT_STATUS).includes(status)) {
		filters.status = status;
	}
	if (stylistId) {
		filters.stylistId = stylistId;
	}
	if (startDate) {
		filters.startDate = startDate;
	}
	if (endDate) {
		filters.endDate = endDate;
	}

	// Fetch appointments and statistics in parallel
	const [appointments, stats, stylistsResult] = await Promise.all([
		getAllAppointments(supabase, filters),
		getAppointmentStats(supabase, startDate ?? undefined, endDate ?? undefined),
		supabase.from('stylists').select('id, name').eq('is_active', true).order('name')
	]);

	return {
		appointments,
		stats,
		stylists: stylistsResult.data ?? [],
		filters: {
			status,
			stylistId,
			startDate,
			endDate
		}
	};
};

export const actions = {
	updateStatus: async ({ locals, request }) => {
		const data = await request.formData();
		const appointmentId = data.get('appointmentId');
		const status = data.get('status') as AppointmentStatus;

		if (!appointmentId || typeof appointmentId !== 'string') {
			return fail(400, { message: 'Invalid appointment ID' });
		}

		if (!status || !Object.values(APPOINTMENT_STATUS).includes(status)) {
			return fail(400, { message: 'Invalid status' });
		}

		const { supabase } = locals;
		const result = await updateAppointmentStatus(supabase, appointmentId, status);

		if (!result.success) {
			return fail(400, { message: result.error ?? 'Failed to update appointment status' });
		}

		return { success: true, message: `Appointment status updated to ${status}` };
	},

	updateNotes: async ({ locals, request }) => {
		const data = await request.formData();
		const appointmentId = data.get('appointmentId');
		const notes = data.get('notes');

		if (!appointmentId || typeof appointmentId !== 'string') {
			return fail(400, { message: 'Invalid appointment ID' });
		}

		const { supabase } = locals;
		const notesValue = notes ? notes.toString() : null;
		
		const { error } = await supabase
			.from('appointments')
			.update({ notes: notesValue, updated_at: new Date().toISOString() })
			.eq('id', appointmentId);

		if (error) {
			console.error('Error updating appointment notes:', error);
			return fail(500, { message: 'Failed to update appointment notes' });
		}

		return { success: true, message: 'Notes updated successfully' };
	}
} satisfies Actions;
