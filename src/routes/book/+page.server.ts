import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import type { Database } from '$lib/types/database.types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	try {
		// Fetch services
		const { data: services, error: servicesError } = await supabase
			.from('services')
			.select('*')
			.eq('is_active', true)
			.order('category')
			.order('name');

		if (servicesError) {
			console.error('Error fetching services:', servicesError);
			error(500, 'Failed to load services');
		}

		// Fetch stylists
		const { data: stylists, error: stylistsError } = await supabase
			.from('stylists')
			.select('*')
			.eq('is_active', true)
			.order('name');

		if (stylistsError) {
			console.error('Error fetching stylists:', stylistsError);
			error(500, 'Failed to load stylists');
		}

		return {
			services: services || [],
			stylists: stylists || []
		};
	} catch (err) {
		console.error('Unexpected error fetching data:', err);
		error(500, 'Failed to load booking data');
	}
};

export const actions: Actions = {
	book: async ({ request, locals: { supabase, safeGetSession } }) => {
		const data = await request.formData();
		const { session, user } = await safeGetSession();

		const serviceId = data.get('serviceId') as string;
		const stylistId = data.get('stylistId') as string;
		const appointmentDate = data.get('appointmentDate') as string;
		const appointmentTime = data.get('appointmentTime') as string;
		const notes = data.get('notes') as string;

		// Check if user is authenticated
		if (!session || !user) {
			return fail(401, { error: 'You must be logged in to book an appointment' });
		}

		// Validate required fields
		if (!serviceId || !stylistId || !appointmentDate || !appointmentTime) {
			return fail(400, { error: 'All fields are required' });
		}

		try {
			// Get service price for total calculation
			const { data: service, error: serviceError } = await supabase
				.from('services')
				.select('price')
				.eq('id', serviceId)
				.single();

			if (serviceError || !service) {
				return fail(400, { error: 'Invalid service selected' });
			}

			// Use authenticated user ID
			const userId = user.id;

			// Create appointment
			const { data: appointment, error: appointmentError } = await supabase
				.from('appointments')
				.insert({
					user_id: userId,
					service_id: serviceId,
					stylist_id: stylistId,
					appointment_date: appointmentDate,
					appointment_time: appointmentTime,
					notes: notes || null,
					total_price: service.price,
					status: 'pending'
				})
				.select()
				.single();

			if (appointmentError) {
				console.error('Error creating appointment:', appointmentError);
				return fail(500, { error: 'Failed to create appointment' });
			}

			// Log confirmation email (placeholder)
			console.log('Appointment confirmation email would be sent:', {
				appointmentId: appointment.id,
				date: appointmentDate,
				time: appointmentTime
			});

			// Redirect to success page
			throw redirect(303, `/book/confirmation?id=${appointment.id}`);
		} catch (err) {
			if (err instanceof Response) {
				throw err; // Re-throw redirect
			}
			console.error('Unexpected error creating appointment:', err);
			return fail(500, { error: 'Failed to create appointment' });
		}
	}
};
