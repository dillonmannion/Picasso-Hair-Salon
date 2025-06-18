import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Database } from '$lib/types/database.types';

export const load: PageServerLoad = async () => {
	const supabase = createClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

	try {
		const { data: images, error: supabaseError } = await supabase
			.from('gallery_images')
			.select('*')
			.order('is_featured', { ascending: false })
			.order('display_order')
			.order('created_at', { ascending: false });

		if (supabaseError) {
			console.error('Error fetching gallery images:', supabaseError);
			error(500, 'Failed to load gallery images');
		}

		return {
			images: images || [],
			meta: {
				title: 'Hair Gallery - Picasso Hair Salon',
				description:
					'Browse our stunning hair transformation gallery showcasing cuts, colors, and styles by our expert stylists at Picasso Hair Salon. Get inspired for your next look!'
			}
		};
	} catch (err) {
		console.error('Unexpected error fetching gallery images:', err);
		error(500, 'Failed to load gallery images');
	}
};
