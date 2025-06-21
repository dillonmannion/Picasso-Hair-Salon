import Stripe from 'stripe';
import { env } from '$env/dynamic/private';

if (!env.STRIPE_SECRET_KEY) {
	throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
	apiVersion: '2025-05-28.basil',
	typescript: true,
	maxNetworkRetries: 2,
	appInfo: {
		name: 'Picasso Hair Salon',
		version: '1.0.0',
		url: 'https://picasso-hair-salon.vercel.app'
	}
});

export type CreateCheckoutSessionParams = {
	appointmentId: string;
	serviceId: string;
	serviceName: string;
	servicePrice: number;
	stylistId: string;
	stylistName: string;
	customerEmail: string;
	customerName: string;
	appointmentDate: string;
	appointmentTime: string;
	successUrl: string;
	cancelUrl: string;
};

export async function createCheckoutSession(
	params: CreateCheckoutSessionParams
): Promise<Stripe.Checkout.Session> {
	const session = await stripe.checkout.sessions.create({
		payment_method_types: ['card'],
		line_items: [
			{
				price_data: {
					currency: 'usd',
					product_data: {
						name: params.serviceName,
						description: `${params.serviceName} with ${params.stylistName} on ${params.appointmentDate} at ${params.appointmentTime}`,
						metadata: {
							service_id: params.serviceId,
							stylist_id: params.stylistId
						}
					},
					unit_amount: Math.round(params.servicePrice * 100) // Convert to cents
				},
				quantity: 1
			}
		],
		mode: 'payment',
		success_url: params.successUrl,
		cancel_url: params.cancelUrl,
		customer_email: params.customerEmail,
		metadata: {
			appointment_id: params.appointmentId,
			service_id: params.serviceId,
			stylist_id: params.stylistId,
			customer_name: params.customerName,
			appointment_date: params.appointmentDate,
			appointment_time: params.appointmentTime
		},
		payment_intent_data: {
			metadata: {
				appointment_id: params.appointmentId,
				service_id: params.serviceId,
				stylist_id: params.stylistId
			}
		}
	});

	return session;
}

export function constructWebhookEvent(
	payload: string | Buffer,
	signature: string,
	webhookSecret: string
): Stripe.Event {
	return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}
