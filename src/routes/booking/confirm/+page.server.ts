import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const serviceId = url.searchParams.get('service');
	const stylistId = url.searchParams.get('stylist');
	const date = url.searchParams.get('date');
	const time = url.searchParams.get('time');

	if (!serviceId || !stylistId || !date || !time) {
		throw error(400, 'Missing booking parameters');
	}

	// Get service details
	const { data: service } = await locals.supabase
		.from('services')
		.select('*')
		.eq('id', serviceId)
		.single();

	if (!service) {
		throw error(404, 'Service not found');
	}

	// Get stylist details (if not "any")
	let stylist = null;
	const availableStylists: string[] = [];

	if (stylistId === 'any') {
		// For "any stylist", find available stylists for this time slot
		const { data: allStylists } = await locals.supabase
			.from('stylists')
			.select('id')
			.eq('is_active', true);

		if (allStylists) {
			// Check each stylist's availability
			for (const s of allStylists) {
				const isAvailable = await checkStylistAvailability(
					locals.supabase,
					s.id,
					date,
					time,
					service.duration
				);

				if (isAvailable) {
					availableStylists.push(s.id);
				}
			}
		}

		if (availableStylists.length === 0) {
			throw error(400, 'No stylists available for this time slot');
		}
	} else {
		const { data } = await locals.supabase
			.from('stylists')
			.select('*')
			.eq('id', stylistId)
			.single();
		stylist = data;

		// Verify the selected stylist is still available
		const isAvailable = await checkStylistAvailability(
			locals.supabase,
			stylistId,
			date,
			time,
			service.duration
		);

		if (!isAvailable) {
			throw error(400, 'This time slot is no longer available');
		}
	}

	return {
		service,
		stylist,
		isAnyStylist: stylistId === 'any',
		availableStylists,
		date,
		time
	};
};

export const actions = {
	create: async ({ request, locals, url }) => {
		const session = await locals.safeGetSession();
		const user = session?.user;

		if (!user) {
			throw error(401, 'Unauthorized');
		}

		const formData = await request.formData();
		const serviceId = formData.get('serviceId') as string;
		const stylistId = formData.get('stylistId') as string;
		const date = formData.get('date') as string;
		const time = formData.get('time') as string;
		const notes = formData.get('notes') as string;
		const isAnyStylist = formData.get('isAnyStylist') === 'true';

		// Get service details for price
		const { data: service } = await locals.supabase
			.from('services')
			.select('price, duration')
			.eq('id', serviceId)
			.single();

		if (!service) {
			return fail(400, { error: 'Service not found' });
		}

		// Determine the actual stylist ID
		let actualStylistId = stylistId;

		if (isAnyStylist) {
			// Get available stylists from form data
			const availableStylists = formData.get('availableStylists') as string;
			const stylistIds = JSON.parse(availableStylists);

			// Randomly select one of the available stylists
			// In a real app, you might want more sophisticated logic here
			actualStylistId = stylistIds[Math.floor(Math.random() * stylistIds.length)];
		}

		// Double-check availability before creating
		const isAvailable = await checkStylistAvailability(
			locals.supabase,
			actualStylistId,
			date,
			time,
			service.duration
		);

		if (!isAvailable) {
			return fail(400, { error: 'This time slot is no longer available' });
		}

		// Ensure user profile exists
		const { data: existingProfile } = await locals.supabase
			.from('users')
			.select('id')
			.eq('id', user.id)
			.single();

		// Create user profile if it doesn't exist
		if (!existingProfile) {
			const { error: profileError } = await locals.supabase.from('users').insert({
				id: user.id,
				email: user.email,
				full_name: user.user_metadata?.full_name || null,
				avatar_url: user.user_metadata?.avatar_url || null
			});

			if (profileError) {
				console.error('Error creating user profile:', profileError);
				return fail(500, { error: 'Failed to create user profile' });
			}
		}

		// Create the appointment
		const { data: appointment, error: createError } = await locals.supabase
			.from('appointments')
			.insert({
				user_id: user.id,
				service_id: serviceId,
				stylist_id: actualStylistId,
				appointment_date: date,
				appointment_time: `${time}:00`,
				status: 'pending',
				notes: notes || null,
				total_price: service.price
			})
			.select()
			.single();

		if (createError) {
			console.error('Error creating appointment:', createError);
			return fail(500, { error: 'Failed to create appointment' });
		}

		// Redirect to embedded payment page
		throw redirect(303, `/booking/payment?appointment_id=${appointment.id}`);
	}
} satisfies Actions;

async function checkStylistAvailability(
	supabase: any,
	stylistId: string,
	date: string,
	time: string,
	serviceDuration: number
): Promise<boolean> {
	// Get existing appointments for the stylist on this date
	const { data: appointments } = await supabase
		.from('appointments')
		.select('appointment_time, services!inner(duration)')
		.eq('stylist_id', stylistId)
		.eq('appointment_date', date)
		.neq('status', 'cancelled');

	if (!appointments) return true;

	// Check for conflicts
	const slotStartTime = new Date(`2000-01-01T${time}:00`);
	const slotEndTime = new Date(slotStartTime.getTime() + serviceDuration * 60000);

	return !appointments.some((apt: any) => {
		const aptStartTime = new Date(`2000-01-01T${apt.appointment_time}`);
		const aptEndTime = new Date(aptStartTime.getTime() + apt.services.duration * 60000);

		return (
			(slotStartTime >= aptStartTime && slotStartTime < aptEndTime) ||
			(slotEndTime > aptStartTime && slotEndTime <= aptEndTime) ||
			(slotStartTime <= aptStartTime && slotEndTime >= aptEndTime)
		);
	});
}
