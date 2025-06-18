import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	return {
		meta: {
			title: 'Contact Us - Picasso Hair Salon',
			description:
				"Get in touch with Picasso Hair Salon. Find our location, hours, phone number, and contact form. We're here to help with all your hair care needs and questions."
		}
	};
};
