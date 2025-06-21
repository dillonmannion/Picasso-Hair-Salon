import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	// Fetch active services from the database
	// The RLS policy ensures only active services are returned for public view
	const { data: services, error: servicesError } = await supabase
		.from('services')
		.select('*')
		.eq('is_active', true)
		.order('category', { ascending: true })
		.order('name', { ascending: true });

	if (servicesError) {
		console.error('Error fetching services:', servicesError);
		error(500, 'Failed to load services');
	}

	// Convert price from string to number for frontend use
	const formattedServices = (services ?? []).map((service) => ({
		...service,
		price: Number.parseFloat(service.price)
	}));

	return {
		services: formattedServices
	};
};
