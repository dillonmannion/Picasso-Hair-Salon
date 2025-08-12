import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Fetch services from database
	const { data: services, error: servicesError } = await locals.supabase
		.from('services')
		.select('*')
		.order('category', { ascending: true })
		.order('name', { ascending: true });

	if (servicesError) {
		console.error('Error fetching services:', servicesError);
		error(500, 'Failed to load services');
	}

	return {
		services: services || []
	};
};

export const actions = {
	create: async ({ request, locals }) => {
		const formData = await request.formData();
		const name = formData.get('name') as string;
		const description = formData.get('description') as string;
		const price = Number.parseFloat(formData.get('price') as string);
		const duration = Number.parseInt(formData.get('duration') as string);
		const category = formData.get('category') as string;
		const is_active = formData.get('is_active') === 'true';

		// @ts-expect-error "No overload matches the call"
		const { error: createError } = await locals.supabase.from('services').insert({
			name,
			description,
			price,
			duration,
			category,
			is_active
		});

		if (createError) {
			console.error('Error creating service:', createError);
			return fail(500, { error: 'Failed to create service' });
		}

		return { success: true };
	},

	update: async ({ request, locals }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		const name = formData.get('name') as string;
		const description = formData.get('description') as string;
		const price = Number.parseFloat(formData.get('price') as string);
		const duration = Number.parseInt(formData.get('duration') as string);
		const category = formData.get('category') as string;
		const is_active = formData.get('is_active') === 'true';

		const { error: updateError } = await locals.supabase
			.from('services')
			.update({
				name,
				description,
				price,
				duration,
				category,
				is_active
			})
			.eq('id', id);

		if (updateError) {
			console.error('Error updating service:', updateError);
			return fail(500, { error: 'Failed to update service' });
		}

		return { success: true };
	},

	delete: async ({ request, locals }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		const { error: deleteError } = await locals.supabase.from('services').delete().eq('id', id);

		if (deleteError) {
			console.error('Error deleting service:', deleteError);
			return fail(500, { error: 'Failed to delete service' });
		}

		return { success: true };
	}
} satisfies Actions;
