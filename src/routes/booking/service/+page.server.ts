import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Load active services from database
	const { data: services, error } = await locals.supabase
		.from('services')
		.select('*')
		.eq('is_active', true)
		.order('category')
		.order('name');

	if (error) {
		console.error('Error loading services:', error);
		return {
			services: []
		};
	}

	// Group services by category
	const groupedServices = services.reduce(
		(acc, service) => {
			const category = service.category || 'Other';
			if (!acc[category]) {
				acc[category] = [];
			}
			acc[category].push(service);
			return acc;
		},
		{} as Record<string, typeof services>
	);

	return {
		services,
		groupedServices
	};
};
