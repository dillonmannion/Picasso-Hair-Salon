import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name') as string;
		const email = data.get('email') as string;
		const phone = data.get('phone') as string;
		const subject = data.get('subject') as string;
		const message = data.get('message') as string;

		// Validate required fields
		if (!name || !email || !subject || !message) {
			return fail(400, {
				error: 'Please fill in all required fields'
			});
		}

		// In a real application, you would:
		// 1. Send an email notification
		// 2. Save to database
		// 3. Integrate with a CRM or ticketing system

		// For now, we'll just log it and return success
		console.log('Contact form submission:', {
			name,
			email,
			phone,
			subject,
			message,
			timestamp: new Date().toISOString()
		});

		// Return success (in a real app, you might redirect or show a success message)
		return {
			success: true,
			message: "Thank you for your message! We'll get back to you soon."
		};
	}
} satisfies Actions;
