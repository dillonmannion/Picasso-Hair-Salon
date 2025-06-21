import type { PageServerLoad } from './$types';

export const load: PageServerLoad = (_locals) => {
	// TODO: Implement actual gallery images fetching from database
	// For now, return mock data
	const mockGalleryImages = [
		{
			id: '1',
			url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
			title: 'Modern Bob Cut',
			description: 'Sleek bob with subtle highlights',
			category: 'Haircuts',
			stylist_id: '1',
			stylist_name: 'Sarah Johnson',
			is_featured: true,
			display_order: 1,
			created_at: '2024-06-20'
		},
		{
			id: '2',
			url: 'https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?w=400',
			title: 'Blonde Balayage',
			description: 'Beautiful blonde balayage with natural roots',
			category: 'Color',
			stylist_id: '2',
			stylist_name: 'Maria Garcia',
			is_featured: true,
			display_order: 2,
			created_at: '2024-06-19'
		},
		{
			id: '3',
			url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400',
			title: 'Classic Mens Cut',
			description: 'Traditional mens haircut with modern styling',
			category: 'Mens',
			stylist_id: '3',
			stylist_name: 'Carlos Rodriguez',
			is_featured: false,
			display_order: 3,
			created_at: '2024-06-18'
		},
		{
			id: '4',
			url: 'https://images.unsplash.com/photo-1562322140-8ba9c0f3fb8f?w=400',
			title: 'Curly Hair Styling',
			description: 'Natural curl enhancement and styling',
			category: 'Styling',
			stylist_id: '1',
			stylist_name: 'Sarah Johnson',
			is_featured: false,
			display_order: 4,
			created_at: '2024-06-17'
		}
	];

	return {
		galleryImages: mockGalleryImages
	};
};
