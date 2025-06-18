import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Database } from '$lib/types/database.types';

export const load: PageServerLoad = async () => {
	const supabase = createClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

	try {
		const { data: services, error: supabaseError } = await supabase
			.from('services')
			.select('*')
			.eq('is_active', true)
			.order('category')
			.order('name');

		if (supabaseError) {
			console.error('Error fetching services:', supabaseError);
			error(500, 'Failed to load services');
		}

		return {
			services: services || [],
			meta: {
				title: 'Hair Services - Picasso Hair Salon',
				description:
					'Discover our premium hair services including cuts, coloring, styling, and treatments. Expert stylists delivering exceptional results at Picasso Hair Salon.'
			}
		};
	} catch (err) {
		console.error('Unexpected error fetching services:', err);
		error(500, 'Failed to load services');
	}
};
