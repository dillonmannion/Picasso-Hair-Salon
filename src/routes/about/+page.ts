import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	return {
		meta: {
			title: 'About Us - Picasso Hair Salon',
			description:
				"Learn about Picasso Hair Salon's story, our expert stylists, and our commitment to exceptional hair care. Discover what makes us the premier destination for hair services."
		}
	};
};
