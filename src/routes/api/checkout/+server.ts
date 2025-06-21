import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createCheckoutSession } from '$lib/stripe/client';
import { supabase } from '$lib/supabaseClient';

export const GET: RequestHandler = ({ url }) => {
	const appointmentId = url.searchParams.get('appointmentId');

	if (!appointmentId) {
		return new Response('Appointment ID is required', { status: 400 });
	}

	// Create a form and submit it to the POST endpoint
	const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Redirecting to checkout...</title>
      </head>
      <body>
        <p>Redirecting to checkout...</p>
        <form id="checkout-form" method="POST" action="/api/checkout">
          <input type="hidden" name="appointmentId" value="${appointmentId}" />
        </form>
        <script>
          document.getElementById('checkout-form').submit();
        </script>
      </body>
    </html>
  `;

	return new Response(html, {
		headers: {
			'Content-Type': 'text/html'
		}
	});
};

export const POST: RequestHandler = async ({ request, url }) => {
	try {
		// Check if user is authenticated
		const {
			data: { user },
			error: authError
		} = await supabase.auth.getUser();
		if (authError || !user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		let appointmentId: string | null = null;

		// Handle both JSON and form data
		const contentType = request.headers.get('content-type');
		if (contentType?.includes('application/json')) {
			const data = await request.json();
			appointmentId = data.appointmentId;
		} else {
			const formData = await request.formData();
			appointmentId = formData.get('appointmentId') as string;
		}

		if (!appointmentId) {
			return json({ error: 'Appointment ID is required' }, { status: 400 });
		}

		// Fetch appointment details with service and stylist information
		const { data: appointment, error: appointmentError } = await supabase
			.from('appointments')
			.select(
				`
        *,
        services (*),
        stylists (*),
        users (*)
      `
			)
			.eq('id', appointmentId)
			.eq('user_id', user.id)
			.single();

		if (appointmentError || !appointment) {
			console.error('Appointment fetch error:', appointmentError);
			return json({ error: 'Appointment not found' }, { status: 404 });
		}

		if (appointment.status !== 'scheduled' || appointment.paid) {
			return json({ error: 'Appointment is not available for payment' }, { status: 400 });
		}

		// Create Stripe checkout session
		const session = await createCheckoutSession({
			appointmentId: appointment.id,
			serviceId: appointment.service_id,
			serviceName: appointment.services.name,
			servicePrice: appointment.services.price,
			stylistId: appointment.stylist_id,
			stylistName: appointment.stylists.name,
			customerEmail: user.email || '',
			customerName: appointment.users.name || user.email || 'Customer',
			appointmentDate: new Date(appointment.appointment_date).toLocaleDateString(),
			appointmentTime: appointment.appointment_time,
			successUrl: `${url.origin}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
			cancelUrl: `${url.origin}/booking/cancel?appointment_id=${appointmentId}&canceled=true`
		});

		// For POST requests from form, redirect to Stripe
		if (!request.headers.get('content-type')?.includes('application/json')) {
			return new Response(null, {
				status: 303,
				headers: {
					Location: session.url || '/booking/success'
				}
			});
		}

		return json({ url: session.url });
	} catch (error) {
		console.error('Checkout session creation error:', error);
		return json({ error: 'Failed to create checkout session' }, { status: 500 });
	}
};
