import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { getUserAppointments, cancelAppointment } from '$lib/server/appointments';
import type { AppointmentWithDetails } from '$lib/server/appointments';
import { APPOINTMENT_ERRORS, SUCCESS_MESSAGES } from '$lib/constants/errors';

export const load: PageServerLoad = async ({ locals }) => {
	// Allow public access to appointments page
	// User data and appointments are loaded based on authentication status

	let appointments: AppointmentWithDetails[] = [];

	if (locals.user) {
		// Fetch real appointments from database
		const { supabase } = locals;
		appointments = await getUserAppointments(supabase, locals.user.id);
	}

	return {
		user: locals.user,
		appointments
	};
};

export const actions = {
	cancel: async ({ locals, request }) => {
		// Check if user is authenticated
		if (!locals.user) {
			return fail(401, { error: APPOINTMENT_ERRORS.UNAUTHORIZED });
		}

		const data = await request.formData();
		const appointmentId = data.get('appointmentId');

		if (!appointmentId || typeof appointmentId !== 'string') {
			return fail(400, { error: APPOINTMENT_ERRORS.APPOINTMENT_NOT_FOUND });
		}

		const { supabase } = locals;
		const result = await cancelAppointment(supabase, appointmentId, locals.user.id);

		if (!result.success) {
			return fail(400, { error: result.error || APPOINTMENT_ERRORS.DATABASE_ERROR });
		}

		return { success: true, message: SUCCESS_MESSAGES.APPOINTMENT_CANCELLED };
	},

	reschedule: async ({ locals, request, url }) => {
		// Check if user is authenticated
		if (!locals.user) {
			return fail(401, { error: APPOINTMENT_ERRORS.UNAUTHORIZED });
		}

		const data = await request.formData();
		const appointmentId = data.get('appointmentId');

		if (!appointmentId || typeof appointmentId !== 'string') {
			return fail(400, { error: APPOINTMENT_ERRORS.APPOINTMENT_NOT_FOUND });
		}

		// Redirect to reschedule page
		redirect(303, `/appointments/${appointmentId}/reschedule${url.search}`);
	}
} satisfies Actions;
