# Stripe Documentation

## Overview

**Stripe** is a comprehensive payment processing platform that provides APIs and tools for accepting payments, managing subscriptions, and handling complex financial workflows. It offers both client-side and server-side SDKs to create secure payment experiences.

**Current versions in project**:

- @stripe/stripe-js: 5.3.0 (Browser-side loading wrapper)
- stripe: 17.5.0 (Node.js SDK)

## Why Use Stripe?

- **Developer-Friendly**: Extensive APIs with excellent documentation
- **Security**: PCI-compliant with built-in fraud protection
- **Global Reach**: Support for 135+ currencies and 45+ countries
- **Flexible Integration**: Pre-built UI components or custom implementations
- **Comprehensive Features**: Payments, subscriptions, invoicing, and more
- **Strong Typing**: Full TypeScript support
- **Reliability**: 99.99% uptime with automatic retries

## Installation & Setup

### 1. Install Dependencies

```bash
# Client-side (Browser)
npm install @stripe/stripe-js

# Server-side (Node.js)
npm install stripe
```

### 2. Initialize Client-Side

```javascript
// Client-side initialization
import { loadStripe } from '@stripe/stripe-js';

// Use your publishable key (starts with pk_)
const stripePromise = loadStripe(process.env.PUBLIC_STRIPE_PUBLISHABLE_KEY);

// For immediate loading (recommended for fraud detection)
import '@stripe/stripe-js';
```

### 3. Initialize Server-Side

```javascript
// Server-side initialization (CommonJS)
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// ES Modules
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// With configuration options
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
	apiVersion: '2023-10-16',
	maxNetworkRetries: 2,
	timeout: 20000 // 20 seconds
});
```

### 4. TypeScript Setup

```typescript
// Lazy initialization pattern
import Stripe from 'stripe';

let _stripe: Stripe | null = null;
const getStripe = (): Stripe => {
	if (!_stripe) {
		_stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
			apiVersion: '2023-10-16',
			typescript: true
		});
	}
	return _stripe;
};
```

## Core Concepts

### 1. Payment Intents

The Payment Intent API is the recommended way to accept payments.

#### Create Payment Intent (Server)

```javascript
// Create a payment intent
const paymentIntent = await stripe.paymentIntents.create({
	amount: 2000, // Amount in cents
	currency: 'usd',
	automatic_payment_methods: {
		enabled: true
	},
	metadata: {
		order_id: '123',
		customer_email: 'customer@example.com'
	}
});

// Return client secret to frontend
return {
	clientSecret: paymentIntent.client_secret
};
```

#### Confirm Payment (Client)

```javascript
// Using Stripe Elements
const stripe = await loadStripe(publishableKey);

const { error } = await stripe.confirmPayment({
	elements,
	confirmParams: {
		return_url: 'https://example.com/success'
	}
});

if (error) {
	// Handle error
	console.error(error.message);
}
```

### 2. Stripe Elements

Pre-built UI components for collecting payment information.

```javascript
// Create Elements instance
const elements = stripe.elements({
	clientSecret: paymentIntent.client_secret
});

// Create and mount Payment Element
const paymentElement = elements.create('payment', {
	layout: 'tabs',
	paymentMethodOrder: ['card', 'apple_pay', 'google_pay']
});
paymentElement.mount('#payment-element');

// Handle form submission
const handleSubmit = async (event) => {
	event.preventDefault();

	const { error } = await stripe.confirmPayment({
		elements,
		confirmParams: {
			return_url: `${window.location.origin}/success`
		}
	});

	if (error) {
		showError(error.message);
	}
};
```

### 3. Customers

Managing customer records for recurring payments and saved payment methods.

```javascript
// Create customer
const customer = await stripe.customers.create({
	email: 'customer@example.com',
	name: 'John Doe',
	phone: '+1234567890',
	metadata: {
		user_id: 'usr_123'
	}
});

// Update customer
const updatedCustomer = await stripe.customers.update(customer.id, {
	address: {
		line1: '123 Main St',
		city: 'San Francisco',
		state: 'CA',
		postal_code: '94111',
		country: 'US'
	}
});

// Retrieve customer
const retrievedCustomer = await stripe.customers.retrieve(customer.id);

// List customers
const customers = await stripe.customers.list({
	email: 'customer@example.com',
	limit: 10
});
```

### 4. Subscriptions

Managing recurring payments and billing cycles.

