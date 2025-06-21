import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	// Fetch active stylists from the database
	// The RLS policy ensures only active stylists are returned for public view
	const { data: stylists, error: stylistsError } = await supabase
		.from('stylists')
		.select('*')
		.eq('is_active', true)
		.order('name', { ascending: true });

	if (stylistsError) {
		console.error('Error fetching stylists:', stylistsError);
		error(500, 'Failed to load stylists');
	}

	return {
		stylists: stylists ?? []
	};
};
