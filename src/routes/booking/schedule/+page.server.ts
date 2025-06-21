import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const serviceId = url.searchParams.get('service');
	const stylistId = url.searchParams.get('stylist');
	const selectedDate = url.searchParams.get('date');

	if (!serviceId || !stylistId) {
		throw error(400, 'Service and stylist IDs are required');
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
	if (stylistId !== 'any') {
		const { data } = await locals.supabase
			.from('stylists')
			.select('*')
			.eq('id', stylistId)
			.single();
		stylist = data;
	}

	// If a date is selected, get available time slots
	let timeSlots: Array<{ time: string; available: boolean }> = [];

	if (selectedDate) {
		// For "any stylist", we'd need to check all stylists
		// For now, we'll generate slots for the specific stylist
		if (stylistId === 'any') {
			// Get all active stylists and check their availability
			const { data: allStylists } = await locals.supabase
				.from('stylists')
				.select('id')
				.eq('is_active', true);

			// Generate time slots and check if at least one stylist is available
			timeSlots = await generateTimeSlotsForAny(
				locals.supabase,
				allStylists?.map((s) => s.id) || [],
				selectedDate,
				service.duration
			);
		} else {
			// Generate time slots for specific stylist
			timeSlots = await generateTimeSlots(
				locals.supabase,
				stylistId,
				selectedDate,
				service.duration
			);
		}
	}

	return {
		service,
		stylist,
		isAnyStylist: stylistId === 'any',
		timeSlots
	};
};

async function generateTimeSlots(
	supabase: any,
	stylistId: string,
	date: string,
	serviceDuration: number
): Promise<Array<{ time: string; available: boolean }>> {
	// Get existing appointments for the stylist on this date
	const { data: appointments } = await supabase
		.from('appointments')
		.select('appointment_time, services!inner(duration)')
		.eq('stylist_id', stylistId)
		.eq('appointment_date', date)
		.neq('status', 'cancelled');

	// Generate time slots from 9 AM to 6 PM
	const slots: Array<{ time: string; available: boolean }> = [];
	const startHour = 9;
	const endHour = 18;
	const slotInterval = 30; // 30-minute intervals

	for (let hour = startHour; hour < endHour; hour++) {
		for (let minute = 0; minute < 60; minute += slotInterval) {
			const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;

			// Check if this slot would fit before closing time
			const slotEndMinutes = hour * 60 + minute + serviceDuration;
			if (slotEndMinutes > endHour * 60) {
				continue;
			}

			// Check for conflicts with existing appointments
			const hasConflict = appointments?.some((apt: any) => {
				const aptStartTime = new Date(`2000-01-01T${apt.appointment_time}`);
				const aptEndTime = new Date(aptStartTime.getTime() + apt.services.duration * 60000);
				const slotStartTime = new Date(`2000-01-01T${time}`);
				const slotEndTime = new Date(slotStartTime.getTime() + serviceDuration * 60000);

				return (
					(slotStartTime >= aptStartTime && slotStartTime < aptEndTime) ||
					(slotEndTime > aptStartTime && slotEndTime <= aptEndTime) ||
					(slotStartTime <= aptStartTime && slotEndTime >= aptEndTime)
				);
			});

			slots.push({
				time: time.substring(0, 5), // HH:MM format
				available: !hasConflict
			});
		}
	}

	return slots;
}

async function generateTimeSlotsForAny(
	supabase: any,
	stylistIds: string[],
	date: string,
	serviceDuration: number
): Promise<Array<{ time: string; available: boolean }>> {
	// Get all appointments for all stylists on this date
	const { data: appointments } = await supabase
		.from('appointments')
		.select('stylist_id, appointment_time, services!inner(duration)')
		.in('stylist_id', stylistIds)
		.eq('appointment_date', date)
		.neq('status', 'cancelled');

	// Group appointments by stylist
	const appointmentsByStylist =
		appointments?.reduce(
			(acc: Record<string, any[]>, apt: any) => {
				if (!acc[apt.stylist_id]) {
					acc[apt.stylist_id] = [];
				}
				acc[apt.stylist_id].push(apt);
				return acc;
			},
			{} as Record<string, any[]>
		) || {};

	// Generate time slots
	const slots: Array<{ time: string; available: boolean }> = [];
	const startHour = 9;
	const endHour = 18;
	const slotInterval = 30;

	for (let hour = startHour; hour < endHour; hour++) {
		for (let minute = 0; minute < 60; minute += slotInterval) {
			const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;

			// Check if this slot would fit before closing time
			const slotEndMinutes = hour * 60 + minute + serviceDuration;
			if (slotEndMinutes > endHour * 60) {
				continue;
			}

			// Check if at least one stylist is available
			const isAvailable = stylistIds.some((stylistId) => {
				const stylistAppointments = appointmentsByStylist[stylistId] || [];

				const hasConflict = stylistAppointments.some((apt: any) => {
					const aptStartTime = new Date(`2000-01-01T${apt.appointment_time}`);
					const aptEndTime = new Date(aptStartTime.getTime() + apt.services.duration * 60000);
					const slotStartTime = new Date(`2000-01-01T${time}`);
					const slotEndTime = new Date(slotStartTime.getTime() + serviceDuration * 60000);

					return (
						(slotStartTime >= aptStartTime && slotStartTime < aptEndTime) ||
						(slotEndTime > aptStartTime && slotEndTime <= aptEndTime) ||
						(slotStartTime <= aptStartTime && slotEndTime >= aptEndTime)
					);
				});

				return !hasConflict;
			});

			slots.push({
				time: time.substring(0, 5), // HH:MM format
				available: isAvailable
			});
		}
	}

	return slots;
}
