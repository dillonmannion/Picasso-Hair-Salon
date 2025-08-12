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
		console.error('Error loading services for showcase:', error);
		return {
			services: []
		};
	}

	return {
		services: services || []
	};
};
