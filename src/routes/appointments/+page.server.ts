import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	// Allow public access to appointments page
	// User data and appointments are loaded based on authentication status

	const appointments = locals.user
		? [
				// TODO: Implement actual appointment fetching from database
				// For now, return mock data for authenticated users
				{
					id: '1',
					service: 'Haircut & Style',
					stylist: 'Sarah Johnson',
					date: '2024-06-25',
					time: '10:00 AM',
					status: 'confirmed'
				},
				{
					id: '2',
					service: 'Hair Color',
					stylist: 'Maria Garcia',
					date: '2024-07-02',
					time: '2:00 PM',
					status: 'pending'
				}
			]
		: [];

	return {
		user: locals.user,
		appointments
	};
};
