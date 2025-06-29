<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { loadStripe, type Stripe, type StripeEmbeddedCheckout } from '@stripe/stripe-js';
	import { PUBLIC_STRIPE_PUBLISHABLE_KEY } from '$env/static/public';

	export let appointmentId: string;
	export let onComplete: (() => void) | undefined = undefined;

	let checkoutDiv: HTMLDivElement;
	let stripe: Stripe | null = null;
	let checkout: StripeEmbeddedCheckout | null = null;
	let loading = true;
	let error = '';

	async function initializeCheckout() {
		try {
			// Load Stripe
			stripe = await loadStripe(PUBLIC_STRIPE_PUBLISHABLE_KEY);
			if (!stripe) {
				throw new Error('Failed to load Stripe');
			}

			// Fetch client secret from our backend
			const response = await fetch('/api/checkout', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					appointmentId,
					mode: 'embedded'
				})
			});

			if (!response.ok) {
				const errorData = (await response.json()) as { error?: string };
				throw new Error(errorData.error ?? 'Failed to create checkout session');
			}

			const { clientSecret } = (await response.json()) as { clientSecret: string };

			// Initialize embedded checkout
			checkout = await stripe.initEmbeddedCheckout({
				clientSecret,
				onComplete
			});

			// Mount checkout
			if (checkoutDiv) {
				checkout.mount(checkoutDiv);
			}

			loading = false;
		} catch (err) {
			console.error('Checkout initialization error:', err);
			error = err instanceof Error ? err.message : 'Failed to initialize checkout';
			loading = false;
		}
	}

	onMount(() => {
		void initializeCheckout();
	});

	onDestroy(() => {
		if (checkout) {
			checkout.destroy();
		}
	});
</script>

<div class="checkout-container">
	{#if loading}
		<div class="loading">
			<div class="spinner" />
			<p>Loading checkout...</p>
		</div>
	{:else if error}
		<div class="error">
			<p>Error: {error}</p>
			<button on:click={() => window.location.reload()}>Try Again</button>
		</div>
	{:else}
		<div bind:this={checkoutDiv} class="stripe-checkout" />
	{/if}
</div>

<style>
	.checkout-container {
		width: 100%;
		min-height: 600px;
	}

	.loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 400px;
		gap: 1rem;
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 3px solid #f3f3f3;
		border-top: 3px solid #333;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	.error {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 400px;
		gap: 1rem;
		color: #dc2626;
	}

	.error button {
		padding: 0.5rem 1rem;
		background-color: #dc2626;
		color: white;
		border: none;
		border-radius: 0.375rem;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.error button:hover {
		background-color: #b91c1c;
	}

	.stripe-checkout {
		width: 100%;
	}
</style>
