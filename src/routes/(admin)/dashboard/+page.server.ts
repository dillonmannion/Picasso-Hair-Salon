import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Database } from '$lib/types/database.types';

export const load: PageServerLoad = async () => {
	const supabase = createClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

	try {
		// Fetch dashboard analytics data
		const [appointmentsResult, servicesResult, stylistsResult, reviewsResult] = await Promise.all([
			// Appointments data
			supabase.from('appointments').select('*').order('created_at', { ascending: false }),

			// Services data
			supabase.from('services').select('*').eq('is_active', true),

			// Stylists data
			supabase.from('stylists').select('*').eq('is_active', true),

			// Reviews data
			supabase.from('reviews').select('*').eq('is_visible', true)
		]);

		if (appointmentsResult.error) {
			console.error('Error fetching appointments:', appointmentsResult.error);
		}
		if (servicesResult.error) {
			console.error('Error fetching services:', servicesResult.error);
		}
		if (stylistsResult.error) {
			console.error('Error fetching stylists:', stylistsResult.error);
		}
		if (reviewsResult.error) {
			console.error('Error fetching reviews:', reviewsResult.error);
		}

		const appointments = appointmentsResult.data || [];
		const services = servicesResult.data || [];
		const stylists = stylistsResult.data || [];
		const reviews = reviewsResult.data || [];

		// Calculate analytics
		const totalAppointments = appointments.length;
		const totalServices = services.length;
		const totalStylists = stylists.length;
		const totalReviews = reviews.length;

		// Calculate revenue (sum of all completed appointment prices)
		const totalRevenue = appointments
			.filter((apt) => apt.status === 'completed')
			.reduce((sum, apt) => sum + parseFloat(apt.total_price || '0'), 0);

		// Calculate average rating
		const averageRating =
			reviews.length > 0
				? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length
				: 0;

		// Get recent appointments (last 10)
		const recentAppointments = appointments.slice(0, 10);

		// Calculate appointment status breakdown
		const appointmentsByStatus = appointments.reduce(
			(acc, apt) => {
				acc[apt.status || 'pending'] = (acc[apt.status || 'pending'] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>
		);

		// Calculate monthly revenue (mock data for chart)
		const currentDate = new Date();
		const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
			const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
			const monthName = date.toLocaleDateString('en-US', { month: 'short' });
			// In a real app, you'd calculate actual monthly revenue from appointments
			const revenue = Math.floor(Math.random() * 5000) + 2000; // Mock data
			return { month: monthName, revenue };
		}).reverse();

		return {
			analytics: {
				totalAppointments,
				totalServices,
				totalStylists,
				totalReviews,
				totalRevenue,
				averageRating: Math.round(averageRating * 10) / 10
			},
			recentAppointments,
			appointmentsByStatus,
			monthlyRevenue
		};
	} catch (err) {
		console.error('Unexpected error fetching dashboard data:', err);
		error(500, 'Failed to load dashboard data');
	}
};
