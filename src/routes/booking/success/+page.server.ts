import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { stripe } from '$lib/stripe/client';

export const load: PageServerLoad = async ({ url, locals }) => {
	const sessionId = url.searchParams.get('session_id');
	const appointmentId = url.searchParams.get('id');

	if (!sessionId && !appointmentId) {
		error(400, 'Missing session or appointment ID');
	}

	// If we have a session ID from Stripe, verify it
	if (sessionId) {
		try {
			const session = await stripe.checkout.sessions.retrieve(sessionId);

			// Verify the session is complete
			if (session.payment_status !== 'paid') {
				error(400, 'Payment not completed');
			}

			// Get appointment ID from session metadata
			const appointmentIdFromSession = session.metadata?.appointment_id;

			if (appointmentIdFromSession) {
				// Verify the appointment exists and belongs to the current user
				const { data: appointment } = await locals.supabase
					.from('appointments')
					.select('*')
					.eq('id', appointmentIdFromSession)
					.single();

				if (!appointment) {
					error(404, 'Appointment not found');
				}

				return {
					session,
					appointment,
					paymentSuccessful: true
				};
			}
		} catch (err) {
			console.error('Error retrieving session:', err);
			error(500, 'Failed to verify payment');
		}
	}

	// If we only have appointment ID, just verify it exists
	if (appointmentId) {
		const { data: appointment } = await locals.supabase
			.from('appointments')
			.select('*')
			.eq('id', appointmentId)
			.single();

		if (!appointment) {
			error(404, 'Appointment not found');
		}

		return {
			appointment,
			paymentSuccessful: appointment.paid
		};
	}

	error(400, 'Invalid request');
};