```javascript
// Create a product
const product = await stripe.products.create({
	name: 'Premium Plan',
	description: 'Premium features for your app'
});

// Create a price
const price = await stripe.prices.create({
	product: product.id,
	unit_amount: 2999, // $29.99
	currency: 'usd',
	recurring: {
		interval: 'month'
	}
});

// Create subscription
const subscription = await stripe.subscriptions.create({
	customer: customer.id,
	items: [{ price: price.id }],
	payment_behavior: 'default_incomplete',
	expand: ['latest_invoice.payment_intent']
});

// Update subscription
const updatedSubscription = await stripe.subscriptions.update(subscription.id, {
	items: [
		{
			id: subscription.items.data[0].id,
			price: newPrice.id
		}
	],
	proration_behavior: 'create_prorations'
});

// Cancel subscription
const canceledSubscription = await stripe.subscriptions.cancel(subscription.id);
```

### 5. Webhooks

Handling real-time events from Stripe.

```javascript
// Webhook endpoint
export async function POST(request) {
	const body = await request.text();
	const signature = request.headers.get('stripe-signature');

	let event;

	try {
		event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
	} catch (err) {
		console.error('Webhook signature verification failed');
		return new Response('Webhook Error', { status: 400 });
	}

	// Handle the event
	switch (event.type) {
		case 'payment_intent.succeeded':
			const paymentIntent = event.data.object;
			await handlePaymentSuccess(paymentIntent);
			break;

		case 'payment_intent.payment_failed':
			const failedPayment = event.data.object;
			await handlePaymentFailure(failedPayment);
			break;

		case 'customer.subscription.created':
		case 'customer.subscription.updated':
		case 'customer.subscription.deleted':
			const subscription = event.data.object;
			await handleSubscriptionChange(subscription);
			break;

		default:
			console.log(`Unhandled event type ${event.type}`);
	}

	return new Response(JSON.stringify({ received: true }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
}
```

### 6. Checkout Session

Pre-built hosted payment page.

```javascript
// Create Checkout session
const session = await stripe.checkout.sessions.create({
	payment_method_types: ['card'],
	line_items: [
		{
			price_data: {
				currency: 'usd',
				product_data: {
					name: 'T-shirt',
					description: 'Comfortable cotton t-shirt',
					images: ['https://example.com/t-shirt.png']
				},
				unit_amount: 2000
			},
			quantity: 1
		}
	],
	mode: 'payment',
	success_url: `${YOUR_DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
	cancel_url: `${YOUR_DOMAIN}/cancel`,
	metadata: {
		order_id: '123'
	}
});

// Redirect to Checkout
return Response.redirect(session.url, 303);
```

## API Reference

### Configuration Options

```javascript
const stripe = new Stripe(apiKey, {
	apiVersion: '2023-10-16',
	maxNetworkRetries: 2,
	timeout: 80000, // 80 seconds
	host: 'api.stripe.com',
	port: 443,
	telemetry: true,
	httpAgent: null, // For proxy configuration
	appInfo: {
		name: 'MyApp',
		version: '1.2.3',
		url: 'https://myapp.com'
	}
});
```

### Error Handling

```javascript
try {
	const paymentIntent = await stripe.paymentIntents.create({
		amount: 1000,
		currency: 'usd'
	});
} catch (error) {
	switch (error.type) {
		case 'StripeCardError':
			// Card was declined
			console.error('Card error:', error.message);
			break;
		case 'StripeRateLimitError':
			// Too many requests
			console.error('Rate limit error');
			break;
		case 'StripeInvalidRequestError':
			// Invalid parameters
			console.error('Invalid request:', error.message);
			break;
		case 'StripeAPIError':
			// Server error
			console.error('Stripe API error');
			break;
		case 'StripeConnectionError':
			// Network error
			console.error('Network error');
			break;
		case 'StripeAuthenticationError':
			// Authentication failed
			console.error('Authentication error');
			break;
		default:
			console.error('Unknown error:', error);
	}
}
```

### Pagination

```javascript
// Auto-pagination with async iterators
for await (const customer of stripe.customers.list()) {
	processCustomer(customer);
	if (shouldStop()) {
		break;
	}
}

// Manual pagination
const customers = await stripe.customers.list({ limit: 100 });
for (const customer of customers.data) {
	processCustomer(customer);
}

