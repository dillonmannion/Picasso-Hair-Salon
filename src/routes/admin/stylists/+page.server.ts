import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Fetch stylists from database
	const { data: stylists, error: stylistsError } = await locals.supabase
		.from('stylists')
		.select('*')
		.order('name', { ascending: true });

	if (stylistsError) {
		console.error('Error fetching stylists:', stylistsError);
		throw error(500, 'Failed to load stylists');
	}

	return {
		stylists: stylists || []
	};
};

export const actions = {
	create: async ({ request, locals }) => {
		const formData = await request.formData();
		const name = formData.get('name') as string;
		const bio = formData.get('bio') as string;
		const specialties = formData.getAll('specialties') as string[];
		const is_active = formData.get('is_active') === 'true';
		const availabilityJson = formData.get('availability') as string;

		let availability = null;
		try {
			if (availabilityJson) {
				availability = JSON.parse(availabilityJson);
			}
		} catch (e) {
			console.error('Error parsing availability:', e);
		}

		const { error: createError } = await locals.supabase.from('stylists').insert({
			name,
			bio,
			specialties,
			is_active,
			availability
		});

		if (createError) {
			console.error('Error creating stylist:', createError);
			return fail(500, { error: 'Failed to create stylist' });
		}

		return { success: true };
	},

	update: async ({ request, locals }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		const name = formData.get('name') as string;
		const bio = formData.get('bio') as string;
		const specialties = formData.getAll('specialties') as string[];
		const is_active = formData.get('is_active') === 'true';
		const availabilityJson = formData.get('availability') as string;

		let availability = null;
		try {
			if (availabilityJson) {
				availability = JSON.parse(availabilityJson);
			}
		} catch (e) {
			console.error('Error parsing availability:', e);
		}

		const { error: updateError } = await locals.supabase
			.from('stylists')
			.update({
				name,
				bio,
				specialties,
				is_active,
				availability
			})
			.eq('id', id);

		if (updateError) {
			console.error('Error updating stylist:', updateError);
			return fail(500, { error: 'Failed to update stylist' });
		}

		return { success: true };
	},

	delete: async ({ request, locals }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		const { error: deleteError } = await locals.supabase.from('stylists').delete().eq('id', id);

		if (deleteError) {
			console.error('Error deleting stylist:', deleteError);
			return fail(500, { error: 'Failed to delete stylist' });
		}

		return { success: true };
	}
} satisfies Actions;
