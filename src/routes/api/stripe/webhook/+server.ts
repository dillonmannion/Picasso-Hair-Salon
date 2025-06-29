import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { constructWebhookEvent } from '$lib/stripe/client';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { env } from '$env/dynamic/private';

export const POST: RequestHandler = async ({ request }) => {
	const signature = request.headers.get('stripe-signature');

	if (!signature) {
		return error(400, 'No signature');
	}

	if (!env.STRIPE_WEBHOOK_SECRET) {
		console.error('STRIPE_WEBHOOK_SECRET is not configured');
		return error(500, 'Webhook secret not configured');
	}

	const body = await request.text();

	try {
		const event = constructWebhookEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);

		// Use service role for webhook operations
		if (!env.SUPABASE_SERVICE_ROLE_KEY) {
			return error(500, 'Service role key not configured');
		}

		const supabase = createClient(PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

		// Log the event for debugging
		console.log(`Received Stripe webhook event: ${event.type}`);

		switch (event.type) {
			case 'checkout.session.completed': {
				const session = event.data.object as any;

				if (!session.metadata?.appointment_id) {
					console.error('No appointment_id in session metadata');
					break;
				}

				// Update appointment as paid
				const { error: updateError } = await supabase
					.from('appointments')
					.update({
						paid: true,
						payment_session_id: session.id,
						payment_intent_id: session.payment_intent,
						status: 'scheduled'
					})
					.eq('id', session.metadata.appointment_id);

				if (updateError) {
					console.error('Error updating appointment:', updateError);
					return error(500, 'Failed to update appointment');
				}

				// Create order record
				const { error: orderError } = await supabase.from('orders').insert({
					appointment_id: session.metadata.appointment_id,
					stripe_session_id: session.id,
					stripe_payment_intent_id: session.payment_intent,
					amount: session.amount_total / 100, // Convert from cents
					currency: session.currency,
					status: 'completed',
					customer_email: session.customer_details?.email || session.customer_email,
					customer_name: session.metadata.customer_name,
					metadata: {
						service_id: session.metadata.service_id,
						stylist_id: session.metadata.stylist_id,
						appointment_date: session.metadata.appointment_date,
						appointment_time: session.metadata.appointment_time
					}
				});

				if (orderError) {
					console.error('Error creating order:', orderError);
					// Don't throw here - appointment is already marked as paid
				}

				console.log(
					`Successfully processed payment for appointment ${session.metadata.appointment_id}`
				);
				break;
			}

			case 'payment_intent.succeeded': {
				const paymentIntent = event.data.object as any;
				console.log(`Payment intent succeeded: ${paymentIntent.id}`);
				// Additional handling if needed
				break;
			}

			case 'payment_intent.payment_failed': {
				const paymentIntent = event.data.object as any;
				console.error(`Payment failed for intent: ${paymentIntent.id}`);

				if (paymentIntent.metadata?.appointment_id) {
					// Update appointment status to indicate payment failure
					await supabase
						.from('appointments')
						.update({
							status: 'payment_failed',
							notes: `Payment failed: ${paymentIntent.last_payment_error?.message || 'Unknown error'}`
						})
						.eq('id', paymentIntent.metadata.appointment_id);
				}
				break;
			}

			default:
				console.log(`Unhandled event type: ${event.type}`);
		}

		return new Response(JSON.stringify({ received: true }), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (err) {
		console.error('Webhook error:', err);
		return error(400, 'Webhook error');
	}
};
