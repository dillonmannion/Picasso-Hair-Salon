import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const serviceId = url.searchParams.get('service');

	if (!serviceId) {
		error(400, 'Service ID is required');
	}

	// Get the selected service details
	const { data: service } = await locals.supabase
		.from('services')
		.select('*')
		.eq('id', serviceId)
		.single();

	if (!service) {
		error(404, 'Service not found');
	}

	// Get stylists who offer this service
	// For now, we'll return all active stylists since we don't have the junction table data yet
	// In production, you would join with stylist_services table
	const { data: stylists, error: stylistsError } = await locals.supabase
		.from('stylists')
		.select(
			`
			*,
			reviews:reviews(rating)
		`
		)
		.eq('is_active', true)
		.order('name');

	if (stylistsError) {
		console.error('Error loading stylists:', stylistsError);
		error(500, 'Failed to load stylists');
	}

	// Calculate average ratings for each stylist
	const stylistsWithRatings = stylists.map((stylist) => {
		const ratings = stylist.reviews?.map((r: { rating: number }) => r.rating) || [];
		const averageRating =
			ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

		return {
			...stylist,
			averageRating,
			reviewCount: ratings.length
		};
	});

	return {
		service,
		stylists: stylistsWithRatings
	};
};