// Get next page
if (customers.has_more) {
	const nextPage = await stripe.customers.list({
		limit: 100,
		starting_after: customers.data[customers.data.length - 1].id
	});
}
```

## Code Examples

### Complete Payment Flow

```javascript
// 1. Server: Create payment intent
app.post('/create-payment-intent', async (req, res) => {
	const { amount, currency = 'usd' } = req.body;

	try {
		const paymentIntent = await stripe.paymentIntents.create({
			amount,
			currency,
			automatic_payment_methods: { enabled: true }
		});

		res.json({ clientSecret: paymentIntent.client_secret });
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

// 2. Client: Collect payment
const PaymentForm = () => {
	const [clientSecret, setClientSecret] = useState('');
	const stripe = useStripe();
	const elements = useElements();

	useEffect(() => {
		fetch('/create-payment-intent', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ amount: 2000 })
		})
			.then((res) => res.json())
			.then((data) => setClientSecret(data.clientSecret));
	}, []);

	const handleSubmit = async (e) => {
		e.preventDefault();

		const result = await stripe.confirmPayment({
			elements,
			confirmParams: {
				return_url: `${window.location.origin}/success`
			}
		});

		if (result.error) {
			showError(result.error.message);
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<PaymentElement />
			<button type="submit" disabled={!stripe}>
				Pay
			</button>
		</form>
	);
};
```

### Subscription with Trial

```javascript
// Create subscription with trial
const subscription = await stripe.subscriptions.create({
	customer: customer.id,
	items: [{ price: 'price_123' }],
	trial_period_days: 14,
	payment_settings: {
		save_default_payment_method: 'on_subscription'
	},
	expand: ['latest_invoice.payment_intent']
});

// Handle trial ending webhook
if (event.type === 'customer.subscription.trial_will_end') {
	const subscription = event.data.object;
	const customer = await stripe.customers.retrieve(subscription.customer);

	// Send reminder email
	await sendTrialEndingEmail(customer.email, subscription);
}
```

### Save Payment Method

```javascript
// Save payment method for future use
const setupIntent = await stripe.setupIntents.create({
	customer: customer.id,
	payment_method_types: ['card'],
	usage: 'off_session'
});

// Client-side confirmation
const result = await stripe.confirmCardSetup(clientSecret, {
	payment_method: {
		card: cardElement,
		billing_details: {
			name: 'John Doe',
			email: 'john@example.com'
		}
	}
});

// Use saved payment method
const paymentIntent = await stripe.paymentIntents.create({
	amount: 1000,
	currency: 'usd',
	customer: customer.id,
	payment_method: savedPaymentMethodId,
	off_session: true,
	confirm: true
});
```

### Refunds

```javascript
// Full refund
const refund = await stripe.refunds.create({
	payment_intent: 'pi_123',
	reason: 'requested_by_customer'
});

// Partial refund
const partialRefund = await stripe.refunds.create({
	payment_intent: 'pi_123',
	amount: 500 // Refund $5.00 of a larger payment
});

// List refunds
const refunds = await stripe.refunds.list({
	payment_intent: 'pi_123',
	limit: 10
});
```

## Best Practices

### 1. Security

- Never expose secret keys on the client side
- Always verify webhook signatures
- Use HTTPS for all API communications
- Store sensitive data (like API keys) in environment variables
- Implement proper authentication before processing payments

### 2. Error Handling

- Implement comprehensive error handling for all API calls
- Provide clear error messages to users
- Log errors for debugging but don't expose sensitive details
- Implement retry logic for transient failures

### 3. Performance

- Use webhook events instead of polling
- Implement proper pagination for large data sets
- Cache customer data when appropriate
- Use expand parameter to reduce API calls

### 4. Testing

- Use test mode API keys during development
- Test with Stripe-provided test card numbers
- Implement webhook testing with Stripe CLI
- Test edge cases like declined cards and network failures

### 5. Compliance

- Follow PCI compliance guidelines
- Implement Strong Customer Authentication (SCA) for European customers
- Store minimal payment information
- Use Stripe's fraud detection tools

## Troubleshooting

### Common Issues

1. **"No such customer" error**

   - Verify customer ID is correct
   - Check if using correct API keys (test vs live)
   - Ensure customer exists in the correct Stripe account

2. **Webhook signature verification fails**

   - Use raw request body, not parsed JSON
   - Verify webhook secret is correct
   - Check for modifications to the request body

3. **Payment requires authentication**

   - Implement 3D Secure handling
   - Use Payment Intents API with proper confirmation flow
   - Handle `requires_action` status

4. **Rate limiting errors**
   - Implement exponential backoff
   - Use Stripe's idempotency keys
   - Batch operations when possible

### Debugging Tips

```javascript
// Enable debug logging
const stripe = new Stripe(apiKey, {
	maxNetworkRetries: 2
});

// Listen to request/response events
stripe.on('request', (request) => {
	console.log('Stripe Request:', request);
});

stripe.on('response', (response) => {
	console.log('Stripe Response:', response);
});

// Access response metadata
const customer = await stripe.customers.create({
	email: 'test@example.com'
});
console.log('Request ID:', customer.lastResponse.requestId);
```

### Using Stripe CLI

```bash
# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/webhook

# Trigger test events
stripe trigger payment_intent.succeeded

# Tail API logs
stripe logs tail
```

## Quick Reference

### Test Card Numbers

- Success: `4242 4242 4242 4242`
- Requires auth: `4000 0025 0000 3155`
- Declined: `4000 0000 0000 9995`

### Common Webhook Events

- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

### API Versions

- Always specify API version for consistency
- Check changelog before upgrading
- Use versioned webhooks for stability

### Environment Variables

```bash
# Required
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Optional
STRIPE_API_VERSION=2023-10-16
```
