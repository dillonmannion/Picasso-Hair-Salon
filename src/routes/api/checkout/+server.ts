import { createCheckoutSession } from '$lib/stripe/client';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

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

interface CheckoutRequestBody {
	appointmentId: string;
	mode?: 'redirect' | 'embedded';
}

export const POST: RequestHandler = async ({ request, url, locals }) => {
	try {
		// Check if user is authenticated
		const session = await locals.safeGetSession();
		const user = session?.user;

		if (!user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		let appointmentId: string | null = null;

		// Handle both JSON and form data
		const contentType = request.headers.get('content-type');
		let mode: 'redirect' | 'embedded' = 'redirect';

		if (contentType?.includes('application/json')) {
			const data = (await request.json()) as CheckoutRequestBody;
			appointmentId = data.appointmentId;
			mode = data.mode ?? 'redirect';
		} else {
			const formData = await request.formData();
			appointmentId = formData.get('appointmentId') as string;
			mode = (formData.get('mode') as 'redirect' | 'embedded') ?? 'redirect';
		}

		if (!appointmentId) {
			return json({ error: 'Appointment ID is required' }, { status: 400 });
		}

		// Fetch appointment details with service and stylist information
		const { data: appointment, error: appointmentError } = await locals.supabase
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

		// Check if appointment is already paid
		const appointmentWithPaid = appointment as typeof appointment & { paid?: boolean };
		if (appointmentWithPaid.paid) {
			return json({ error: 'Appointment is already paid' }, { status: 400 });
		}

		// Check if appointment status allows payment
		if (appointment.status !== 'pending' && appointment.status !== 'confirmed') {
			return json({ error: 'Appointment is not available for payment' }, { status: 400 });
		}

		// Ensure required fields are not null
		if (!appointment.service_id || !appointment.stylist_id) {
			return json({ error: 'Invalid appointment data' }, { status: 400 });
		}

		// Create Stripe checkout session
		const sessionConfig = {
			appointmentId: appointment.id,
			serviceId: appointment.service_id,
			serviceName: appointment.services?.name ?? '',
			servicePrice: Number(appointment.services?.price ?? 0),
			stylistId: appointment.stylist_id,
			stylistName: appointment.stylists?.name ?? '',
			customerEmail: user.email ?? '',
			customerName: appointment.users?.full_name ?? user.email ?? 'Customer',
			appointmentDate: new Date(appointment.appointment_date).toLocaleDateString(),
			appointmentTime: appointment.appointment_time,
			successUrl: `${url.origin}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
			cancelUrl: `${url.origin}/booking/cancel?appointment_id=${appointmentId}&canceled=true`,
			mode: mode === 'embedded' ? ('embedded' as const) : undefined
		};

		const checkout_session = await createCheckoutSession(sessionConfig);

		// For POST requests from form, redirect to Stripe
		if (!request.headers.get('content-type')?.includes('application/json')) {
			return new Response(null, {
				status: 303,
				headers: {
					Location: checkout_session.url ?? '/booking/success'
				}
			});
		}

		// For embedded mode, return client secret
		if (mode === 'embedded') {
			return json({ clientSecret: checkout_session.client_secret });
		}

		return json({ url: checkout_session.url });
	} catch (error) {
		console.error('Checkout session creation error:', error);
		return json({ error: 'Failed to create checkout session' }, { status: 500 });
	}
};
