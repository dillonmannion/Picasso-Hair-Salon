import type { PageServerLoad } from './$types';

export const load: PageServerLoad = (_locals) => {
	// TODO: Implement actual appointment fetching from database
	// For now, return mock data
	const mockAppointments = [
		{
			id: '1',
			customerName: 'John Doe',
			customerEmail: 'john@example.com',
			service: 'Haircut & Style',
			stylist: 'Sarah Johnson',
			date: '2024-06-25',
			time: '10:00 AM',
			status: 'confirmed',
			price: 45.0,
			notes: 'Regular customer, prefers shorter sides'
		},
		{
			id: '2',
			customerName: 'Jane Smith',
			customerEmail: 'jane@example.com',
			service: 'Hair Color',
			stylist: 'Maria Garcia',
			date: '2024-07-02',
			time: '2:00 PM',
			status: 'pending',
			price: 120.0,
			notes: 'First time color, wants highlights'
		},
		{
			id: '3',
			customerName: 'Mike Johnson',
			customerEmail: 'mike@example.com',
			service: 'Beard Trim',
			stylist: 'Carlos Rodriguez',
			date: '2024-06-26',
			time: '3:30 PM',
			status: 'completed',
			price: 25.0,
			notes: 'Monthly appointment'
		}
	];

	return {
		appointments: mockAppointments
	};
};
