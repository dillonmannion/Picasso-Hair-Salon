import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const { data: galleryImages, error } = await supabase
		.from('gallery_images')
		.select('*')
		.order('display_order', { ascending: true })
		.order('created_at', { ascending: false });

	if (error) {
		console.error('Error fetching gallery images:', error);
	}

	return {
		galleryImages: galleryImages ?? []
	};
};
