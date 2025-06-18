import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	try {
		// Fetch reviews with related data
		const { data: reviews, error: reviewsError } = await supabase
			.from('reviews')
			.select(
				`
				*,
				users:user_id (full_name),
				services:service_id (name),
				stylists:stylist_id (name)
			`
			)
			.eq('is_visible', true)
			.order('created_at', { ascending: false });

		if (reviewsError) {
			console.error('Error fetching reviews:', reviewsError);
			error(500, 'Failed to load reviews');
		}

		// Calculate review statistics
		const totalReviews = reviews?.length || 0;
		let averageRating = 0;
		const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

		if (reviews && reviews.length > 0) {
			const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
			averageRating = totalRating / reviews.length;

			// Calculate rating breakdown
			reviews.forEach((review) => {
				if (review.rating) {
					ratingBreakdown[review.rating as keyof typeof ratingBreakdown]++;
				}
			});
		}

		// Calculate percentages for rating breakdown
		const ratingPercentages = Object.entries(ratingBreakdown).reduce(
			(acc, [rating, count]) => {
				acc[rating as unknown as keyof typeof ratingBreakdown] =
					totalReviews > 0 ? (count / totalReviews) * 100 : 0;
				return acc;
			},
			{} as Record<number, number>
		);

		// Fetch services and stylists for the review form
		const { data: services } = await supabase
			.from('services')
			.select('id, name')
			.eq('is_active', true)
			.order('name');

		const { data: stylists } = await supabase
			.from('stylists')
			.select('id, name')
			.eq('is_active', true)
			.order('name');

		return {
			reviews: reviews || [],
			totalReviews,
			averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
			ratingBreakdown,
			ratingPercentages,
			services: services || [],
			stylists: stylists || [],
			meta: {
				title: 'Customer Reviews - Picasso Hair Salon',
				description: `Read ${totalReviews} customer reviews for Picasso Hair Salon. Average rating: ${Math.round(averageRating * 10) / 10}/5 stars. See what our clients say about our hair services and stylists.`
			}
		};
	} catch (err) {
		console.error('Unexpected error fetching reviews:', err);
		error(500, 'Failed to load reviews');
	}
};

export const actions: Actions = {
	submitReview: async ({ request, locals: { supabase, safeGetSession } }) => {
		const data = await request.formData();
		const { session, user } = await safeGetSession();

		const serviceId = data.get('serviceId') as string;
		const stylistId = data.get('stylistId') as string;
		const rating = parseInt(data.get('rating') as string);
		const comment = data.get('comment') as string;

		// Check if user is authenticated
		if (!session || !user) {
			return fail(401, { error: 'You must be logged in to submit a review' });
		}

		// Validate required fields
		if (!serviceId || !stylistId || !rating || rating < 1 || rating > 5) {
			return fail(400, {
				error: 'Please provide all required fields with valid values',
				serviceId: serviceId || '',
				stylistId: stylistId || '',
				rating: rating || 0,
				comment: comment || ''
			});
		}

		// Check for duplicate review (user can only review a service/stylist combo once)
		const { data: existingReview } = await supabase
			.from('reviews')
			.select('id')
			.eq('user_id', user.id)
			.eq('service_id', serviceId)
			.eq('stylist_id', stylistId)
			.single();

		if (existingReview) {
			return fail(400, {
				error: 'You have already reviewed this service with this stylist',
				serviceId,
				stylistId,
				rating,
				comment: comment || ''
			});
		}

		try {
			// Use authenticated user ID
			const userId = user.id;

			// Create review
			const { error: reviewError } = await supabase
				.from('reviews')
				.insert({
					user_id: userId,
					service_id: serviceId,
					stylist_id: stylistId,
					rating,
					comment: comment || null,
					is_visible: true
				})
				.select()
				.single();

			if (reviewError) {
				console.error('Error creating review:', reviewError);
				return fail(500, { error: 'Failed to submit review' });
			}

			return { success: true, message: 'Thank you for your review!' };
		} catch (err) {
			console.error('Unexpected error creating review:', err);
			return fail(500, { error: 'Failed to submit review' });
		}
	}
};
